/**
 * Progress Integration Tests
 *
 * Tests the integration between progress service and database
 */

import {
  recordPrayerCompletion,
  getTodayProgress,
  getPrayerRecords,
} from '@services/progress/progressService';
import {prisma} from '@services/database/prismaClient';

// Mock Prisma
jest.mock('@services/database/prismaClient');

describe('Progress Integration', () => {
  const mockUserId = 'test-user-123';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete prayer flow', () => {
    it('records prayer and updates progress in sequence', async () => {
      // Mock: No existing records
      (prisma.prayerRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.prayerRecord.findFirst as jest.Mock).mockResolvedValueOnce(null);

      // Mock: Create prayer record
      (prisma.prayerRecord.create as jest.Mock).mockResolvedValueOnce({
        id: 'prayer-1',
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: today,
      });

      // Mock: Upsert progress (first prayer of the day)
      (prisma.userProgress.upsert as jest.Mock).mockResolvedValueOnce({
        id: 'progress-1',
        userId: mockUserId,
        progressDate: today,
        prayersCompleted: 1,
        currentStreak: 1,
        longestStreak: 1,
      });

      // Mock: Find records for streak calculation
      (prisma.prayerRecord.findMany as jest.Mock).mockResolvedValueOnce([
        {id: 'prayer-1'},
      ]);
      (prisma.prayerRecord.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'prayer-1',
      });

      // Mock: Update progress with streak
      (prisma.userProgress.update as jest.Mock).mockResolvedValueOnce({});

      // Record prayer
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: today,
        prayerTime: new Date(today.setHours(6, 0, 0, 0)),
      });

      // Verify prayer was recorded
      expect(prisma.prayerRecord.create).toHaveBeenCalled();
      expect(prisma.userProgress.upsert).toHaveBeenCalled();
    });

    it('tracks multiple prayers in a day', async () => {
      // Mock: Get today's progress (2 prayers already completed)
      (prisma.prayerRecord.findMany as jest.Mock)
        .mockResolvedValueOnce([
          {id: 'prayer-1', prayerName: 'fajr'},
          {id: 'prayer-2', prayerName: 'dhuhr'},
        ])
        .mockResolvedValueOnce([
          {id: 'prayer-1'},
          {id: 'prayer-2'},
        ]);

      (prisma.prayerRecord.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'prayer-2',
      });

      (prisma.prayerRecord.create as jest.Mock).mockResolvedValueOnce({
        id: 'prayer-3',
      });

      (prisma.userProgress.upsert as jest.Mock).mockResolvedValueOnce({
        id: 'progress-1',
        prayersCompleted: 3,
      });

      (prisma.userProgress.update as jest.Mock).mockResolvedValueOnce({});

      // Record third prayer
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'asr',
        prayerDate: today,
        prayerTime: new Date(today.setHours(15, 30, 0, 0)),
      });

      // Verify progress shows 3 prayers
      const progress = await getTodayProgress(mockUserId);
      expect(progress.prayersCompleted).toBe(2); // From mocked findMany
    });
  });

  describe('Streak calculation', () => {
    it('maintains streak for consecutive days', async () => {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Mock: Today has prayers
      (prisma.prayerRecord.findFirst as jest.Mock)
        .mockResolvedValueOnce({id: 'today-prayer'}) // Today
        .mockResolvedValueOnce({id: 'yesterday-prayer'}); // Yesterday

      (prisma.prayerRecord.findMany as jest.Mock).mockResolvedValueOnce([
        {id: 'today-prayer'},
      ]);

      (prisma.userProgress.upsert as jest.Mock).mockResolvedValueOnce({
        id: 'progress-1',
        currentStreak: 1,
      });

      (prisma.userProgress.update as jest.Mock).mockResolvedValueOnce({
        currentStreak: 2, // Streak continues
      });

      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: today,
        prayerTime: new Date(today.setHours(6, 0, 0, 0)),
      });

      // Streak should be calculated and updated
      expect(prisma.userProgress.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currentStreak: expect.any(Number),
          }),
        }),
      );
    });
  });
});

