import { Movie } from '../types/movie';

// Mock data for development
const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Angles and Demons',
    posterUrl: 'https://images.justwatch.com/poster/244160758/s166/angels-and-demons.avif', // Replace with actual URLs or import local images
    year: 2009,
    rating: 'R18+',
    genres: ['Action', 'Thriller']
  },
  {
    id: '2',
    title: 'Minecraft Movie',
    posterUrl: 'https://images.justwatch.com/poster/328203307/s166/a-minecraft-movie.avif',
    year: 2025,
    rating: 'PG',
    genres: ['Fantasy', 'Comedy', 'Animation']
  },
  {
    id: '3',
    title: 'Family Guy',
    posterUrl: 'https://images.justwatch.com/poster/242592844/s166/family-guy.avif',
    year: 1999,
    rating: 'TV-MA',
    genres: ['Animation', 'Comedy']
  },
  {
    id: '4',
    title: 'Solo Leveling',
    originalTitle: '俺だけレベルアップな件 ',
    posterUrl: 'https://images.justwatch.com/poster/310154566/s166/solo-leveling.avif', // Replace with actual URLs
    backdropUrl: 'https://images.justwatch.com/poster/321046122/s332/season-2.avif',
    year: 2024,
    rating: '78%',
    ratingCount: '(79)',
    imdbRating: '7.0',
    imdbCount: '(1k)',
    runtime: '23min',
    overview: 'The story follows a skilled warrior who can parry any attack, making him virtually invincible in battle. After defeating the demon king, he seeks a peaceful life as an adventurer but finds that his reputation and abilities continue to draw him into conflict.',
    genres: ['Action & Adventure', 'Fantasy', 'Animation', 'Japanese Anime'],
    country: 'South Japan',
    episodes: 12,
    streamingServices: ['Netflix']
  },
  // Add more mock movies to fill your grid
  // You can see in the image there are multiple rows of movies
  // Add at least 12-18 entries to get a full page
];

export const getPopularMovies = async (): Promise<Movie[]> => {
  // This would be an API call in production
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockMovies), 500);
  });
};

export const getMovieById = async (id: string): Promise<Movie | undefined> => {
  // This would be an API call for a specific movie in production
  return new Promise((resolve) => {
    setTimeout(() => {
      const movie = mockMovies.find(movie => movie.id === id);
      resolve(movie);
    }, 500);
  });
};
