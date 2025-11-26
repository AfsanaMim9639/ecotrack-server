import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import challengeRoutes from './routes/challengeRoutes.js';
import userChallengeRoutes from './routes/userChallengeRoutes.js';
import tipsRoutes from './routes/tipsRoutes.js';
import eventsRoutes from './routes/eventsRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://ecotrack-71dcf.web.app',
    'https://ecotrack-71dcf.firebaseapp.com',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (only if not already connected)
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) {
    console.log('📦 Using existing database connection');
    return;
  }
  
  try {
    await connectDB();
    isConnected = true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: '🌱 EcoTrack API is running!',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      challenges: '/api/challenges',
      userChallenges: '/api/user-challenges',
      tips: '/api/tips',
      events: '/api/events',
      stats: '/api/stats'
    }
  });
});

// API Routes - Connect to DB before handling requests
app.use('/api/*', async (req, res, next) => {
  await connectToDatabase();
  next();
});

app.use('/api/challenges', challengeRoutes);
app.use('/api/user-challenges', userChallengeRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/stats', statsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// For local development
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║   🌱 EcoTrack Server Running          ║
  ║   Port: ${PORT}                        ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}         ║
  ╚═══════════════════════════════════════╝
    `);
  });
}

export default app;