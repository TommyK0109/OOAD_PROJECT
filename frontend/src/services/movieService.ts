import { Movie } from '../types/movie';
import { MovieFilters } from '../types/filters';

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

export const getFilteredMovies = async (filters: MovieFilters): Promise<Movie[]> => {
  // This would be an API call with filter parameters in production
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Filtering movies with:', filters);
      let filteredMovies = [...mockMovies];
      
      // Filter by release year
      if (filters.releaseYear) {
        filteredMovies = filteredMovies.filter(movie => 
          movie.year?.toString() === filters.releaseYear
        );
      }
      
      // Filter by genres
      if (filters.genres && filters.genres.length > 0) {
        filteredMovies = filteredMovies.filter(movie => 
          movie.genres?.some(genre => 
            filters.genres?.some(g => genre.includes(g))
          )
        );
      }
      
      // Filter by rating
      if (filters.rating) {
        const minRating = parseInt(filters.rating);
        filteredMovies = filteredMovies.filter(movie => {
          let movieRating = 0;
          
          if (movie.imdbRating) {
            movieRating = parseFloat(movie.imdbRating);
          } else if (movie.rating && movie.rating.includes('%')) {
            movieRating = parseFloat(movie.rating) / 10;
          }
          
          return !isNaN(movieRating) && movieRating >= minRating;
        });
      }
      
      // Filter by media type - only apply if not 'all'
      if (filters.mediaType && filters.mediaType !== 'all') {
        filteredMovies = filteredMovies.filter(movie => {
          // Determine media type based on episodes property
          const isTVShow = movie.episodes !== undefined;
          return (filters.mediaType === 'tvshow' && isTVShow) || 
                 (filters.mediaType === 'movie' && !isTVShow);
        });
      }
      
      // Filter by country
      if (filters.country) {
        filteredMovies = filteredMovies.filter(movie => 
          movie.country?.includes(filters.country || '')
        );
      }
      
      // Sort results
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'alphabetical':
            filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case 'releaseDate':
            filteredMovies.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
          case 'rating':
            filteredMovies.sort((a, b) => {
              const aRating = parseFloat(a.imdbRating || '0');
              const bRating = parseFloat(b.imdbRating || '0');
              return bRating - aRating;
            });
            break;
          // popularity is default
        }
      }
      
      console.log('Filtered results:', filteredMovies.length);
      resolve(filteredMovies);
    }, 500);
  });
};
