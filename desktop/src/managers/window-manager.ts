// NeuralEdge AI Desktop - Window Manager
// AION Protocol Compliant Window Management

import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { WINDOW_CONFIG } from '../constants';

export interface WindowInfo {
  id: string;
  type: string;
  title: string;
  bounds: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  createdAt: Date;
}

export class WindowManager {
  private mainWindow: BrowserWindow;
  private windows: Map<string, BrowserWindow> = new Map();
  private windowHistory: WindowInfo[] = [];

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.registerMainWindow();
  }

  public openAIConsole(): void {
    const windowId = 'ai-console';
    
    if (this.windows.has(windowId)) {
      const existingWindow = this.windows.get(windowId);
      existingWindow?.focus();
      return;
    }

    const aiConsoleWindow = new BrowserWindow({
      width: WINDOW_CONFIG.AI_CONSOLE.width,
      height: WINDOW_CONFIG.AI_CONSOLE.height,
      minWidth: WINDOW_CONFIG.AI_CONSOLE.minWidth,
      minHeight: WINDOW_CONFIG.AI_CONSOLE.minHeight,
      title: 'NeuralEdge AI - Console',
      parent: this.mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
      },
      backgroundColor: '#1a1a1a',
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    // Load AI console interface
    if (process.env.NODE_ENV === 'development') {
      aiConsoleWindow.loadURL('http://localhost:3000/ai-console');
    } else {
      aiConsoleWindow.loadFile(path.join(__dirname, '../../renderer/ai-console.html'));
    }

    this.registerWindow(windowId, 'ai-console', aiConsoleWindow);
    
    console.log('[WINDOW_MANAGER] AI Console opened');
  }

  public openSettingsWindow(): void {
    const windowId = 'settings';
    
    if (this.windows.has(windowId)) {
      const existingWindow = this.windows.get(windowId);
      existingWindow?.focus();
      return;
    }

    const settingsWindow = new BrowserWindow({
      width: WINDOW_CONFIG.SETTINGS.width,
      height: WINDOW_CONFIG.SETTINGS.height,
      minWidth: WINDOW_CONFIG.SETTINGS.minWidth,
      minHeight: WINDOW_CONFIG.SETTINGS.minHeight,
      title: 'NeuralEdge AI - Settings',
      parent: this.mainWindow,
      modal: true,
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
      },
      backgroundColor: '#1a1a1a',
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    // Load settings interface
    if (process.env.NODE_ENV === 'development') {
      settingsWindow.loadURL('http://localhost:3000/settings');
    } else {
      settingsWindow.loadFile(path.join(__dirname, '../../renderer/settings.html'));
    }

    this.registerWindow(windowId, 'settings', settingsWindow);
    
    console.log('[WINDOW_MANAGER] Settings window opened');
  }

  public openPerformanceWindow(): void {
    const windowId = 'performance';
    
    if (this.windows.has(windowId)) {
      const existingWindow = this.windows.get(windowId);
      existingWindow?.focus();
      return;
    }

    const performanceWindow = new BrowserWindow({
      width: WINDOW_CONFIG.PERFORMANCE.width,
      height: WINDOW_CONFIG.PERFORMANCE.height,
      minWidth: WINDOW_CONFIG.PERFORMANCE.minWidth,
      minHeight: WINDOW_CONFIG.PERFORMANCE.minHeight,
      title: 'NeuralEdge AI - Performance Monitor',
      parent: this.mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
      },
      backgroundColor: '#1a1a1a',
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    // Load performance monitor interface
    if (process.env.NODE_ENV === 'development') {
      performanceWindow.loadURL('http://localhost:3000/performance');
    } else {
      performanceWindow.loadFile(path.join(__dirname, '../../renderer/performance.html'));
    }

    this.registerWindow(windowId, 'performance', performanceWindow);
    
    console.log('[WINDOW_MANAGER] Performance monitor opened');
  }

  public openModelManager(): void {
    const windowId = 'model-manager';
    
    if (this.windows.has(windowId)) {
      const existingWindow = this.windows.get(windowId);
      existingWindow?.focus();
      return;
    }

    const modelWindow = new BrowserWindow({
      width: 900,
      height: 700,
      minWidth: 700,
      minHeight: 500,
      title: 'NeuralEdge AI - Model Manager',
      parent: this.mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
      },
      backgroundColor: '#1a1a1a',
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    // Load model manager interface
    if (process.env.NODE_ENV === 'development') {
      modelWindow.loadURL('http://localhost:3000/model-manager');
    } else {
      modelWindow.loadFile(path.join(__dirname, '../../renderer/model-manager.html'));
    }

    this.registerWindow(windowId, 'model-manager', modelWindow);
    
    console.log('[WINDOW_MANAGER] Model manager opened');
  }

  public openTrainingDashboard(): void {
    const windowId = 'training-dashboard';
    
    if (this.windows.has(windowId)) {
      const existingWindow = this.windows.get(windowId);
      existingWindow?.focus();
      return;
    }

    const trainingWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      title: 'NeuralEdge AI - Training Dashboard',
      parent: this.mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
      },
      backgroundColor: '#1a1a1a',
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    // Load training dashboard interface
    if (process.env.NODE_ENV === 'development') {
      trainingWindow.loadURL('http://localhost:3000/training');
    } else {
      trainingWindow.loadFile(path.join(__dirname, '../../renderer/training.html'));
    }

    this.registerWindow(windowId, 'training-dashboard', trainingWindow);
    
    console.log('[WINDOW_MANAGER] Training dashboard opened');
  }

  public createProjectWindow(): void {
    const windowId = `project-${Date.now()}`;
    
    const projectWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 500,
      title: 'NeuralEdge AI - New Project',
      parent: this.mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
      },
      backgroundColor: '#1a1a1a',
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    // Load project interface
    if (process.env.NODE_ENV === 'development') {
      projectWindow.loadURL('http://localhost:3000/project');
    } else {
      projectWindow.loadFile(path.join(__dirname, '../../renderer/project.html'));
    }

    this.registerWindow(windowId, 'project', projectWindow);
    
    console.log('[WINDOW_MANAGER] New project window created');
  }

  public openProject(projectPath: string): void {
    const windowId = `project-${Date.now()}`;
    
    const projectWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      title: `NeuralEdge AI - ${path.basename(projectPath)}`,
      parent: this.mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
      },
      backgroundColor: '#1a1a1a',
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    // Load project interface with path
    const url = process.env.NODE_ENV === 'development' 
      ? `http://localhost:3000/project?path=${encodeURIComponent(projectPath)}`
      : path.join(__dirname, '../../renderer/project.html');
    
    projectWindow.loadURL(url);

    this.registerWindow(windowId, 'project', projectWindow);
    
    console.log(`[WINDOW_MANAGER] Project opened: ${projectPath}`);
  }

  public openExportWindow(): void {
    const windowId = 'export';
    
    if (this.windows.has(windowId)) {
      const existingWindow = this.windows.get(windowId);
      existingWindow?.focus();
      return;
    }

    const exportWindow = new BrowserWindow({
      width: 600,
      height: 500,
      minWidth: 500,
      minHeight: 400,
      title: 'NeuralEdge AI - Export Data',
      parent: this.mainWindow,
      modal: true,
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
      },
      backgroundColor: '#1a1a1a',
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    // Load export interface
    if (process.env.NODE_ENV === 'development') {
      exportWindow.loadURL('http://localhost:3000/export');
    } else {
      exportWindow.loadFile(path.join(__dirname, '../../renderer/export.html'));
    }

    this.registerWindow(windowId, 'export', exportWindow);
    
    console.log('[WINDOW_MANAGER] Export window opened');
  }

  public showAllWindows(): void {
    this.mainWindow.show();
    
    for (const window of this.windows.values()) {
      if (!window.isDestroyed()) {
        window.show();
      }
    }
    
    console.log('[WINDOW_MANAGER] All windows shown');
  }

  public hideAllWindows(): void {
    this.mainWindow.hide();
    
    for (const window of this.windows.values()) {
      if (!window.isDestroyed()) {
        window.hide();
      }
    }
    
    console.log('[WINDOW_MANAGER] All windows hidden');
  }

  public closeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (window && !window.isDestroyed()) {
      window.close();
      this.windows.delete(windowId);
      console.log(`[WINDOW_MANAGER] Window closed: ${windowId}`);
      return true;
    }
    return false;
  }

  public getWindowInfo(windowId?: string): WindowInfo | WindowInfo[] {
    if (windowId) {
      const window = this.windows.get(windowId);
      if (window && !window.isDestroyed()) {
        return this.createWindowInfo(windowId, 'unknown', window);
      }
      return null;
    }

    // Return info for all windows
    const allWindows: WindowInfo[] = [];
    
    // Add main window
    allWindows.push(this.createWindowInfo('main', 'main', this.mainWindow));
    
    // Add all managed windows
    for (const [id, window] of this.windows.entries()) {
      if (!window.isDestroyed()) {
        allWindows.push(this.createWindowInfo(id, 'managed', window));
      }
    }
    
    return allWindows;
  }

  public getActiveWindow(): BrowserWindow | null {
    return BrowserWindow.getFocusedWindow();
  }

  public arrangeWindows(arrangement: 'cascade' | 'tile' | 'stack'): void {
    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    switch (arrangement) {
      case 'cascade':
        this.arrangeWindowsCascade();
        break;
      case 'tile':
        this.arrangeWindowsTile();
        break;
      case 'stack':
        this.arrangeWindowsStack();
        break;
    }
    
    console.log(`[WINDOW_MANAGER] Windows arranged: ${arrangement}`);
  }

  private registerMainWindow(): void {
    const windowInfo: WindowInfo = {
      id: 'main',
      type: 'main',
      title: this.mainWindow.getTitle(),
      bounds: this.mainWindow.getBounds(),
      isVisible: this.mainWindow.isVisible(),
      isMinimized: this.mainWindow.isMinimized(),
      isMaximized: this.mainWindow.isMaximized(),
      createdAt: new Date()
    };
    
    this.windowHistory.push(windowInfo);
  }

  private registerWindow(id: string, type: string, window: BrowserWindow): void {
    this.windows.set(id, window);
    
    const windowInfo: WindowInfo = {
      id,
      type,
      title: window.getTitle(),
      bounds: window.getBounds(),
      isVisible: window.isVisible(),
      isMinimized: window.isMinimized(),
      isMaximized: window.isMaximized(),
      createdAt: new Date()
    };
    
    this.windowHistory.push(windowInfo);

    // Handle window closure
    window.on('closed', () => {
      this.windows.delete(id);
      console.log(`[WINDOW_MANAGER] Window unregistered: ${id}`);
    });

    // Handle window events for history tracking
    window.on('focus', () => {
      console.log(`[WINDOW_MANAGER] Window focused: ${id}`);
    });

    window.on('blur', () => {
      console.log(`[WINDOW_MANAGER] Window blurred: ${id}`);
    });
  }

  private createWindowInfo(id: string, type: string, window: BrowserWindow): WindowInfo {
    return {
      id,
      type,
      title: window.getTitle(),
      bounds: window.getBounds(),
      isVisible: window.isVisible(),
      isMinimized: window.isMinimized(),
      isMaximized: window.isMaximized(),
      createdAt: new Date()
    };
  }

  private arrangeWindowsCascade(): void {
    let offsetX = 0;
    let offsetY = 0;
    const increment = 30;
    
    this.mainWindow.setBounds({ x: offsetX, y: offsetY, width: 1200, height: 800 });
    offsetX += increment;
    offsetY += increment;
    
    for (const window of this.windows.values()) {
      if (!window.isDestroyed()) {
        window.setBounds({ x: offsetX, y: offsetY, width: 1000, height: 700 });
        offsetX += increment;
        offsetY += increment;
      }
    }
  }

  private arrangeWindowsTile(): void {
    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    
    const allWindows = [this.mainWindow, ...Array.from(this.windows.values())];
    const validWindows = allWindows.filter(w => !w.isDestroyed());
    
    const columns = Math.ceil(Math.sqrt(validWindows.length));
    const rows = Math.ceil(validWindows.length / columns);
    
    const tileWidth = Math.floor(width / columns);
    const tileHeight = Math.floor(height / rows);
    
    validWindows.forEach((window, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      window.setBounds({
        x: col * tileWidth,
        y: row * tileHeight,
        width: tileWidth,
        height: tileHeight
      });
    });
  }

  private arrangeWindowsStack(): void {
    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    
    const centerX = Math.floor(width / 2 - 600);
    const centerY = Math.floor(height / 2 - 400);
    
    this.mainWindow.setBounds({ x: centerX, y: centerY, width: 1200, height: 800 });
    
    for (const window of this.windows.values()) {
      if (!window.isDestroyed()) {
        window.setBounds({ x: centerX + 20, y: centerY + 20, width: 1000, height: 700 });
      }
    }
  }
}