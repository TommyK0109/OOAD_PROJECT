import { Movie } from '../types/movie';
import { MovieFilters } from '../types/filters';

// Backend API configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to convert backend movie to frontend format
const formatMovie = (backendMovie: any): Movie => {
  return {
    id: backendMovie._id,
    title: backendMovie.title,
    originalTitle: backendMovie.originalTitle,
    posterUrl: backendMovie.posterUrl,
    backdropUrl: backendMovie.backdropUrl,
    year: backendMovie.year,
    rating: backendMovie.rating,
    ratingCount: backendMovie.ratingCount,
    imdbRating: backendMovie.imdbRating,
    imdbCount: backendMovie.imdbCount,
    runtime: backendMovie.runtime,
    overview: backendMovie.overview,
    genres: backendMovie.genres,
    country: backendMovie.country,
    episodes: backendMovie.episodes,
    streamingServices: backendMovie.streamingServices
  };
};

export const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${API_BASE}/movies/popular`);
    const movies = await handleApiResponse(response);
    return movies.map(formatMovie);
  } catch (error) {
    console.error('Failed to fetch popular movies:', error);
    throw error;
  }
};

export const getMovieById = async (id: string): Promise<Movie | undefined> => {
  try {
    const response = await fetch(`${API_BASE}/movies/${id}`);
    if (response.status === 404) {
      return undefined;
    }
    const movie = await handleApiResponse(response);
    return formatMovie(movie);
  } catch (error) {
    console.error('Failed to fetch movie by ID:', error);
    return undefined;
  }
};

export const getFilteredMovies = async (filters: MovieFilters): Promise<Movie[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();

    if (filters.releaseYear) {
      params.append('year', filters.releaseYear);
    }

    if (filters.genres && filters.genres.length > 0) {
      filters.genres.forEach(genre => {
        params.append('genres', genre);
      });
    }

    if (filters.rating) {
      params.append('rating', filters.rating);
    }

    if (filters.mediaType && filters.mediaType !== 'all') {
      params.append('mediaType', filters.mediaType);
    }

    if (filters.country) {
      params.append('country', filters.country);
    }

    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }

    const response = await fetch(`${API_BASE}/movies/filtered?${params.toString()}`);
    const movies = await handleApiResponse(response);
    return movies.map(formatMovie);
  } catch (error) {
    console.error('Failed to fetch filtered movies:', error);
    throw error;
  }
};
