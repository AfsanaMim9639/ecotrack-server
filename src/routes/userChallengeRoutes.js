import express from 'express';
import {
  joinChallenge,
  getUserChallenges,
  getUserChallengeById,
  updateProgress
} from '../controllers/userChallengeController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

router.post('/join', joinChallenge);
router.get('/', getUserChallenges);
router.get('/:id', getUserChallengeById);
router.post('/:id/progress', updateProgress);

export default router;