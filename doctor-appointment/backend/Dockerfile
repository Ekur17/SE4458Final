# Node.js'in resmi imajını kullan
FROM node:18

# Çalışma dizinini ayarla
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Tüm proje dosyalarını konteyner içine kopyala
COPY . .

# Sunucuyu başlat
CMD ["node", "server.js"]

# Konteyner için kullanılacak portu tanımla
EXPOSE 5000
