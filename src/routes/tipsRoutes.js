import express from 'express';
import {
  getAllTips,
  getTipById,
  createTip,
  likeTip
} from '../controllers/tipsController.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllTips);
router.get('/:id', getTipById);

// Protected routes
router.post('/', authenticateUser, createTip);
router.post('/:id/like', optionalAuth, likeTip);

export default router;