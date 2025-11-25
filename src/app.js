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

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
import { corsOptions } from './middleware/cors.js';
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: '🌱 EcoTrack API is running!',
    version: '1.0.0',
    endpoints: {
      challenges: '/api/challenges',
      userChallenges: '/api/user-challenges',
      tips: '/api/tips',
      events: '/api/events',
      stats: '/api/stats'
    }
  });
});

// API Routes
app.use('/api/challenges', challengeRoutes);
app.use('/api/user-challenges', userChallengeRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/stats', statsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🌱 EcoTrack Server Running          ║
  ║   Port: ${PORT}                        ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}         ║
  ╚═══════════════════════════════════════╝
  `);
});

export default app;