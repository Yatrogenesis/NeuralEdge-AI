// NeuralEdge AI - Performance Utils Test Suite
// AION Protocol Compliance Testing

import { PerformanceMonitor, withPerformanceMonitoring, performanceUtils } from './performance';
import { PERFORMANCE } from '../constants';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AION Protocol Compliance', () => {
    it('should meet <1ms response time requirement', () => {
      const perfTest = global.setupPerformanceTest('PerformanceMonitor.getInstance');
      
      const instance = PerformanceMonitor.getInstance();
      
      const duration = perfTest.end();
      expect(instance).toBeDefined();
      expect(duration).toBeLessThan(1.0);
    });

    it('should validate performance thresholds', () => {
      const operationId = 'test_operation';
      
      const metrics = monitor.startMeasure(operationId, 0.5);
      expect(metrics.threshold).toBe(0.5);
      
      // Simulate operation that exceeds threshold
      jest.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1.0); // 1ms duration
      
      const finalMetrics = monitor.endMeasure(operationId);
      expect(finalMetrics.duration).toBe(1.0);
      
      expect(() => monitor.validatePerformance(finalMetrics)).toThrow();
    });
  });

  describe('Measurement Operations', () => {
    it('should start and end measurements correctly', () => {
      const operationId = 'test_measurement';
      const threshold = PERFORMANCE.MAX_RESPONSE_TIME;
      
      const startMetrics = monitor.startMeasure(operationId, threshold);
      
      expect(startMetrics.startTime).toBeDefined();
      expect(startMetrics.threshold).toBe(threshold);
      expect(startMetrics.duration).toBeUndefined();
      expect(startMetrics.endTime).toBeUndefined();
      
      const endMetrics = monitor.endMeasure(operationId);
      
      expect(endMetrics.endTime).toBeDefined();
      expect(endMetrics.duration).toBeDefined();
      expect(endMetrics.duration).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for non-existent operation', () => {
      expect(() => monitor.endMeasure('non_existent_operation')).toThrow();
    });

    it('should provide metrics summary', () => {
      const summary = monitor.getMetricsSummary();
      
      expect(summary).toHaveProperty('activeOperations');
      expect(summary).toHaveProperty('memoryUsage');
      expect(summary).toHaveProperty('timestamp');
      expect(typeof summary.activeOperations).toBe('number');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = PerformanceMonitor.getInstance();
      const instance2 = PerformanceMonitor.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});

describe('withPerformanceMonitoring Decorator', () => {
  it('should monitor function performance', async () => {
    class TestClass {
      @withPerformanceMonitoring('test_function', 2.0)
      async testMethod(input: string): Promise<string> {
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 0.1));
        return `processed: ${input}`;
      }
    }

    const testInstance = new TestClass();
    const result = await testInstance.testMethod('test_input');
    
    expect(result).toBe('processed: test_input');
  });

  it('should throw on performance threshold violation', async () => {
    class TestClass {
      @withPerformanceMonitoring('slow_function', 0.001) // Very strict threshold
      async slowMethod(): Promise<void> {
        // Simulate slow operation
        await new Promise(resolve => setTimeout(resolve, 2));
      }
    }

    const testInstance = new TestClass();
    
    await expect(testInstance.slowMethod()).rejects.toThrow();
  });
});

describe('performanceUtils', () => {
  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      const mockFn = jest.fn();
      const debouncedFn = performanceUtils.debounce(mockFn, 100);
      
      // Call multiple times rapidly
      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');
      
      // Should not be called immediately
      expect(mockFn).not.toHaveBeenCalled();
      
      // Should be called once after delay with last argument
      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('arg3');
        done();
      }, 150);
    });

    it('should meet performance requirements', () => {
      const perfTest = global.setupPerformanceTest('debounce creation');
      
      const mockFn = jest.fn();
      const debouncedFn = performanceUtils.debounce(mockFn, 100);
      
      perfTest.end();
      expect(debouncedFn).toBeDefined();
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', (done) => {
      const mockFn = jest.fn();
      const throttledFn = performanceUtils.throttle(mockFn, 100);
      
      // First call should execute immediately
      throttledFn('arg1');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg1');
      
      // Subsequent calls should be throttled
      throttledFn('arg2');
      throttledFn('arg3');
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // After throttle period, should accept new calls
      setTimeout(() => {
        throttledFn('arg4');
        expect(mockFn).toHaveBeenCalledTimes(2);
        expect(mockFn).toHaveBeenLastCalledWith('arg4');
        done();
      }, 150);
    });
  });

  describe('batchProcess', () => {
    it('should process arrays in batches', () => {
      const perfTest = global.setupPerformanceTest('batch processing', 5.0);
      
      const items = Array.from({ length: 1000 }, (_, i) => i);
      const processor = (item: number): number => item * 2;
      
      const results = performanceUtils.batchProcess(items, processor, 100);
      
      perfTest.end();
      
      expect(results).toHaveLength(1000);
      expect(results[0]).toBe(0);
      expect(results[999]).toBe(1998);
    });

    it('should handle empty arrays', () => {
      const results = performanceUtils.batchProcess([], (x) => x, 10);
      expect(results).toEqual([]);
    });
  });

  describe('withTimeout', () => {
    it('should resolve when promise completes within timeout', async () => {
      const quickPromise = Promise.resolve('success');
      
      const result = await performanceUtils.withTimeout(quickPromise, 100);
      expect(result).toBe('success');
    });

    it('should reject when promise exceeds timeout', async () => {
      const slowPromise = new Promise(resolve => setTimeout(() => resolve('slow'), 200));
      
      await expect(
        performanceUtils.withTimeout(slowPromise, 100)
      ).rejects.toThrow('Operation timed out after 100ms');
    });
  });

  describe('trackMemoryUsage', () => {
    it('should track operation memory usage', () => {
      const tracker = performanceUtils.trackMemoryUsage('test_operation');
      
      expect(tracker).toHaveProperty('end');
      
      const duration = tracker.end();
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('preloadCriticalResources', () => {
    it('should meet cold start performance requirements', async () => {
      const perfTest = global.setupPerformanceTest('preload resources', PERFORMANCE.MAX_COLD_START);
      
      const result = await performanceUtils.preloadCriticalResources();
      
      const duration = perfTest.end();
      expect(typeof result).toBe('boolean');
      expect(duration).toBeLessThan(PERFORMANCE.MAX_COLD_START);
    });
  });

  describe('Battery Optimization Utils', () => {
    it('should provide battery optimization settings', () => {
      const perfTest = global.setupPerformanceTest('battery optimization');
      
      const animationSettings = performanceUtils.optimizeForBattery.useEfficientAnimations();
      
      perfTest.end();
      
      expect(animationSettings).toHaveProperty('useNativeDriver', true);
      expect(animationSettings).toHaveProperty('duration');
      expect(animationSettings.duration).toBeLessThanOrEqual(300);
    });

    it('should limit network calls for battery efficiency', () => {
      const maxConcurrent = performanceUtils.optimizeForBattery.limitNetworkCalls(3);
      expect(maxConcurrent).toBe(3);
    });
  });
});

describe('Performance Requirements Validation', () => {
  it('should meet AION Protocol performance standards', () => {
    // Test that all core performance utilities meet <1ms requirement
    const operations = [
      () => PerformanceMonitor.getInstance(),
      () => performanceUtils.debounce(() => {}, 100),
      () => performanceUtils.throttle(() => {}, 100),
      () => performanceUtils.optimizeForBattery.useEfficientAnimations(),
    ];

    operations.forEach((operation, index) => {
      const perfTest = global.setupPerformanceTest(`operation_${index}`);
      operation();
      const duration = perfTest.end();
      expect(duration).toBeLessThan(PERFORMANCE.MAX_RESPONSE_TIME);
    });
  });

  it('should validate performance metrics format', () => {
    const monitor = PerformanceMonitor.getInstance();
    const operationId = 'format_test';
    
    const metrics = monitor.startMeasure(operationId);
    monitor.endMeasure(operationId);
    
    // Validate metrics structure
    expect(metrics).toHaveProperty('startTime');
    expect(metrics).toHaveProperty('threshold');
    expect(typeof metrics.startTime).toBe('number');
    expect(typeof metrics.threshold).toBe('number');
  });
});