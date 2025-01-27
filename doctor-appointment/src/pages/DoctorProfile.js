import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useParams } from "react-router-dom";
import "../styles/DoctorProfile.css";
import ReactStars from "react-rating-stars-component";

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // **Doktor bilgilerini ve değerlendirmeleri çek**
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const doctorRef = doc(db, "doctors", doctorId);
        const doctorSnap = await getDoc(doctorRef);
        if (doctorSnap.exists()) {
          const doctorData = doctorSnap.data();
          setDoctor({ id: doctorSnap.id, ...doctorData });
          setAverageRating(doctorData.averageRating || 0);
          setTotalReviews(doctorData.totalReviews || 0);
        }
      } catch (error) {
        console.error("Doktor verileri alınırken hata:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const reviewsRef = collection(db, "doctors", doctorId, "reviews"); // 🔥 **İç içe koleksiyon çekildi!**
        const reviewsSnapshot = await getDocs(reviewsRef);
        const reviewsData = reviewsSnapshot.docs.map((doc) => doc.data());
        setReviews(reviewsData);
      } catch (error) {
        console.error("Değerlendirmeler çekilirken hata:", error);
      }
    };

    fetchDoctorData();
    fetchReviews();
  }, [doctorId]);

  // **Değerlendirme ekleme fonksiyonu**
  const handleRatingSubmit = async () => {
    if (rating === 0 || comment.trim() === "") {
      alert("Lütfen bir puan verin ve yorum girin.");
      return;
    }

    try {
      // **Yeni değerlendirmeyi Firestore'a ekle**
      const reviewRef = collection(db, "doctors", doctorId, "reviews"); // 🔥 **Doğru yeri hedefle!**
      await addDoc(reviewRef, {
        rating,
        comment,
        timestamp: new Date(),
      });

      // **Doktorun ortalama puanını güncelle**
      await updateDoctorRating(doctorId, rating);

      // **UI'yi güncellemek için yeni değerlendirmeyi listeye ekle**
      setReviews([...reviews, { rating, comment }]);
      setRating(0);
      setComment("");
      alert("Yorum başarıyla eklendi!");
    } catch (error) {
      console.error("Yorum eklenirken hata:", error);
    }
  };

  // **Doktorun ortalama puanını güncelleyen fonksiyon**
  const updateDoctorRating = async (doctorId, newRating) => {
    try {
      const doctorRef = doc(db, "doctors", doctorId);
      const doctorSnap = await getDoc(doctorRef);
      if (doctorSnap.exists()) {
        const doctorData = doctorSnap.data();
        const totalReviews = doctorData.totalReviews || 0;
        const currentRating = doctorData.averageRating || 0;

        // **Yeni ortalama hesapla**
        const updatedRating =
          (currentRating * totalReviews + newRating) / (totalReviews + 1);

        // **Firestore'da güncelle**
        await updateDoc(doctorRef, {
          averageRating: updatedRating,
          totalReviews: totalReviews + 1,
        });

        // **UI'de anında güncelle**
        setAverageRating(updatedRating);
        setTotalReviews(totalReviews + 1);
      }
    } catch (error) {
      console.error("Doktorun puanı güncellenirken hata:", error);
    }
  };

  return (
    <div className="doctor-profile">
      {doctor ? (
        <>
          <h2>{doctor.fullName}</h2>
          <p>
            <strong>Uzmanlık:</strong> {doctor.areaOfInterest}
          </p>
          <p>
            <strong>Adres:</strong> {doctor.address}
          </p>
          <p>
            <strong>Ortalama Puan:</strong>{" "}
            {averageRating > 0 ? averageRating.toFixed(1) : "Henüz Puan Yok"} (
            {totalReviews} değerlendirme)
          </p>
          {/* 🔥 **Değerlendirmeler UI'de gösteriliyor** */}
          <h3>Değerlendirmeler</h3>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="review-card">
                <ReactStars
                  count={5}
                  value={doctor.averageRating}
                  size={24}
                  activeColor="#ffd700"
                />
                ;<p>{review.comment}</p>
              </div>
            ))
          ) : (
            <p>Henüz değerlendirme yapılmamış.</p>
          )}
          {/* 🔥 **Yeni yorum ekleme alanı** */}
          <h3>Doktoru Değerlendir</h3>
          <ReactStars
            count={5}
            value={rating}
            onChange={setRating}
            size={30}
            activeColor="#ffd700"
          />
          ;
          <textarea
            placeholder="Yorumunuzu yazın..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={handleRatingSubmit}>Gönder</button>
        </>
      ) : (
        <p>Doktor bilgileri yükleniyor...</p>
      )}
    </div>
  );
};

export default DoctorProfile;
