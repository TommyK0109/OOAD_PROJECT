import express from 'express';
import { register, login, getCurrentUser, updateWatchlist } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.put('/watchlist', protect, updateWatchlist);

export default router;