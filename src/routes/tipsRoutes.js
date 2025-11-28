import express from 'express';
import {
  getAllTips,
  getTipById,
  createTip,
  likeTip
} from '../controllers/tipsController.js';

const router = express.Router();

// Public routes
router.get('/', getAllTips);              // GET /api/tips?featured=true&limit=6
router.get('/:id', getTipById);           // GET /api/tips/:id
router.post('/:id/like', likeTip);        // POST /api/tips/:id/like

// Admin route (optional - add auth later)
router.post('/', createTip);              // POST /api/tips

export default router;
