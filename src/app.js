const express = require('express');
const cors = require('cors');

const app = express();

// ============================================
// CORS Configuration - Allow Your Firebase App
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ecotrack-71dcf.web.app',           // ← Your Firebase URL
  'https://ecotrack-71dcf.firebaseapp.com',   // ← Firebase alternative domain
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROOT ROUTE
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🌱 EcoTrack API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    client: 'https://ecotrack-71dcf.web.app'
  });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// TEST ROUTE
// ============================================
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API connection successful!',
    server: 'Vercel',
    client: 'Firebase'
  });
});

// ============================================
// CHALLENGES ROUTES (Sample)
// ============================================
app.get('/api/challenges', (req, res) => {
  res.json({
    success: true,
    message: 'Challenges endpoint',
    data: [
      {
        _id: '1',
        title: 'Plastic-Free July',
        category: 'Waste Reduction',
        description: 'Avoid single-use plastic for one month',
        participants: 156
      },
      {
        _id: '2',
        title: 'Zero Waste Week',
        category: 'Waste Reduction',
        description: 'Produce no waste for 7 days',
        participants: 89
      }
    ]
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  });
});

// ============================================
// EXPORT APP
// ============================================
module.exports = app;