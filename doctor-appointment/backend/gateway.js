require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 5001; // API Gateway Portu

// 📌 API Gateway, gelen istekleri backend'e yönlendirir
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:5000", // Backend API'nin adresi
    changeOrigin: true,
  })
);

app.listen(PORT, () => {
  console.log(`🚀 API Gateway Çalışıyor: http://localhost:${PORT}`);
});
