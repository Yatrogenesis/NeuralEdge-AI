// NeuralEdge AI Desktop - Window Manager Unit Tests
// Comprehensive testing for window creation and management

import { WindowManager } from '../../src/managers/window-manager';
import { BrowserWindow } from 'electron';
import { AION_CONSTANTS } from '../../src/constants';

describe('WindowManager', () => {
  let windowManager: WindowManager;
  let mainWindow: BrowserWindow;
  
  beforeEach(() => {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false
    });
    windowManager = new WindowManager(mainWindow);
  });

  afterEach(() => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.destroy();
    }
  });

  describe('Window Creation', () => {
    it('should open AI console window', () => {
      const { time } = TestPerformanceMonitor.measure(() => {
        windowManager.openAIConsole();
      });
      
      AIONComplianceTestUtils.assertResponseTime(time);
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.some(w => w.title.includes('Console'))).toBe(true);
    });

    it('should open settings window', () => {
      windowManager.openSettingsWindow();
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.some(w => w.title.includes('Settings'))).toBe(true);
    });

    it('should open performance monitor window', () => {
      windowManager.openPerformanceWindow();
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.some(w => w.title.includes('Performance'))).toBe(true);
    });

    it('should open model manager window', () => {
      windowManager.openModelManager();
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.some(w => w.title.includes('Model Manager'))).toBe(true);
    });

    it('should open training dashboard', () => {
      windowManager.openTrainingDashboard();
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.some(w => w.title.includes('Training'))).toBe(true);
    });

    it('should create new project window', () => {
      windowManager.createProjectWindow();
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.some(w => w.title.includes('Project'))).toBe(true);
    });

    it('should open project with path', () => {
      const projectPath = 'D:\\test-project';
      
      windowManager.openProject(projectPath);
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.some(w => w.title.includes('test-project'))).toBe(true);
    });

    it('should open export window', () => {
      windowManager.openExportWindow();
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.some(w => w.title.includes('Export'))).toBe(true);
    });
  });

  describe('Window Management', () => {
    it('should prevent duplicate windows', () => {
      windowManager.openSettingsWindow();
      windowManager.openSettingsWindow(); // Try to open again
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      const settingsWindows = windowInfo.filter(w => w.title.includes('Settings'));
      expect(settingsWindows.length).toBe(1);
    });

    it('should focus existing window when trying to open duplicate', () => {
      windowManager.openAIConsole();
      const activeWindowBefore = windowManager.getActiveWindow();
      
      windowManager.openAIConsole(); // Should focus existing
      
      expect(activeWindowBefore).toBeDefined();
    });

    it('should show all windows', () => {
      windowManager.openAIConsole();
      windowManager.openSettingsWindow();
      windowManager.hideAllWindows();
      
      windowManager.showAllWindows();
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      windowInfo.forEach(info => {
        expect(info.isVisible).toBe(true);
      });
    });

    it('should hide all windows', () => {
      windowManager.openAIConsole();
      windowManager.openSettingsWindow();
      
      windowManager.hideAllWindows();
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      windowInfo.forEach(info => {
        expect(info.isVisible).toBe(false);
      });
    });

    it('should close specific window', () => {
      windowManager.openAIConsole();
      const windowInfoBefore = windowManager.getWindowInfo() as any[];
      const aiConsoleWindow = windowInfoBefore.find(w => w.title.includes('Console'));
      
      expect(aiConsoleWindow).toBeDefined();
      
      const closed = windowManager.closeWindow(aiConsoleWindow.id);
      expect(closed).toBe(true);
      
      const windowInfoAfter = windowManager.getWindowInfo() as any[];
      expect(windowInfoAfter.some(w => w.id === aiConsoleWindow.id)).toBe(false);
    });
  });

  describe('Window Information', () => {
    it('should provide window information', () => {
      const windowInfo = windowManager.getWindowInfo();
      
      expect(Array.isArray(windowInfo)).toBe(true);
      expect((windowInfo as any[]).length).toBeGreaterThan(0);
    });

    it('should get specific window information', () => {
      windowManager.openAIConsole();
      const allWindows = windowManager.getWindowInfo() as any[];
      const aiConsoleWindow = allWindows.find(w => w.title.includes('Console'));
      
      const specificInfo = windowManager.getWindowInfo(aiConsoleWindow.id);
      
      expect(specificInfo).toBeDefined();
      expect((specificInfo as any).id).toBe(aiConsoleWindow.id);
    });

    it('should track window creation time', () => {
      const beforeTime = new Date();
      windowManager.openSettingsWindow();
      const afterTime = new Date();
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      const settingsWindow = windowInfo.find(w => w.title.includes('Settings'));
      
      expect(settingsWindow.createdAt).toBeInstanceOf(Date);
      expect(settingsWindow.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(settingsWindow.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('Window Arrangements', () => {
    beforeEach(() => {
      windowManager.openAIConsole();
      windowManager.openSettingsWindow();
      windowManager.openPerformanceWindow();
    });

    it('should arrange windows in cascade', () => {
      windowManager.arrangeWindows('cascade');
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.length).toBeGreaterThan(1);
    });

    it('should arrange windows in tile layout', () => {
      windowManager.arrangeWindows('tile');
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.length).toBeGreaterThan(1);
    });

    it('should arrange windows in stack layout', () => {
      windowManager.arrangeWindows('stack');
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.length).toBeGreaterThan(1);
    });

    it('should meet AION performance requirements for arrangement', () => {
      const { time } = TestPerformanceMonitor.measure(() => {
        windowManager.arrangeWindows('tile');
      });
      
      AIONComplianceTestUtils.assertResponseTime(time, 500); // 500ms for UI operations
    });
  });

  describe('Performance and Memory', () => {
    it('should handle multiple window operations efficiently', () => {
      const { time } = TestPerformanceMonitor.measure(() => {
        windowManager.openAIConsole();
        windowManager.openSettingsWindow();
        windowManager.openPerformanceWindow();
        windowManager.openModelManager();
        windowManager.arrangeWindows('tile');
      });
      
      AIONComplianceTestUtils.assertResponseTime(time, 2000); // 2s for multiple operations
    });

    it('should not leak memory with window operations', async () => {
      const operation = async () => {
        windowManager.createProjectWindow();
        const windowInfo = windowManager.getWindowInfo() as any[];
        const projectWindow = windowInfo.find(w => w.title.includes('Project'));
        if (projectWindow) {
          windowManager.closeWindow(projectWindow.id);
        }
      };
      
      const { leakDetected, memoryIncrease } = await MemoryLeakTestUtils.detectMemoryLeak(operation, 10);
      
      expect(leakDetected).toBe(false);
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB threshold
    });

    it('should handle rapid window creation and destruction', () => {
      const operations = Array.from({ length: 20 }, (_, i) => () => {
        windowManager.createProjectWindow();
        const windowInfo = windowManager.getWindowInfo() as any[];
        const projectWindows = windowInfo.filter(w => w.title.includes('Project'));
        if (projectWindows.length > 0) {
          windowManager.closeWindow(projectWindows[projectWindows.length - 1].id);
        }
      });
      
      const { time } = TestPerformanceMonitor.measure(() => {
        operations.forEach(op => op());
      });
      
      expect(time).toBeLessThan(5000); // 5 seconds for 20 operations
    });
  });

  describe('Error Handling', () => {
    it('should handle closing non-existent window', () => {
      const result = windowManager.closeWindow('non-existent-id');
      expect(result).toBe(false);
    });

    it('should handle getting info for non-existent window', () => {
      const info = windowManager.getWindowInfo('non-existent-id');
      expect(info).toBeNull();
    });

    it('should handle window operations when main window is destroyed', () => {
      mainWindow.destroy();
      
      expect(() => {
        windowManager.openAIConsole();
      }).not.toThrow();
    });

    it('should gracefully handle screen availability issues', () => {
      expect(() => {
        windowManager.arrangeWindows('tile');
      }).not.toThrow();
    });
  });

  describe('Window State Tracking', () => {
    it('should track window visibility state', () => {
      windowManager.openAIConsole();
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      const aiConsole = windowInfo.find(w => w.title.includes('Console'));
      
      expect(typeof aiConsole.isVisible).toBe('boolean');
      expect(typeof aiConsole.isMinimized).toBe('boolean');
      expect(typeof aiConsole.isMaximized).toBe('boolean');
    });

    it('should track window bounds', () => {
      windowManager.openSettingsWindow();
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      const settingsWindow = windowInfo.find(w => w.title.includes('Settings'));
      
      expect(settingsWindow.bounds).toBeDefined();
      expect(typeof settingsWindow.bounds.x).toBe('number');
      expect(typeof settingsWindow.bounds.y).toBe('number');
      expect(typeof settingsWindow.bounds.width).toBe('number');
      expect(typeof settingsWindow.bounds.height).toBe('number');
    });

    it('should update window information on state changes', () => {
      windowManager.openAIConsole();
      
      // Get initial info
      const initialInfo = windowManager.getWindowInfo() as any[];
      const aiConsole = initialInfo.find(w => w.title.includes('Console'));
      
      // Get updated info
      const updatedInfo = windowManager.getWindowInfo() as any[];
      const updatedConsole = updatedInfo.find(w => w.title.includes('Console'));
      
      expect(updatedConsole.id).toBe(aiConsole.id);
    });
  });
});