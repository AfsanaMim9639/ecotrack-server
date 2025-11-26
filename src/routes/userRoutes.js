// routes/userRoutes.js
import express from 'express';
import {
  getOrCreateProfile,
  getUserProfile,
  updateUserProfile
} from '../controllers/userController.js';

const router = express.Router();

// Get or create user profile
router.post('/profile', getOrCreateProfile);

// Get user profile
router.get('/profile/:userId', getUserProfile);

// Update user profile
router.put('/profile/:userId', updateUserProfile);

export default router;