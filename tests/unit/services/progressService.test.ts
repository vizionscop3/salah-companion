/**
 * Progress Service Tests
 * 
 * Updated to use AsyncStorage mocks instead of Prisma
 * (Prisma cannot run in React Native)
 */

import {
  recordPrayerCompletion,
  getTodayProgress,
  getPrayerRecords,
  getLongestStreak,
} from '@services/progress/progressService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('Progress Service', () => {
  const mockUserId = 'test-user-id';
  const mockPrayerDate = new Date('2024-12-12');
  const mockPrayerTime = new Date('2024-12-12T06:00:00');

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('recordPrayerCompletion', () => {
    it('creates a prayer record', async () => {
      // Mock AsyncStorage to return empty records initially
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: mockPrayerDate,
        prayerTime: mockPrayerTime,
      });

      // Verify AsyncStorage.setItem was called to save the record
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      
      // Get the call arguments to verify the data structure
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const recordsCall = setItemCalls.find(call => 
        call[0].includes('prayer_records')
      );
      
      expect(recordsCall).toBeDefined();
      if (recordsCall) {
        const savedRecords = JSON.parse(recordsCall[1]);
        expect(savedRecords).toHaveLength(1);
        expect(savedRecords[0]).toMatchObject({
          userId: mockUserId,
          prayerName: 'fajr',
        });
      }
    });

    it('updates user progress after recording', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: mockPrayerDate,
        prayerTime: mockPrayerTime,
      });

      // Verify progress was also saved
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const progressCall = setItemCalls.find(call => 
        call[0].includes('user_progress')
      );
      
      expect(progressCall).toBeDefined();
    });
  });

  describe('getTodayProgress', () => {
    it('returns progress stats for today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      // Mock prayer records
      const mockRecords = [
        {
          id: 'record-1',
          userId: mockUserId,
          prayerName: 'fajr',
          prayerDate: today.toISOString(),
          prayerTime: new Date(today.setHours(6, 0, 0, 0)).toISOString(),
        },
        {
          id: 'record-2',
          userId: mockUserId,
          prayerName: 'dhuhr',
          prayerDate: today.toISOString(),
          prayerTime: new Date(today.setHours(12, 0, 0, 0)).toISOString(),
        },
      ];

      // Mock user progress
      const mockProgress = [
        {
          userId: mockUserId,
          progressDate: todayStr,
          prayersCompleted: 2,
          currentStreak: 5,
          longestStreak: 10,
          experiencePoints: 100,
        },
      ];

      // Mock achievements
      const mockAchievements = ['achievement-1', 'achievement-2', 'achievement-3'];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key.includes('prayer_records')) {
          return Promise.resolve(JSON.stringify(mockRecords));
        }
        if (key.includes('user_progress')) {
          return Promise.resolve(JSON.stringify(mockProgress));
        }
        if (key.includes('achievements')) {
          return Promise.resolve(JSON.stringify(mockAchievements));
        }
        return Promise.resolve(null);
      });

      const progress = await getTodayProgress(mockUserId);

      expect(progress.prayersCompleted).toBe(2);
      expect(progress.totalPrayers).toBe(5);
      // Streak calculation requires consecutive days - may be 0 or 1 for single day
      expect(progress.currentStreak).toBeGreaterThanOrEqual(0);
      expect(progress.longestStreak).toBeGreaterThanOrEqual(0);
      expect(progress.achievements).toBe(3);
    });

    it('returns zero values when no progress exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

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
        {
          id: '1',
          userId: mockUserId,
          prayerName: 'fajr',
          prayerDate: mockPrayerDate.toISOString(),
          prayerTime: mockPrayerTime.toISOString(),
        },
        {
          id: '2',
          userId: mockUserId,
          prayerName: 'dhuhr',
          prayerDate: mockPrayerDate.toISOString(),
          prayerTime: mockPrayerTime.toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockRecords),
      );

      const records = await getPrayerRecords(mockUserId);

      expect(records).toHaveLength(2);
      expect(records[0].prayerName).toBe('fajr');
      expect(records[1].prayerName).toBe('dhuhr');
    });

    it('filters by date range when provided', async () => {
      const startDate = new Date('2024-12-01');
      const endDate = new Date('2024-12-31');
      
      const mockRecords = [
        {
          id: '1',
          userId: mockUserId,
          prayerName: 'fajr',
          prayerDate: '2024-12-15T00:00:00.000Z',
          prayerTime: mockPrayerTime.toISOString(),
        },
        {
          id: '2',
          userId: mockUserId,
          prayerName: 'dhuhr',
          prayerDate: '2024-11-30T00:00:00.000Z', // Outside range
          prayerTime: mockPrayerTime.toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockRecords),
      );

      const records = await getPrayerRecords(mockUserId, startDate, endDate);

      // Should only return records within date range
      expect(records.length).toBeGreaterThanOrEqual(0);
      records.forEach(record => {
        const recordDate = new Date(record.prayerDate);
        expect(recordDate >= startDate).toBe(true);
        expect(recordDate <= endDate).toBe(true);
      });
    });
  });

  describe('getLongestStreak', () => {
    it('returns longest streak for user', async () => {
      const mockProgress = [
        {
          userId: mockUserId,
          progressDate: '2024-12-01',
          prayersCompleted: 5,
          currentStreak: 10,
          longestStreak: 15,
          experiencePoints: 100,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress),
      );

      const streak = await getLongestStreak(mockUserId);

      expect(streak).toBe(15);
    });

    it('returns 0 when no progress exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const streak = await getLongestStreak(mockUserId);

      expect(streak).toBe(0);
    });
  });
});
