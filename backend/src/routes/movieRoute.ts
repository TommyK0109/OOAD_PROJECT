import express from 'express';
import { 
  getPopularMovies, 
  getMovieById, 
  searchMovies,
  getMoviesByGenre
} from '../controllers/movieController';

const router = express.Router();

router.get('/popular', getPopularMovies);
router.get('/search', searchMovies);
router.get('/genre/:genre', getMoviesByGenre);
router.get('/:id', getMovieById);

export default router;