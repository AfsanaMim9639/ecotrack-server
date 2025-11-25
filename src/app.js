const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EcoTrack API is running!'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK'
  });
});

module.exports = app;