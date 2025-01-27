const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672"; // RabbitMQ bağlantı adresi

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    console.log("✅ RabbitMQ bağlantısı başarılı!");

    return { connection, channel };
  } catch (error) {
    console.error("❌ RabbitMQ bağlantısı başarısız:", error);
    process.exit(1);
  }
}

module.exports = connectRabbitMQ;
