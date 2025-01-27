import React, { useState } from "react";

const Appointment = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleAppointment = () => {
    alert(`Randevu oluşturuldu: ${date} - ${time}`);
  };

  return (
    <div>
      <h2>Randevu Al</h2>
      <label>Tarih:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <label>Saat:</label>
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <button onClick={handleAppointment}>Randevu Al</button>
    </div>
  );
};

export default Appointment;
