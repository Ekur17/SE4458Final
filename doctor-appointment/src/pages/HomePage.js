import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/HomePage.css";

const HomePage = () => {
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/doctors");
        const doctorsData = await response.json();

        console.log("📢 API'den gelen tüm doktor verisi:", doctorsData);

        if (!Array.isArray(doctorsData.data)) {
          console.error(
            "❌ HATA: API'den gelen veri array değil!",
            doctorsData
          );
          return;
        }

        // 🔥 Her doktorun `reviews` koleksiyonunu ayrı ayrı çekiyoruz
        const updatedDoctors = await Promise.all(
          doctorsData.data.map(async (doctor) => {
            try {
              const reviewsResponse = await fetch(
                `http://localhost:5000/api/v1/doctors/${doctor.id}/reviews`
              );
              const reviewsData = await reviewsResponse.json();

              console.log(
                `📜 Doktor ${doctor.fullName} için reviews:`,
                reviewsData
              );

              const reviews = Array.isArray(reviewsData) ? reviewsData : [];
              const totalReviews = reviews.length;

              const totalRatings = reviews.reduce((sum, review) => {
                const ratingValue = parseFloat(review.rating);
                return sum + (isNaN(ratingValue) ? 0 : ratingValue);
              }, 0);

              const averageRating =
                totalReviews > 0
                  ? (totalRatings / totalReviews).toFixed(1)
                  : "0";

              console.log(
                `🌟 ${doctor.fullName} -> Ortalama Puan: ${averageRating}, Toplam Yorum: ${totalReviews}`
              );

              return {
                ...doctor,
                averageRating: parseFloat(averageRating), // Sayıya çeviriyoruz
                totalReviews,
                reviews, // Tüm yorumları ekliyoruz
              };
            } catch (error) {
              console.error(
                `❌ Doktor ${doctor.fullName} için yorumlar çekilirken hata oluştu:`,
                error
              );
              return {
                ...doctor,
                averageRating: 0,
                totalReviews: 0,
                reviews: [],
              };
            }
          })
        );

        setDoctors(updatedDoctors);
      } catch (error) {
        console.error("Doktor verileri çekilirken hata oluştu:", error);
      }
    };

    fetchDoctors();
  }, []);

  // ⭐ Ortalama puanı hesapla ve yıldızları oluştur
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalRatings = reviews.reduce(
      (sum, review) => sum + (parseFloat(review.rating) || 0),
      0
    );
    const averageRating = totalRatings / reviews.length;

    return {
      averageRating: isNaN(averageRating) ? 0 : averageRating.toFixed(1),
      totalReviews: reviews.length,
    };
  };

  // 🔍 Arama sonrası doktor bilgisini ayarlarken güncelle
  const handleSearch = () => {
    console.log("🔎 Arama yapılıyor:", specialization, location);

    const filteredDoctors = doctors
      .map((doctor) => {
        const { averageRating, totalReviews } = calculateAverageRating(
          doctor.reviews || []
        );
        return { ...doctor, averageRating, totalReviews };
      })
      .filter((doctor) => {
        const specialtyMatch = doctor.areaOfInterest
          .toLowerCase()
          .includes(specialization.toLowerCase());
        const cityMatch = doctor.city
          .toLowerCase()
          .includes(location.toLowerCase());
        return specialtyMatch && cityMatch;
      });

    if (filteredDoctors.length > 0) {
      setSelectedDoctor(filteredDoctors[0]);
    } else {
      alert("⚠️ Aradığınız kriterlere uygun doktor bulunamadı.");
    }
  };

  // 📧 Randevu alındığında API'ye bildirim gönder
  const handleAppointmentBooking = async (selectedTime) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/appointments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId: selectedDoctor.id,
            patientEmail: "ekursun3510@gmail.com",
            appointmentTime: selectedTime,
          }),
        }
      );

      if (response.ok) {
        alert("📧 Randevu başarıyla alındı ve onay e-postası gönderildi!");
      } else {
        alert("❌ Randevu oluşturma başarısız oldu.");
      }
    } catch (error) {
      console.error("❌ Randevu oluştururken hata:", error);
    }
  };

  const generateSequentialTimes = (startHour, endHour, interval = 60) => {
    const times = [];
    let currentTime = startHour * 60;
    const endTime = endHour * 60;

    while (currentTime < endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      times.push(formattedTime);
      currentTime += interval;
    }

    return times;
  };

  const renderWeeklySchedule = (doctor) => {
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <div className="schedule-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-schedule">
            <h4>{day}</h4>
            {doctor?.availableDays?.includes(day) ? (
              generateSequentialTimes(
                parseInt(doctor.availableHours.start.split(":")[0]),
                parseInt(doctor.availableHours.end.split(":")[0])
              ).map((time, index) => (
                <button
                  key={index}
                  className="available-time"
                  onClick={() => handleAppointmentBooking(`${day} ${time}`)}
                >
                  {time}
                </button>
              ))
            ) : (
              <p>-</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="homepage">
      <h1>Doktor bul ve randevu al</h1>
      <p>181,000 doktor ve uzman arasından tercihini yap</p>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Uzmanlık, ilgi alanı veya isim"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        />
        <input
          type="text"
          placeholder="Şehir"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={handleSearch}>Ara</button>
      </div>

      {selectedDoctor && (
        <div className="results-container">
          <div className="map-container">
            <MapContainer
              center={[
                selectedDoctor.location.latitude,
                selectedDoctor.location.longitude,
              ]}
              zoom={13}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[
                  selectedDoctor.location.latitude,
                  selectedDoctor.location.longitude,
                ]}
              >
                <Popup>
                  {selectedDoctor.fullName} - {selectedDoctor.areaOfInterest}
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="doctor-info">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3>
                <strong>{selectedDoctor.fullName}</strong>
              </h3>

              {/* ⭐ Yıldızları Göster */}
              <span style={{ fontSize: "20px", color: "#ffcc00" }}>
                {selectedDoctor?.totalReviews > 0
                  ? [
                      ...Array(Math.round(selectedDoctor?.averageRating || 0)),
                    ].map((_, i) => <span key={i}>⭐</span>)
                  : "Puan Yok"}
              </span>

              {/* 📝 Toplam yorum sayısını göster */}
              <span>({selectedDoctor.totalReviews || 0})</span>
            </div>

            <p>
              <strong>Uzmanlık:</strong> {selectedDoctor.areaOfInterest}
            </p>
            <h4>Haftalık Program:</h4>
            {renderWeeklySchedule(selectedDoctor)}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
