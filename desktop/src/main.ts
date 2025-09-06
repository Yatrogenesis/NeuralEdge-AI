// NeuralEdge AI Desktop - Main Process
// AION Protocol Compliant Desktop Application

import { app, BrowserWindow, ipcMain, Menu, Tray, shell, dialog, nativeImage } from 'electron';
import * as path from 'path';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
import { PerformanceMonitor } from './utils/performance';
import { SecurityManager } from './services/security';
import { SyncManager } from './services/sync';
import { AIEngine } from './services/ai-engine';
import { MCPBridge } from './services/mcp-bridge';
import { WindowManager } from './managers/window-manager';
import { AION_CONSTANTS } from './constants';

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Initialize secure store
const store = new Store({
  encryptionKey: process.env.ENCRYPTION_KEY || 'neuraledge-desktop-2025',
  name: 'neuraledge-config'
});

// Application state
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Services
let securityManager: SecurityManager;
let syncManager: SyncManager;
let aiEngine: AIEngine;
let mcpBridge: MCPBridge;
let windowManager: WindowManager;

// Performance metrics
const appMetrics = {
  startupTime: 0,
  memoryUsage: 0,
  cpuUsage: 0,
  networkLatency: 0,
  aiResponseTime: 0
};

// Create main application window
async function createMainWindow(): Promise<void> {
  const startTime = performance.now();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'NeuralEdge AI Desktop',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    frame: process.platform !== 'darwin',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#1a1a1a',
    show: false
  });

  // Load application
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Window events
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    appMetrics.startupTime = performance.now() - startTime;
    console.log(`[DESKTOP] Main window created in ${appMetrics.startupTime.toFixed(2)}ms`);
    
    // Verify AION compliance
    if (appMetrics.startupTime > AION_CONSTANTS.MAX_STARTUP_TIME) {
      console.warn(`[DESKTOP] Startup time ${appMetrics.startupTime}ms exceeds AION limit`);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting && process.platform === 'darwin') {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Initialize window manager
  windowManager = new WindowManager(mainWindow);
}

// Create system tray
function createTray(): void {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show NeuralEdge AI',
      click: () => {
        mainWindow?.show();
      }
    },
    {
      label: 'AI Status',
      enabled: false,
      id: 'ai-status'
    },
    { type: 'separator' },
    {
      label: 'Sync Now',
      click: async () => {
        await syncManager.performFullSync();
      }
    },
    {
      label: 'Performance Metrics',
      click: () => {
        windowManager.openPerformanceWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        windowManager.openSettingsWindow();
      }
    },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('NeuralEdge AI - Enterprise AI Platform');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    mainWindow?.show();
  });
}

// Initialize application services
async function initializeServices(): Promise<void> {
  console.log('[DESKTOP] Initializing services...');
  
  try {
    // Initialize security
    securityManager = new SecurityManager(store);
    await securityManager.initialize();
    
    // Initialize AI engine
    aiEngine = new AIEngine({
      modelPath: path.join(app.getPath('userData'), 'models'),
      maxResponseTime: AION_CONSTANTS.MAX_RESPONSE_TIME
    });
    await aiEngine.initialize();
    
    // Initialize sync manager
    syncManager = new SyncManager(store, securityManager);
    await syncManager.initialize();
    
    // Initialize MCP bridge
    mcpBridge = new MCPBridge(aiEngine);
    await mcpBridge.initialize();
    
    console.log('[DESKTOP] All services initialized successfully');
  } catch (error) {
    console.error('[DESKTOP] Service initialization failed:', error);
    dialog.showErrorBox('Initialization Error', 'Failed to initialize application services');
    app.quit();
  }
}

// Setup IPC handlers
function setupIpcHandlers(): void {
  // AI Processing
  ipcMain.handle('ai:process', async (_event, input: string) => {
    const startTime = performance.now();
    try {
      const result = await aiEngine.processInput(input);
      appMetrics.aiResponseTime = performance.now() - startTime;
      
      // Verify AION compliance
      if (appMetrics.aiResponseTime > AION_CONSTANTS.MAX_RESPONSE_TIME) {
        console.warn(`[DESKTOP] AI response time ${appMetrics.aiResponseTime}ms exceeds AION limit`);
      }
      
      return { success: true, data: result, metrics: { responseTime: appMetrics.aiResponseTime } };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Sync operations
  ipcMain.handle('sync:start', async () => {
    try {
      const result = await syncManager.performFullSync();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // MCP operations
  ipcMain.handle('mcp:execute', async (event, toolCall: any) => {
    try {
      const result = await mcpBridge.executeTool(toolCall);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Performance metrics
  ipcMain.handle('metrics:get', async () => {
    const metrics = {
      ...appMetrics,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      cpuUsage: process.cpuUsage().user / 1000000, // seconds
      uptime: process.uptime(),
      platform: process.platform,
      version: app.getVersion()
    };
    return metrics;
  });

  // Settings operations
  ipcMain.handle('settings:get', async (event, key?: string) => {
    if (key) {
      return store.get(key);
    }
    return store.store;
  });

  ipcMain.handle('settings:set', async (event, key: string, value: any) => {
    store.set(key, value);
    return { success: true };
  });

  // Security operations
  ipcMain.handle('security:encrypt', async (event, data: string) => {
    try {
      const encrypted = await securityManager.encryptData(data);
      return { success: true, data: encrypted };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('security:decrypt', async (event, data: string) => {
    try {
      const decrypted = await securityManager.decryptData({ encryptedData: data, iv: '', tag: '' });
      return { success: true, data: decrypted };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// Setup application menu
function setupApplicationMenu(): void {
  const template: any[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            windowManager.createProjectWindow();
          }
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            dialog.showOpenDialog({
              properties: ['openDirectory']
            }).then(result => {
              if (!result.canceled && result.filePaths[0]) {
                windowManager.openProject(result.filePaths[0]);
              }
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Export Data',
          click: () => {
            windowManager.openExportWindow();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'AI',
      submenu: [
        {
          label: 'AI Console',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            windowManager.openAIConsole();
          }
        },
        {
          label: 'Model Manager',
          click: () => {
            windowManager.openModelManager();
          }
        },
        {
          label: 'Training Dashboard',
          click: () => {
            windowManager.openTrainingDashboard();
          }
        },
        { type: 'separator' },
        {
          label: 'Performance Benchmark',
          click: async () => {
            const result = await performanceMonitor.runBenchmark('test input', 'session123');
            dialog.showMessageBox({
              type: 'info',
              title: 'Performance Benchmark',
              message: `Benchmark Results:\n\nResponse Time: ${result.responseTime}ms\nMemory Usage: ${result.memoryUsage}MB\nThroughput: ${result.throughput} QPS\n\nAION Compliance: ${result.aionCompliant ? 'PASS' : 'FAIL'}`
            });
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        { type: 'separator' },
        {
          label: 'All Windows',
          click: () => {
            windowManager.showAllWindows();
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://docs.neuraledge.ai');
          }
        },
        {
          label: 'GitHub Repository',
          click: () => {
            shell.openExternal('https://github.com/Yatrogenesis/NeuralEdge-AI');
          }
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify();
          }
        },
        { type: 'separator' },
        {
          label: 'About NeuralEdge AI',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About NeuralEdge AI',
              message: 'NeuralEdge AI Desktop',
              detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}\nChrome: ${process.versions.chrome}\n\nEnterprise AI Platform with AION Protocol Compliance`,
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Auto-updater setup
function setupAutoUpdater(): void {
  autoUpdater.checkForUpdatesAndNotify();
  
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version of NeuralEdge AI is available. It will be downloaded in the background.',
      buttons: ['OK']
    });
  });
  
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. The application will restart to apply the update.',
      buttons: ['Restart Now', 'Later']
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}

// Application event handlers
app.whenReady().then(async () => {
  console.log('[DESKTOP] Application starting...');
  
  // Initialize services
  await initializeServices();
  
  // Create main window
  await createMainWindow();
  
  // Create system tray
  createTray();
  
  // Setup IPC handlers
  setupIpcHandlers();
  
  // Setup application menu
  setupApplicationMenu();
  
  // Setup auto-updater
  if (process.env.NODE_ENV !== 'development') {
    setupAutoUpdater();
  }
  
  // Monitor performance
  setInterval(() => {
    appMetrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    appMetrics.cpuUsage = process.cpuUsage().user / 1000000;
    
    // Update tray status - simplified without context menu access
    if (tray) {
      tray.setToolTip(`AI: ${aiEngine.isReady() ? 'Ready' : 'Loading'} | Memory: ${appMetrics.memoryUsage.toFixed(1)}MB`);
    }
  }, 5000);
  
  console.log('[DESKTOP] Application ready');
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  } else {
    mainWindow?.show();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// Handle protocol for deep linking
app.setAsDefaultProtocolClient('neuraledge');

app.on('open-url', (event, url) => {
  event.preventDefault();
  // Handle deep link
  if (mainWindow) {
    mainWindow.webContents.send('deep-link', url);
  }
});

// Export for testing
export { app, mainWindow, appMetrics };