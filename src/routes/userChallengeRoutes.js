import express from 'express';
import {
  joinChallenge,
  getUserChallenges,
  getUserChallengeById,
  updateProgress,
  addProgressUpdate,
  getUserStats,
  abandonChallenge
} from '../controllers/userChallengeController.js';

const router = express.Router();

// ALL ROUTES ARE PUBLIC (No authentication required for testing)

// Join a challenge
router.post('/join', joinChallenge);

// Get all challenges for a user
router.get('/user/:userId', getUserChallenges);

// Get user statistics
router.get('/user/:userId/stats', getUserStats);

// Get single user challenge
router.get('/:id', getUserChallengeById);

// Update progress percentage
router.put('/:id/progress', updateProgress);

// Add progress update
router.post('/:id/updates', addProgressUpdate);

// Abandon challenge
router.put('/:id/abandon', abandonChallenge);

export default router;