# Gunakan image Node.js
FROM node:18

# Tentukan direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin semua file aplikasi ke dalam container
COPY . .

# Ekspos port aplikasi (misalnya 3001)
EXPOSE 3001

# Perintah untuk menjalankan aplikasi
CMD ["node", "app.js"]
