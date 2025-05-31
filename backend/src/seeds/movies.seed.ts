import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Movie data matching your frontend mockMovies
const movieData = [
  {
    id: '1',
    title: 'Angels and Demons',
    posterUrl: 'https://images.justwatch.com/poster/244160758/s166/angels-and-demons.avif',
    year: 2009,
    rating: 'R18+',
    genres: ['Action', 'Thriller'],
    overview: 'When Robert Langdon discovers evidence of the resurgence of an ancient secret brotherhood known as the Illuminati, he also faces a deadly threat to the existence of the secret organization\'s most despised enemy: the Catholic Church.',
    runtime: '138min',
    country: 'United States',
    imdbRating: '6.7',
    imdbCount: '(297k)',
    ratingCount: '(1.2k)',
    streamingServices: ['Netflix', 'Amazon Prime'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  },
  {
    id: '2',
    title: 'Minecraft Movie',
    posterUrl: 'https://images.justwatch.com/poster/328203307/s166/a-minecraft-movie.avif',
    year: 2025,
    rating: 'PG',
    genres: ['Fantasy', 'Comedy', 'Animation'],
    overview: 'A live-action adaptation of the popular video game Minecraft, following players as they navigate the pixelated world filled with adventure, creativity, and endless possibilities.',
    runtime: '110min',
    country: 'United States',
    imdbRating: '7.2',
    imdbCount: '(15k)',
    ratingCount: '(500)',
    streamingServices: ['Warner Bros'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=wJO_vIDZn-I' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=wJO_vIDZn-I' }
    ]
  },
  {
    id: '3',
    title: 'Family Guy',
    posterUrl: 'https://images.justwatch.com/poster/242592844/s166/family-guy.avif',
    year: 1999,
    rating: 'TV-MA',
    genres: ['Animation', 'Comedy'],
    overview: 'The satiric adventures of a working-class family in the misfit city of Quahog. Patriarch Peter Griffin, his wife Lois, and their three kids Meg, Chris and Stewie.',
    runtime: '22min',
    country: 'United States',
    episodes: 400,
    imdbRating: '8.1',
    imdbCount: '(320k)',
    ratingCount: '(15k)',
    streamingServices: ['Hulu', 'Fox'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' },
      { resolution: '1080p', streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' }
    ]
  },
  {
    id: '4',
    title: 'Solo Leveling',
    originalTitle: '俺だけレベルアップな件',
    posterUrl: 'https://images.justwatch.com/poster/310154566/s166/solo-leveling.avif',
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
    streamingServices: ['Netflix'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=QTxvzkwVsQE' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=QTxvzkwVsQE' }
    ]
  }
];

export async function seedMovies() {
  try {
    const Movie = mongoose.model('Movie');
    
    // Clear existing movies
    await Movie.deleteMany({});
    logger.info('Cleared existing movies');
    
    // Insert seed movies
    const insertedMovies = await Movie.insertMany(movieData);
    logger.info(`Inserted ${insertedMovies.length} movies`);
    
    // Log the inserted movies for verification
    insertedMovies.forEach(movie => {
      logger.info(`- ${movie.title} (${movie.year})`);
    });
    
    return insertedMovies;
  } catch (error) {
    logger.error('Error seeding movies:', error);
    throw error;
  }
}

export async function seedCategoriesForCompatibility() {
  try {
    const Category = mongoose.model('Category');
    
    // Create some basic categories for backward compatibility
    const categories = [
      { name: 'Action', description: 'Action movies and shows' },
      { name: 'Comedy', description: 'Comedy movies and shows' },
      { name: 'Drama', description: 'Drama movies and shows' },
      { name: 'Fantasy', description: 'Fantasy movies and shows' },
      { name: 'Animation', description: 'Animated movies and shows' },
      { name: 'Thriller', description: 'Thriller movies and shows' }
    ];
    
    // Clear existing categories
    await Category.deleteMany({});
    
    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    logger.info(`Inserted ${insertedCategories.length} categories for compatibility`);
    
    return insertedCategories;
  } catch (error) {
    logger.error('Error seeding categories:', error);
    throw error;
  }
}
