import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const forbiddenWords = ["kötü", "berbat", "lanet", "aptal"]; // Uygunsuz kelimeler listesi

const ReviewPage = () => {
  const { doctorId } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Uygunsuz yorumları filtrele
    if (forbiddenWords.some((word) => comment.toLowerCase().includes(word))) {
      alert("Lütfen uygun bir yorum girin.");
      return;
    }

    try {
      await addDoc(collection(db, "doctors", doctorId, "reviews"), {
        rating,
        comment,
        timestamp: new Date(),
      });
      alert("Değerlendirme başarıyla kaydedildi!");
    } catch (error) {
      console.error("Hata oluştu:", error);
      alert("Değerlendirme sırasında bir hata oluştu.");
    }
  };

  return (
    <div>
      <h2>Doktoru Değerlendir</h2>
      <form onSubmit={handleSubmit}>
        <label>Puan:</label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          required
        >
          <option value="">Seçin</option>
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num} Yıldız
            </option>
          ))}
        </select>
        <label>Yorum:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
};

export default ReviewPage;
