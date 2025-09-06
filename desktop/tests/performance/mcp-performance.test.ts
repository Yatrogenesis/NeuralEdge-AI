/**
 * NeuralEdge AI - Enterprise AI Platform
 * 
 * Copyright (c) 2025 Francisco Molina <pako.molina@gmail.com>
 * All rights reserved.
 * 
 * This software is licensed under the NeuralEdge AI Enterprise License.
 * Commercial use requires attribution and royalty payments of 5% gross revenue,
 * with a minimum annual payment of $1,000 USD per commercial entity.
 * 
 * Contact: pako.molina@gmail.com for licensing inquiries.
 * Repository: https://github.com/Yatrogenesis/NeuralEdge-AI
 */

// NeuralEdge AI Desktop - MCP Performance Benchmarks
// Performance testing for MCP bridge operations and tool execution

import { MCPBridge } from '../../src/services/mcp-bridge';
import { AIEngine } from '../../src/services/ai-engine';
import { AION_CONSTANTS } from '../../src/constants';

describe('MCP Bridge Performance Benchmarks', () => {
  let mcpBridge: MCPBridge;
  let aiEngine: AIEngine;
  
  beforeAll(async () => {
    aiEngine = new AIEngine();
    mcpBridge = new MCPBridge(aiEngine);
    
    const initResult = await mcpBridge.initialize();
    expect(initResult.success).toBe(true);
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('Tool Execution Performance', () => {
    it('should execute system tools within AION limits', async () => {
      const systemTools = [
        { tool: 'get_system_info' },
        { tool: 'get_process_list' },
        { tool: 'monitor_performance', arguments: { duration: 1 } }
      ];
      
      const toolResults = [];
      
      for (const toolCall of systemTools) {
        const { time, result } = await TestPerformanceMonitor.measureAsync(async () => {
          return await mcpBridge.executeTool(toolCall);
        });
        
        expect(result.success).toBe(true);
        AIONComplianceTestUtils.assertResponseTime(time);
        
        toolResults.push({
          tool: toolCall.tool,
          time,
          success: result.success,
          contentLength: result.content.reduce((sum, c) => sum + c.data.length, 0)
        });
        
        console.log(`${toolCall.tool}: ${time.toFixed(3)}ms`);
      }
      
      const avgTime = toolResults.reduce((sum, r) => sum + r.time, 0) / toolResults.length;
      console.log(`System Tools Average Time: ${avgTime.toFixed(3)}ms`);
    });

    it('should handle file operations efficiently', async () => {
      const testFiles = [
        { size: 1024, name: 'small.txt' },
        { size: 10240, name: 'medium.txt' },
        { size: 102400, name: 'large.txt' }
      ];
      
      const fileResults = [];
      
      for (const testFile of testFiles) {
        const content = SecurityTestUtils.generateTestData(testFile.size);
        
        // Write performance
        const { time: writeTime, result: writeResult } = await TestPerformanceMonitor.measureAsync(async () => {
          return await mcpBridge.executeTool({
            tool: 'write_file',
            arguments: {
              path: `./test-${testFile.name}`,
              content
            }
          });
        });
        
        expect(writeResult.success).toBe(true);
        
        // Read performance
        const { time: readTime, result: readResult } = await TestPerformanceMonitor.measureAsync(async () => {
          return await mcpBridge.executeTool({
            tool: 'read_file',
            arguments: {
              path: `./test-${testFile.name}`
            }
          });
        });
        
        expect(readResult.success).toBe(true);
        expect(readResult.content[0].data.length).toBe(content.length);
        
        fileResults.push({
          file: testFile.name,
          size: testFile.size,
          writeTime,
          readTime,
          throughputWrite: (testFile.size / writeTime) * 1000, // bytes per second
          throughputRead: (testFile.size / readTime) * 1000
        });
        
        console.log(`${testFile.name} (${testFile.size}B): Write ${writeTime.toFixed(1)}ms, Read ${readTime.toFixed(1)}ms`);
      }
      
      fileResults.forEach(result => {
        expect(result.writeTime).toBeLessThan(AION_CONSTANTS.MAX_RESPONSE_TIME * 2);
        expect(result.readTime).toBeLessThan(AION_CONSTANTS.MAX_RESPONSE_TIME);
        expect(result.throughputRead).toBeGreaterThan(1000000); // 1MB/s minimum
      });
    });

    it('should maintain performance with concurrent tool executions', async () => {
      const concurrentTools = [
        { tool: 'get_system_info' },
        { tool: 'get_process_list' },
        { tool: 'list_directory', arguments: { path: '.' } },
        { tool: 'monitor_performance', arguments: { duration: 1 } },
        { tool: 'read_file', arguments: { path: './package.json' } }
      ];
      
      const iterations = 5;
      const concurrentResults = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        const promises = concurrentTools.map(toolCall => 
          mcpBridge.executeTool(toolCall)
        );
        
        const results = await Promise.all(promises);
        const totalTime = performance.now() - startTime;
        
        const successCount = results.filter(r => r.success).length;
        const avgTimePerTool = totalTime / concurrentTools.length;
        
        concurrentResults.push({
          iteration: i + 1,
          totalTime,
          avgTimePerTool,
          successCount,
          successRate: successCount / concurrentTools.length
        });
        
        console.log(`Iteration ${i + 1}: ${totalTime.toFixed(1)}ms total, ${avgTimePerTool.toFixed(1)}ms avg, ${successCount}/${concurrentTools.length} success`);
        
        expect(successCount).toBe(concurrentTools.length);
      }
      
      const overallAvgTime = concurrentResults.reduce((sum, r) => sum + r.avgTimePerTool, 0) / concurrentResults.length;
      expect(overallAvgTime).toBeLessThan(AION_CONSTANTS.MAX_RESPONSE_TIME * 2);
    });
  });

  describe('Throughput Benchmarks', () => {
    it('should maintain high throughput for system queries', async () => {
      const testDuration = 15000; // 15 seconds
      const startTime = performance.now();
      const results = [];
      let requestCount = 0;
      
      while (performance.now() - startTime < testDuration) {
        const result = await mcpBridge.executeTool({
          tool: 'get_system_info'
        });
        
        results.push(result);
        requestCount++;
        
        if (requestCount % 20 === 0) {
          console.log(`Processed ${requestCount} MCP requests in ${(performance.now() - startTime).toFixed(0)}ms`);
        }
      }
      
      const actualDuration = performance.now() - startTime;
      const throughput = (results.length / actualDuration) * 1000;
      const successRate = results.filter(r => r.success).length / results.length;
      
      console.log(`MCP Throughput Benchmark:`);
      console.log(`- Total Requests: ${results.length}`);
      console.log(`- Duration: ${actualDuration.toFixed(0)}ms`);
      console.log(`- Throughput: ${throughput.toFixed(2)} requests/second`);
      console.log(`- Success Rate: ${(successRate * 100).toFixed(2)}%`);
      
      expect(throughput).toBeGreaterThan(2); // At least 2 requests per second
      expect(successRate).toBeGreaterThan(0.99);
    });

    it('should handle directory operations at scale', async () => {
      const directoryOperations = Array.from({ length: 50 }, (_, i) => ({
        tool: 'list_directory',
        arguments: { path: i % 2 === 0 ? '.' : '..' }
      }));
      
      const startTime = performance.now();
      const results = await Promise.all(
        directoryOperations.map(op => mcpBridge.executeTool(op))
      );
      const totalTime = performance.now() - startTime;
      
      const successCount = results.filter(r => r.success).length;
      const avgTime = totalTime / directoryOperations.length;
      const throughput = (directoryOperations.length / totalTime) * 1000;
      
      console.log(`Directory Operations Benchmark:`);
      console.log(`- Operations: ${directoryOperations.length}`);
      console.log(`- Total Time: ${totalTime.toFixed(1)}ms`);
      console.log(`- Average Time: ${avgTime.toFixed(1)}ms`);
      console.log(`- Throughput: ${throughput.toFixed(2)} ops/second`);
      console.log(`- Success Rate: ${(successCount/directoryOperations.length*100).toFixed(1)}%`);
      
      expect(successCount).toBe(directoryOperations.length);
      expect(avgTime).toBeLessThan(AION_CONSTANTS.MAX_RESPONSE_TIME);
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should manage memory efficiently during extended operations', async () => {
      const memorySnapshots = [];
      const operationCount = 200;
      
      for (let i = 0; i < operationCount; i++) {
        const beforeMemory = process.memoryUsage();
        
        await mcpBridge.executeTool({
          tool: 'get_system_info'
        });
        
        const afterMemory = process.memoryUsage();
        
        memorySnapshots.push({
          operation: i,
          heapBefore: beforeMemory.heapUsed,
          heapAfter: afterMemory.heapUsed,
          heapDelta: afterMemory.heapUsed - beforeMemory.heapUsed
        });
        
        if (i % 50 === 0 && i > 0) {
          if (global.gc) {
            global.gc();
          }
          console.log(`MCP Operations: ${i}, Heap: ${(afterMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        }
      }
      
      const totalHeapIncrease = memorySnapshots[memorySnapshots.length - 1].heapAfter - 
                               memorySnapshots[0].heapBefore;
      
      console.log(`MCP Memory Usage:`);
      console.log(`- Operations: ${operationCount}`);
      console.log(`- Total Heap Increase: ${(totalHeapIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      expect(totalHeapIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });

    it('should not exhibit memory leaks in tool execution', async () => {
      const operation = async () => {
        const tools = [
          { tool: 'get_system_info' },
          { tool: 'get_process_list' },
          { tool: 'list_directory', arguments: { path: '.' } }
        ];
        
        for (const toolCall of tools) {
          await mcpBridge.executeTool(toolCall);
        }
      };
      
      const { leakDetected, memoryIncrease } = await MemoryLeakTestUtils.detectMemoryLeak(
        operation,
        50 // Run 50 times (150 tool executions)
      );
      
      console.log(`MCP Memory Leak Test:`);
      console.log(`- Leak Detected: ${leakDetected}`);
      console.log(`- Memory Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      expect(leakDetected).toBe(false);
    });

    it('should handle execution history efficiently', async () => {
      // Fill execution history
      const historyOperations = Array.from({ length: 1200 }, (_, i) => 
        mcpBridge.executeTool({
          tool: 'get_system_info'
        })
      );
      
      await Promise.all(historyOperations);
      
      // Verify history is capped at 1000
      const fullHistory = mcpBridge.getExecutionHistory(2000);
      expect(fullHistory.length).toBe(1000);
      
      // Test history retrieval performance
      const { time: historyTime } = TestPerformanceMonitor.measure(() => {
        mcpBridge.getExecutionHistory(100);
      });
      
      console.log(`History Retrieval Time: ${historyTime.toFixed(3)}ms`);
      expect(historyTime).toBeLessThan(10); // Should be very fast
    });
  });

  describe('Server Management Performance', () => {
    it('should add and remove servers efficiently', async () => {
      const serverCount = 10;
      const serverResults = [];
      
      // Add servers
      for (let i = 0; i < serverCount; i++) {
        const { time: addTime, result: addResult } = await TestPerformanceMonitor.measureAsync(async () => {
          return await mcpBridge.addServer(
            `http://localhost:${3000 + i}`,
            `Test Server ${i}`,
            `Performance test server ${i}`
          );
        });
        
        serverResults.push({
          serverId: i,
          addTime,
          addSuccess: addResult.success
        });
      }
      
      const servers = mcpBridge.getConnectedServers();
      const testServers = servers.filter(s => s.name.startsWith('Test Server'));
      
      // Remove servers
      for (const server of testServers) {
        const { time: removeTime, result: removeResult } = await TestPerformanceMonitor.measureAsync(async () => {
          return await mcpBridge.removeServer(server.id);
        });
        
        const serverResult = serverResults.find(sr => sr.serverId.toString() === server.name.split(' ')[2]);
        if (serverResult) {
          serverResult.removeTime = removeTime;
          serverResult.removeSuccess = removeResult.success;
        }
      }
      
      const avgAddTime = serverResults.reduce((sum, r) => sum + r.addTime, 0) / serverResults.length;
      const avgRemoveTime = serverResults.reduce((sum, r) => sum + (r.removeTime || 0), 0) / serverResults.length;
      
      console.log(`Server Management Performance:`);
      console.log(`- Average Add Time: ${avgAddTime.toFixed(3)}ms`);
      console.log(`- Average Remove Time: ${avgRemoveTime.toFixed(3)}ms`);
      
      expect(avgAddTime).toBeLessThan(AION_CONSTANTS.MAX_RESPONSE_TIME * 5);
      expect(avgRemoveTime).toBeLessThan(AION_CONSTANTS.MAX_RESPONSE_TIME);
    });

    it('should discover tools and resources quickly', async () => {
      const { time: toolsTime, result: tools } = await TestPerformanceMonitor.measureAsync(async () => {
        return await mcpBridge.getAvailableTools();
      });
      
      const { time: resourcesTime, result: resources } = await TestPerformanceMonitor.measureAsync(async () => {
        return await mcpBridge.getAvailableResources();
      });
      
      console.log(`Tool Discovery:`);
      console.log(`- Tools: ${tools.length} found in ${toolsTime.toFixed(3)}ms`);
      console.log(`- Resources: ${resources.length} found in ${resourcesTime.toFixed(3)}ms`);
      
      expect(toolsTime).toBeLessThan(100); // Very fast discovery
      expect(resourcesTime).toBeLessThan(100);
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('AION Protocol Compliance', () => {
    it('should maintain AION standards under load', async () => {
      const loadTestResults = await AIONComplianceTestUtils.runRepeatedTest(async () => {
        return await mcpBridge.executeTool({
          tool: 'get_system_info'
        });
      }, 100);
      
      const successRate = (100 - loadTestResults.failures) / 100;
      const avgTime = loadTestResults.times.reduce((a, b) => a + b, 0) / loadTestResults.times.length;
      const maxTime = Math.max(...loadTestResults.times);
      
      console.log(`MCP AION Compliance Test:`);
      console.log(`- Success Rate: ${(successRate * 100).toFixed(3)}%`);
      console.log(`- Average Time: ${avgTime.toFixed(3)}ms`);
      console.log(`- Max Time: ${maxTime.toFixed(3)}ms`);
      console.log(`- Failures: ${loadTestResults.failures}/100`);
      
      AIONComplianceTestUtils.assertFailureRate(loadTestResults.failures, 100);
      AIONComplianceTestUtils.assertResponseTime(avgTime);
    });

    it('should handle mixed workload efficiently', async () => {
      const mixedWorkload = [
        () => mcpBridge.executeTool({ tool: 'get_system_info' }),
        () => mcpBridge.executeTool({ tool: 'get_process_list' }),
        () => mcpBridge.executeTool({ tool: 'list_directory', arguments: { path: '.' } }),
        () => mcpBridge.executeTool({ tool: 'monitor_performance', arguments: { duration: 1 } })
      ];
      
      const workloadResults = [];
      const iterations = 25; // 100 total operations
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        const promises = mixedWorkload.map(operation => operation());
        const results = await Promise.all(promises);
        
        const iterationTime = performance.now() - startTime;
        const successCount = results.filter(r => r.success).length;
        
        workloadResults.push({
          iteration: i + 1,
          time: iterationTime,
          successCount,
          successRate: successCount / mixedWorkload.length
        });
      }
      
      const avgIterationTime = workloadResults.reduce((sum, r) => sum + r.time, 0) / workloadResults.length;
      const overallSuccessRate = workloadResults.reduce((sum, r) => sum + r.successRate, 0) / workloadResults.length;
      
      console.log(`Mixed Workload Results:`);
      console.log(`- Average Iteration Time: ${avgIterationTime.toFixed(3)}ms`);
      console.log(`- Overall Success Rate: ${(overallSuccessRate * 100).toFixed(3)}%`);
      
      expect(avgIterationTime).toBeLessThan(AION_CONSTANTS.MAX_RESPONSE_TIME * 4);
      expect(overallSuccessRate).toBeGreaterThan(0.995);
    });
  });
});