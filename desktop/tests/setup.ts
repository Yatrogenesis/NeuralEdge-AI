// NeuralEdge AI Desktop - Test Setup
// Global test configuration and utilities

import { AION_CONSTANTS } from '../src/constants';

// Global test timeout for AION compliance
jest.setTimeout(10000);

// Mock Electron APIs for testing
const mockElectron = {
  app: {
    getPath: jest.fn().mockReturnValue('/tmp/neuraledge-test'),
    getVersion: jest.fn().mockReturnValue('1.0.0'),
    whenReady: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn(),
    on: jest.fn(),
    setAsDefaultProtocolClient: jest.fn()
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadFile: jest.fn(),
    loadURL: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    close: jest.fn(),
    focus: jest.fn(),
    getBounds: jest.fn().mockReturnValue({ x: 0, y: 0, width: 1000, height: 800 }),
    setBounds: jest.fn(),
    getTitle: jest.fn().mockReturnValue('Test Window'),
    isVisible: jest.fn().mockReturnValue(true),
    isMinimized: jest.fn().mockReturnValue(false),
    isMaximized: jest.fn().mockReturnValue(false),
    isDestroyed: jest.fn().mockReturnValue(false),
    webContents: {
      send: jest.fn(),
      openDevTools: jest.fn()
    }
  })),
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn()
  },
  dialog: {
    showMessageBox: jest.fn().mockResolvedValue({ response: 0 }),
    showOpenDialog: jest.fn().mockResolvedValue({ canceled: false, filePaths: [] }),
    showSaveDialog: jest.fn().mockResolvedValue({ canceled: false, filePath: '' }),
    showErrorBox: jest.fn()
  },
  Menu: {
    buildFromTemplate: jest.fn().mockReturnValue({}),
    setApplicationMenu: jest.fn()
  },
  Tray: jest.fn().mockImplementation(() => ({
    setToolTip: jest.fn(),
    setContextMenu: jest.fn(),
    on: jest.fn(),
    getContextMenu: jest.fn().mockReturnValue({
      getMenuItemById: jest.fn().mockReturnValue({ label: 'Test' })
    })
  })),
  screen: {
    getPrimaryDisplay: jest.fn().mockReturnValue({
      workAreaSize: { width: 1920, height: 1080 }
    }),
    getAllDisplays: jest.fn().mockReturnValue([])
  },
  shell: {
    openExternal: jest.fn()
  },
  nativeImage: {
    createFromPath: jest.fn().mockReturnValue({})
  },
  autoUpdater: {
    checkForUpdatesAndNotify: jest.fn(),
    on: jest.fn()
  }
};

// Mock electron-store
const mockStore = {
  get: jest.fn().mockReturnValue({}),
  set: jest.fn(),
  has: jest.fn().mockReturnValue(false),
  delete: jest.fn(),
  clear: jest.fn(),
  store: {}
};

// Set up global mocks
beforeAll(() => {
  // Mock Electron modules
  jest.doMock('electron', () => mockElectron);
  jest.doMock('electron-store', () => jest.fn().mockImplementation(() => mockStore));
  jest.doMock('electron-updater', () => ({ autoUpdater: mockElectron.autoUpdater }));
  
  // Mock Node.js modules that might cause issues in tests
  jest.doMock('fs', () => ({
    promises: {
      readFile: jest.fn().mockResolvedValue('test file content'),
      writeFile: jest.fn().mockResolvedValue(undefined),
      readdir: jest.fn().mockResolvedValue(['file1.txt', 'file2.txt']),
      stat: jest.fn().mockResolvedValue({ 
        isDirectory: jest.fn().mockReturnValue(false),
        isFile: jest.fn().mockReturnValue(true),
        size: 1024,
        mtime: new Date()
      }),
      mkdir: jest.fn().mockResolvedValue(undefined)
    },
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    readFileSync: jest.fn().mockReturnValue('test file content'),
    writeFileSync: jest.fn()
  }));
  
  jest.doMock('path', () => ({
    join: jest.fn((...args) => args.join('/')),
    dirname: jest.fn().mockReturnValue('/test/dir'),
    basename: jest.fn().mockReturnValue('test.file'),
    extname: jest.fn().mockReturnValue('.test'),
    resolve: jest.fn().mockReturnValue('/resolved/path')
  }));
  
  jest.doMock('os', () => ({
    platform: jest.fn().mockReturnValue('linux'),
    arch: jest.fn().mockReturnValue('x64'),
    hostname: jest.fn().mockReturnValue('test-hostname'),
    release: jest.fn().mockReturnValue('1.0.0'),
    totalmem: jest.fn().mockReturnValue(8589934592), // 8GB
    freemem: jest.fn().mockReturnValue(4294967296), // 4GB
    cpus: jest.fn().mockReturnValue([
      { model: 'Test CPU', speed: 3000, times: { user: 1000, nice: 0, sys: 500, idle: 10000, irq: 0 } },
      { model: 'Test CPU', speed: 3000, times: { user: 1000, nice: 0, sys: 500, idle: 10000, irq: 0 } }
    ]),
    uptime: jest.fn().mockReturnValue(3600), // 1 hour
    userInfo: jest.fn().mockReturnValue({ username: 'testuser', homedir: '/home/testuser' }),
    loadavg: jest.fn().mockReturnValue([1.5, 1.2, 1.1])
  }));
});

// Performance testing utilities
export class TestPerformanceMonitor {
  private startTime: number = 0;
  
  start(): void {
    this.startTime = performance.now();
  }
  
  stop(): number {
    return performance.now() - this.startTime;
  }
  
  static async measureAsync<T>(operation: () => Promise<T>): Promise<{ result: T; time: number }> {
    const startTime = performance.now();
    const result = await operation();
    const time = performance.now() - startTime;
    return { result, time };
  }
  
  static measure<T>(operation: () => T): { result: T; time: number } {
    const startTime = performance.now();
    const result = operation();
    const time = performance.now() - startTime;
    return { result, time };
  }
}

// AION Protocol compliance testing utilities
export class AIONComplianceTestUtils {
  static assertResponseTime(actualTime: number, maxTime: number = AION_CONSTANTS.MAX_RESPONSE_TIME): void {
    expect(actualTime).toBeLessThanOrEqual(maxTime);
  }
  
  static assertMemoryUsage(actualMemory: number, maxMemory: number = AION_CONSTANTS.MAX_MEMORY_USAGE): void {
    expect(actualMemory).toBeLessThanOrEqual(maxMemory);
  }
  
  static assertFailureRate(failures: number, total: number, maxRate: number = AION_CONSTANTS.MAX_FAILURE_RATE): void {
    const actualRate = failures / total;
    expect(actualRate).toBeLessThanOrEqual(maxRate);
  }
  
  static async runRepeatedTest<T>(
    operation: () => Promise<T>, 
    iterations: number = 100
  ): Promise<{ results: T[]; times: number[]; failures: number }> {
    const results: T[] = [];
    const times: number[] = [];
    let failures = 0;
    
    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = performance.now();
        const result = await operation();
        const time = performance.now() - startTime;
        
        results.push(result);
        times.push(time);
      } catch (error) {
        failures++;
      }
    }
    
    return { results, times, failures };
  }
}

// Security testing utilities
export class SecurityTestUtils {
  static generateTestData(size: number = 1024): string {
    return 'a'.repeat(size);
  }
  
  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  static async testEncryptionDecryption(
    encrypt: (data: string) => Promise<any>,
    decrypt: (data: any) => Promise<string>,
    testData: string
  ): Promise<{ success: boolean; encryptTime: number; decryptTime: number }> {
    try {
      const encryptStart = performance.now();
      const encrypted = await encrypt(testData);
      const encryptTime = performance.now() - encryptStart;
      
      const decryptStart = performance.now();
      const decrypted = await decrypt(encrypted);
      const decryptTime = performance.now() - decryptStart;
      
      const success = decrypted === testData;
      return { success, encryptTime, decryptTime };
    } catch (error) {
      return { success: false, encryptTime: 0, decryptTime: 0 };
    }
  }
}

// Memory leak detection utilities  
export class MemoryLeakTestUtils {
  static async detectMemoryLeak(
    operation: () => Promise<void>,
    iterations: number = 1000,
    threshold: number = 10 * 1024 * 1024 // 10MB
  ): Promise<{ leakDetected: boolean; memoryIncrease: number }> {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    for (let i = 0; i < iterations; i++) {
      await operation();
    }
    
    // Force garbage collection again
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    const leakDetected = memoryIncrease > threshold;
    
    return { leakDetected, memoryIncrease };
  }
}

// Test data generators
export class TestDataGenerators {
  static generateVectorMemoryEntry(id?: string): any {
    return {
      id: id || `test_memory_${Date.now()}`,
      userId: 'test_user',
      sessionId: 'test_session',
      interactionIndex: 0,
      timestamp: new Date(),
      userInput: 'Test user input',
      aiResponse: 'Test AI response',
      inputVector: new Float32Array(128).fill(0.5),
      responseVector: new Float32Array(128).fill(0.7),
      contextVector: new Float32Array(128).fill(0.3),
      sentiment: 0.1,
      topics: ['test', 'memory'],
      entities: ['test_entity'],
      parentInteractionId: undefined,
      childInteractionIds: [],
      relatedInteractionIds: []
    };
  }
  
  static generateMCPToolCall(tool: string = 'test_tool'): any {
    return {
      tool,
      arguments: { test_param: 'test_value' }
    };
  }
  
  static generateSyncItem(type: string = 'memory'): any {
    return {
      id: `test_sync_${Date.now()}`,
      type,
      data: { test: 'data' },
      timestamp: new Date(),
      deviceId: 'test_device',
      hash: 'test_hash',
      version: 1
    };
  }
}

// Make utilities available globally
declare global {
  namespace NodeJS {
    interface Global {
      TestPerformanceMonitor: typeof TestPerformanceMonitor;
      AIONComplianceTestUtils: typeof AIONComplianceTestUtils;
      SecurityTestUtils: typeof SecurityTestUtils;
      MemoryLeakTestUtils: typeof MemoryLeakTestUtils;
      TestDataGenerators: typeof TestDataGenerators;
      gc?: () => void;
    }
  }
}

global.TestPerformanceMonitor = TestPerformanceMonitor;
global.AIONComplianceTestUtils = AIONComplianceTestUtils;
global.SecurityTestUtils = SecurityTestUtils;
global.MemoryLeakTestUtils = MemoryLeakTestUtils;
global.TestDataGenerators = TestDataGenerators;

// Cleanup after tests
afterAll(() => {
  jest.restoreAllMocks();
});

console.log('[TEST_SETUP] NeuralEdge AI Desktop test environment configured');