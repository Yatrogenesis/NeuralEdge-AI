// NeuralEdge AI Desktop - Sync Manager
// Cross-platform synchronization with mobile app

import Store from 'electron-store';
import { SecurityManager } from './security';
import { AION_CONSTANTS } from '../constants';

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  errors: number;
  syncTime: number;
  lastSync: Date;
}

export interface SyncItem {
  id: string;
  type: 'conversation' | 'memory' | 'project' | 'settings';
  data: any;
  timestamp: Date;
  deviceId: string;
  hash: string;
  version: number;
}

export interface SyncConflict {
  itemId: string;
  localVersion: SyncItem;
  remoteVersion: SyncItem;
  conflictType: 'timestamp' | 'content' | 'both';
  resolutionStrategy: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'desktop' | 'mobile';
  platform: string;
  lastSeen: Date;
  syncEnabled: boolean;
  version: string;
}

export class SyncManager {
  private store: Store;
  private securityManager: SecurityManager;
  private isInitialized = false;
  private syncInProgress = false;
  private deviceId: string;
  private knownDevices: Map<string, DeviceInfo> = new Map();
  private pendingSync: SyncItem[] = [];
  private syncConflicts: SyncConflict[] = [];

  constructor(store: Store, securityManager: SecurityManager) {
    this.store = store;
    this.securityManager = securityManager;
    this.deviceId = this.generateDeviceId();
  }

  public async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[SYNC] Initializing sync manager...');
      
      // Load device information
      await this.loadDeviceInfo();
      
      // Load pending sync items
      await this.loadPendingSync();
      
      // Start periodic sync
      this.startPeriodicSync();
      
      this.isInitialized = true;
      console.log('[SYNC] Sync manager initialized successfully');
      
      return { success: true };
    } catch (error) {
      console.error('[SYNC] Failed to initialize:', error);
      return { success: false, error: error.message };
    }
  }

  public async performFullSync(): Promise<SyncResult> {
    if (!this.isInitialized) {
      throw new Error('Sync manager not initialized');
    }

    if (this.syncInProgress) {
      console.log('[SYNC] Sync already in progress, skipping...');
      return this.getLastSyncResult();
    }

    this.syncInProgress = true;
    const startTime = performance.now();
    
    try {
      console.log('[SYNC] Starting full synchronization...');
      
      let itemsSynced = 0;
      let errors = 0;

      // Phase 1: Sync conversations
      const conversationResult = await this.syncConversations();
      itemsSynced += conversationResult.synced;
      errors += conversationResult.errors;

      // Phase 2: Sync vector memories
      const memoryResult = await this.syncVectorMemories();
      itemsSynced += memoryResult.synced;
      errors += memoryResult.errors;

      // Phase 3: Sync projects
      const projectResult = await this.syncProjects();
      itemsSynced += projectResult.synced;
      errors += projectResult.errors;

      // Phase 4: Sync settings
      const settingsResult = await this.syncSettings();
      itemsSynced += settingsResult.synced;
      errors += settingsResult.errors;

      // Phase 5: Resolve conflicts
      await this.resolveConflicts();

      const syncTime = performance.now() - startTime;
      const result: SyncResult = {
        success: errors === 0,
        itemsSynced,
        errors,
        syncTime,
        lastSync: new Date()
      };

      // Store sync result
      this.store.set('lastSyncResult', result);
      
      console.log(`[SYNC] Full sync completed: ${itemsSynced} items, ${errors} errors, ${syncTime.toFixed(2)}ms`);
      
      return result;
      
    } catch (error) {
      console.error('[SYNC] Full sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  public async syncItem(item: SyncItem): Promise<{ success: boolean; conflict?: SyncConflict }> {
    try {
      // Encrypt item data
      const encryptResult = await this.securityManager.encryptData(JSON.stringify(item.data));
      if (!encryptResult.success) {
        throw new Error('Failed to encrypt sync item');
      }

      // Generate hash for conflict detection
      const hash = this.generateHash(JSON.stringify(item));
      item.hash = hash;

      // Simulate cloud sync
      await this.simulateCloudSync(item);

      // Check for conflicts
      const conflict = await this.detectConflict(item);
      if (conflict) {
        this.syncConflicts.push(conflict);
        return { success: false, conflict };
      }

      console.log(`[SYNC] Item synced successfully: ${item.id}`);
      return { success: true };
      
    } catch (error) {
      console.error(`[SYNC] Failed to sync item ${item.id}:`, error);
      return { success: false };
    }
  }

  public async resolveConflict(
    conflictId: string, 
    resolution: 'local' | 'remote' | 'merge'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const conflictIndex = this.syncConflicts.findIndex(c => c.itemId === conflictId);
      if (conflictIndex === -1) {
        throw new Error('Conflict not found');
      }

      const conflict = this.syncConflicts[conflictIndex];
      
      let resolvedItem: SyncItem;
      
      switch (resolution) {
        case 'local':
          resolvedItem = conflict.localVersion;
          break;
        case 'remote':
          resolvedItem = conflict.remoteVersion;
          break;
        case 'merge':
          resolvedItem = await this.mergeItems(conflict.localVersion, conflict.remoteVersion);
          break;
        default:
          throw new Error('Invalid resolution strategy');
      }

      // Apply resolved item
      await this.applyResolvedItem(resolvedItem);
      
      // Remove conflict from list
      this.syncConflicts.splice(conflictIndex, 1);
      
      console.log(`[SYNC] Conflict resolved: ${conflictId} using ${resolution}`);
      return { success: true };
      
    } catch (error) {
      console.error(`[SYNC] Failed to resolve conflict ${conflictId}:`, error);
      return { success: false, error: error.message };
    }
  }

  public getDeviceInfo(): DeviceInfo {
    return {
      id: this.deviceId,
      name: require('os').hostname(),
      type: 'desktop',
      platform: process.platform,
      lastSeen: new Date(),
      syncEnabled: true,
      version: require('../../package.json').version
    };
  }

  public getKnownDevices(): DeviceInfo[] {
    return Array.from(this.knownDevices.values());
  }

  public getSyncConflicts(): SyncConflict[] {
    return [...this.syncConflicts];
  }

  public getPendingSyncItems(): SyncItem[] {
    return [...this.pendingSync];
  }

  private async syncConversations(): Promise<{ synced: number; errors: number }> {
    console.log('[SYNC] Syncing conversations...');
    
    // Get local conversations
    const localConversations = this.store.get('conversations', []) as any[];
    
    let synced = 0;
    let errors = 0;
    
    for (const conversation of localConversations) {
      try {
        const syncItem: SyncItem = {
          id: conversation.id,
          type: 'conversation',
          data: conversation,
          timestamp: new Date(),
          deviceId: this.deviceId,
          hash: '',
          version: 1
        };
        
        const result = await this.syncItem(syncItem);
        if (result.success) {
          synced++;
        } else {
          errors++;
        }
      } catch (error) {
        errors++;
        console.error(`[SYNC] Failed to sync conversation ${conversation.id}:`, error);
      }
    }
    
    return { synced, errors };
  }

  private async syncVectorMemories(): Promise<{ synced: number; errors: number }> {
    console.log('[SYNC] Syncing vector memories...');
    
    // Get local vector memories
    const localMemories = this.store.get('vectorMemories', []) as any[];
    
    let synced = 0;
    let errors = 0;
    
    for (const memory of localMemories) {
      try {
        const syncItem: SyncItem = {
          id: memory.id,
          type: 'memory',
          data: memory,
          timestamp: new Date(),
          deviceId: this.deviceId,
          hash: '',
          version: 1
        };
        
        const result = await this.syncItem(syncItem);
        if (result.success) {
          synced++;
        } else {
          errors++;
        }
      } catch (error) {
        errors++;
        console.error(`[SYNC] Failed to sync memory ${memory.id}:`, error);
      }
    }
    
    return { synced, errors };
  }

  private async syncProjects(): Promise<{ synced: number; errors: number }> {
    console.log('[SYNC] Syncing projects...');
    
    // Get local projects
    const localProjects = this.store.get('projects', []) as any[];
    
    let synced = 0;
    let errors = 0;
    
    for (const project of localProjects) {
      try {
        const syncItem: SyncItem = {
          id: project.id,
          type: 'project',
          data: project,
          timestamp: new Date(),
          deviceId: this.deviceId,
          hash: '',
          version: 1
        };
        
        const result = await this.syncItem(syncItem);
        if (result.success) {
          synced++;
        } else {
          errors++;
        }
      } catch (error) {
        errors++;
        console.error(`[SYNC] Failed to sync project ${project.id}:`, error);
      }
    }
    
    return { synced, errors };
  }

  private async syncSettings(): Promise<{ synced: number; errors: number }> {
    console.log('[SYNC] Syncing settings...');
    
    try {
      const settings = {
        preferences: this.store.get('preferences', {}),
        aiConfig: this.store.get('aiConfig', {}),
        syncConfig: this.store.get('syncConfig', {})
      };

      const syncItem: SyncItem = {
        id: 'desktop_settings',
        type: 'settings',
        data: settings,
        timestamp: new Date(),
        deviceId: this.deviceId,
        hash: '',
        version: 1
      };
      
      const result = await this.syncItem(syncItem);
      return { synced: result.success ? 1 : 0, errors: result.success ? 0 : 1 };
      
    } catch (error) {
      console.error('[SYNC] Failed to sync settings:', error);
      return { synced: 0, errors: 1 };
    }
  }

  private async resolveConflicts(): Promise<void> {
    console.log(`[SYNC] Resolving ${this.syncConflicts.length} conflicts...`);
    
    for (const conflict of this.syncConflicts) {
      try {
        // Auto-resolve based on strategy
        let resolution: 'local' | 'remote' | 'merge';
        
        switch (conflict.resolutionStrategy) {
          case 'local_wins':
            resolution = 'local';
            break;
          case 'remote_wins':
            resolution = 'remote';
            break;
          case 'merge':
            resolution = 'merge';
            break;
          default:
            continue; // Skip manual conflicts
        }
        
        await this.resolveConflict(conflict.itemId, resolution);
      } catch (error) {
        console.error(`[SYNC] Failed to auto-resolve conflict ${conflict.itemId}:`, error);
      }
    }
  }

  private async simulateCloudSync(item: SyncItem): Promise<void> {
    // Simulate network delay
    const networkDelay = 50 + Math.random() * 100;
    await new Promise(resolve => setTimeout(resolve, networkDelay));
    
    // Simulate occasional network errors
    if (Math.random() < 0.02) { // 2% error rate
      throw new Error('Network error during sync');
    }
    
    console.log(`[SYNC] Cloud sync simulated for item: ${item.id}`);
  }

  private async detectConflict(item: SyncItem): Promise<SyncConflict | null> {
    // Simulate conflict detection
    if (Math.random() < 0.05) { // 5% conflict rate
      const remoteVersion: SyncItem = {
        ...item,
        timestamp: new Date(Date.now() - 60000), // 1 minute ago
        deviceId: 'mobile_device_123',
        version: item.version + 1
      };
      
      return {
        itemId: item.id,
        localVersion: item,
        remoteVersion,
        conflictType: 'timestamp',
        resolutionStrategy: 'local_wins'
      };
    }
    
    return null;
  }

  private async mergeItems(local: SyncItem, remote: SyncItem): Promise<SyncItem> {
    // Simple merge strategy - combine data and use latest timestamp
    const mergedData = { ...local.data, ...remote.data };
    
    return {
      id: local.id,
      type: local.type,
      data: mergedData,
      timestamp: local.timestamp > remote.timestamp ? local.timestamp : remote.timestamp,
      deviceId: local.deviceId,
      hash: this.generateHash(JSON.stringify(mergedData)),
      version: Math.max(local.version, remote.version) + 1
    };
  }

  private async applyResolvedItem(item: SyncItem): Promise<void> {
    console.log(`[SYNC] Applying resolved item: ${item.id}`);
    
    // Update local storage based on item type
    switch (item.type) {
      case 'conversation':
        const conversations = this.store.get('conversations', []) as any[];
        const convIndex = conversations.findIndex(c => c.id === item.id);
        if (convIndex >= 0) {
          conversations[convIndex] = item.data;
        } else {
          conversations.push(item.data);
        }
        this.store.set('conversations', conversations);
        break;
        
      case 'memory':
        const memories = this.store.get('vectorMemories', []) as any[];
        const memIndex = memories.findIndex(m => m.id === item.id);
        if (memIndex >= 0) {
          memories[memIndex] = item.data;
        } else {
          memories.push(item.data);
        }
        this.store.set('vectorMemories', memories);
        break;
        
      case 'project':
        const projects = this.store.get('projects', []) as any[];
        const projIndex = projects.findIndex(p => p.id === item.id);
        if (projIndex >= 0) {
          projects[projIndex] = item.data;
        } else {
          projects.push(item.data);
        }
        this.store.set('projects', projects);
        break;
        
      case 'settings':
        Object.keys(item.data).forEach(key => {
          this.store.set(key, item.data[key]);
        });
        break;
    }
  }

  private generateDeviceId(): string {
    const saved = this.store.get('deviceId') as string;
    if (saved) return saved;
    
    const id = `desktop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.store.set('deviceId', id);
    return id;
  }

  private generateHash(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async loadDeviceInfo(): Promise<void> {
    const knownDevices = this.store.get('knownDevices', []) as DeviceInfo[];
    knownDevices.forEach(device => {
      this.knownDevices.set(device.id, device);
    });
    
    console.log(`[SYNC] Loaded ${this.knownDevices.size} known devices`);
  }

  private async loadPendingSync(): Promise<void> {
    this.pendingSync = this.store.get('pendingSync', []) as SyncItem[];
    console.log(`[SYNC] Loaded ${this.pendingSync.length} pending sync items`);
  }

  private getLastSyncResult(): SyncResult {
    return this.store.get('lastSyncResult', {
      success: false,
      itemsSynced: 0,
      errors: 0,
      syncTime: 0,
      lastSync: new Date(0)
    }) as SyncResult;
  }

  private startPeriodicSync(): void {
    setInterval(async () => {
      if (!this.syncInProgress) {
        try {
          console.log('[SYNC] Running periodic sync...');
          await this.performFullSync();
        } catch (error) {
          console.error('[SYNC] Periodic sync failed:', error);
        }
      }
    }, AION_CONSTANTS.SYNC_INTERVAL);
  }
}