import express from 'express';
import {
  joinChallenge,
  getUserChallenges,
  getUserChallengeById,
  updateProgress,
  abandonChallenge
} from '../controllers/userChallengeController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Join challenge
router.post('/join', joinChallenge);

// Get all user challenges
router.get('/', getUserChallenges);

// Get one
router.get('/:id', getUserChallengeById);

// Update progress (FIXED: must be PATCH)
router.patch('/:id/progress', updateProgress);

// Abandon challenge (missing route FIXED)
router.patch('/:id/abandon', abandonChallenge);

export default router;
