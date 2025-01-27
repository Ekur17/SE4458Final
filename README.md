# Video Link


# **Doctor Appointment System**

The project aims to create a Doctor Appointment System that allows patients to search for doctors, book appointments, and leave reviews. 
The system is built using JavaScript, Node.js, Express.js, Firebase, and RabbitMQ for message queuing. The backend provides a RESTful API for managing doctors, appointments, notifications, and reviews. 
The application supports real-time appointment scheduling, ensuring efficient booking management.
Users can authenticate using Google Authentication, and doctors can manage their availability through a structured scheduling system. Cloud Firestore is used as a NoSQL database to store user and appointment data. 
The system integrates RabbitMQ for handling appointment notifications asynchronously, ensuring a smooth user experience.
Security measures include role-based access control. The system also features email notifications for appointment and doctor rating requests.

# **Docker**

![image](https://github.com/user-attachments/assets/da3cd3c2-8865-41ce-8ac3-580dd307b9f6)

# **Tech Stack**

## **Frontend**

-React.js

-React Router

-Leaflet.js (for Map View)

-CSS (Styled Components & Bootstrap)

## **Backend**

-Node.js & Express.js

-Firebase Firestore (Database & Authentication)

-RabbitMQ (Queue System for Notifications)

-Nodemailer (for Email Services)

-Docker & Azure (for Deployment)

# **Modules**

Authentication Module: Google login, user authentication

Doctor Management Module: Doctor registration, scheduling

Appointment Module: Search, book, and manage appointments

Review Module: Patients leave reviews

Notification Module: Email & in-app notifications using RabbitMQ

# **Installation & Run**

Before running the API server, update the .env file with your credentials:

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com

SMTP_PORT=465

SMTP_USER=your_email@gmail.com

SMTP_PASS=your_email_password

RABBITMQ_URL=amqp://localhost:5672






