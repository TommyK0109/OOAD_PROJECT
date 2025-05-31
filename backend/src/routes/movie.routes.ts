import { Router } from 'express';
import { movieController } from '../controllers/movie.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', optionalAuthMiddleware, movieController.getMovies);
router.get('/popular', movieController.getPopularMovies);
router.get('/new', movieController.getNewReleases);
router.get('/filtered', movieController.getFilteredMovies);
router.get('/categories', movieController.getCategories);
router.get('/:id', optionalAuthMiddleware, movieController.getMovieById);

// Protected routes
router.get('/:id/stream', authMiddleware, movieController.getStreamUrl);
router.post('/watchlist', authMiddleware, movieController.addToWatchlist);
router.delete('/watchlist/:movieId', authMiddleware, movieController.removeFromWatchlist);
router.get('/user/watchlist', authMiddleware, movieController.getWatchlist);
router.get('/user/history', authMiddleware, movieController.getWatchHistory);

export default router;