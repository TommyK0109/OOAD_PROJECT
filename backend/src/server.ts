import http from 'http';
import app from './app';
import { config } from './utils/config';
import { connectDB } from './utils/database';
import logger from './utils/logger';
import { initializeSocketIO } from './sockets/watchPartySocket';

const server = http.createServer(app);

initializeSocketIO(server);
connectDB();

server.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});