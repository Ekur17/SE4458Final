import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import DoctorsList from "./pages/DoctorsList";
import Appointment from "./pages/Appointment";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReviewPage from "./pages/ReviewPage"; // ✅ Yeni eklenen sayfa
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/doctors" element={<DoctorsList />} />
              <Route path="/appointment" element={<Appointment />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/review/:doctorId" element={<ReviewPage />} />{" "}
              {/* ✅ Yeni route eklendi */}
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
