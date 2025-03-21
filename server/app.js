const express = require('express');
const app = express();
const routes = require('./api'); 

module.exports = app;
let requestID = 0;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello, this is the homepage!");
});
app.use('/api/', require('./api'));

const userRouter = require('./api/test');
app.use('/api/users', userRouter);


app.get('/ping', (req, res) => {
  try {
    res.status(200).send('pong');
  } catch ({ message }) {
    res.status(500).send(message);
  }
});