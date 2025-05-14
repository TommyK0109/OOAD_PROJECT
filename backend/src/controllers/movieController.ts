import { Request, Response, NextFunction } from 'express';
import { Movie } from '../models/Movie';
import { AppError } from '../middleware/errorMiddleware';

// Get popular movies
export const getPopularMovies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const movies = await Movie.find()
      .sort({ popularity: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Movie.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        movies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get movie by ID
export const getMovieById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// Search movies
export const searchMovies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, genres, year, rating } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Build search filter
    const filter: any = {};
    
    if (query) {
      filter.$text = { $search: query as string };
    }
    
    if (genres) {
      filter.genres = { $in: (genres as string).split(',') };
    }
    
    if (year) {
      filter.year = parseInt(year as string);
    }
    
    if (rating) {
      // Assuming rating is stored as a number
      filter.imdbRating = { $gte: parseFloat(rating as string) };
    }
    
    const movies = await Movie.find(filter)
      .skip(skip)
      .limit(limit);
    
    const total = await Movie.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        movies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get movies by genre
export const getMoviesByGenre = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const genre = req.params.genre;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const movies = await Movie.find({ genres: genre })
      .skip(skip)
      .limit(limit);
    
    const total = await Movie.countDocuments({ genres: genre });
    
    res.status(200).json({
      success: true,
      data: {
        movies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};