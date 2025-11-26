import express from 'express';
import {
  getAllTips,
  getTipById,
  createTip,
  updateTip,
  deleteTip,
  likeTip
} from '../controllers/tipsController.js';

const router = express.Router();

router.get('/', getAllTips);
router.get('/:id', getTipById);
router.post('/', createTip);
router.put('/:id', updateTip);
router.delete('/:id', deleteTip);
router.post('/:id/like', likeTip);

export default router;