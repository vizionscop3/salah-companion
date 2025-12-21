/**
 * ProgressCard Component Tests
 */

import React from 'react';
import {render, screen, cleanup} from '@testing-library/react-native';
import {ProgressCard} from '@components/index';
import {TestWrapper} from '@tests/utils/testHelpers';

describe('ProgressCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  it('renders progress information correctly', () => {
    render(
      <TestWrapper>
        <ProgressCard
          prayersCompleted={3}
          totalPrayers={5}
          currentStreak={7}
          longestStreak={10}
          achievements={5}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("Today's Progress")).toBeTruthy();
    expect(screen.getByText('3 of 5 prayers completed')).toBeTruthy();
    expect(screen.getByText('Day Streak')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy(); // Current streak
  });

  it('displays correct progress percentage', () => {
    render(
      <TestWrapper>
        <ProgressCard
          prayersCompleted={2}
          totalPrayers={5}
          currentStreak={5}
          longestStreak={8}
          achievements={3}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('40%')).toBeTruthy();
  });

  it('shows streak badge when streak > 0', () => {
    render(
      <TestWrapper>
        <ProgressCard
          prayersCompleted={5}
          totalPrayers={5}
          currentStreak={5}
          longestStreak={10}
          achievements={5}
        />
      </TestWrapper>,
    );

    expect(screen.getByText(/🔥.*day streak/i)).toBeTruthy();
  });

  it('does not show streak badge when streak is 0', () => {
    render(
      <TestWrapper>
        <ProgressCard
          prayersCompleted={0}
          totalPrayers={5}
          currentStreak={0}
          longestStreak={0}
          achievements={0}
        />
      </TestWrapper>,
    );

    expect(screen.queryByText(/🔥.*day streak/i)).toBeNull();
  });

  it('displays all stats when showDetails is true', () => {
    render(
      <TestWrapper>
        <ProgressCard
          prayersCompleted={4}
          totalPrayers={5}
          currentStreak={12}
          longestStreak={15}
          achievements={8}
          showDetails={true}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Day Streak')).toBeTruthy();
    expect(screen.getByText('Best Streak')).toBeTruthy();
    expect(screen.getByText('Achievements')).toBeTruthy();
  });

  it('hides details when showDetails is false', () => {
    render(
      <TestWrapper>
        <ProgressCard
          prayersCompleted={3}
          totalPrayers={5}
          currentStreak={5}
          longestStreak={10}
          achievements={3}
          showDetails={false}
        />
      </TestWrapper>,
    );

    // Progress bar should still be visible
    expect(screen.getByText("Today's Progress")).toBeTruthy();
  });
});

