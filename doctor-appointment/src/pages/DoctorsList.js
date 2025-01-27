import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // Firestore bağlantısı
import ReactStars from "react-rating-stars-component"; // Yıldızlı puanlama için

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "doctors"));
        const doctorsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Doktor verileri çekilirken hata oluştu:", error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="doctors-list">
      <h2>Doktor Listesi</h2>
      <ul>
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <li key={doctor.id}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <h3>{doctor.fullName}</h3>
                <ReactStars
                  count={5}
                  value={doctor.averageRating || 0} // Eğer puan yoksa 0 göster
                  size={20}
                  edit={false}
                  activeColor="#ffd700"
                />
                <span>({doctor.totalReviews || 0})</span>{" "}
                {/* Yorum sayısını göster */}
              </div>
              <p>Uzmanlık: {doctor.areaOfInterest}</p>
              <p>
                Adres: {doctor.address}, {doctor.city}
              </p>
              <p>
                Çalışma Günleri:{" "}
                {doctor.availableDays
                  ? doctor.availableDays.join(", ")
                  : "Belirtilmemiş"}
              </p>
              <p>
                Çalışma Saatleri:{" "}
                {doctor.availableHours
                  ? `${doctor.availableHours.start} - ${doctor.availableHours.end}`
                  : "Belirtilmemiş"}
              </p>
            </li>
          ))
        ) : (
          <p>Kayıtlı doktor bulunamadı.</p>
        )}
      </ul>
    </div>
  );
};

export default DoctorsList;
