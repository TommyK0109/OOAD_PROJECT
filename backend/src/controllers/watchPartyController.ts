import { Request, Response, NextFunction } from 'express';
import { WatchParty } from '../models/watchParty';
import { Movie } from '../models/Movie';
import { AppError } from '../middleware/errorMiddleware';
import { v4 as uuidv4 } from 'uuid';

export const createWatchParty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movieId, name } = req.body;
    const hostId = req.user.id;
    const username = req.user.username;

    // Verify that the movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    // Create a new watch party
    const watchParty = await WatchParty.create({
      name: name || `${username}'s Watch Party`,
      movieId,
      hostId,
      currentTime: 0,
      isPlaying: false,
      participants: [{
        userId: hostId,
        username,
        joinedAt: new Date()
      }],
      chatMessages: []
    });

    res.status(201).json({
      success: true,
      data: watchParty
    });
  } catch (error) {
    next(error);
  }
};

// Get a watch party by ID
export const getWatchPartyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const watchParty = await WatchParty.findById(req.params.id);
    
    if (!watchParty) {
      throw new AppError('Watch party not found', 404);
    }
    
    // Get the movie details
    const movie = await Movie.findById(watchParty.movieId);
    
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: {
        watchParty,
        movie
      }
    });
  } catch (error) {
    next(error);
  }
};

// Join a watch party
export const joinWatchParty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const watchPartyId = req.params.id;
    const userId = req.user.id;
    const username = req.user.username;
    
    const watchParty = await WatchParty.findById(watchPartyId);
    
    if (!watchParty) {
      throw new AppError('Watch party not found', 404);
    }
    
    // Check if user is already in the watch party
    const isParticipant = watchParty.participants.some(p => p.userId === userId);
    
    if (!isParticipant) {
      // Add user to participants
      watchParty.participants.push({
        userId,
        username,
        joinedAt: new Date()
      });
      
      await watchParty.save();
    }
    
    // Get the movie details
    const movie = await Movie.findById(watchParty.movieId);
    
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: {
        watchParty,
        movie
      }
    });
  } catch (error) {
    next(error);
  }
};

// Leave a watch party
export const leaveWatchParty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const watchPartyId = req.params.id;
    const userId = req.user.id;
    
    const watchParty = await WatchParty.findById(watchPartyId);
    
    if (!watchParty) {
      throw new AppError('Watch party not found', 404);
    }
    
    // Remove user from participants
    watchParty.participants = watchParty.participants.filter(p => p.userId !== userId);
    
    // If the host leaves, assign a new host or delete the party
    if (watchParty.hostId === userId) {
      if (watchParty.participants.length > 0) {
        // Assign first participant as new host
        watchParty.hostId = watchParty.participants[0].userId;
      } else {
        // Delete the watch party if no participants left
        await WatchParty.findByIdAndDelete(watchPartyId);
        
        res.status(200).json({
          success: true,
          message: 'Watch party deleted as no participants remain'
        });
        return;
      }
    }
    
    await watchParty.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully left the watch party'
    });
  } catch (error) {
    next(error);
  }
};

// Get active watch parties for a user
export const getUserWatchParties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    // Find watch parties where user is a participant
    const watchParties = await WatchParty.find({
      'participants.userId': userId
    });
    
    // Get movie details for each watch party
    const watchPartiesWithMovies = await Promise.all(
      watchParties.map(async (party) => {
        const movie = await Movie.findById(party.movieId);
        return {
          watchParty: party,
          movie
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: watchPartiesWithMovies
    });
  } catch (error) {
    next(error);
  }
};