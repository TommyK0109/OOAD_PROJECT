import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { errorMiddleware } from './middleware/error.middleware';
import { logger } from './utils/logger';
import routes from './routes';
import { initializeDatabase } from './config/database';
import { WatchPartyManager } from './websocket/WatchPartyManager';

// Load environment variables
dotenv.config();
console.log('Loaded PORT from .env:', process.env.PORT);

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Initialize WatchParty Manager
const watchPartyManager = WatchPartyManager.getInstance();
watchPartyManager.initialize(wss);

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 8081;

async function startServer() {
    try {
        // Initialize database connection
        await initializeDatabase();
        logger.info('Database connection established');

        // Start server with error handling
        httpServer.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`WebSocket server ready`);
        });

        // Handle server listen errors
        httpServer.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${PORT} is already in use. Please:`);
                logger.error('1. Kill the existing process, or');
                logger.error('2. Change the PORT in your .env file, or');
                logger.error('3. Use a different port number');
                process.exit(1);
            } else {
                logger.error('Server error:', error);
                process.exit(1);
            }
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});

startServer(); 