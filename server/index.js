const app = require('./app');
require('dotenv').config();

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  PORT,
  console.log(`SoundClone is running at http://172.22.0.13:${PORT}`);
});