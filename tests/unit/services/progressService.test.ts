/**
 * Progress Service Tests
 */

import {
  recordPrayerCompletion,
  getTodayProgress,
  getPrayerRecords,
  getLongestStreak,
} from '@services/progress/progressService';
import {prisma} from '@services/database/prismaClient';

// Mock Prisma
jest.mock('@services/database/prismaClient');

describe('Progress Service', () => {
  const mockUserId = 'test-user-id';
  const mockPrayerDate = new Date('2024-12-12');
  const mockPrayerTime = new Date('2024-12-12T06:00:00');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordPrayerCompletion', () => {
    it('creates a prayer record', async () => {
      const mockCreate = jest.fn().mockResolvedValue({id: 'record-id'});
      const mockUpsert = jest.fn().mockResolvedValue({
        id: 'progress-id',
        currentStreak: 1,
        longestStreak: 1,
      });
      const mockFindMany = jest.fn().mockResolvedValue([{id: 'record-1'}]);
      const mockFindFirst = jest.fn().mockResolvedValue(null);
      const mockUpdate = jest.fn().mockResolvedValue({});

      (prisma.prayerRecord.create as jest.Mock) = mockCreate;
      (prisma.prayerRecord.findMany as jest.Mock) = mockFindMany;
      (prisma.userProgress.upsert as jest.Mock) = mockUpsert;
      (prisma.userProgress.update as jest.Mock) = mockUpdate;
      (prisma.prayerRecord.findFirst as jest.Mock) = mockFindFirst;

      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: mockPrayerDate,
        prayerTime: mockPrayerTime,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUserId,
          prayerName: 'fajr',
          prayerDate: mockPrayerDate,
          prayerTime: mockPrayerTime,
          wasGuided: true,
        }),
      });
    });

    it('updates user progress after recording', async () => {
      const mockCreate = jest.fn().mockResolvedValue({id: 'record-id'});
      const mockUpsert = jest.fn().mockResolvedValue({
        id: 'progress-id',
        currentStreak: 1,
        longestStreak: 1,
      });
      const mockFindMany = jest.fn().mockResolvedValue([{id: 'record-1'}]);
      const mockFindFirst = jest.fn().mockResolvedValue(null);
      const mockUpdate = jest.fn().mockResolvedValue({});

      (prisma.prayerRecord.create as jest.Mock) = mockCreate;
      (prisma.prayerRecord.findMany as jest.Mock) = mockFindMany;
      (prisma.userProgress.upsert as jest.Mock) = mockUpsert;
      (prisma.userProgress.update as jest.Mock) = mockUpdate;
      (prisma.prayerRecord.findFirst as jest.Mock) = mockFindFirst;

      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: mockPrayerDate,
        prayerTime: mockPrayerTime,
      });

      expect(mockUpsert).toHaveBeenCalled();
    });
  });

  describe('getTodayProgress', () => {
    it('returns progress stats for today', async () => {
      const mockFindMany = jest.fn().mockResolvedValue([
        {id: 'record-1', prayerName: 'fajr'},
        {id: 'record-2', prayerName: 'dhuhr'},
      ]);
      const mockFindFirst = jest.fn().mockResolvedValue({
        currentStreak: 5,
        longestStreak: 10,
      });
      const mockCount = jest.fn().mockResolvedValue(3);

      (prisma.prayerRecord.findMany as jest.Mock) = mockFindMany;
      (prisma.userProgress.findFirst as jest.Mock) = mockFindFirst;
      (prisma.userAchievement.count as jest.Mock) = mockCount;

      const progress = await getTodayProgress(mockUserId);

      expect(progress.prayersCompleted).toBe(2);
      expect(progress.totalPrayers).toBe(5);
      expect(progress.currentStreak).toBe(5);
      expect(progress.longestStreak).toBe(10);
      expect(progress.achievements).toBe(3);
    });

    it('returns zero values when no progress exists', async () => {
      const mockFindMany = jest.fn().mockResolvedValue([]);
      const mockFindFirst = jest.fn().mockResolvedValue(null);
      const mockCount = jest.fn().mockResolvedValue(0);

      (prisma.prayerRecord.findMany as jest.Mock) = mockFindMany;
      (prisma.userProgress.findFirst as jest.Mock) = mockFindFirst;
      (prisma.userAchievement.count as jest.Mock) = mockCount;

      const progress = await getTodayProgress(mockUserId);

      expect(progress.prayersCompleted).toBe(0);
      expect(progress.currentStreak).toBe(0);
      expect(progress.longestStreak).toBe(0);
      expect(progress.achievements).toBe(0);
    });
  });

  describe('getPrayerRecords', () => {
    it('returns prayer records for user', async () => {
      const mockRecords = [
        {id: '1', prayerName: 'fajr', prayerDate: mockPrayerDate},
        {id: '2', prayerName: 'dhuhr', prayerDate: mockPrayerDate},
      ];
      const mockFindMany = jest.fn().mockResolvedValue(mockRecords);

      (prisma.prayerRecord.findMany as jest.Mock) = mockFindMany;

      const records = await getPrayerRecords(mockUserId);

      expect(records).toHaveLength(2);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {userId: mockUserId},
        orderBy: {prayerDate: 'desc'},
      });
    });

    it('filters by date range when provided', async () => {
      const startDate = new Date('2024-12-01');
      const endDate = new Date('2024-12-31');
      const mockFindMany = jest.fn().mockResolvedValue([]);

      (prisma.prayerRecord.findMany as jest.Mock) = mockFindMany;

      await getPrayerRecords(mockUserId, startDate, endDate);

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          prayerDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {prayerDate: 'desc'},
      });
    });
  });

  describe('getLongestStreak', () => {
    it('returns longest streak for user', async () => {
      const mockFindFirst = jest.fn().mockResolvedValue({
        longestStreak: 15,
      });

      (prisma.userProgress.findFirst as jest.Mock) = mockFindFirst;

      const streak = await getLongestStreak(mockUserId);

      expect(streak).toBe(15);
    });

    it('returns 0 when no progress exists', async () => {
      const mockFindFirst = jest.fn().mockResolvedValue(null);

      (prisma.userProgress.findFirst as jest.Mock) = mockFindFirst;

      const streak = await getLongestStreak(mockUserId);

      expect(streak).toBe(0);
    });
  });
});

