/**
 * Performance Monitor Utility
 *
 * Provides performance monitoring and profiling capabilities for the app.
 * Tracks startup time, screen transitions, API calls, and memory usage.
 */

import {InteractionManager} from 'react-native';

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = __DEV__;

  /**
   * Start tracking a performance metric
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  /**
   * End tracking a performance metric
   */
  end(name: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log in development
    if (__DEV__) {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`, metric.metadata || '');
    }

    return duration;
  }

  /**
   * Measure async function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>,
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Measure sync function execution time
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>,
  ): T {
    this.start(name, metadata);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metric by name
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Get summary report
   */
  getReport(): {
    totalMetrics: number;
    averageDuration: number;
    slowestMetric: PerformanceMetric | null;
    fastestMetric: PerformanceMetric | null;
    metrics: PerformanceMetric[];
  } {
    const completedMetrics = Array.from(this.metrics.values()).filter(
      m => m.duration !== undefined,
    );

    if (completedMetrics.length === 0) {
      return {
        totalMetrics: 0,
        averageDuration: 0,
        slowestMetric: null,
        fastestMetric: null,
        metrics: [],
      };
    }

    const durations = completedMetrics
      .map(m => m.duration!)
      .filter(d => d !== undefined);

    const averageDuration =
      durations.reduce((sum, d) => sum + d, 0) / durations.length;

    const slowestMetric = completedMetrics.reduce((slowest, current) => {
      if (!slowest || !current.duration) return current;
      return current.duration > slowest.duration ? current : slowest;
    }, null as PerformanceMetric | null);

    const fastestMetric = completedMetrics.reduce((fastest, current) => {
      if (!fastest || !current.duration) return current;
      return current.duration < fastest.duration ? current : fastest;
    }, null as PerformanceMetric | null);

    return {
      totalMetrics: completedMetrics.length,
      averageDuration,
      slowestMetric,
      fastestMetric,
      metrics: completedMetrics,
    };
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure app startup time
 */
export function measureAppStartup(): void {
  if (!__DEV__) return;

  // Mark app start
  performanceMonitor.start('app_startup');

  // Wait for interactions to complete
  InteractionManager.runAfterInteractions(() => {
    performanceMonitor.end('app_startup');
    const report = performanceMonitor.getReport();
    console.log('[Performance] App Startup Report:', report);
  });
}

/**
 * Measure screen transition
 */
export function measureScreenTransition(
  screenName: string,
  callback: () => void,
): void {
  if (!__DEV__) return;

  const metricName = `screen_transition_${screenName}`;
  performanceMonitor.start(metricName);

  // Wait for transition to complete
  InteractionManager.runAfterInteractions(() => {
    performanceMonitor.end(metricName);
    callback();
  });
}

/**
 * Measure API call
 */
export async function measureAPICall<T>(
  apiName: string,
  apiCall: () => Promise<T>,
): Promise<T> {
  return performanceMonitor.measure(`api_call_${apiName}`, apiCall);
}

/**
 * Measure database operation
 */
export async function measureDatabaseOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
): Promise<T> {
  return performanceMonitor.measure(`db_operation_${operationName}`, operation);
}

/**
 * Get performance report
 */
export function getPerformanceReport() {
  return performanceMonitor.getReport();
}

