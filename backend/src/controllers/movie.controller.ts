import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

interface MovieQuality {
  resolution: string;
  streamUrl: string;
}

interface WatchlistMovie {
  movieId: mongoose.Types.ObjectId | mongoose.Document;
  addedAt: Date;
}

interface MovieDocument extends mongoose.Document {
  title: string;
  description?: string;
  duration: number;
  thumbnailUrl?: string;
  viewCount: number;
  categoryId?: mongoose.Types.ObjectId;
  qualities: MovieQuality[];
}

export const movieController = {
  async getMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, limit = 20, offset = 0 } = req.query;
      const Movie = mongoose.model('Movie');
      const Category = mongoose.model('Category');

      let query: any = {};

      if (category) {
        const categoryDoc = await Category.findOne({ name: category });
        if (categoryDoc) {
          query.categoryId = categoryDoc._id;
        }
      }

      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }

      const movies = await Movie.find(query)
        .populate('categoryId', 'name')
        .sort({ viewCount: -1 })
        .skip(Number(offset))
        .limit(Number(limit));

      return res.json({
        movies,
        pagination: {
          limit: Number(limit),
          offset: Number(offset)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async getMovieById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const Movie = mongoose.model('Movie');

      const movie = await Movie.findById(id).populate('categoryId', 'name');

      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      // Increment view count
      movie.viewCount += 1;
      await movie.save();

      return res.json(movie);
    } catch (error) {
      return next(error);
    }
  },

  async getStreamUrl(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const { quality = '720p' } = req.query;
      const Movie = mongoose.model('Movie');
      const WatchHistory = mongoose.model('WatchHistory');

      const movie = await Movie.findById(id);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      const qualityInfo = movie.qualities.find((q: MovieQuality) => q.resolution === quality);
      if (!qualityInfo) {
        return res.status(404).json({ error: 'Stream not found' });
      }

      // Log watch history
      await WatchHistory.create({
        userId: req.user.userId,
        movieId: movie._id
      });

      return res.json({
        streamUrl: qualityInfo.streamUrl,
        quality
      });
    } catch (error) {
      return next(error);
    }
  },

  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const Category = mongoose.model('Category');
      const categories = await Category.find().sort({ name: 1 });
      return res.json(categories);
    } catch (error) {
      return next(error);
    }
  },

  async getPopularMovies(_req: Request, res: Response, next: NextFunction) {
    try {
      const Movie = mongoose.model('Movie');
      const movies = await Movie.find()
        .populate('categoryId', 'name')
        .sort({ viewCount: -1 })
        .limit(10);

      return res.json(movies);
    } catch (error) {
      return next(error);
    }
  },

  async getNewReleases(_req: Request, res: Response, next: NextFunction) {
    try {
      const Movie = mongoose.model('Movie');
      const movies = await Movie.find()
        .populate('categoryId', 'name')
        .sort({ _id: -1 })
        .limit(10);

      return res.json(movies);
    } catch (error) {
      return next(error);
    }
  },

  async addToWatchlist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { movieId } = req.body;
      const Watchlist = mongoose.model('Watchlist');

      // Get or create user's watchlist
      let watchlist = await Watchlist.findOne({ userId: req.user.userId });
      if (!watchlist) {
        watchlist = await Watchlist.create({ userId: req.user.userId });
      }

      // Check if movie already in watchlist
      const existingMovie = watchlist.movies.find((m: WatchlistMovie) => m.movieId.toString() === movieId);
      if (existingMovie) {
        return res.status(409).json({ error: 'Movie already in watchlist' });
      }

      // Add movie to watchlist
      watchlist.movies.push({ movieId });
      await watchlist.save();

      return res.json({ message: 'Added to watchlist' });
    } catch (error) {
      return next(error);
    }
  },

  async removeFromWatchlist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { movieId } = req.params;
      const Watchlist = mongoose.model('Watchlist');

      const watchlist = await Watchlist.findOne({ userId: req.user.userId });
      if (!watchlist) {
        return res.status(404).json({ error: 'Watchlist not found' });
      }

      // Remove movie from watchlist
      watchlist.movies = watchlist.movies.filter((m: WatchlistMovie) => m.movieId.toString() !== movieId);
      await watchlist.save();

      return res.json({ message: 'Removed from watchlist' });
    } catch (error) {
      return next(error);
    }
  },

  async getWatchlist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const Watchlist = mongoose.model('Watchlist');
      const watchlist = await Watchlist.findOne({ userId: req.user.userId })
        .populate({
          path: 'movies.movieId',
          populate: { path: 'categoryId', select: 'name' }
        });

      if (!watchlist) {
        return res.json([]);
      }

      const movies = watchlist.movies.map((m: WatchlistMovie) => ({
        ...(m.movieId as MovieDocument).toObject(),
        addedAt: m.addedAt
      }));

      return res.json(movies);
    } catch (error) {
      return next(error);
    }
  },

  async getWatchHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const WatchHistory = mongoose.model('WatchHistory');
      const history = await WatchHistory.find({ userId: req.user.userId })
        .populate({
          path: 'movieId',
          populate: { path: 'categoryId', select: 'name' }
        })
        .sort({ watchedAt: -1 })
        .limit(50);

      return res.json(history);
    } catch (error) {
      return next(error);
    }
  }
};