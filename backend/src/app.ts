import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorMiddleware';
import authRoutes from './routes/authRoute';
import movieRoutes from './routes/movieRoute';
import watchPartyRoutes from './routes/watchPartyRoute';
import { config } from './utils/config';

const app = express();

app.use(express.json());
app.use(cors({
  origin: config.clientOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/watch-party', watchPartyRoutes);
app.use(errorHandler);

export default app;