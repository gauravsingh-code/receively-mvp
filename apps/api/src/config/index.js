import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT ,
  env: process.env.NODE_ENV || 'development',
  
  // Database
  db: {
    // host: process.env.DB_HOST || 'localhost',
    // port: process.env.DB_PORT || 5432,
    // name: process.env.DB_NAME || 'receively',
    // user: process.env.DB_USER || 'postgres',
    // password: process.env.DB_PASSWORD || '',',
  },
  
  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-~-secret',
    accessExpiry: '15m',
    refreshExpiry: '7d',
  },
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
