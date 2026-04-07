import 'dotenv/config';
import {createApp} from './app.js';
import { config } from './config/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

// Create Express app
const server = createApp();

// Global error handler
server.use(errorHandler);

// Start server
server.listen(config.port, () => {
  logger.info(`Server running in ${config.env} mode on port ${config.port}`, { timestamp : new Date().toISOString()});
});


server.get('/', (req, res) => {
    res.send('Hii working fine ...');
});
