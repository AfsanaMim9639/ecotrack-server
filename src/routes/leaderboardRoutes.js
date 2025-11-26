import express from 'express';
import {
  getLeaderboard,
  getUserRank,
  getTopPerformers
} from '../controllers/leaderboardController.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getLeaderboard);
router.get('/top-performers', getTopPerformers);

// Protected routes
router.get('/my-rank', authenticateUser, getUserRank);

export default router;