const Imap = require('imap');
const { simpleParser } = require('mailparser');
const axios = require('axios');

// Environment variables
const IMAP_SERVER = process.env.IMAP_SERVER || '172.16.0.1';
const IMAP_PORT = process.env.IMAP_PORT || 143;
const IMAP_USER = process.env.IMAP_USER || 'bitwarden';
const IMAP_PASSWORD = process.env.IMAP_PASSWORD || 'T3st@pi2o24';
const API_URL = 'http://localhost:3000/send-message';
const RECIPIENT_ID = '120363374129473581@g.us';

// Create IMAP client
const imap = new Imap({
  user: IMAP_USER,
  password: IMAP_PASSWORD,
  host: IMAP_SERVER,
  port: IMAP_PORT,
  tls: false,
  autotls: false
});

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
function processNewEmail(stream) {
  simpleParser(stream, (err, parsed) => {
    if (err) {
      console.error('Error parsing email:', err);
      return;
    }
    console.log('New email received at:', new Date().toISOString());
    console.log('Subject:', parsed.subject);
    console.log('From:', parsed.from.text);
    console.log('Forwarding to API...');

    sendEmailToApi(parsed.text);
  });
}

function startImapListener() {
  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('Error opening inbox:', err);
        return;
      }
      console.log('Connected to IMAP server');

      // Listen for new emails
      imap.on('mail', () => {
        imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            console.error('Error searching unseen emails:', err);
            return;
          }

          if (results.length === 0) return;

          const f = imap.fetch(results, { bodies: '' });
          f.on('message', (msg) => {
            let stream = '';
            msg.on('body', (s) => {
              stream = s;
            });
            msg.once('end', () => {
              processNewEmail(stream);
            });
          });
        });
      });

      // Enable IDLE mode
      imap.idle();
    });
  });

  imap.once('error', (err) => {
    console.error('IMAP Error:', err);
    setTimeout(() => {
      console.log('Reconnecting...');
      startImapListener();
    }, 30000);
  });

  imap.once('end', () => {
    console.log('Connection ended');
    setTimeout(() => {
      console.log('Reconnecting...');
      startImapListener();
    }, 30000);
  });

  imap.connect();
}

// Start the IMAP listener
startImapListener();
