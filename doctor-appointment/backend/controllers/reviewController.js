const amqp = require("amqplib");
require("dotenv").config();

// RabbitMQ'ya bildirim ekle
async function queueReviewNotification(patientEmail, doctorName, doctorId) {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  const queue = "review_notification";

  await channel.assertQueue(queue, { durable: true });

  const message = JSON.stringify({
    recipient: patientEmail,
    doctorName,
    doctorId,
  });
  channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

  console.log(`📩 Review Notification Kuyruğa Eklendi: ${patientEmail}`);
}

// Randevu sonrası çağrılacak fonksiyon
async function sendReviewNotification(req, res) {
  const { patientEmail, doctorName, doctorId } = req.body;

  if (!patientEmail || !doctorName || !doctorId) {
    return res.status(400).json({ error: "Eksik bilgi" });
  }

  try {
    await queueReviewNotification(patientEmail, doctorName, doctorId);
    res.status(200).json({ message: "Review notification sent to queue" });
  } catch (error) {
    console.error("Hata oluştu:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { sendReviewNotification };
