const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');

const app = express(); 

// Logger
let requestID = 0;
function logger(req, res, next) {
  console.log(`Request #${requestID}\nRequest fired: ${req.url}\nMethod: ${req.method}`);
  requestID += 1;
  next();
}
app.use(logger);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS cấu hình chuẩn
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8081',
  'http://192.168.1.2:3000',
  'http://192.168.1.2:8081'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// API routes
app.use('/api', require('./api'));

app.use(errorHandler);
// Test routes
app.get('/', (req, res) => res.send('Hello, this is the homepage!'));
app.get('/ping', (req, res) => res.status(200).send('pong'));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'admin', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'dist', 'index.html'));
});

module.exports = app;
