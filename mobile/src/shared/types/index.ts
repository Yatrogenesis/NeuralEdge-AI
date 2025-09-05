// NeuralEdge AI - Core Type Definitions
// AION Protocol Compliance: Performance & Security Types

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  threshold: number;
}

export interface SecurityContext {
  userId: string;
  sessionId: string;
  biometricVerified: boolean;
  encryptionKey?: string;
}

// Domain Types
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface UserProfile {
  displayName: string;
  avatar?: string;
  timezone: string;
  language: string;
}

export interface UserPreferences {
  aiModel: 'local' | 'cloud' | 'hybrid';
  backupFrequency: 'realtime' | 'daily' | 'weekly' | 'manual';
  biometricAuth: boolean;
  cloudProviders: CloudProvider[];
}

// AI & Vector Types
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  summary?: string;
  createdAt: Date;
  lastInteraction: Date;
  vectorCount: number;
  interactions: Interaction[];
}

export interface Interaction {
  id: string;
  conversationId: string;
  userInput: string;
  aiResponse: string;
  timestamp: Date;
  vectors: VectorMemoryEntry;
  metadata: InteractionMetadata;
}

export interface VectorMemoryEntry {
  id: string;
  userId: string;
  sessionId: string;
  interactionIndex: number;
  timestamp: Date;
  
  // Content
  userInput: string;
  aiResponse: string;
  
  // Vector Data
  inputVector: Float32Array;
  responseVector: Float32Array;
  contextVector: Float32Array;
  
  // Metadata
  sentiment: number;
  topics: string[];
  entities: string[];
  
  // Relationships
  parentInteractionId?: string;
  childInteractionIds: string[];
  relatedInteractionIds: string[];
}

export interface InteractionMetadata {
  sentiment: number;
  topics: string[];
  entities: string[];
  confidence: number;
  processingTime: number;
}

// Cloud Storage Types
export interface CloudProvider {
  id: string;
  name: 'cloudflare' | 'icloud' | 'dropbox' | 'terabox' | 'gdrive' | 'aws-s3';
  enabled: boolean;
  credentials: CloudCredentials;
  syncStatus: 'synced' | 'syncing' | 'error' | 'disabled';
}

export interface CloudCredentials {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  endpoint?: string;
}

// MCP Types
export interface MCPServer {
  id: string;
  name: string;
  url: string;
  capabilities: MCPCapabilities;
  status: 'connected' | 'disconnected' | 'error';
}

export interface MCPCapabilities {
  tools: boolean;
  resources: boolean;
  prompts: boolean;
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

// Performance & Error Types
export interface APIResponse<T = any> {
  data?: T;
  error?: APIError;
  performance: PerformanceMetrics;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// AION Protocol Compliance Types
export interface AIONCompliantFunction<T = any, R = any> {
  execute(params: T): Promise<AIONResult<R>>;
}

export interface AIONResult<T = any> {
  data?: T;
  error?: AIONError;
  performance: PerformanceMetrics;
  security: SecurityValidation;
}

export interface AIONError {
  code: string;
  message: string;
  category: 'performance' | 'security' | 'business' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityValidation {
  encrypted: boolean;
  authenticated: boolean;
  authorized: boolean;
  auditTrail: string;
}

// React Native Specific Types
export interface NavigationParams {
  [key: string]: any;
}

export interface ScreenProps<T = NavigationParams> {
  navigation: any;
  route: {
    params?: T;
  };
}

// State Management Types
export interface AppState {
  user: UserState;
  conversations: ConversationState;
  ai: AIState;
  cloud: CloudState;
  security: SecurityState;
}

export interface UserState {
  currentUser?: User;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
}

export interface ConversationState {
  conversations: Conversation[];
  currentConversation?: Conversation;
  loading: boolean;
}

export interface AIState {
  model: 'local' | 'cloud' | 'hybrid';
  inferenceEngine: 'onnx' | 'tensorflow' | 'webgpu';
  isProcessing: boolean;
  lastResponse?: string;
}

export interface CloudState {
  providers: CloudProvider[];
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSync?: Date;
}

export interface SecurityState {
  biometricAvailable: boolean;
  encryptionEnabled: boolean;
  deviceSecure: boolean;
  lastSecurityCheck: Date;
}

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };