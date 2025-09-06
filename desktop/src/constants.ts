// NeuralEdge AI Desktop - Constants
// AION Protocol Compliance Constants

export const AION_CONSTANTS = {
  MAX_RESPONSE_TIME: 1000, // 1ms maximum response time
  MAX_STARTUP_TIME: 5000,  // 5s maximum startup time
  MAX_MEMORY_USAGE: 512,   // 512MB maximum memory usage
  MAX_CPU_USAGE: 50,       // 50% maximum CPU usage
  MAX_FAILURE_RATE: 0.001, // 0.001% maximum failure rate
  PERFORMANCE_CHECK_INTERVAL: 5000, // 5s interval for performance checks
  HEARTBEAT_INTERVAL: 30000,        // 30s interval for heartbeat
  SYNC_INTERVAL: 300000,            // 5min interval for sync operations
  BENCHMARK_ITERATIONS: 1000        // Number of iterations for benchmarks
} as const;

export const WINDOW_CONFIG = {
  MAIN: {
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768
  },
  AI_CONSOLE: {
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400
  },
  SETTINGS: {
    width: 600,
    height: 500,
    minWidth: 500,
    minHeight: 400
  },
  PERFORMANCE: {
    width: 900,
    height: 700,
    minWidth: 700,
    minHeight: 500
  }
} as const;

export const PATHS = {
  ASSETS: '../assets',
  RENDERER: '../renderer',
  MODELS: 'models',
  CACHE: 'cache',
  LOGS: 'logs'
} as const;

export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: { cpu: 10, memory: 100, responseTime: 100 },
  GOOD: { cpu: 25, memory: 200, responseTime: 500 },
  FAIR: { cpu: 50, memory: 350, responseTime: 800 },
  POOR: { cpu: 100, memory: 512, responseTime: 1000 }
} as const;

export const SECURITY_CONFIG = {
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  SALT_LENGTH: 64,
  ITERATIONS: 10000
} as const;