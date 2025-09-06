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

// NeuralEdge AI Desktop - Performance Monitor
// AION Protocol Compliance Performance Monitoring

import { AION_CONSTANTS, PERFORMANCE_THRESHOLDS } from '../constants';

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  isCompliant: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  standardDeviation: number;
  successRate: number;
  aionCompliant: boolean;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private benchmarkHistory: BenchmarkResult[] = [];
  private startTime: number = Date.now();

  constructor() {
    this.metrics = {
      responseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkLatency: 0,
      throughput: 0,
      errorRate: 0,
      uptime: 0,
      isCompliant: false,
      quality: 'poor'
    };
  }

  public async measureResponseTime<T>(
    operation: () => Promise<T>,
    operationName: string = 'unknown'
  ): Promise<{ result: T; time: number; compliant: boolean }> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const compliant = responseTime <= AION_CONSTANTS.MAX_RESPONSE_TIME;
      
      console.log(`[PERF] ${operationName}: ${responseTime.toFixed(3)}ms ${compliant ? 'PASS' : 'FAIL'}`);
      
      return { result, time: responseTime, compliant };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      console.error(`[PERF] ${operationName} failed in ${responseTime.toFixed(3)}ms:`, error);
      throw error;
    }
  }

  public async runBenchmark(
    operation: () => Promise<any>,
    operationName: string,
    iterations: number = AION_CONSTANTS.BENCHMARK_ITERATIONS
  ): Promise<BenchmarkResult> {
    console.log(`[PERF] Running benchmark: ${operationName} (${iterations} iterations)`);
    
    const times: number[] = [];
    let successCount = 0;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      try {
        const iterationStart = performance.now();
        await operation();
        const iterationTime = performance.now() - iterationStart;
        times.push(iterationTime);
        successCount++;
      } catch (error) {
        console.warn(`[PERF] Benchmark iteration ${i} failed:`, error);
      }
    }

    const totalTime = performance.now() - startTime;
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    // Calculate standard deviation
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length;
    const standardDeviation = Math.sqrt(variance);
    
    const successRate = (successCount / iterations) * 100;
    const aionCompliant = averageTime <= AION_CONSTANTS.MAX_RESPONSE_TIME && 
                         successRate >= (100 - AION_CONSTANTS.MAX_FAILURE_RATE * 100);

    const result: BenchmarkResult = {
      operation: operationName,
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      standardDeviation,
      successRate,
      aionCompliant
    };

    this.benchmarkHistory.push(result);
    
    console.log(`[PERF] Benchmark complete: ${operationName}`);
    console.log(`  Average: ${averageTime.toFixed(3)}ms`);
    console.log(`  Min/Max: ${minTime.toFixed(3)}ms / ${maxTime.toFixed(3)}ms`);
    console.log(`  Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`  AION Compliant: ${aionCompliant ? 'YES' : 'NO'}`);

    return result;
  }

  public updateMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.memoryUsage = memoryUsage.heapUsed / 1024 / 1024; // MB
    this.metrics.cpuUsage = (cpuUsage.user + cpuUsage.system) / 1000000; // seconds to percentage
    this.metrics.uptime = (Date.now() - this.startTime) / 1000; // seconds
    
    // Calculate error rate based on recent operations
    const recentBenchmarks = this.benchmarkHistory.slice(-10);
    if (recentBenchmarks.length > 0) {
      const totalSuccessRate = recentBenchmarks.reduce((sum, b) => sum + b.successRate, 0);
      this.metrics.errorRate = 100 - (totalSuccessRate / recentBenchmarks.length);
    }
    
    // Check AION compliance
    this.metrics.isCompliant = this.checkAionCompliance();
    this.metrics.quality = this.calculateQuality();
  }

  private checkAionCompliance(): boolean {
    return this.metrics.responseTime <= AION_CONSTANTS.MAX_RESPONSE_TIME &&
           this.metrics.memoryUsage <= AION_CONSTANTS.MAX_MEMORY_USAGE &&
           this.metrics.cpuUsage <= AION_CONSTANTS.MAX_CPU_USAGE &&
           this.metrics.errorRate <= AION_CONSTANTS.MAX_FAILURE_RATE * 100;
  }

  private calculateQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    const { cpuUsage, memoryUsage, responseTime } = this.metrics;
    
    if (cpuUsage <= PERFORMANCE_THRESHOLDS.EXCELLENT.cpu &&
        memoryUsage <= PERFORMANCE_THRESHOLDS.EXCELLENT.memory &&
        responseTime <= PERFORMANCE_THRESHOLDS.EXCELLENT.responseTime) {
      return 'excellent';
    } else if (cpuUsage <= PERFORMANCE_THRESHOLDS.GOOD.cpu &&
               memoryUsage <= PERFORMANCE_THRESHOLDS.GOOD.memory &&
               responseTime <= PERFORMANCE_THRESHOLDS.GOOD.responseTime) {
      return 'good';
    } else if (cpuUsage <= PERFORMANCE_THRESHOLDS.FAIR.cpu &&
               memoryUsage <= PERFORMANCE_THRESHOLDS.FAIR.memory &&
               responseTime <= PERFORMANCE_THRESHOLDS.FAIR.responseTime) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  public getMetrics(): PerformanceMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  public getBenchmarkHistory(): BenchmarkResult[] {
    return [...this.benchmarkHistory];
  }

  public async measureMemoryUsage<T>(operation: () => Promise<T>): Promise<{ result: T; memoryDelta: number }> {
    const initialMemory = process.memoryUsage().heapUsed;
    const result = await operation();
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDelta = (finalMemory - initialMemory) / 1024 / 1024; // MB
    
    return { result, memoryDelta };
  }

  public async measureThroughput(
    operation: () => Promise<any>,
    operationName: string,
    durationMs: number = 10000
  ): Promise<{ operationsPerSecond: number; totalOperations: number }> {
    console.log(`[PERF] Measuring throughput: ${operationName} for ${durationMs}ms`);
    
    const startTime = Date.now();
    let operationCount = 0;
    
    while (Date.now() - startTime < durationMs) {
      try {
        await operation();
        operationCount++;
      } catch (error) {
        console.warn(`[PERF] Throughput test operation failed:`, error);
      }
    }
    
    const actualDuration = Date.now() - startTime;
    const operationsPerSecond = (operationCount / actualDuration) * 1000;
    
    console.log(`[PERF] Throughput: ${operationsPerSecond.toFixed(2)} ops/sec (${operationCount} total ops)`);
    
    return {
      operationsPerSecond,
      totalOperations: operationCount
    };
  }

  public generateReport(): string {
    const metrics = this.getMetrics();
    const benchmarks = this.getBenchmarkHistory();
    
    let report = `
NEURALEDGE AI DESKTOP - PERFORMANCE REPORT
==========================================

CURRENT METRICS:
- Response Time: ${metrics.responseTime.toFixed(3)}ms
- Memory Usage: ${metrics.memoryUsage.toFixed(1)}MB
- CPU Usage: ${metrics.cpuUsage.toFixed(1)}%
- Error Rate: ${metrics.errorRate.toFixed(3)}%
- Uptime: ${metrics.uptime.toFixed(1)}s
- Quality: ${metrics.quality.toUpperCase()}
- AION Compliant: ${metrics.isCompliant ? 'YES' : 'NO'}

BENCHMARK HISTORY (Last 5):
`;

    const recentBenchmarks = benchmarks.slice(-5);
    recentBenchmarks.forEach(b => {
      report += `
- ${b.operation}:
  Average: ${b.averageTime.toFixed(3)}ms
  Success Rate: ${b.successRate.toFixed(1)}%
  AION Compliant: ${b.aionCompliant ? 'YES' : 'NO'}`;
    });

    report += `

AION PROTOCOL COMPLIANCE:
- Max Response Time: ${AION_CONSTANTS.MAX_RESPONSE_TIME}ms
- Max Memory Usage: ${AION_CONSTANTS.MAX_MEMORY_USAGE}MB  
- Max CPU Usage: ${AION_CONSTANTS.MAX_CPU_USAGE}%
- Max Failure Rate: ${AION_CONSTANTS.MAX_FAILURE_RATE * 100}%

COMPLIANCE STATUS: ${metrics.isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
`;

    return report;
  }

  public startContinuousMonitoring(): void {
    setInterval(() => {
      this.updateMetrics();
      const metrics = this.getMetrics();
      
      if (!metrics.isCompliant) {
        console.warn('[PERF] AION Protocol violation detected:', {
          responseTime: metrics.responseTime,
          memoryUsage: metrics.memoryUsage,
          cpuUsage: metrics.cpuUsage,
          errorRate: metrics.errorRate
        });
      }
    }, AION_CONSTANTS.PERFORMANCE_CHECK_INTERVAL);
  }
}