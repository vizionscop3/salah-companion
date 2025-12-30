/**
 * API Security Service
 *
 * Centralized API security utilities including:
 * - Request/response interceptors
 * - Security headers
 * - Rate limiting
 * - Request validation
 */

import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import {RateLimiter} from '@utils/securityHelpers';

/**
 * Security headers to add to all requests
 */
const SECURITY_HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};

/**
 * Create secure axios instance with security headers
 */
export function createSecureAxiosInstance(baseURL?: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      ...SECURITY_HEADERS,
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add security headers and validate
  instance.interceptors.request.use(
    config => {
      // Add security headers
      config.headers = {
        ...config.headers,
        ...SECURITY_HEADERS,
      };

      // Validate request URL (prevent SSRF)
      if (config.url) {
        validateRequestUrl(config.url);
      }

      // Add timestamp for request tracking
      config.metadata = {
        ...config.metadata,
        requestTime: Date.now(),
      };

      return config;
    },
    error => {
      return Promise.reject(error);
    },
  );

  // Response interceptor - security validation
  instance.interceptors.response.use(
    response => {
      // Validate response headers
      validateResponseHeaders(response);

      // Log security events (in production, send to monitoring)
      if (__DEV__) {
        console.log('API Security: Request completed', {
          url: response.config.url,
          status: response.status,
        });
      }

      return response;
    },
    error => {
      // Handle security-related errors
      if (error.response?.status === 401) {
        // Unauthorized - clear tokens, redirect to login
        console.warn('API Security: Unauthorized request');
      } else if (error.response?.status === 403) {
        // Forbidden - log security event
        console.warn('API Security: Forbidden request', {
          url: error.config?.url,
        });
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

/**
 * Validate request URL to prevent SSRF attacks
 */
function validateRequestUrl(url: string): void {
  // Block localhost/internal network requests (unless explicitly allowed)
  const blockedPatterns = [
    /^https?:\/\/localhost/,
    /^https?:\/\/127\.0\.0\.1/,
    /^https?:\/\/0\.0\.0\.0/,
    /^https?:\/\/192\.168\./,
    /^https?:\/\/10\./,
    /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(url)) {
      throw new Error(`Security: Blocked request to internal network: ${url}`);
    }
  }
}

/**
 * Validate response headers for security
 */
function validateResponseHeaders(response: AxiosResponse): void {
  const headers = response.headers;

  // Check for security headers in response
  const requiredHeaders = ['X-Content-Type-Options'];
  for (const header of requiredHeaders) {
    if (!headers[header.toLowerCase()]) {
      console.warn(`API Security: Missing security header: ${header}`);
    }
  }
}

/**
 * API Rate Limiter instance
 */
const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

/**
 * Check if API request is allowed (rate limiting)
 */
export function isApiRequestAllowed(endpoint: string): boolean {
  return apiRateLimiter.isAllowed(endpoint);
}

/**
 * Reset rate limiter for an endpoint
 */
export function resetApiRateLimit(endpoint: string): void {
  apiRateLimiter.reset(endpoint);
}

/**
 * Sanitize API response data
 */
export function sanitizeApiResponse(data: any): any {
  if (typeof data === 'string') {
    // Remove potential XSS payloads
    return data.replace(/<script[^>]*>.*?<\/script>/gi, '');
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeApiResponse);
  }
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      sanitized[key] = sanitizeApiResponse(data[key]);
    }
    return sanitized;
  }
  return data;
}

