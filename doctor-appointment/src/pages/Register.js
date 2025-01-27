import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import axios from "axios";
import "../styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    areaOfInterest: "",
    availableDays: [],
    availableHours: { start: "", end: "" },
    address: "",
    city: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleToken, setGoogleToken] = useState(null); // 🔹 Google Token'ı burada saklıyoruz.

  // 🔹 Google ile Giriş Yap ve Token Al
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Google Token Al
      const token = await user.getIdToken();
      console.log("Google Token:", token);

      setGoogleToken(token); // 🔹 Token'ı state'e kaydet
      setIsAuthenticated(true);
      setFormData((prevData) => ({
        ...prevData,
        email: user.email,
      }));

      alert(`Google ile giriş başarılı: ${user.displayName}`);
    } catch (error) {
      console.error("Google ile giriş hatası:", error);
      alert("Google ile giriş yapılamadı!");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        availableDays: checked
          ? [...prevData.availableDays, value]
          : prevData.availableDays.filter((day) => day !== value),
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // 🔹 API'ye Token ile Korunan İstek Atma
  const sendProtectedRequest = async () => {
    if (!googleToken) {
      console.error("Token alınamadı.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/protected-route", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${googleToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("API Yanıtı:", data);
    } catch (error) {
      console.error("API isteği sırasında hata:", error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Lütfen önce Google ile giriş yapınız!");
      return;
    }

    try {
      const geocodingResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: `${formData.address}, ${formData.city}`,
            format: "json",
          },
        }
      );

      if (geocodingResponse.data.length > 0) {
        const location = geocodingResponse.data[0];
        const doctorData = {
          ...formData,
          location: {
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
          },
        };

        await addDoc(collection(db, "doctors"), doctorData);
        alert("Doktor kaydı başarıyla tamamlandı!");
      } else {
        alert("Adres bulunamadı, lütfen geçerli bir adres girin.");
      }
    } catch (error) {
      console.error("Hata oluştu:", error);
      alert("Doktor kaydı sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="register-container">
      <h2>Doktor Kaydı</h2>

      <div className="email-google-container">
        <label>Email:</label>
        <input type="email" name="email" value={formData.email} disabled />
        {!isAuthenticated && (
          <button onClick={handleGoogleSignIn} className="google-btn">
            Google ile Giriş Yap
          </button>
        )}
      </div>

      <form onSubmit={handleRegister}>
        <label>Full Name:</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <label>Area of Interest:</label>
        <input
          type="text"
          name="areaOfInterest"
          value={formData.areaOfInterest}
          onChange={handleChange}
          required
        />

        <label>Available Days:</label>
        <div className="days-container">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <label key={day} className="day-label">
              <input type="checkbox" value={day} onChange={handleChange} />
              {day}
            </label>
          ))}
        </div>

        <label>Available Hours:</label>
        <div className="time-container">
          <input
            type="time"
            name="start"
            value={formData.availableHours.start}
            onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData,
                availableHours: {
                  ...prevData.availableHours,
                  start: e.target.value,
                },
              }))
            }
            required
          />
          <input
            type="time"
            name="end"
            value={formData.availableHours.end}
            onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData,
                availableHours: {
                  ...prevData.availableHours,
                  end: e.target.value,
                },
              }))
            }
            required
          />
        </div>

        <label>Address:</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <label>City:</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />

        <button type="submit" className="register-btn">
          Register
        </button>
      </form>

      {/* 🔹 Korunan API isteği butonu */}
      {isAuthenticated && (
        <button onClick={sendProtectedRequest} className="protected-btn">
          API'yi Test Et (Google Token Kullan)
        </button>
      )}
    </div>
  );
};

export default Register;
