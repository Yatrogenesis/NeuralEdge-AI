// NeuralEdge AI - Application Constants
// AION Protocol Compliance Constants

// Performance Constants (AION Requirements)
export const PERFORMANCE = {
  MAX_RESPONSE_TIME: 1.0, // 1ms threshold
  MAX_FAILURE_RATE: 0.00001, // 0.001%
  MIN_AVAILABILITY: 0.99999, // 99.999%
  MAX_MEMORY_BASELINE: 50 * 1024 * 1024, // 50MB
  MIN_BATTERY_EFFICIENCY: 0.95, // 95%
  MAX_COLD_START: 500, // 500ms
} as const;

// Security Constants
export const SECURITY = {
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  KEY_DERIVATION: 'PBKDF2',
  MIN_PASSWORD_LENGTH: 12,
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  BIOMETRIC_TIMEOUT: 30 * 1000, // 30 seconds
  MAX_LOGIN_ATTEMPTS: 3,
} as const;

// AI Engine Constants
export const AI = {
  MAX_CONTEXT_LENGTH: 8192,
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TOKENS: 4096,
  VECTOR_DIMENSIONS: 1536,
  SIMILARITY_THRESHOLD: 0.8,
  LOCAL_MODEL_PATH: 'models/neural-edge.onnx',
} as const;

// Cloud Storage Constants
export const CLOUD = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3,
  BACKUP_RETENTION: 30, // days
} as const;

// Network Constants
export const NETWORK = {
  API_TIMEOUT: 30000, // 30 seconds
  RETRY_DELAY: 1000, // 1 second
  MAX_RETRIES: 3,
  HEADERS: {
    'Content-Type': 'application/json',
    'User-Agent': 'NeuralEdge-AI/1.0',
  },
} as const;

// Database Constants
export const DATABASE = {
  VERSION: 1,
  NAME: 'NeuralEdge',
  MAX_CACHE_SIZE: 10 * 1024 * 1024, // 10MB
  ENCRYPTION_KEY_LENGTH: 32,
} as const;

// UI Constants
export const UI = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_TIME: 500,
  TOUCH_FEEDBACK_DELAY: 100,
  LOADING_MIN_TIME: 500,
} as const;

// Platform Constants
export const PLATFORM = {
  MIN_IOS_VERSION: '12.0',
  MIN_ANDROID_VERSION: 21, // API Level 21 (Android 5.0)
  SUPPORTED_ARCHITECTURES: ['arm64', 'x86_64', 'armeabi-v7a'],
} as const;

// MCP Constants
export const MCP = {
  PROTOCOL_VERSION: '2024-11-05',
  MAX_SERVERS: 10,
  CONNECTION_TIMEOUT: 5000,
  DEFAULT_PORT: 3000,
} as const;

// Error Codes
export const ERROR_CODES = {
  // Performance Errors
  PERFORMANCE_THRESHOLD_EXCEEDED: 'PERF_001',
  MEMORY_LIMIT_EXCEEDED: 'PERF_002',
  TIMEOUT_ERROR: 'PERF_003',
  
  // Security Errors
  AUTHENTICATION_FAILED: 'SEC_001',
  AUTHORIZATION_DENIED: 'SEC_002',
  BIOMETRIC_UNAVAILABLE: 'SEC_003',
  ENCRYPTION_FAILED: 'SEC_004',
  DEVICE_COMPROMISED: 'SEC_005',
  
  // AI Errors
  MODEL_LOAD_FAILED: 'AI_001',
  INFERENCE_FAILED: 'AI_002',
  VECTOR_STORE_ERROR: 'AI_003',
  CONTEXT_OVERFLOW: 'AI_004',
  
  // Cloud Errors
  SYNC_FAILED: 'CLOUD_001',
  PROVIDER_UNAVAILABLE: 'CLOUD_002',
  UPLOAD_FAILED: 'CLOUD_003',
  DOWNLOAD_FAILED: 'CLOUD_004',
  
  // Network Errors
  CONNECTION_ERROR: 'NET_001',
  REQUEST_TIMEOUT: 'NET_002',
  RATE_LIMIT_EXCEEDED: 'NET_003',
  
  // General Errors
  UNKNOWN_ERROR: 'GEN_001',
  VALIDATION_ERROR: 'GEN_002',
  CONFIGURATION_ERROR: 'GEN_003',
} as const;

// Routes
export const ROUTES = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  BIOMETRIC_SETUP: 'BiometricSetup',
  
  // Main App
  HOME: 'Home',
  CHAT: 'Chat',
  CONVERSATIONS: 'Conversations',
  SETTINGS: 'Settings',
  
  // AI
  AI_MODELS: 'AIModels',
  VECTOR_MEMORY: 'VectorMemory',
  
  // Cloud
  CLOUD_SYNC: 'CloudSync',
  BACKUP_RESTORE: 'BackupRestore',
  
  // MCP
  MCP_SERVERS: 'MCPServers',
  TOOL_EXECUTION: 'ToolExecution',
  
  // System
  PERFORMANCE_MONITOR: 'PerformanceMonitor',
  SECURITY_AUDIT: 'SecurityAudit',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_PREFERENCES: 'user_preferences',
  CONVERSATIONS: 'conversations',
  VECTOR_CACHE: 'vector_cache',
  CLOUD_CREDENTIALS: 'cloud_credentials',
  SECURITY_SETTINGS: 'security_settings',
  PERFORMANCE_METRICS: 'performance_metrics',
  MCP_SERVERS: 'mcp_servers',
  APP_STATE: 'app_state',
} as const;

// Notifications
export const NOTIFICATIONS = {
  CATEGORIES: {
    AI_RESPONSE: 'ai_response',
    SYNC_COMPLETE: 'sync_complete',
    SECURITY_ALERT: 'security_alert',
    PERFORMANCE_WARNING: 'performance_warning',
  },
  PRIORITIES: {
    LOW: 'low',
    DEFAULT: 'default',
    HIGH: 'high',
    CRITICAL: 'critical',
  },
} as const;

// Feature Flags
export const FEATURES = {
  LOCAL_AI_INFERENCE: true,
  CLOUD_SYNC: true,
  MCP_INTEGRATION: true,
  BIOMETRIC_AUTH: true,
  PERFORMANCE_MONITORING: true,
  OFFLINE_MODE: true,
  COLLABORATION: false, // Phase 5 feature
  DESKTOP_SYNC: false, // Phase 6 feature
} as const;

export type RouteNames = keyof typeof ROUTES;
export type ErrorCodes = keyof typeof ERROR_CODES;
export type StorageKeys = keyof typeof STORAGE_KEYS;