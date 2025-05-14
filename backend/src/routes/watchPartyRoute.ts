import express from 'express';
import { 
  createWatchParty,
  getWatchPartyById,
  joinWatchParty,
  leaveWatchParty,
  getUserWatchParties
} from '../controllers/watchPartyController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect); // All watch party routes require authentication

router.post('/', createWatchParty);
router.get('/me', getUserWatchParties);
router.get('/:id', getWatchPartyById);
router.post('/:id/join', joinWatchParty);
router.post('/:id/leave', leaveWatchParty);

export default router;