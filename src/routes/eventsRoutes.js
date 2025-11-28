import express from 'express';
import {
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  registerForEvent
} from '../controllers/eventsController.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);                    // GET /api/events
router.get('/upcoming', getUpcomingEvents);       // GET /api/events/upcoming?limit=6
router.get('/:id', getEventById);                 // GET /api/events/:id
router.post('/:id/register', registerForEvent);   // POST /api/events/:id/register

// Admin route (optional - add auth later)
router.post('/', createEvent);                    // POST /api/events

export default router;