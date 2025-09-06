// NeuralEdge AI Desktop - Preload Script
// Secure bridge between renderer and main process

import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface
interface NeuralEdgeAPI {
  // AI operations
  ai: {
    process: (input: string) => Promise<any>;
    getModels: () => Promise<any>;
    loadModel: (modelName: string) => Promise<any>;
    unloadModel: (modelName: string) => Promise<any>;
    getStatus: () => Promise<any>;
  };

  // Sync operations
  sync: {
    start: () => Promise<any>;
    getStatus: () => Promise<any>;
    getConflicts: () => Promise<any>;
    resolveConflict: (conflictId: string, resolution: string) => Promise<any>;
  };

  // MCP operations
  mcp: {
    execute: (toolCall: any) => Promise<any>;
    getTools: () => Promise<any>;
    getServers: () => Promise<any>;
    addServer: (endpoint: string, name: string, description?: string) => Promise<any>;
  };

  // Settings operations
  settings: {
    get: (key?: string) => Promise<any>;
    set: (key: string, value: any) => Promise<any>;
  };

  // Security operations
  security: {
    encrypt: (data: string) => Promise<any>;
    decrypt: (data: string) => Promise<any>;
  };

  // Performance monitoring
  metrics: {
    get: () => Promise<any>;
    startMonitoring: (callback: (metrics: any) => void) => void;
    stopMonitoring: () => void;
  };

  // File operations
  files: {
    read: (path: string) => Promise<any>;
    write: (path: string, content: string) => Promise<any>;
    list: (path: string) => Promise<any>;
  };

  // Window operations
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    openDevTools: () => void;
  };

  // Event handling
  events: {
    on: (channel: string, callback: (...args: any[]) => void) => void;
    once: (channel: string, callback: (...args: any[]) => void) => void;
    off: (channel: string, callback: (...args: any[]) => void) => void;
    emit: (channel: string, ...args: any[]) => void;
  };
}

// Create the API object
const neuralEdgeAPI: NeuralEdgeAPI = {
  // AI operations
  ai: {
    process: async (input: string) => {
      try {
        return await ipcRenderer.invoke('ai:process', input);
      } catch (error) {
        console.error('[PRELOAD] AI process error:', error);
        throw error;
      }
    },

    getModels: async () => {
      try {
        return await ipcRenderer.invoke('ai:getModels');
      } catch (error) {
        console.error('[PRELOAD] Get models error:', error);
        throw error;
      }
    },

    loadModel: async (modelName: string) => {
      try {
        return await ipcRenderer.invoke('ai:loadModel', modelName);
      } catch (error) {
        console.error('[PRELOAD] Load model error:', error);
        throw error;
      }
    },

    unloadModel: async (modelName: string) => {
      try {
        return await ipcRenderer.invoke('ai:unloadModel', modelName);
      } catch (error) {
        console.error('[PRELOAD] Unload model error:', error);
        throw error;
      }
    },

    getStatus: async () => {
      try {
        return await ipcRenderer.invoke('ai:getStatus');
      } catch (error) {
        console.error('[PRELOAD] Get AI status error:', error);
        throw error;
      }
    }
  },

  // Sync operations
  sync: {
    start: async () => {
      try {
        return await ipcRenderer.invoke('sync:start');
      } catch (error) {
        console.error('[PRELOAD] Sync start error:', error);
        throw error;
      }
    },

    getStatus: async () => {
      try {
        return await ipcRenderer.invoke('sync:getStatus');
      } catch (error) {
        console.error('[PRELOAD] Get sync status error:', error);
        throw error;
      }
    },

    getConflicts: async () => {
      try {
        return await ipcRenderer.invoke('sync:getConflicts');
      } catch (error) {
        console.error('[PRELOAD] Get conflicts error:', error);
        throw error;
      }
    },

    resolveConflict: async (conflictId: string, resolution: string) => {
      try {
        return await ipcRenderer.invoke('sync:resolveConflict', conflictId, resolution);
      } catch (error) {
        console.error('[PRELOAD] Resolve conflict error:', error);
        throw error;
      }
    }
  },

  // MCP operations
  mcp: {
    execute: async (toolCall: any) => {
      try {
        return await ipcRenderer.invoke('mcp:execute', toolCall);
      } catch (error) {
        console.error('[PRELOAD] MCP execute error:', error);
        throw error;
      }
    },

    getTools: async () => {
      try {
        return await ipcRenderer.invoke('mcp:getTools');
      } catch (error) {
        console.error('[PRELOAD] Get MCP tools error:', error);
        throw error;
      }
    },

    getServers: async () => {
      try {
        return await ipcRenderer.invoke('mcp:getServers');
      } catch (error) {
        console.error('[PRELOAD] Get MCP servers error:', error);
        throw error;
      }
    },

    addServer: async (endpoint: string, name: string, description?: string) => {
      try {
        return await ipcRenderer.invoke('mcp:addServer', endpoint, name, description);
      } catch (error) {
        console.error('[PRELOAD] Add MCP server error:', error);
        throw error;
      }
    }
  },

  // Settings operations
  settings: {
    get: async (key?: string) => {
      try {
        return await ipcRenderer.invoke('settings:get', key);
      } catch (error) {
        console.error('[PRELOAD] Get settings error:', error);
        throw error;
      }
    },

    set: async (key: string, value: any) => {
      try {
        return await ipcRenderer.invoke('settings:set', key, value);
      } catch (error) {
        console.error('[PRELOAD] Set settings error:', error);
        throw error;
      }
    }
  },

  // Security operations
  security: {
    encrypt: async (data: string) => {
      try {
        return await ipcRenderer.invoke('security:encrypt', data);
      } catch (error) {
        console.error('[PRELOAD] Encrypt error:', error);
        throw error;
      }
    },

    decrypt: async (data: string) => {
      try {
        return await ipcRenderer.invoke('security:decrypt', data);
      } catch (error) {
        console.error('[PRELOAD] Decrypt error:', error);
        throw error;
      }
    }
  },

  // Performance monitoring
  metrics: {
    get: async () => {
      try {
        return await ipcRenderer.invoke('metrics:get');
      } catch (error) {
        console.error('[PRELOAD] Get metrics error:', error);
        throw error;
      }
    },

    startMonitoring: (callback: (metrics: any) => void) => {
      ipcRenderer.on('metrics:update', (_, metrics) => {
        callback(metrics);
      });
      ipcRenderer.send('metrics:startMonitoring');
    },

    stopMonitoring: () => {
      ipcRenderer.removeAllListeners('metrics:update');
      ipcRenderer.send('metrics:stopMonitoring');
    }
  },

  // File operations
  files: {
    read: async (path: string) => {
      try {
        return await ipcRenderer.invoke('files:read', path);
      } catch (error) {
        console.error('[PRELOAD] File read error:', error);
        throw error;
      }
    },

    write: async (path: string, content: string) => {
      try {
        return await ipcRenderer.invoke('files:write', path, content);
      } catch (error) {
        console.error('[PRELOAD] File write error:', error);
        throw error;
      }
    },

    list: async (path: string) => {
      try {
        return await ipcRenderer.invoke('files:list', path);
      } catch (error) {
        console.error('[PRELOAD] File list error:', error);
        throw error;
      }
    }
  },

  // Window operations
  window: {
    minimize: () => {
      ipcRenderer.send('window:minimize');
    },

    maximize: () => {
      ipcRenderer.send('window:maximize');
    },

    close: () => {
      ipcRenderer.send('window:close');
    },

    openDevTools: () => {
      ipcRenderer.send('window:openDevTools');
    }
  },

  // Event handling
  events: {
    on: (channel: string, callback: (...args: any[]) => void) => {
      // Validate channel to prevent security issues
      const validChannels = [
        'ai:statusUpdate',
        'sync:progress',
        'sync:conflict',
        'mcp:serverUpdate',
        'metrics:update',
        'deep-link',
        'notification'
      ];

      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, callback);
      } else {
        console.warn(`[PRELOAD] Invalid event channel: ${channel}`);
      }
    },

    once: (channel: string, callback: (...args: any[]) => void) => {
      const validChannels = [
        'ai:statusUpdate',
        'sync:progress',
        'sync:conflict',
        'mcp:serverUpdate',
        'metrics:update',
        'deep-link',
        'notification'
      ];

      if (validChannels.includes(channel)) {
        ipcRenderer.once(channel, callback);
      } else {
        console.warn(`[PRELOAD] Invalid event channel: ${channel}`);
      }
    },

    off: (channel: string, callback: (...args: any[]) => void) => {
      ipcRenderer.off(channel, callback);
    },

    emit: (channel: string, ...args: any[]) => {
      const validChannels = [
        'window:focus',
        'window:blur',
        'app:ready',
        'user:action'
      ];

      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args);
      } else {
        console.warn(`[PRELOAD] Invalid emit channel: ${channel}`);
      }
    }
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('neuralEdge', neuralEdgeAPI);

// Also expose a version identifier for debugging
contextBridge.exposeInMainWorld('neuralEdgeVersion', {
  api: '1.0.0',
  electron: process.versions.electron,
  node: process.versions.node,
  chrome: process.versions.chrome
});

// Log successful preload
console.log('[PRELOAD] NeuralEdge API exposed successfully');

// Type declaration for TypeScript support in renderer
declare global {
  interface Window {
    neuralEdge: NeuralEdgeAPI;
    neuralEdgeVersion: {
      api: string;
      electron: string;
      node: string;
      chrome: string;
    };
  }
}