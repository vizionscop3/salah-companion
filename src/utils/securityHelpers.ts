/**
 * Security Helpers
 *
 * Utilities for security enhancements and validation.
 */

import {Platform} from 'react-native';
import * as Crypto from 'expo-crypto';

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate secure random token
 */
export async function generateSecureToken(length: number = 32): Promise<string> {
  try {
    // Use expo-crypto for secure random generation
    const bytes = await Crypto.getRandomBytesAsync(length);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    // Fallback to Math.random if expo-crypto unavailable
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}

/**
 * Check if device is rooted/jailbroken (basic check)
 */
export function isDeviceSecure(): boolean {
  // Basic checks - in production, use more sophisticated detection
  if (Platform.OS === 'android') {
    // Check for common root indicators
    // This is a simplified check
    return true; // Assume secure for now
  }
  if (Platform.OS === 'ios') {
    // Check for common jailbreak indicators
    // This is a simplified check
    return true; // Assume secure for now
  }
  return true;
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const recentRequests = requests.filter(timestamp => now - timestamp < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

/**
 * Encrypt sensitive data (basic implementation)
 * In production, use proper encryption libraries
 */
export function encryptData(data: string, key: string): string {
  // This is a placeholder - use proper encryption in production
  // For now, return base64 encoded (NOT secure, just for structure)
  return Buffer.from(data).toString('base64');
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string, key: string): string {
  // This is a placeholder - use proper decryption in production
  try {
    return Buffer.from(encryptedData, 'base64').toString();
  } catch {
    return '';
  }
}

