// API Configuration Test Utility
import config from '../config/environment'

export const testApiConfiguration = () => {
  console.log('🔧 API Configuration Test:')
  console.log('API Base URL:', config.API_BASE_URL)
  console.log('App Name:', config.APP_NAME)
  console.log('Environment:', config.NODE_ENV)
  console.log('Is Development:', config.IS_DEVELOPMENT)
  console.log('Is Production:', config.IS_PRODUCTION)
  
  // Test if the URL is properly formatted
  const isValidUrl = config.API_BASE_URL.startsWith('https://') && config.API_BASE_URL.includes('ngrok')
  console.log('URL Valid:', isValidUrl)
  
  return {
    apiUrl: config.API_BASE_URL,
    isValid: isValidUrl,
    environment: config.NODE_ENV
  }
}

// Test the backend endpoints
export const testBackendConnection = async () => {
  try {
    const response = await fetch(config.API_BASE_URL.replace('/api', ''))
    const data = await response.json()
    console.log('🌐 Backend Connection Test:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Backend Connection Failed:', error)
    return { success: false, error: error.message }
  }
}
