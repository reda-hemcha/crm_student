// Environment configuration
const config = {
  // Backend API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://7364dad43d3c.ngrok-free.app/api',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'CRM School Management',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Development flags
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
}

export default config
