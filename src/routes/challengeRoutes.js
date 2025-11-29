import express from 'express';
import {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  incrementParticipants,
  decrementParticipants
} from '../controllers/challengeController.js';
import { authenticateUser, optionalAuth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllChallenges);
router.get('/:id', getChallengeById);

// Protected routes (require authentication)
router.post('/', authenticateUser, createChallenge);
router.post('/:id/increment', authenticateUser, incrementParticipants);
router.post('/:id/decrement', authenticateUser, decrementParticipants);

// Admin-only routes
router.patch('/:id', authenticateUser, isAdmin, updateChallenge);
router.delete('/:id', authenticateUser, isAdmin, deleteChallenge);

export default router;