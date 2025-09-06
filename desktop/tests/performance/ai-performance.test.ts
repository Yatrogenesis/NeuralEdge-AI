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

// NeuralEdge AI Desktop - AI Performance Benchmarks
// AION Protocol compliance performance testing for AI operations

import { AIEngine } from '../../src/services/ai-engine';
import { AION_CONSTANTS } from '../../src/constants';

describe('AI Engine Performance Benchmarks', () => {
  let aiEngine: AIEngine;
  
  beforeAll(async () => {
    aiEngine = new AIEngine();
    const initResult = await aiEngine.initialize();
    expect(initResult.success).toBe(true);
    
    const modelResult = await aiEngine.loadModel('performance-test-model');
    expect(modelResult.success).toBe(true);
  });

  afterAll(async () => {
    await aiEngine.shutdown();
  });

  describe('Response Time Benchmarks', () => {
    it('should process simple queries within AION limits', async () => {
      const simpleQueries = [
        'Hello',
        'What time is it?',
        'Help me',
        'Yes',
        'No'
      ];
      
      const benchmarkResults = [];
      
      for (const query of simpleQueries) {
        const { time, result } = await TestPerformanceMonitor.measureAsync(async () => {
          return await aiEngine.processInput(query);
        });
        
        expect(result.success).toBe(true);
        AIONComplianceTestUtils.assertResponseTime(time);
        
        benchmarkResults.push({
          query,
          time,
          success: result.success
        });
      }
      
      const avgTime = benchmarkResults.reduce((sum, r) => sum + r.time, 0) / benchmarkResults.length;
      console.log(`Simple Query Average Response Time: ${avgTime.toFixed(3)}ms`);
      
      expect(avgTime).toBeLessThan(AION_CONSTANTS.MAX_RESPONSE_TIME * 0.5);
    });

    it('should process complex queries within acceptable limits', async () => {
      const complexQueries = [
        'Explain quantum computing and its applications in artificial intelligence',
        'Write a detailed analysis of machine learning algorithms for natural language processing',
        'Create a comprehensive overview of neural network architectures',
        'Describe the mathematical foundations of deep learning',
        'Analyze the ethical implications of artificial intelligence in society'
      ];
      
      const benchmarkResults = [];
      
      for (const query of complexQueries) {
        const { time, result } = await TestPerformanceMonitor.measureAsync(async () => {
          return await aiEngine.processInput(query);
        });
        
        expect(result.success).toBe(true);
        
        benchmarkResults.push({
          query: query.substring(0, 50) + '...',
          time,
          success: result.success,
          confidence: result.data.confidence
        });
      }
      
      const avgTime = benchmarkResults.reduce((sum, r) => sum + r.time, 0) / benchmarkResults.length;
      const avgConfidence = benchmarkResults.reduce((sum, r) => sum + r.confidence, 0) / benchmarkResults.length;
      
      console.log(`Complex Query Average Response Time: ${avgTime.toFixed(3)}ms`);
      console.log(`Complex Query Average Confidence: ${avgConfidence.toFixed(3)}`);
      
      expect(avgTime).toBeLessThan(AION_CONSTANTS.MAX_RESPONSE_TIME * 2);
      expect(avgConfidence).toBeGreaterThan(0.7);
    });

    it('should handle concurrent processing efficiently', async () => {
      const concurrentQueries = Array.from({ length: 10 }, (_, i) => 
        `Concurrent processing test query number ${i + 1}`
      );
      
      const startTime = performance.now();
      
      const promises = concurrentQueries.map(query => 
        aiEngine.processInput(query)
      );
      
      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      const avgTimePerQuery = totalTime / concurrentQueries.length;
      
      console.log(`Concurrent Processing - Total Time: ${totalTime.toFixed(3)}ms`);
      console.log(`Concurrent Processing - Avg Per Query: ${avgTimePerQuery.toFixed(3)}ms`);
      
      expect(avgTimePerQuery).toBeLessThan(AION_CONSTANTS.MAX_RESPONSE_TIME * 1.5);
    });
  });

  describe('Throughput Benchmarks', () => {
    it('should maintain high throughput under sustained load', async () => {
      const testDuration = 10000; // 10 seconds
      const startTime = performance.now();
      const results = [];
      let requestCount = 0;
      
      while (performance.now() - startTime < testDuration) {
        const result = await aiEngine.processInput(`Throughput test request ${++requestCount}`);
        results.push(result);
        
        if (requestCount % 10 === 0) {
          console.log(`Processed ${requestCount} requests in ${(performance.now() - startTime).toFixed(0)}ms`);
        }
      }
      
      const actualDuration = performance.now() - startTime;
      const throughput = (results.length / actualDuration) * 1000; // requests per second
      const successRate = results.filter(r => r.success).length / results.length;
      
      console.log(`Throughput Benchmark Results:`);
      console.log(`- Total Requests: ${results.length}`);
      console.log(`- Duration: ${actualDuration.toFixed(0)}ms`);
      console.log(`- Throughput: ${throughput.toFixed(2)} requests/second`);
      console.log(`- Success Rate: ${(successRate * 100).toFixed(2)}%`);
      
      expect(throughput).toBeGreaterThan(1); // At least 1 request per second
      expect(successRate).toBeGreaterThan(0.995); // 99.5% success rate
    });

    it('should handle burst traffic patterns', async () => {
      const burstSizes = [5, 10, 20, 50];
      const burstResults = [];
      
      for (const burstSize of burstSizes) {
        const startTime = performance.now();
        
        const promises = Array.from({ length: burstSize }, (_, i) =>
          aiEngine.processInput(`Burst test ${burstSize}:${i}`)
        );
        
        const results = await Promise.all(promises);
        const burstTime = performance.now() - startTime;
        
        const successCount = results.filter(r => r.success).length;
        const burstThroughput = (burstSize / burstTime) * 1000;
        
        burstResults.push({
          burstSize,
          burstTime,
          successCount,
          burstThroughput,
          successRate: successCount / burstSize
        });
        
        console.log(`Burst ${burstSize}: ${burstTime.toFixed(1)}ms, ${burstThroughput.toFixed(2)} req/s, ${((successCount/burstSize)*100).toFixed(1)}% success`);
      }
      
      burstResults.forEach(result => {
        expect(result.successRate).toBeGreaterThan(0.95);
        expect(result.burstThroughput).toBeGreaterThan(0.5);
      });
    });
  });

  describe('Memory Usage Benchmarks', () => {
    it('should maintain stable memory usage', async () => {
      const memorySnapshots = [];
      const testOperations = 100;
      
      for (let i = 0; i < testOperations; i++) {
        const beforeMemory = process.memoryUsage();
        
        await aiEngine.processInput(`Memory test iteration ${i}`);
        
        const afterMemory = process.memoryUsage();
        
        memorySnapshots.push({
          iteration: i,
          heapUsedBefore: beforeMemory.heapUsed,
          heapUsedAfter: afterMemory.heapUsed,
          heapDelta: afterMemory.heapUsed - beforeMemory.heapUsed
        });
        
        if (i % 20 === 0) {
          if (global.gc) {
            global.gc();
          }
        }
      }
      
      const totalHeapIncrease = memorySnapshots[memorySnapshots.length - 1].heapUsedAfter - 
                               memorySnapshots[0].heapUsedBefore;
      const avgHeapDelta = memorySnapshots.reduce((sum, s) => sum + s.heapDelta, 0) / memorySnapshots.length;
      
      console.log(`Memory Usage Benchmark:`);
      console.log(`- Operations: ${testOperations}`);
      console.log(`- Total Heap Increase: ${(totalHeapIncrease / 1024 / 1024).toFixed(2)}MB`);
      console.log(`- Average Delta per Op: ${(avgHeapDelta / 1024).toFixed(2)}KB`);
      
      expect(totalHeapIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB total increase
      AIONComplianceTestUtils.assertMemoryUsage(totalHeapIncrease);
    });

    it('should not exhibit memory leaks during extended processing', async () => {
      const operation = async () => {
        const queries = [
          'Short query',
          'Medium length query with more details',
          'Long query with extensive detail and complex requirements that need comprehensive analysis and detailed responses',
          'Another query with different characteristics'
        ];
        
        for (const query of queries) {
          await aiEngine.processInput(query);
        }
      };
      
      const { leakDetected, memoryIncrease } = await MemoryLeakTestUtils.detectMemoryLeak(
        operation,
        25 // Run 25 times (100 queries total)
      );
      
      console.log(`Memory Leak Test:`);
      console.log(`- Leak Detected: ${leakDetected}`);
      console.log(`- Memory Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      expect(leakDetected).toBe(false);
    });
  });

  describe('Model Performance Benchmarks', () => {
    it('should load models within acceptable time limits', async () => {
      const testModels = [
        'small-model',
        'medium-model', 
        'large-model'
      ];
      
      const loadResults = [];
      
      for (const modelName of testModels) {
        const { time, result } = await TestPerformanceMonitor.measureAsync(async () => {
          return await aiEngine.loadModel(modelName);
        });
        
        loadResults.push({
          model: modelName,
          loadTime: time,
          success: result.success
        });
        
        console.log(`Model ${modelName}: ${time.toFixed(3)}ms`);
        
        expect(result.success).toBe(true);
        expect(time).toBeLessThan(AION_CONSTANTS.MAX_MODEL_LOAD_TIME);
        
        // Unload for next test
        await aiEngine.unloadModel(modelName);
      }
      
      const avgLoadTime = loadResults.reduce((sum, r) => sum + r.loadTime, 0) / loadResults.length;
      console.log(`Average Model Load Time: ${avgLoadTime.toFixed(3)}ms`);
    });

    it('should switch between models efficiently', async () => {
      const models = ['test-model-a', 'test-model-b', 'test-model-c'];
      const switchResults = [];
      
      for (let i = 0; i < models.length * 2; i++) {
        const currentModel = models[i % models.length];
        const previousModel = i > 0 ? models[(i - 1) % models.length] : null;
        
        const startTime = performance.now();
        
        if (previousModel) {
          await aiEngine.unloadModel(previousModel);
        }
        
        const loadResult = await aiEngine.loadModel(currentModel);
        const switchTime = performance.now() - startTime;
        
        switchResults.push({
          from: previousModel,
          to: currentModel,
          time: switchTime,
          success: loadResult.success
        });
        
        expect(loadResult.success).toBe(true);
      }
      
      const avgSwitchTime = switchResults.reduce((sum, r) => sum + r.time, 0) / switchResults.length;
      console.log(`Average Model Switch Time: ${avgSwitchTime.toFixed(3)}ms`);
      
      expect(avgSwitchTime).toBeLessThan(AION_CONSTANTS.MAX_MODEL_LOAD_TIME * 1.5);
    });
  });

  describe('AION Protocol Compliance Benchmarks', () => {
    it('should maintain AION failure rates under stress', async () => {
      const stressTestResults = await AIONComplianceTestUtils.runRepeatedTest(async () => {
        const complexQuery = SecurityTestUtils.generateRandomString(500);
        return await aiEngine.processInput(`Analyze this data: ${complexQuery}`);
      }, 200);
      
      const successRate = (200 - stressTestResults.failures) / 200;
      const avgResponseTime = stressTestResults.times.reduce((a, b) => a + b, 0) / stressTestResults.times.length;
      const maxResponseTime = Math.max(...stressTestResults.times);
      const minResponseTime = Math.min(...stressTestResults.times);
      
      console.log(`AION Stress Test Results:`);
      console.log(`- Success Rate: ${(successRate * 100).toFixed(3)}%`);
      console.log(`- Average Response: ${avgResponseTime.toFixed(3)}ms`);
      console.log(`- Min Response: ${minResponseTime.toFixed(3)}ms`);
      console.log(`- Max Response: ${maxResponseTime.toFixed(3)}ms`);
      console.log(`- Failures: ${stressTestResults.failures}/200`);
      
      AIONComplianceTestUtils.assertFailureRate(stressTestResults.failures, 200);
      AIONComplianceTestUtils.assertResponseTime(avgResponseTime);
    });

    it('should meet availability requirements', async () => {
      const availabilityTest = async () => {
        const startTime = Date.now();
        let successfulRequests = 0;
        let totalRequests = 0;
        const testDuration = 30000; // 30 seconds
        
        while (Date.now() - startTime < testDuration) {
          totalRequests++;
          
          try {
            const result = await aiEngine.processInput(`Availability test ${totalRequests}`);
            if (result.success) {
              successfulRequests++;
            }
          } catch (error) {
            // Request failed
          }
          
          // Small delay to prevent overwhelming
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        const availability = successfulRequests / totalRequests;
        
        console.log(`Availability Test Results:`);
        console.log(`- Total Requests: ${totalRequests}`);
        console.log(`- Successful Requests: ${successfulRequests}`);
        console.log(`- Availability: ${(availability * 100).toFixed(5)}%`);
        
        expect(availability).toBeGreaterThan(AION_CONSTANTS.MIN_AVAILABILITY);
        
        return availability;
      };
      
      await availabilityTest();
    });
  });
});