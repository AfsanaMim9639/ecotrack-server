import express from 'express';
import {
  getLiveStats,
  getUserStats
} from '../controllers/statsController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/live', getLiveStats);

// Protected route
router.get('/user', authenticateUser, getUserStats);

export default router;