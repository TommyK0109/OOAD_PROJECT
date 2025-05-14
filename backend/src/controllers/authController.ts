import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../middleware/errorMiddleware';
import { config } from '../utils/config';

// Generate JWT token
const generateToken = (userId: string): string => {
    // @ts-ignore
    return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

// Register new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      throw new AppError('User already exists with that email or username', 400);
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    const token = generateToken(user.id);

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      watchlist: user.watchlist
    };

    res.status(201).json({
      success: true,
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate email and password provided
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data without password
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      watchlist: user.watchlist
    };

    res.status(200).json({
      success: true,
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // User is already attached to req from authMiddleware
    const user = req.user;

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update watchlist
export const updateWatchlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { movieId, action } = req.body;
      const userId = req.user.id;
  
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
  
      // Initialize watchlist if it doesn't exist
      if (!user.watchlist) {
        user.watchlist = [];
      }
  
      if (action === 'add') {
        // Add movie to watchlist if not already there
        if (!user.watchlist.includes(movieId)) {
          user.watchlist.push(movieId);
        }
      } else if (action === 'remove') {
        // Remove movie from watchlist
        user.watchlist = user.watchlist.filter(id => id !== movieId);
      } else {
        throw new AppError('Invalid action. Use "add" or "remove"', 400);
      }
  
      await user.save();
  
      res.status(200).json({
        success: true,
        data: {
          watchlist: user.watchlist
        }
      });
    } catch (error) {
      next(error);
    }
};