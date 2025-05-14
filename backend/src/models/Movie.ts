import mongoose, { Document, Schema } from 'mongoose';
import { MovieType } from '../types/movie';

export interface MovieDocument extends Omit<MovieType, 'id'>, Document {}

const movieSchema = new Schema<MovieDocument>({
  title: {
    type: String,
    required: true,
    index: true
  },
  originalTitle: {
    type: String
  },
  posterUrl: {
    type: String,
    required: true
  },
  backdropUrl: {
    type: String
  },
  year: {
    type: Number
  },
  rating: {
    type: String
  },
  ratingCount: {
    type: String
  },
  imdbRating: {
    type: String
  },
  imdbCount: {
    type: String
  },
  runtime: {
    type: String
  },
  overview: {
    type: String
  },
  genres: [{
    type: String
  }],
  country: {
    type: String
  },
  episodes: {
    type: Number
  },
  streamingServices: [{
    type: String
  }],
  videoUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for text search
movieSchema.index({ 
  title: 'text', 
  originalTitle: 'text', 
  overview: 'text' 
});

export const Movie = mongoose.model<MovieDocument>('Movie', movieSchema);