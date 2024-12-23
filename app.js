const Imap = require('imap');
const { simpleParser } = require('mailparser');
const axios = require('axios');

// Environment variables
const IMAP_SERVER = process.env.IMAP_SERVER || 'your_imap_server';
const IMAP_PORT = process.env.IMAP_PORT || 143;
const IMAP_USER = process.env.IMAP_USER || 'your_mail_user';
const IMAP_PASSWORD = process.env.IMAP_PASSWORD || 'your_mail_password';
const API_URL = process.env.API_URL || 'ypur_api_url';
const RECIPIENT_ID = process.env.RECIPIENT_ID || 'your_wa_api_number';

// Create IMAP client
const imap = new Imap({
  user: IMAP_USER,
  password: IMAP_PASSWORD,
  host: IMAP_SERVER,
  port: IMAP_PORT,
  tls: false,
  autotls: false
});

// Variable to store the last email timestamp
let lastEmailTime = new Date();

// Function to send email to API
function sendEmailToApi(body) {
  console.log('Sending to API at:', new Date().toISOString());
  axios.post(API_URL, {
    message: body,
    id: RECIPIENT_ID
  })
  .then(response => {
    console.log('Successfully forwarded to API at:', new Date().toISOString());
    console.log('API Response:', response.data);
  })
  .catch(error => {
    console.error('Error forwarding to API:', error);
  });
}

// Function to process new email
function processNewEmail(stream, seqno) {
  simpleParser(stream, (err, parsed) => {
    if (err) {
      console.error('Error parsing email:', err);
      return;
    }

    // Check if email is newer than our last processed email
    const emailDate = parsed.date || new Date();
    if (emailDate > lastEmailTime) {
      console.log('New email received at:', new Date().toISOString());
      console.log('Subject:', parsed.subject);
      console.log('From:', parsed.from.text);
      console.log('Forwarding to API...');

      sendEmailToApi(parsed.text);
      lastEmailTime = emailDate;
    } else {
      console.log('Skipping older email:', parsed.subject);
    }
  });
}

function startImapListener() {
  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('Error opening inbox:', err);
        return;
      }
      console.log('Connected to IMAP server and listening for new emails...');
      console.log('Starting timestamp:', lastEmailTime.toISOString());

      // Listen for new emails
      imap.on('mail', () => {
        imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            console.error('Error searching unseen emails:', err);
            return;
          }

          if (results.length === 0) return;

          const f = imap.fetch(results, { bodies: '' });
          f.on('message', (msg, seqno) => {
            let stream = '';
            msg.on('body', (s) => {
              stream = s;
            });
            msg.once('end', () => {
              processNewEmail(stream, seqno);
            });
          });
        });
      });
    });
  });

  imap.once('error', (err) => {
    console.error('IMAP Error:', err);
    imap.connect();
  });

  imap.once('end', () => {
    console.log('Connection ended, reconnecting...');
    imap.connect();
  });

  imap.connect();
}

// Start the IMAP listener
startImapListener();
