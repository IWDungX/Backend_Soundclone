const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express(); 

let requestID = 0;
function logger(req, res, next) {
  console.log(`Request #${requestID}\nRequest fired: ${req.url}\nMethod: ${req.method}`);
  requestID += 1;
  next();
}


app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: '*' }));

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api', require('./api'));


app.get('/', (req, res) => {
  res.send('Hello, this is the homepage!');
});

app.get('/ping', (req, res) => {
  try {
    res.status(200).send('pong');
  } catch ({ message }) {
    res.status(500).send(message);
  }
});

// Phục vụ file tĩnh (chỉ áp dụng nếu không khớp route nào ở trên)
app.use(express.static(path.join(__dirname, '..', 'admin', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'dist', 'index.html'));
});

// Xuất app sau khi đã cấu hình
module.exports = app;
