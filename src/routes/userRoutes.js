import express from 'express';
import {
  getOrCreateProfile,
  getUserProfile,
  getUserBadges
} from '../controllers/userController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

router.post('/profile', getOrCreateProfile);
router.get('/profile', getUserProfile);
router.get('/badges', getUserBadges);

export default router;