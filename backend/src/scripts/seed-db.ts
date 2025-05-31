import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initializeDatabase } from '../config/database';
import { seedMovies, seedCategoriesForCompatibility } from '../seeds/movies.seed';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

async function runSeeds() {
  try {
    logger.info('Starting manual database seeding...');
    
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-watch-party';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');
    
    // Create schemas first (without auto-seeding)
    await initializeDatabase();
    
    // Run seeds manually
    logger.info('Running seeds manually...');
    await seedCategoriesForCompatibility();
    await seedMovies();
    
    // Verify seeding worked
    const Movie = mongoose.model('Movie');
    const movies = await Movie.find();
    logger.info(`✅ Seeding completed! Found ${movies.length} movies:`);
    movies.forEach(movie => {
      logger.info(`  - ${movie.title} (${movie.year})`);
    });
    
    // Close connection
    await mongoose.connection.close();
    logger.info('✅ Manual seeding completed successfully!');
    
  } catch (error) {
    logger.error('❌ Manual seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
runSeeds();
