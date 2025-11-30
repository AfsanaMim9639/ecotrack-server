import express from 'express';
import {
  joinChallenge,
  getUserChallenges,
  getUserChallengeById,
  getActivityById, // ✅ NEW
  updateProgress,
  abandonChallenge
} from '../controllers/userChallengeController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Get all user challenges
router.get('/', getUserChallenges);

// Get single user challenge/activity (both endpoints for flexibility)
router.get('/:id', getUserChallengeById);
router.get('/activity/:id', getActivityById); 

// Join challenge
router.post('/join', joinChallenge);
router.post('/join/:challengeId', joinChallenge); 

// Update progress
router.post('/:id/progress', updateProgress);
router.patch('/:id/progress', updateProgress); 

// Abandon challenge
router.put('/:id/abandon', abandonChallenge);
router.patch('/:id/abandon', abandonChallenge); 

export default router;