import express from 'express';
import {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  incrementParticipants,
  decrementParticipants  // Add this import
} from '../controllers/challengeController.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllChallenges);
router.get('/:id', getChallengeById);

// Protected routes (require authentication)
router.post('/', authenticateUser, createChallenge);
router.patch('/:id', authenticateUser, updateChallenge);
router.delete('/:id', authenticateUser, deleteChallenge);
router.post('/:id/increment', authenticateUser, incrementParticipants);
router.post('/:id/decrement', authenticateUser, decrementParticipants); // Add this route

export default router;