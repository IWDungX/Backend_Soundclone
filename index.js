const express = require('express');
const app = require('./app');
module.exports = app;

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`SoundClone is running at http://localhost:${PORT}`);
});