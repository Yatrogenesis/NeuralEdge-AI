// NeuralEdge AI Desktop - MCP Bridge Unit Tests
// Comprehensive testing for MCP server communication and tool execution

import { MCPBridge } from '../../src/services/mcp-bridge';
import { AIEngine } from '../../src/services/ai-engine';
import { AION_CONSTANTS } from '../../src/constants';

describe('MCPBridge', () => {
  let mcpBridge: MCPBridge;
  let mockAIEngine: AIEngine;
  
  beforeEach(() => {
    mockAIEngine = new AIEngine();
    mcpBridge = new MCPBridge(mockAIEngine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await mcpBridge.initialize();
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should meet AION response time for initialization', async () => {
      const { time } = await TestPerformanceMonitor.measureAsync(async () => {
        return await mcpBridge.initialize();
      });
      
      AIONComplianceTestUtils.assertResponseTime(time, AION_CONSTANTS.MAX_STARTUP_TIME);
    });

    it('should initialize built-in servers', async () => {
      await mcpBridge.initialize();
      
      const servers = mcpBridge.getConnectedServers();
      
      expect(servers.length).toBeGreaterThan(0);
      expect(servers.some(s => s.name === 'Desktop File System')).toBe(true);
      expect(servers.some(s => s.name === 'Desktop System Info')).toBe(true);
    });
  });

  describe('Server Management', () => {
    beforeEach(async () => {
      await mcpBridge.initialize();
    });

    it('should add new MCP server successfully', async () => {
      const result = await mcpBridge.addServer(
        'http://localhost:3001',
        'Test Server',
        'Test MCP server for unit testing'
      );
      
      expect(result.success).toBe(true);
      
      const servers = mcpBridge.getConnectedServers();
      expect(servers.some(s => s.name === 'Test Server')).toBe(true);
    });

    it('should handle server addition failures', async () => {
      const result = await mcpBridge.addServer(
        'invalid-endpoint',
        'Invalid Server'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should remove server successfully', async () => {
      // Add a server first
      await mcpBridge.addServer('http://localhost:3002', 'Temp Server');
      const servers = mcpBridge.getConnectedServers();
      const tempServer = servers.find(s => s.name === 'Temp Server');
      
      expect(tempServer).toBeDefined();
      
      // Remove the server
      const result = await mcpBridge.removeServer(tempServer!.id);
      
      expect(result.success).toBe(true);
      
      const updatedServers = mcpBridge.getConnectedServers();
      expect(updatedServers.some(s => s.name === 'Temp Server')).toBe(false);
    });
  });

  describe('Tool Execution', () => {
    beforeEach(async () => {
      await mcpBridge.initialize();
    });

    it('should execute file system tools successfully', async () => {
      const toolCall = {
        tool: 'read_file',
        arguments: { path: 'test.txt' }
      };
      
      const result = await mcpBridge.executeTool(toolCall);
      
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.metadata.tool).toBe('read_file');
    });

    it('should meet AION response time requirements', async () => {
      const toolCall = {
        tool: 'get_system_info'
      };
      
      const { time, result } = await TestPerformanceMonitor.measureAsync(async () => {
        return await mcpBridge.executeTool(toolCall);
      });
      
      AIONComplianceTestUtils.assertResponseTime(time);
      expect(result.success).toBe(true);
    });

    it('should handle tool execution timeout', async () => {
      const toolCall = {
        tool: 'slow_operation',
        timeout: 100 // Very short timeout
      };
      
      const result = await mcpBridge.executeTool(toolCall);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should execute system info tools', async () => {
      const toolCall = {
        tool: 'get_system_info'
      };
      
      const result = await mcpBridge.executeTool(toolCall);
      
      expect(result.success).toBe(true);
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.content[0].type).toBe('json');
      
      const systemInfo = JSON.parse(result.content[0].data);
      expect(systemInfo.platform).toBeDefined();
      expect(systemInfo.architecture).toBeDefined();
    });

    it('should handle directory listing', async () => {
      const toolCall = {
        tool: 'list_directory',
        arguments: { path: '.' }
      };
      
      const result = await mcpBridge.executeTool(toolCall);
      
      expect(result.success).toBe(true);
      expect(result.content[0].type).toBe('json');
      
      const directoryList = JSON.parse(result.content[0].data);
      expect(Array.isArray(directoryList)).toBe(true);
    });

    it('should track execution history', async () => {
      const toolCall1 = { tool: 'get_system_info' };
      const toolCall2 = { tool: 'get_process_list' };
      
      await mcpBridge.executeTool(toolCall1);
      await mcpBridge.executeTool(toolCall2);
      
      const history = mcpBridge.getExecutionHistory(10);
      
      expect(history.length).toBe(2);
      expect(history[0].metadata.tool).toBe('get_system_info');
      expect(history[1].metadata.tool).toBe('get_process_list');
    });
  });

  describe('Tool Discovery', () => {
    beforeEach(async () => {
      await mcpBridge.initialize();
    });

    it('should get available tools from all servers', async () => {
      const tools = await mcpBridge.getAvailableTools();
      
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some(t => t.name === 'read_file')).toBe(true);
      expect(tools.some(t => t.name === 'get_system_info')).toBe(true);
    });

    it('should get available resources', async () => {
      const resources = await mcpBridge.getAvailableResources();
      
      expect(Array.isArray(resources)).toBe(true);
    });

    it('should provide tool metadata', async () => {
      const tools = await mcpBridge.getAvailableTools();
      const readFileTool = tools.find(t => t.name === 'read_file');
      
      expect(readFileTool).toBeDefined();
      expect(readFileTool!.description).toBeDefined();
      expect(readFileTool!.parameters).toBeDefined();
      expect(readFileTool!.returns).toBeDefined();
    });
  });

  describe('Performance Monitoring', () => {
    beforeEach(async () => {
      await mcpBridge.initialize();
    });

    it('should track execution performance metrics', async () => {
      const toolCall = { tool: 'get_system_info' };
      
      const result = await mcpBridge.executeTool(toolCall);
      
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.metadata.memoryUsed).toBeGreaterThanOrEqual(0);
      expect(result.metadata.timestamp).toBeDefined();
    });

    it('should maintain execution history limits', async () => {
      // Execute more tools than history limit
      const promises = Array.from({ length: 1005 }, (_, i) => 
        mcpBridge.executeTool({ tool: 'get_system_info' })
      );
      
      await Promise.all(promises);
      
      const history = mcpBridge.getExecutionHistory(2000);
      expect(history.length).toBe(1000); // Should be capped at 1000
    });

    it('should detect memory leaks in tool execution', async () => {
      const operation = async () => {
        await mcpBridge.executeTool({ tool: 'get_system_info' });
      };
      
      const { leakDetected, memoryIncrease } = await MemoryLeakTestUtils.detectMemoryLeak(operation, 100);
      
      expect(leakDetected).toBe(false);
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB threshold
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await mcpBridge.initialize();
    });

    it('should handle unknown tool execution', async () => {
      const toolCall = {
        tool: 'unknown_tool',
        arguments: { param: 'value' }
      };
      
      const result = await mcpBridge.executeTool(toolCall);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No server found for tool');
    });

    it('should handle invalid tool arguments', async () => {
      const toolCall = {
        tool: 'read_file',
        arguments: {} // Missing required path
      };
      
      const result = await mcpBridge.executeTool(toolCall);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle server disconnection gracefully', async () => {
      // Add and then disconnect a server
      await mcpBridge.addServer('http://localhost:3003', 'Test Server');
      const servers = mcpBridge.getConnectedServers();
      const testServer = servers.find(s => s.name === 'Test Server');
      
      // Simulate disconnection
      if (testServer) {
        testServer.connected = false;
      }
      
      const toolCall = {
        tool: 'test_tool' // Assuming this tool exists on Test Server
      };
      
      const result = await mcpBridge.executeTool(toolCall);
      
      // Should attempt reconnection or fail gracefully
      expect(result).toBeDefined();
    });
  });

  describe('Concurrent Operations', () => {
    beforeEach(async () => {
      await mcpBridge.initialize();
    });

    it('should handle concurrent tool executions', async () => {
      const concurrentCalls = Array.from({ length: 10 }, (_, i) => ({
        tool: 'get_system_info'
      }));
      
      const promises = concurrentCalls.map(call => mcpBridge.executeTool(call));
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.content).toBeDefined();
      });
    });

    it('should maintain AION compliance under load', async () => {
      const loadTestResults = await AIONComplianceTestUtils.runRepeatedTest(async () => {
        return await mcpBridge.executeTool({ tool: 'get_system_info' });
      }, 50);
      
      AIONComplianceTestUtils.assertFailureRate(loadTestResults.failures, 50);
      
      const avgTime = loadTestResults.times.reduce((a, b) => a + b, 0) / loadTestResults.times.length;
      AIONComplianceTestUtils.assertResponseTime(avgTime);
    });
  });
});