const amqp = require("amqplib");
const nodemailer = require("nodemailer");
require("dotenv").config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function startWorker() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue("emailQueue", { durable: true });

    console.log("📩 Email worker listening for messages...");

    channel.consume("emailQueue", async (msg) => {
      const emailData = JSON.parse(msg.content.toString());
      console.log("📨 Sending email to:", emailData.recipient);

      try {
        await transporter.sendMail({
          from: `"Doktor Randevu Sistemi" <${process.env.SMTP_USER}>`,
          to: emailData.recipient,
          subject: emailData.subject,
          text: emailData.message,
        });
        console.log("✅ Email sent successfully!");
        channel.ack(msg);
      } catch (error) {
        console.error("❌ Error sending email:", error);
      }
    });
  } catch (error) {
    console.error("❌ RabbitMQ Connection Error:", error);
  }
}

startWorker();
