const POP3Client = require('poplib');
const { simpleParser } = require('mailparser');
const axios = require('axios');

// Mendapatkan variabel lingkungan
const POP3_SERVER = process.env.POP3_SERVER || 'mail.fc-network.com';
const POP3_PORT = process.env.POP3_PORT || 110;
const POP3_USER = process.env.POP3_USER || 'bitwarden';
const POP3_PASSWORD = process.env.POP3_PASSWORD || 'T3st@pi2o24';
const API_URL = 'http://192.168.100.117:3000/send-message';
const RECIPIENT_ID = '628980619040@c.us';  // ID penerima

let lastEmailCount = 0; // Menyimpan jumlah email terakhir yang diproses

// Fungsi untuk mengirim body email ke API
function sendEmailToApi(body) {
  axios.post(API_URL, {
    message: body,
    id: RECIPIENT_ID
  })
  .then(response => {
    console.log('Email sent to API:', response.data);
  })
  .catch(error => {
    console.error('Error sending email to API:', error);
  });
}

// Fungsi untuk membuat koneksi ke POP3 server
function createConnection() {
  const client = new POP3Client(POP3_PORT, POP3_SERVER, {
    tlserrs: false,
    enabletls: false,
    debug: false
  });

  // Event saat terhubung ke server
  client.on('connect', () => {
    console.log('Connected to POP3 server');
    client.login(POP3_USER, POP3_PASSWORD);
  });

  // Event saat login berhasil
  client.on('login', (status, rawdata) => {
    if (status) {
      console.log('Logged in to POP3 server');
      // Mulai polling berkala
      checkEmails(client);
    } else {
      console.error('Login failed:', rawdata);
      client.quit();
    }
  });

  // Fungsi untuk mengecek email secara berkala
  function checkEmails(client) {
    client.stat();
    // Jadwalkan pengecekan berikutnya tanpa perlu reconnect
    setTimeout(() => checkEmails(client), 30000);
  }

  // Event saat menerima statistik email
  client.on('stat', (status, data) => {
    if (status) {
      console.log(`You have ${data.count} emails in your inbox`);
      
      // Mengecek jika jumlah email tidak berubah
      if (data.count === lastEmailCount) {
        console.log('Jumlah email tidak berubah, tidak mengirimkan ke API.');
        client.quit();
        return;
      }

      // Update jumlah email terakhir
      lastEmailCount = data.count;

      // Mengambil email terbaru (email dengan nomor urut tertinggi)
      client.retr(data.count);  // Mengambil email terakhir
    } else {
      console.error('Error retrieving stats:', data);
      client.quit();
    }
  });

  // Event saat email berhasil diambil
  client.on('retr', (status, msgnumber, data, rawdata) => {
    if (status) {
      console.log(`Email #${msgnumber} retrieved`);
      // Parse email data
      simpleParser(data, (err, parsed) => {
        if (err) {
          console.error('Error parsing email:', err);
        } else {
          console.log('Subject:', parsed.subject);
          console.log('From:', parsed.from.text);
          console.log('Body:', parsed.text);

          // Kirim body email ke API
          sendEmailToApi(parsed.text);
        }
        client.quit();
      });
    } else {
      console.error('Error retrieving email:', rawdata);
      client.quit();
    }
  });

  // Modifikasi event close dan error
  client.on('close', () => {
    console.log('Connection closed unexpectedly');
    // Hanya reconnect jika koneksi terputus secara tidak diharapkan
    setTimeout(createConnection, 5000);
  });

  client.on('error', (err) => {
    console.error('POP3 Error:', err);
    // Reconnect hanya jika terjadi error
    setTimeout(createConnection, 5000);
  });
}

// Memulai koneksi pertama kali
createConnection();
