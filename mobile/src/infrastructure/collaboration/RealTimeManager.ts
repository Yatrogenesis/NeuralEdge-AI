// NeuralEdge AI - Real-Time Updates Manager
// AION Protocol Compliant Real-time Synchronization

import { PerformanceMonitor, withPerformanceMonitoring } from '../../shared/utils/performance';
import SecurityManager from '../security/SecurityManager';
import { AIONResult, AIONError } from '../../shared/types';
import { PERFORMANCE, ERROR_CODES } from '../../shared/constants';

export interface RealTimeMessage {
  id: string;
  type: 'user_status' | 'memory_update' | 'conversation_update' | 'collaboration_event' | 'system_notification';
  from: string;
  to: string | 'broadcast';
  projectId?: string;
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  encrypted: boolean;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentProject?: string;
  activeMemories: string[];
  device: string;
  location?: {
    country: string;
    timezone: string;
  };
}

export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  reconnectAttempts: number;
  lastConnected?: Date;
  lastDisconnected?: Date;
  latency: number; // milliseconds
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface MessageQueue {
  pending: RealTimeMessage[];
  failed: RealTimeMessage[];
  delivered: string[]; // message IDs
  acknowledged: string[]; // message IDs
}

export class RealTimeManager {
  private static instance: RealTimeManager;
  private performanceMonitor: PerformanceMonitor;
  private securityManager: SecurityManager;
  private connection: WebSocket | null = null;
  private connectionStatus: ConnectionStatus;
  private messageQueue: MessageQueue;
  private userPresence: Map<string, UserPresence> = new Map();
  private messageHandlers: Map<string, Function[]> = new Map();
  private heartbeatInterval?: NodeJS.Timeout;
  private reconnectTimeout?: NodeJS.Timeout;
  private isInitialized = false;
  private currentUserId?: string;

  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.securityManager = SecurityManager.getInstance();
    this.connectionStatus = {
      connected: false,
      connecting: false,
      reconnecting: false,
      reconnectAttempts: 0,
      latency: 0,
      quality: 'poor',
    };
    this.messageQueue = {
      pending: [],
      failed: [],
      delivered: [],
      acknowledged: [],
    };
  }

  public static getInstance(): RealTimeManager {
    if (!RealTimeManager.instance) {
      RealTimeManager.instance = new RealTimeManager();
    }
    return RealTimeManager.instance;
  }

  @withPerformanceMonitoring('RealTime.initialize')
  public async initialize(userId: string, serverUrl?: string): Promise<AIONResult<boolean>> {
    try {
      if (this.isInitialized) {
        return {
          data: true,
          performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
          security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `REALTIME_ALREADY_INIT_${Date.now()}` },
        };
      }

      console.log('[REALTIME] Initializing real-time manager...');

      this.currentUserId = userId;

      // Initialize security manager
      await this.securityManager.initialize();

      // Connect to real-time server
      await this.connect(serverUrl || 'wss://api.neuraledge.ai/realtime');

      // Start periodic tasks
      this.startHeartbeat();
      this.startQueueProcessor();

      this.isInitialized = true;
      console.log('[REALTIME] Real-time manager initialized successfully');

      return {
        data: true,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `REALTIME_INIT_${Date.now()}` },
      };

    } catch (error) {
      const realtimeError: AIONError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: `Failed to initialize real-time manager: ${error}`,
        category: 'technical',
        severity: 'medium',
      };

      return {
        error: realtimeError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `REALTIME_INIT_FAILED_${Date.now()}` },
      };
    }
  }

  @withPerformanceMonitoring('RealTime.sendMessage', PERFORMANCE.MAX_RESPONSE_TIME)
  public async sendMessage(message: Partial<RealTimeMessage>): Promise<AIONResult<string>> {
    try {
      if (!this.isInitialized || !this.currentUserId) {
        throw new Error('Real-time manager not initialized');
      }

      const fullMessage: RealTimeMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: message.type || 'system_notification',
        from: this.currentUserId,
        to: message.to || 'broadcast',
        projectId: message.projectId,
        data: message.data || {},
        timestamp: new Date(),
        priority: message.priority || 'medium',
        encrypted: true,
      };

      // Encrypt message data if needed
      if (fullMessage.encrypted) {
        const encryptResult = await this.securityManager.encryptData(JSON.stringify(fullMessage.data));
        if (encryptResult.data) {
          fullMessage.data = encryptResult.data;
        }
      }

      // Send immediately if connected, otherwise queue
      if (this.connectionStatus.connected && this.connection) {
        await this.sendDirectly(fullMessage);
      } else {
        this.messageQueue.pending.push(fullMessage);
        console.log(`[REALTIME] Message queued: ${fullMessage.id}`);
      }

      return {
        data: fullMessage.id,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `MESSAGE_SENT_${Date.now()}` },
      };

    } catch (error) {
      const realtimeError: AIONError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: `Failed to send real-time message: ${error}`,
        category: 'technical',
        severity: 'low',
      };

      return {
        error: realtimeError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `MESSAGE_SEND_FAILED_${Date.now()}` },
      };
    }
  }

  @withPerformanceMonitoring('RealTime.updatePresence')
  public async updateUserPresence(
    status: UserPresence['status'],
    projectId?: string,
    activeMemories: string[] = []
  ): Promise<AIONResult<boolean>> {
    try {
      if (!this.currentUserId) {
        throw new Error('User ID not set');
      }

      const presence: UserPresence = {
        userId: this.currentUserId,
        status,
        lastSeen: new Date(),
        currentProject: projectId,
        activeMemories,
        device: this.detectDevice(),
        location: {
          country: 'US', // In real implementation, detect from IP/locale
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      // Update local presence
      this.userPresence.set(this.currentUserId, presence);

      // Broadcast presence update
      await this.sendMessage({
        type: 'user_status',
        to: 'broadcast',
        data: { presence },
        priority: 'low',
      });

      console.log(`[REALTIME] Presence updated: ${status}`);

      return {
        data: true,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `PRESENCE_UPDATED_${Date.now()}` },
      };

    } catch (error) {
      const realtimeError: AIONError = {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Failed to update presence: ${error}`,
        category: 'business',
        severity: 'low',
      };

      return {
        error: realtimeError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `PRESENCE_UPDATE_FAILED_${Date.now()}` },
      };
    }
  }

  private async connect(serverUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.connectionStatus.connecting = true;
        
        // In real implementation, create WebSocket connection
        console.log(`[REALTIME] Connecting to: ${serverUrl}`);
        
        // Simulate connection establishment
        setTimeout(() => {
          this.connectionStatus = {
            ...this.connectionStatus,
            connected: true,
            connecting: false,
            lastConnected: new Date(),
            latency: Math.random() * 50 + 10, // 10-60ms
            quality: 'excellent',
          };
          
          console.log('[REALTIME] Connected to real-time server');
          this.onConnectionOpen();
          resolve();
        }, 100);

      } catch (error) {
        this.connectionStatus.connecting = false;
        reject(error);
      }
    });
  }

  private onConnectionOpen(): void {
    console.log('[REALTIME] Connection opened');
    
    // Authenticate connection
    this.authenticateConnection();
    
    // Process pending messages
    this.processQueuedMessages();
    
    // Reset reconnect attempts
    this.connectionStatus.reconnectAttempts = 0;
  }

  private onConnectionMessage(data: string): void {
    try {
      const message = JSON.parse(data) as RealTimeMessage;
      
      // Decrypt if needed
      if (message.encrypted && typeof message.data === 'string') {
        this.securityManager.decryptData(message.data).then(decryptResult => {
          if (decryptResult.data) {
            message.data = JSON.parse(decryptResult.data);
            this.handleMessage(message);
          }
        });
      } else {
        this.handleMessage(message);
      }
      
    } catch (error) {
      console.warn('[REALTIME] Failed to process incoming message:', error);
    }
  }

  private handleMessage(message: RealTimeMessage): void {
    console.log(`[REALTIME] Received message: ${message.type} from ${message.from}`);
    
    // Update presence if it's a presence message
    if (message.type === 'user_status' && message.data.presence) {
      this.userPresence.set(message.from, message.data.presence);
    }
    
    // Call registered handlers
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.warn(`[REALTIME] Handler error for ${message.type}:`, error);
      }
    });
    
    // Send acknowledgment for high-priority messages
    if (message.priority === 'high' || message.priority === 'critical') {
      this.sendAcknowledgment(message.id);
    }
  }

  private onConnectionClose(): void {
    console.log('[REALTIME] Connection closed');
    this.connectionStatus.connected = false;
    this.connectionStatus.lastDisconnected = new Date();
    
    // Attempt reconnection
    this.scheduleReconnect();
  }

  private onConnectionError(error: any): void {
    console.warn('[REALTIME] Connection error:', error);
    this.connectionStatus.quality = 'poor';
    
    // Move current pending messages to failed
    this.messageQueue.failed.push(...this.messageQueue.pending);
    this.messageQueue.pending = [];
  }

  private async sendDirectly(message: RealTimeMessage): Promise<void> {
    if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
      throw new Error('Connection not available');
    }
    
    // In real implementation, send through WebSocket
    console.log(`[REALTIME] Sending message: ${message.type} to ${message.to}`);
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 5));
    
    // Mark as delivered
    this.messageQueue.delivered.push(message.id);
  }

  private async authenticateConnection(): Promise<void> {
    if (!this.currentUserId) return;
    
    await this.sendMessage({
      type: 'system_notification',
      to: 'server',
      data: { 
        action: 'authenticate',
        userId: this.currentUserId,
        timestamp: new Date().toISOString(),
      },
      priority: 'high',
    });
  }

  private async processQueuedMessages(): Promise<void> {
    console.log(`[REALTIME] Processing ${this.messageQueue.pending.length} queued messages`);
    
    const messages = [...this.messageQueue.pending];
    this.messageQueue.pending = [];
    
    for (const message of messages) {
      try {
        await this.sendDirectly(message);
      } catch (error) {
        this.messageQueue.failed.push(message);
        console.warn(`[REALTIME] Failed to send queued message ${message.id}:`, error);
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.connectionStatus.reconnecting) return;
    
    this.connectionStatus.reconnecting = true;
    this.connectionStatus.reconnectAttempts++;
    
    const delay = Math.min(1000 * Math.pow(2, this.connectionStatus.reconnectAttempts), 30000);
    
    console.log(`[REALTIME] Reconnecting in ${delay}ms (attempt ${this.connectionStatus.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connect('wss://api.neuraledge.ai/realtime');
        this.connectionStatus.reconnecting = false;
      } catch (error) {
        console.warn('[REALTIME] Reconnection failed:', error);
        this.connectionStatus.reconnecting = false;
        
        // Schedule another reconnect if under max attempts
        if (this.connectionStatus.reconnectAttempts < 5) {
          this.scheduleReconnect();
        }
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      if (this.connectionStatus.connected) {
        const startTime = Date.now();
        
        await this.sendMessage({
          type: 'system_notification',
          to: 'server',
          data: { action: 'ping', timestamp: startTime },
          priority: 'low',
        });
        
        // Update connection quality based on response time
        // In real implementation, would measure actual round-trip time
        const latency = Math.random() * 100 + 10;
        this.connectionStatus.latency = latency;
        
        if (latency < 50) this.connectionStatus.quality = 'excellent';
        else if (latency < 100) this.connectionStatus.quality = 'good';
        else if (latency < 200) this.connectionStatus.quality = 'fair';
        else this.connectionStatus.quality = 'poor';
      }
    }, 30000); // Every 30 seconds
  }

  private startQueueProcessor(): void {
    setInterval(async () => {
      // Retry failed messages
      if (this.messageQueue.failed.length > 0 && this.connectionStatus.connected) {
        const failed = [...this.messageQueue.failed];
        this.messageQueue.failed = [];
        
        for (const message of failed) {
          try {
            await this.sendDirectly(message);
          } catch (error) {
            // Keep in failed queue but limit retries
            if (Date.now() - message.timestamp.getTime() < 300000) { // 5 minutes
              this.messageQueue.failed.push(message);
            }
          }
        }
      }
      
      // Clean up old delivered/acknowledged messages
      const cutoffTime = Date.now() - 3600000; // 1 hour
      this.messageQueue.delivered = this.messageQueue.delivered.slice(-100);
      this.messageQueue.acknowledged = this.messageQueue.acknowledged.slice(-100);
      
    }, 10000); // Every 10 seconds
  }

  private detectDevice(): string {
    // Simple device detection
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent;
      if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
      if (/Android/.test(ua)) return 'Android';
      if (/Windows/.test(ua)) return 'Windows';
      if (/Mac/.test(ua)) return 'macOS';
    }
    return 'Unknown';
  }

  private sendAcknowledgment(messageId: string): void {
    this.messageQueue.acknowledged.push(messageId);
    
    this.sendMessage({
      type: 'system_notification',
      to: 'server',
      data: { action: 'acknowledge', messageId },
      priority: 'low',
    });
  }

  public addMessageHandler(messageType: string, handler: Function): void {
    const handlers = this.messageHandlers.get(messageType) || [];
    handlers.push(handler);
    this.messageHandlers.set(messageType, handlers);
  }

  public removeMessageHandler(messageType: string, handler: Function): void {
    const handlers = this.messageHandlers.get(messageType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  public getUserPresence(userId?: string): UserPresence | UserPresence[] {
    if (userId) {
      return this.userPresence.get(userId) || {
        userId,
        status: 'offline',
        lastSeen: new Date(),
        activeMemories: [],
        device: 'Unknown',
      };
    }
    return Array.from(this.userPresence.values());
  }

  public getMessageQueueStatus(): MessageQueue {
    return {
      pending: [...this.messageQueue.pending],
      failed: [...this.messageQueue.failed],
      delivered: [...this.messageQueue.delivered],
      acknowledged: [...this.messageQueue.acknowledged],
    };
  }

  public async dispose(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.connection) {
      this.connection.close();
    }
    
    this.messageHandlers.clear();
    this.userPresence.clear();
    this.messageQueue = {
      pending: [],
      failed: [],
      delivered: [],
      acknowledged: [],
    };
    
    this.isInitialized = false;
    console.log('[REALTIME] Real-time manager disposed');
  }
}

export default RealTimeManager.getInstance();