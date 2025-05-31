import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { seedMovies, seedCategoriesForCompatibility } from '../seeds/movies.seed';

export async function initializeDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-watch-party';
        await mongoose.connect(mongoUri);

        logger.info('Connected to MongoDB successfully');

        // Create schemas and models
        await createSchemas();
    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
}

export function getDb() {
    if (!mongoose.connection.readyState) {
        throw new Error('Database not initialized');
    }
    return mongoose.connection;
}

async function createSchemas() {
    try {
        // Category Schema
        const categorySchema = new mongoose.Schema({
            name: { type: String, required: true, unique: true },
            description: String
        });

        // Quality Schema
        const qualitySchema = new mongoose.Schema({
            resolution: { type: String, required: true, unique: true },
            bitrate: { type: Number, required: true }
        });

        // User Schema
        const userSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            isOnline: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        // Movie Schema - Updated to match frontend Movie interface
        const movieSchema = new mongoose.Schema({
            title: { type: String, required: true },
            originalTitle: String,
            posterUrl: { type: String, required: true },
            backdropUrl: String,
            year: Number,
            rating: String, // "78%", "R18+"
            ratingCount: String, // "(79)"
            imdbRating: String, // "7.0"
            imdbCount: String, // "(1k)"
            runtime: String, // "23min"
            overview: String, // Changed from 'description'
            genres: [String], // Changed from categoryId to array of strings
            country: String,
            episodes: Number,
            streamingServices: [String],
            viewCount: { type: Number, default: 0 },
            qualities: [{
                resolution: String,
                streamUrl: String
            }],
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        // WatchParty Schema
        const watchPartySchema = new mongoose.Schema({
            roomName: { type: String, required: true },
            inviteCode: { type: String, required: true, unique: true },
            createdAt: { type: Date, default: Date.now },
            hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            currentMovieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
            currentPosition: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true },
            participants: [{
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                joinedAt: { type: Date, default: Date.now }
            }]
        });

        // ChatMessage Schema
        const chatMessageSchema = new mongoose.Schema({
            partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'WatchParty', required: true },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        });

        // Watchlist Schema
        const watchlistSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            movies: [{
                movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
                addedAt: { type: Date, default: Date.now }
            }]
        });

        // PartyInvitation Schema
        const partyInvitationSchema = new mongoose.Schema({
            partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'WatchParty', required: true },
            senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            inviteLink: { type: String, required: true },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'declined'],
                default: 'pending'
            },
            createdAt: { type: Date, default: Date.now }
        });

        // WatchHistory Schema
        const watchHistorySchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
            watchedAt: { type: Date, default: Date.now },
            duration: { type: Number, default: 0 },
            completed: { type: Boolean, default: false }
        });

        // Create models
        mongoose.model('Category', categorySchema);
        mongoose.model('Quality', qualitySchema);
        mongoose.model('User', userSchema);
        mongoose.model('Movie', movieSchema);
        mongoose.model('WatchParty', watchPartySchema);
        mongoose.model('ChatMessage', chatMessageSchema);
        mongoose.model('Watchlist', watchlistSchema);
        mongoose.model('PartyInvitation', partyInvitationSchema);
        mongoose.model('WatchHistory', watchHistorySchema);

        logger.info('All schemas created successfully');
        
        // Run seeds if SEED_DB is true
        if (process.env.SEED_DB === 'true') {
            logger.info('SEED_DB is true, running database seeds...');
            await seedCategoriesForCompatibility();
            await seedMovies();
            logger.info('Database seeding completed successfully');
        }
        
    } catch (error) {
        logger.error('Error creating schemas:', error);
        throw error;
    }
} 