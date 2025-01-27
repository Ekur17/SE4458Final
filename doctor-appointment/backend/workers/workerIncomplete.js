const { sendEmail } = require("../utils/emailService");
const { consumeFromQueue } = require("../rabbitmq");

const processIncompleteAppointments = async (msg) => {
  const { patientEmail } = JSON.parse(msg.content.toString());

  await sendEmail({
    recipient: patientEmail,
    subject: "Tamamlanmamış Randevunuz Var!",
    message: "Randevunuzu tamamlamadınız. Devam etmek ister misiniz?",
  });

  console.log(`📩 Tamamlanmamış randevu bildirimi gönderildi: ${patientEmail}`);
};

// RabbitMQ'dan mesajları tüket
consumeFromQueue("incomplete_appointment_queue", processIncompleteAppointments);
