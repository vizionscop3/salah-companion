/**
 * Prisma Client Singleton
 * 
 * Provides a single instance of PrismaClient to be used throughout the app.
 * Prevents multiple instances in development (hot reload).
 */

import {PrismaClient} from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;

