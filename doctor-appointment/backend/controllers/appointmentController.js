const { sendToQueue } = require("../rabbitmq");
const { sendEmail } = require("../utils/emailService");

const bookAppointment = async (req, res) => {
  const { patientEmail, doctorId, selectedTime } = req.body;

  if (!patientEmail || !doctorId || !selectedTime) {
    return res.status(400).json({ message: "Eksik randevu bilgileri." });
  }

  try {
    // Randevuyu veritabanına kaydet (Firestore vb.)
    // await db.collection("appointments").add({ patientEmail, doctorId, selectedTime });

    // Doktor değerlendirme bildirimini RabbitMQ'ya ekle
    sendToQueue("rating_queue", { patientEmail, doctorId });

    res.status(200).json({ message: "Randevu başarıyla oluşturuldu!" });
  } catch (error) {
    console.error("❌ Randevu kaydetme hatası:", error);
    res.status(500).json({ message: "Randevu kaydedilemedi." });
  }
};

module.exports = { bookAppointment };
