const connectToRabbitMQ = require("../rabbitmq");
const { sendEmail } = require("../utils/emailService");

async function startReviewWorker() {
  const { channel } = await connectToRabbitMQ();

  channel.consume("reviewQueue", async (msg) => {
    const reviewData = JSON.parse(msg.content.toString());

    const emailContent = {
      recipient: reviewData.email,
      subject: `Lütfen Doktorunuzu Değerlendirin: ${reviewData.doctorName}`,
      message: `Merhaba, \nLütfen doktorunuz ${reviewData.doctorName} için değerlendirme yapın. \nDeğerlendirme Linki: ${reviewData.reviewLink}`,
    };

    await sendEmail(emailContent);
    channel.ack(msg);
  });

  console.log("📝 Review Worker Başladı!");
}

startReviewWorker();
