/**
 * Performance Optimization Utilities
 *
 * Common performance optimization helpers and utilities.
 */

import {InteractionManager} from 'react-native';

/**
 * Defer heavy operations until after interactions complete
 */
export const runAfterInteractions = (callback: () => void) => {
  InteractionManager.runAfterInteractions(() => {
    callback();
  });
};

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize expensive calculations
 */
export function memoize<Args extends any[], Return>(
  fn: (...args: Args) => Return,
): (...args: Args) => Return {
  const cache = new Map<string, Return>();

  return (...args: Args): Return => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Batch multiple operations together
 */
export class Batcher<T> {
  private queue: T[] = [];
  private batchSize: number;
  private timeout: number;
  private processor: (items: T[]) => Promise<void> | void;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    processor: (items: T[]) => Promise<void> | void,
    batchSize: number = 10,
    timeout: number = 1000,
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.timeout = timeout;
  }

  add(item: T): void {
    this.queue.push(item);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.timeout);
    }
  }

  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const items = [...this.queue];
    this.queue = [];
    await this.processor(items);
  }
}

