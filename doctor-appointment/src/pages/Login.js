import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext"; // 🔹 useAuth'u import et
import "../styles/Login.css";

const Login = () => {
  const { user, logout } = useAuth(); // 🔹 Kullanıcı bilgilerini çek
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google ile giriş hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Hasta Girişi</h2>
      {user ? (
        <>
          <p>Giriş yaptınız: {user.displayName}</p>
          <button onClick={logout} className="logout-btn">
            Çıkış Yap
          </button>
        </>
      ) : (
        <button
          onClick={handleGoogleSignIn}
          className="google-btn"
          disabled={loading}
        >
          {loading ? "Giriş Yapılıyor..." : "Google ile Giriş Yap"}
        </button>
      )}
    </div>
  );
};

export default Login;
