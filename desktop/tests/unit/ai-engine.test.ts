// NeuralEdge AI Desktop - AI Engine Unit Tests
// Comprehensive testing for AI processing and model management

import { AIEngine } from '../../src/services/ai-engine';
import { AION_CONSTANTS } from '../../src/constants';

describe('AIEngine', () => {
  let aiEngine: AIEngine;
  
  beforeEach(() => {
    aiEngine = new AIEngine();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await aiEngine.initialize();
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should meet AION response time requirements for initialization', async () => {
      const { time } = await TestPerformanceMonitor.measureAsync(async () => {
        return await aiEngine.initialize();
      });
      
      AIONComplianceTestUtils.assertResponseTime(time, AION_CONSTANTS.MAX_STARTUP_TIME);
    });

    it('should handle initialization failures gracefully', async () => {
      // Mock initialization failure
      const mockAI = jest.spyOn(aiEngine, 'initialize').mockRejectedValue(new Error('Initialization failed'));
      
      const result = await aiEngine.initialize();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Initialization failed');
      
      mockAI.mockRestore();
    });
  });

  describe('Model Management', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
    });

    it('should load model successfully', async () => {
      const testModel = 'test-model-v1';
      
      const result = await aiEngine.loadModel(testModel);
      
      expect(result.success).toBe(true);
      expect(result.data.modelName).toBe(testModel);
    });

    it('should meet AION requirements for model loading', async () => {
      const testModel = 'performance-test-model';
      
      const { time, result } = await TestPerformanceMonitor.measureAsync(async () => {
        return await aiEngine.loadModel(testModel);
      });
      
      AIONComplianceTestUtils.assertResponseTime(time, AION_CONSTANTS.MAX_MODEL_LOAD_TIME);
      expect(result.success).toBe(true);
    });

    it('should handle model loading failures', async () => {
      const invalidModel = 'non-existent-model';
      
      const result = await aiEngine.loadModel(invalidModel);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Model not found');
    });

    it('should unload model successfully', async () => {
      const testModel = 'test-model-v1';
      await aiEngine.loadModel(testModel);
      
      const result = await aiEngine.unloadModel(testModel);
      
      expect(result.success).toBe(true);
    });

    it('should get available models', async () => {
      const models = await aiEngine.getAvailableModels();
      
      expect(models.success).toBe(true);
      expect(Array.isArray(models.data)).toBe(true);
    });
  });

  describe('AI Processing', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
      await aiEngine.loadModel('test-model-v1');
    });

    it('should process input successfully', async () => {
      const testInput = 'Test AI processing input';
      
      const result = await aiEngine.processInput(testInput);
      
      expect(result.success).toBe(true);
      expect(result.data.response).toBeDefined();
      expect(result.data.confidence).toBeGreaterThan(0);
    });

    it('should meet AION response time requirements', async () => {
      const testInput = 'Performance test input for AION compliance';
      
      const { time, result } = await TestPerformanceMonitor.measureAsync(async () => {
        return await aiEngine.processInput(testInput);
      });
      
      AIONComplianceTestUtils.assertResponseTime(time);
      expect(result.success).toBe(true);
    });

    it('should handle empty input gracefully', async () => {
      const result = await aiEngine.processInput('');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Input cannot be empty');
    });

    it('should handle very long input', async () => {
      const longInput = SecurityTestUtils.generateTestData(10000);
      
      const result = await aiEngine.processInput(longInput);
      
      expect(result.success).toBe(true);
      expect(result.data.response).toBeDefined();
    });

    it('should maintain context across interactions', async () => {
      const context = { sessionId: 'test-session', userId: 'test-user' };
      
      const result1 = await aiEngine.processInput('Hello', context);
      const result2 = await aiEngine.processInput('What is my name?', context);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result2.data.contextUsed).toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
    });

    it('should provide performance metrics', async () => {
      const metrics = await aiEngine.getPerformanceMetrics();
      
      expect(metrics.success).toBe(true);
      expect(metrics.data.responseTime).toBeDefined();
      expect(metrics.data.memoryUsage).toBeDefined();
      expect(metrics.data.throughput).toBeDefined();
    });

    it('should detect memory leaks in processing', async () => {
      const operation = async () => {
        await aiEngine.processInput('Test input for memory leak detection');
      };
      
      const { leakDetected, memoryIncrease } = await MemoryLeakTestUtils.detectMemoryLeak(operation);
      
      expect(leakDetected).toBe(false);
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB threshold
    });

    it('should maintain AION failure rate requirements', async () => {
      const testResults = await AIONComplianceTestUtils.runRepeatedTest(async () => {
        return await aiEngine.processInput('Reliability test input');
      }, 100);
      
      AIONComplianceTestUtils.assertFailureRate(testResults.failures, 100);
    });
  });

  describe('Resource Management', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
    });

    it('should manage memory usage within AION limits', async () => {
      await aiEngine.loadModel('test-model-v1');
      
      const metrics = await aiEngine.getPerformanceMetrics();
      
      AIONComplianceTestUtils.assertMemoryUsage(metrics.data.memoryUsage);
    });

    it('should handle concurrent processing requests', async () => {
      const concurrentPromises = Array.from({ length: 10 }, (_, i) =>
        aiEngine.processInput(`Concurrent test input ${i}`)
      );
      
      const results = await Promise.all(concurrentPromises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should cleanup resources on shutdown', async () => {
      await aiEngine.loadModel('test-model-v1');
      
      const shutdownResult = await aiEngine.shutdown();
      
      expect(shutdownResult.success).toBe(true);
      
      // Verify resources are cleaned up
      const metrics = await aiEngine.getPerformanceMetrics();
      expect(metrics.data.activeModels).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle processing errors gracefully', async () => {
      // Mock processing error
      const mockProcess = jest.spyOn(aiEngine, 'processInput').mockRejectedValue(new Error('Processing error'));
      
      const result = await aiEngine.processInput('Test input');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Processing error');
      
      mockProcess.mockRestore();
    });

    it('should validate input parameters', async () => {
      const result = await aiEngine.processInput(null as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
    });

    it('should handle model unavailability', async () => {
      await aiEngine.unloadModel('test-model-v1');
      
      const result = await aiEngine.processInput('Test without model');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No model loaded');
    });
  });
});