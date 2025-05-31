import mongoose from 'mongoose';
import { initializeDatabase } from '../config/database';
import { logger } from '../utils/logger';

async function testDatabaseSetup() {
  try {
    logger.info('Testing database setup...');
    
    // Initialize database
    await initializeDatabase();
    
    // Test movie queries
    const Movie = mongoose.model('Movie');
    const movies = await Movie.find();
    
    logger.info(`✅ Found ${movies.length} movies in database:`);
    movies.forEach(movie => {
      logger.info(`  - ${movie.title} (${movie.year}) - Genres: ${movie.genres?.join(', ')}`);
    });
    
    // Test popular movies endpoint logic
    const popularMovies = await Movie.find().sort({ viewCount: -1 }).limit(5);
    logger.info(`✅ Popular movies query works - ${popularMovies.length} results`);
    
    // Test filtered movies logic
    const actionMovies = await Movie.find({ genres: { $in: ['Action'] } });
    logger.info(`✅ Genre filter works - ${actionMovies.length} action movies found`);
    
    // Close connection
    await mongoose.connection.close();
    logger.info('✅ Database test completed successfully!');
    
  } catch (error) {
    logger.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseSetup();
