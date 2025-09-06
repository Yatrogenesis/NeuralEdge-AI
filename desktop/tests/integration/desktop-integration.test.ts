// NeuralEdge AI Desktop - Integration Tests
// End-to-end integration testing for desktop application services

import { app, BrowserWindow } from 'electron';
import { AIEngine } from '../../src/services/ai-engine';
import { MCPBridge } from '../../src/services/mcp-bridge';
import { WindowManager } from '../../src/managers/window-manager';
import { AION_CONSTANTS } from '../../src/constants';

describe('Desktop Integration Tests', () => {
  let aiEngine: AIEngine;
  let mcpBridge: MCPBridge;
  let windowManager: WindowManager;
  let mainWindow: BrowserWindow;

  beforeAll(async () => {
    // Initialize Electron app
    await app.whenReady();
    
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // Initialize services
    aiEngine = new AIEngine();
    mcpBridge = new MCPBridge(aiEngine);
    windowManager = new WindowManager(mainWindow);
  });

  afterAll(async () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.destroy();
    }
    await app.quit();
  });

  describe('Service Integration', () => {
    it('should initialize all services successfully', async () => {
      const aiResult = await aiEngine.initialize();
      const mcpResult = await mcpBridge.initialize();

      expect(aiResult.success).toBe(true);
      expect(mcpResult.success).toBe(true);
    });

    it('should meet AION startup time requirements', async () => {
      const startTime = performance.now();
      
      await Promise.all([
        aiEngine.initialize(),
        mcpBridge.initialize()
      ]);
      
      const totalStartupTime = performance.now() - startTime;
      AIONComplianceTestUtils.assertResponseTime(totalStartupTime, AION_CONSTANTS.MAX_STARTUP_TIME);
    });

    it('should handle AI processing through MCP bridge', async () => {
      await aiEngine.initialize();
      await mcpBridge.initialize();
      
      // Load AI model
      const modelResult = await aiEngine.loadModel('test-model-v1');
      expect(modelResult.success).toBe(true);
      
      // Process input through AI engine
      const aiResult = await aiEngine.processInput('Test integration input');
      expect(aiResult.success).toBe(true);
      
      // Execute system info through MCP bridge
      const mcpResult = await mcpBridge.executeTool({
        tool: 'get_system_info'
      });
      expect(mcpResult.success).toBe(true);
    });
  });

  describe('Window and Service Integration', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
      await mcpBridge.initialize();
    });

    it('should open AI console with working AI engine', async () => {
      const { time } = TestPerformanceMonitor.measure(() => {
        windowManager.openAIConsole();
      });
      
      AIONComplianceTestUtils.assertResponseTime(time, 1000);
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      const aiConsole = windowInfo.find(w => w.title.includes('Console'));
      
      expect(aiConsole).toBeDefined();
      expect(aiConsole.isVisible).toBe(true);
      
      // Test AI processing works from console
      const result = await aiEngine.processInput('Integration test from console');
      expect(result.success).toBe(true);
    });

    it('should coordinate performance monitoring across services', async () => {
      windowManager.openPerformanceWindow();
      
      // Generate load across all services
      const promises = [
        aiEngine.processInput('Performance test input 1'),
        aiEngine.processInput('Performance test input 2'),
        mcpBridge.executeTool({ tool: 'get_system_info' }),
        mcpBridge.executeTool({ tool: 'get_process_list' })
      ];
      
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      // Verify performance metrics are available
      const aiMetrics = await aiEngine.getPerformanceMetrics();
      expect(aiMetrics.success).toBe(true);
      expect(aiMetrics.data.responseTime).toBeGreaterThan(0);
    });

    it('should handle file operations through MCP and window management', async () => {
      windowManager.openExportWindow();
      
      // Create test file through MCP
      const writeResult = await mcpBridge.executeTool({
        tool: 'write_file',
        arguments: {
          path: './test-integration.txt',
          content: 'Integration test content'
        }
      });
      expect(writeResult.success).toBe(true);
      
      // Read file back through MCP
      const readResult = await mcpBridge.executeTool({
        tool: 'read_file',
        arguments: { path: './test-integration.txt' }
      });
      expect(readResult.success).toBe(true);
      expect(readResult.content[0].data).toContain('Integration test content');
      
      // Verify export window is functional
      const windowInfo = windowManager.getWindowInfo() as any[];
      const exportWindow = windowInfo.find(w => w.title.includes('Export'));
      expect(exportWindow).toBeDefined();
    });
  });

  describe('Cross-Service Data Flow', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
      await mcpBridge.initialize();
      await aiEngine.loadModel('test-model-v1');
    });

    it('should process AI input and store results via MCP', async () => {
      const testInput = 'Complex integration test input for processing';
      
      // Process through AI engine
      const aiResult = await aiEngine.processInput(testInput);
      expect(aiResult.success).toBe(true);
      
      // Store result through MCP file operations
      const storeResult = await mcpBridge.executeTool({
        tool: 'write_file',
        arguments: {
          path: './ai-result.json',
          content: JSON.stringify({
            input: testInput,
            response: aiResult.data.response,
            timestamp: new Date(),
            confidence: aiResult.data.confidence
          })
        }
      });
      expect(storeResult.success).toBe(true);
      
      // Verify stored data through MCP
      const retrieveResult = await mcpBridge.executeTool({
        tool: 'read_file',
        arguments: { path: './ai-result.json' }
      });
      expect(retrieveResult.success).toBe(true);
      
      const storedData = JSON.parse(retrieveResult.content[0].data);
      expect(storedData.input).toBe(testInput);
      expect(storedData.response).toBe(aiResult.data.response);
    });

    it('should coordinate system monitoring across all services', async () => {
      windowManager.openPerformanceWindow();
      
      // Generate sustained load
      const loadOperations = Array.from({ length: 10 }, async (_, i) => {
        const aiPromise = aiEngine.processInput(`Load test ${i}`);
        const mcpPromise = mcpBridge.executeTool({
          tool: 'monitor_performance',
          arguments: { duration: 1 }
        });
        
        return Promise.all([aiPromise, mcpPromise]);
      });
      
      const results = await Promise.all(loadOperations);
      
      // Verify all operations completed successfully
      results.forEach(([aiResult, mcpResult]) => {
        expect(aiResult.success).toBe(true);
        expect(mcpResult.success).toBe(true);
      });
      
      // Verify system monitoring data is coherent
      const systemInfoResult = await mcpBridge.executeTool({
        tool: 'get_system_info'
      });
      expect(systemInfoResult.success).toBe(true);
      
      const systemInfo = JSON.parse(systemInfoResult.content[0].data);
      expect(systemInfo.platform).toBeDefined();
      expect(systemInfo.totalMemory).toBeGreaterThan(0);
    });
  });

  describe('AION Protocol Compliance', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
      await mcpBridge.initialize();
    });

    it('should maintain response times under load', async () => {
      const loadTest = async () => {
        const startTime = performance.now();
        
        await Promise.all([
          aiEngine.processInput('AION compliance test'),
          mcpBridge.executeTool({ tool: 'get_system_info' }),
          windowManager.arrangeWindows('tile')
        ]);
        
        return performance.now() - startTime;
      };
      
      const { results, times, failures } = await AIONComplianceTestUtils.runRepeatedTest(loadTest, 50);
      
      AIONComplianceTestUtils.assertFailureRate(failures, 50);
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      AIONComplianceTestUtils.assertResponseTime(avgTime, AION_CONSTANTS.MAX_RESPONSE_TIME * 3);
    });

    it('should handle concurrent operations without degradation', async () => {
      const concurrentOperations = Array.from({ length: 20 }, async (_, i) => {
        const startTime = performance.now();
        
        const results = await Promise.all([
          aiEngine.processInput(`Concurrent test ${i}`),
          mcpBridge.executeTool({ tool: 'get_process_list' })
        ]);
        
        const time = performance.now() - startTime;
        
        return {
          results,
          time,
          success: results.every(r => r.success)
        };
      });
      
      const outcomes = await Promise.all(concurrentOperations);
      
      // Verify all operations succeeded
      const failures = outcomes.filter(o => !o.success).length;
      AIONComplianceTestUtils.assertFailureRate(failures, outcomes.length);
      
      // Verify response times
      const avgTime = outcomes.reduce((sum, o) => sum + o.time, 0) / outcomes.length;
      AIONComplianceTestUtils.assertResponseTime(avgTime, AION_CONSTANTS.MAX_RESPONSE_TIME * 2);
    });

    it('should maintain memory efficiency during extended operations', async () => {
      const extendedOperation = async () => {
        // Create multiple windows
        windowManager.openAIConsole();
        windowManager.openSettingsWindow();
        windowManager.openPerformanceWindow();
        
        // Process AI operations
        await aiEngine.processInput('Extended operation test');
        await aiEngine.processInput('Memory efficiency test');
        
        // Execute MCP tools
        await mcpBridge.executeTool({ tool: 'get_system_info' });
        await mcpBridge.executeTool({ tool: 'list_directory', arguments: { path: '.' } });
        
        // Arrange windows
        windowManager.arrangeWindows('cascade');
        
        // Clean up windows
        const windowInfo = windowManager.getWindowInfo() as any[];
        const managedWindows = windowInfo.filter(w => w.id !== 'main');
        
        for (const window of managedWindows) {
          windowManager.closeWindow(window.id);
        }
      };
      
      const { leakDetected, memoryIncrease } = await MemoryLeakTestUtils.detectMemoryLeak(
        extendedOperation,
        5 // Run 5 times
      );
      
      expect(leakDetected).toBe(false);
      AIONComplianceTestUtils.assertMemoryUsage(memoryIncrease);
    });
  });

  describe('Error Recovery and Resilience', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
      await mcpBridge.initialize();
    });

    it('should recover from AI engine failures', async () => {
      // Force an AI engine error scenario
      const invalidInput = null as any;
      const errorResult = await aiEngine.processInput(invalidInput);
      expect(errorResult.success).toBe(false);
      
      // Verify recovery with valid input
      const recoveryResult = await aiEngine.processInput('Recovery test input');
      expect(recoveryResult.success).toBe(true);
    });

    it('should handle MCP server failures gracefully', async () => {
      // Test with invalid tool call
      const invalidResult = await mcpBridge.executeTool({
        tool: 'non_existent_tool'
      });
      expect(invalidResult.success).toBe(false);
      
      // Verify other tools still work
      const validResult = await mcpBridge.executeTool({
        tool: 'get_system_info'
      });
      expect(validResult.success).toBe(true);
    });

    it('should maintain window management during service errors', async () => {
      // Open windows normally
      windowManager.openAIConsole();
      windowManager.openSettingsWindow();
      
      // Simulate service failures
      const invalidAI = await aiEngine.processInput('');
      const invalidMCP = await mcpBridge.executeTool({ tool: 'invalid' });
      
      expect(invalidAI.success).toBe(false);
      expect(invalidMCP.success).toBe(false);
      
      // Window management should still work
      windowManager.arrangeWindows('tile');
      
      const windowInfo = windowManager.getWindowInfo() as any[];
      expect(windowInfo.length).toBeGreaterThan(1);
    });
  });
});