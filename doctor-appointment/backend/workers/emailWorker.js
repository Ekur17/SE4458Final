require("dotenv").config();
const amqp = require("amqplib");
const nodemailer = require("nodemailer");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";

// Nodemailer SMTP yapılandırması
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // 465 için true, 587 için false olmalı
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function consumeQueue() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Kuyrukları tanımla
    const emailQueue = "emailQueue";
    const reviewQueue = "review_notification";

    await channel.assertQueue(emailQueue, { durable: true });
    await channel.assertQueue(reviewQueue, { durable: true });

    console.log("📨 Email Worker Başlatıldı!");

    // **📩 Randevu Onay E-posta Kuyruğunu Tüket**
    channel.consume(emailQueue, async (msg) => {
      if (msg !== null) {
        const emailData = JSON.parse(msg.content.toString());

        console.log("📩 Gönderilecek Randevu Onay E-postası:", emailData);

        try {
          let info = await transporter.sendMail({
            from: `"Randevu Sistemi" <${process.env.SMTP_USER}>`,
            to: emailData.recipient,
            subject: emailData.subject,
            text: emailData.message,
          });

          console.log("✅ Randevu Onay E-postası Gönderildi:", info.response);
          channel.ack(msg);
        } catch (error) {
          console.error("❌ Randevu Onay E-postası Gönderme Hatası:", error);
          channel.nack(msg);
        }
      }
    });

    // **📨 Doktor Değerlendirme Bildirim Kuyruğunu Tüket**
    channel.consume(reviewQueue, async (msg) => {
      if (msg !== null) {
        const reviewData = JSON.parse(msg.content.toString());

        console.log("📨 Gönderilecek Review E-postası:", reviewData);

        try {
          let info = await transporter.sendMail({
            from: `"Randevu Sistemi" <${process.env.SMTP_USER}>`,
            to: reviewData.recipient,
            subject: `Please rate your visit to Dr. ${reviewData.doctorName}`,
            html: `
              <p>Please rate your visit to doctor <a href="http://localhost:3000/review/${reviewData.doctorId}">${reviewData.doctorName}</a></p>
              <p>Click the link to leave a review and help others.</p>
            `,
          });

          console.log(
            "✅ Review E-postası Başarıyla Gönderildi:",
            info.response
          );
          channel.ack(msg);
        } catch (error) {
          console.error("❌ Review E-postası Gönderme Hatası:", error);
          channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error("❌ RabbitMQ Email Worker Hatası:", error);
  }
}

consumeQueue();
