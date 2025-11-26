import express from 'express';
import {
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent
} from '../controllers/eventsController.js';

const router = express.Router();

router.get('/', getAllEvents);
router.get('/upcoming', getUpcomingEvents); // IMPORTANT: This must be BEFORE /:id
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/register', registerForEvent);

export default router;
