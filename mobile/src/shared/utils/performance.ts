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

// NeuralEdge AI - Performance Monitoring Utilities
// AION Protocol Compliance: <1ms response time monitoring

import { PerformanceMetrics, AIONError } from '../types';
import { PERFORMANCE, ERROR_CODES } from '../constants';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startMeasure(operationId: string, threshold: number = PERFORMANCE.MAX_RESPONSE_TIME): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      startTime: performance.now(),
      threshold,
    };
    
    this.metrics.set(operationId, metrics);
    return metrics;
  }

  public endMeasure(operationId: string): PerformanceMetrics {
    const metrics = this.metrics.get(operationId);
    if (!metrics) {
      throw new Error(`Performance measurement not found for operation: ${operationId}`);
    }

    metrics.endTime = performance.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    
    this.metrics.delete(operationId);
    return metrics;
  }

  public validatePerformance(metrics: PerformanceMetrics): void {
    if (metrics.duration && metrics.duration > metrics.threshold) {
      throw this.createPerformanceError(metrics);
    }
  }

  private createPerformanceError(metrics: PerformanceMetrics): AIONError {
    return {
      code: ERROR_CODES.PERFORMANCE_THRESHOLD_EXCEEDED,
      message: `Operation exceeded ${metrics.threshold}ms threshold: ${metrics.duration}ms`,
      category: 'performance',
      severity: 'high',
    };
  }

  public getMetricsSummary(): Record<string, any> {
    return {
      activeOperations: this.metrics.size,
      memoryUsage: this.getMemoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  private getMemoryUsage(): number {
    // React Native doesn't have process.memoryUsage, so we estimate
    return 0; // Platform-specific implementation needed
  }
}

// Performance decorator for AION compliance
export function withPerformanceMonitoring<T extends any[], R>(
  operationName: string,
  threshold: number = PERFORMANCE.MAX_RESPONSE_TIME
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const monitor = PerformanceMonitor.getInstance();
      const operationId = `${operationName}_${Date.now()}`;
      
      const metrics = monitor.startMeasure(operationId, threshold);
      
      try {
        const result = await originalMethod.apply(this, args);
        const finalMetrics = monitor.endMeasure(operationId);
        monitor.validatePerformance(finalMetrics);
        
        return result;
      } catch (error) {
        monitor.endMeasure(operationId);
        throw error;
      }
    };

    return descriptor;
  };
}

// Utility functions for performance optimization
export const performanceUtils = {
  // Debounce function for performance optimization
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number = 300
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // Throttle function for limiting execution frequency
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number = 100
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Memory-efficient array processing
  batchProcess<T, R>(
    items: T[],
    processor: (item: T) => R,
    batchSize: number = 100
  ): R[] {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = batch.map(processor);
      results.push(...batchResults);
    }
    
    return results;
  },

  // Async operation with timeout
  withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = PERFORMANCE.MAX_RESPONSE_TIME * 1000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  },

  // Memory usage tracking
  trackMemoryUsage(operationName: string) {
    const start = Date.now();
    
    return {
      end: () => {
        const duration = Date.now() - start;
        console.log(`[PERFORMANCE] ${operationName}: ${duration}ms`);
        return duration;
      },
    };
  },

  // Cold start optimization
  preloadCriticalResources: () => {
    // Implementation for preloading critical app resources
    const startTime = performance.now();
    
    // Preload critical components, fonts, images
    const criticalResources = [
      // Add critical resource preloading logic
    ];

    return Promise.all(criticalResources).then(() => {
      const duration = performance.now() - startTime;
      console.log(`[COLD_START] Critical resources loaded in: ${duration}ms`);
      return duration < PERFORMANCE.MAX_COLD_START;
    });
  },

  // Battery optimization utilities
  optimizeForBattery: {
    reduceBackgroundActivity: () => {
      // Implement background activity reduction
    },
    
    limitNetworkCalls: (maxConcurrent: number = 2) => {
      // Implement network call limiting
      return maxConcurrent;
    },
    
    useEfficientAnimations: () => {
      // Return animation settings that are battery-efficient
      return {
        useNativeDriver: true,
        duration: 200, // Shorter animations
      };
    },
  },
};