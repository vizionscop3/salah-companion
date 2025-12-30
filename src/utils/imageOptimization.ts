/**
 * Image Optimization Utilities
 *
 * Utilities for optimizing images and managing image caching.
 */

import {Image, ImageResizeMode, ImageStyle} from 'react-native';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
  resizeMode?: ImageResizeMode;
}

/**
 * Get optimized image dimensions based on screen size
 */
export function getOptimizedImageDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 800,
  maxHeight: number = 600,
): {width: number; height: number} {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Preload images for better performance
 */
export function preloadImages(imageUris: string[]): Promise<void[]> {
  return Promise.all(
    imageUris.map(
      uri =>
        new Promise<void>((resolve, reject) => {
          Image.prefetch(uri)
            .then(() => resolve())
            .catch(error => {
              console.warn(`Failed to preload image: ${uri}`, error);
              resolve(); // Don't fail all if one fails
            });
        }),
    ),
  );
}

/**
 * Get image cache key
 */
export function getImageCacheKey(uri: string, options?: ImageOptimizationOptions): string {
  const optionsStr = options
    ? `_${options.width}x${options.height}_q${options.quality || 0.8}`
    : '';
  return `img_${uri.replace(/[^a-zA-Z0-9]/g, '_')}${optionsStr}`;
}

/**
 * Check if image is cached
 */
export async function isImageCached(uri: string): Promise<boolean> {
  // In production, check actual cache
  // For now, return false
  return false;
}

/**
 * Clear image cache
 */
export async function clearImageCache(): Promise<void> {
  // In production, clear actual cache
  // Image component handles its own cache
  if (Image.clearMemoryCache) {
    Image.clearMemoryCache();
  }
  if (Image.clearDiskCache) {
    Image.clearDiskCache();
  }
}

/**
 * Get optimized image style
 */
export function getOptimizedImageStyle(
  options: ImageOptimizationOptions,
): ImageStyle {
  const style: ImageStyle = {};

  if (options.width) {
    style.width = options.width;
  }
  if (options.height) {
    style.height = options.height;
  }
  if (options.resizeMode) {
    style.resizeMode = options.resizeMode;
  }

  return style;
}

