import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  registerForEvent
} from '../controllers/eventsController.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', authenticateUser, createEvent);
router.post('/:id/register', authenticateUser, registerForEvent);

export default router;