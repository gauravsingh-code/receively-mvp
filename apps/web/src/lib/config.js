/**
 * Environment Configuration
 */

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Receively',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
