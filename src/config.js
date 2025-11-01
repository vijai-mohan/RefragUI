// Environment configuration for the Refrag client

const ENV = import.meta.env.MODE || 'development'

const config = {
  development: {
    API_BASE_URL: 'http://localhost:7860',
    WORKER_POLL_INTERVAL: 2000, // 2 seconds
    DEBUG: true
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7860',
    WORKER_POLL_INTERVAL: 5000, // 5 seconds in production
    DEBUG: false
  }
}

const currentConfig = config[ENV] || config.development

export const API_BASE_URL = currentConfig.API_BASE_URL
export const WORKER_POLL_INTERVAL = currentConfig.WORKER_POLL_INTERVAL
export const DEBUG = currentConfig.DEBUG
export const IS_DEV = ENV === 'development'
export const IS_PROD = ENV === 'production'

// Helper for logging in dev mode
export const devLog = (...args) => {
  if (DEBUG) {
    console.log('[Refrag Dev]', ...args)
  }
}

export default currentConfig

