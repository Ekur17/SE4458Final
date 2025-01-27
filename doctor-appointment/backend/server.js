require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectRabbitMQ = require("./rabbitmq"); // RabbitMQ bağlantısı
const { db } = require("./firebaseConfig"); // Firestore bağlantısı
const redis = require("redis"); // Redis kütüphanesi

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = 5000;

// 📌 **Redis Bağlantısını Kur (Özel Host ve Port Ayarı)**
const client = redis.createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

client.on("error", (err) => console.error("Redis Hatası:", err));
client.connect().then(() => console.log("✅ Redis Bağlantısı Başarılı"));

connectRabbitMQ().then(({ connection, channel }) => {
  console.log("✅ RabbitMQ Başlatıldı!");

  // 📌 **API VERSİYONLAMA VE PAGINATION EKLENDİ**
  app.get("/api/v1/doctors", async (req, res) => {
    try {
      let { page = 1, limit = 10 } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);

      // Redis cache kontrolü
      const cachedDoctors = await client.get(
        `doctors_page_${page}_limit_${limit}`
      );
      if (cachedDoctors) {
        console.log("🟢 Redis Cache Kullanılıyor");
        return res.status(200).json(JSON.parse(cachedDoctors));
      }

      // Firestore'dan doktorları çek
      const doctorsRef = db.collection("doctors");
      const snapshot = await doctorsRef.get();
      const allDoctors = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Pagination uygulama
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const doctors = allDoctors.slice(startIndex, endIndex);

      const response = {
        page,
        limit,
        totalDoctors: allDoctors.length,
        totalPages: Math.ceil(allDoctors.length / limit),
        data: doctors,
      };

      // Redis cache ekle (30 dakika boyunca sakla)
      await client.set(
        `doctors_page_${page}_limit_${limit}`,
        JSON.stringify(response),
        { EX: 1800 }
      );

      console.log("🔵 Veritabanından Çekildi ve Cache'lendi");
      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Doktor verileri alınırken hata:", error);
      res.status(500).json({ error: "Doktor verileri alınamadı." });
    }
  });

  // 📌 **Belirli Doktorun Değerlendirmelerini Getiren API**
  app.get("/api/v1/doctors/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const reviewsRef = db.collection(`doctors/${id}/reviews`);
      const snapshot = await reviewsRef.get();
      const reviews = snapshot.docs.map((doc) => doc.data());

      res.status(200).json(reviews);
    } catch (error) {
      console.error("❌ Değerlendirmeler alınırken hata:", error);
      res.status(500).json({ error: "Değerlendirmeler alınamadı." });
    }
  });

  // 📌 **Randevu Oluşturma API'si**
  app.post("/api/v1/appointments", async (req, res) => {
    try {
      const { doctorId, patientEmail, appointmentTime } = req.body;

      if (!doctorId || !patientEmail || !appointmentTime) {
        return res.status(400).json({ error: "Tüm alanlar gereklidir." });
      }

      const appointmentRef = db.collection("appointments").doc();
      await appointmentRef.set({
        doctorId,
        patientEmail,
        appointmentTime,
        status: "pending",
      });

      console.log("📅 Randevu Kaydedildi:", { doctorId, patientEmail });

      // **Doktorun Adını Firestore'dan Al**
      const doctorRef = db.collection("doctors").doc(doctorId);
      const doctorSnap = await doctorRef.get();
      const doctorData = doctorSnap.data();
      const doctorName = doctorData ? doctorData.fullName : "Bilinmeyen Doktor";

      // **Randevu Onayı için RabbitMQ Kuyruğuna Mesaj Gönder**
      const emailQueue = "emailQueue";
      await channel.assertQueue(emailQueue, { durable: true });

      channel.sendToQueue(
        emailQueue,
        Buffer.from(
          JSON.stringify({
            recipient: patientEmail,
            subject: "Randevu Onayı",
            message: `Randevunuz ${appointmentTime} tarihinde oluşturuldu.`,
          })
        ),
        { persistent: true }
      );

      console.log("📩 Randevu E-postası Kuyruğa Eklendi");

      // **Review E-postası için RabbitMQ Kuyruğuna Mesaj Gönder**
      const reviewQueue = "review_notification";
      await channel.assertQueue(reviewQueue, { durable: true });

      channel.sendToQueue(
        reviewQueue,
        Buffer.from(
          JSON.stringify({
            recipient: patientEmail,
            doctorName: doctorName, // Artık ID yerine isim gönderiyoruz!
            doctorId: doctorId,
          })
        ),
        { persistent: true }
      );

      console.log("📨 Review E-postası Kuyruğa Eklendi!");

      res.status(201).json({
        success:
          "Randevu oluşturuldu, onay ve review e-postaları kuyruğa eklendi.",
      });
    } catch (error) {
      console.error("❌ Randevu oluştururken hata:", error);
      res.status(500).json({ error: "Randevu oluşturulamadı." });
    }
  });

  // 📌 **RabbitMQ Çalışmazsa Hata Mesajı Döndür**
  process.on("unhandledRejection", (error) => {
    console.error("❌ Beklenmeyen Hata:", error);
  });

  // 🌐 **Sunucu Başlat**
  app.listen(PORT, () => {
    console.log(`🚀 API çalışıyor: http://localhost:${PORT}`);
  });
});
