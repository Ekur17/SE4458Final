const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendEmail = async (req, res) => {
  const { recipient, subject, message } = req.body;

  const mailOptions = {
    from: `"Doktor Randevu Sistemi" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject: subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "E-posta başarıyla gönderildi." });
  } catch (error) {
    console.error("E-posta gönderim hatası:", error);
    res.status(500).json({ error: "E-posta gönderilemedi." });
  }
};
