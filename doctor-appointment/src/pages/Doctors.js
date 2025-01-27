import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "../styles/Doctors.css";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const querySnapshot = await getDocs(collection(db, "doctors"));
      const doctorList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctorList);
    };
    fetchDoctors();
  }, []);

  return (
    <div className="doctors-container">
      <h2>Doktorlar</h2>
      <ul>
        {doctors.map((doctor) => (
          <li key={doctor.id}>
            <h3>{doctor.fullname}</h3>
            <p>
              <strong>Email:</strong> {doctor.email}
            </p>
            <p>
              <strong>Uzmanlık:</strong> {doctor.areaOfInterest}
            </p>
            <p>
              <strong>Adres:</strong> {doctor.address}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Doctors;
