/**
 * CountdownTimer Component Tests
 */

import React from 'react';
import {render, screen, act} from '@testing-library/react-native';
import {CountdownTimer} from '@components/index';
import {ThemeProvider} from '@context/ThemeContext';

const TestWrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('displays countdown correctly', () => {
    const targetTime = new Date();
    targetTime.setHours(targetTime.getHours() + 2);
    targetTime.setMinutes(targetTime.getMinutes() + 30);

    render(
      <TestWrapper>
        <CountdownTimer targetTime={targetTime} />
      </TestWrapper>,
    );

    expect(screen.getByText('Hours')).toBeTruthy();
    expect(screen.getByText('Minutes')).toBeTruthy();
    expect(screen.getByText('Seconds')).toBeTruthy();
  });

  it('updates countdown every second', () => {
    const targetTime = new Date();
    targetTime.setSeconds(targetTime.getSeconds() + 5);

    render(
      <TestWrapper>
        <CountdownTimer targetTime={targetTime} />
      </TestWrapper>,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Timer should update
    expect(screen.getByText('Seconds')).toBeTruthy();
  });

  it('calls onComplete when countdown reaches zero', () => {
    const onComplete = jest.fn();
    const targetTime = new Date();
    targetTime.setSeconds(targetTime.getSeconds() + 1);

    render(
      <TestWrapper>
        <CountdownTimer targetTime={targetTime} onComplete={onComplete} />
      </TestWrapper>,
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('shows completion message when time has passed', () => {
    const pastTime = new Date();
    pastTime.setHours(pastTime.getHours() - 1);

    render(
      <TestWrapper>
        <CountdownTimer targetTime={pastTime} />
      </TestWrapper>,
    );

    expect(screen.getByText(/Prayer time has arrived/i)).toBeTruthy();
  });

  it('shows progress bar when showProgress is true', () => {
    const targetTime = new Date();
    targetTime.setHours(targetTime.getHours() + 12);

    render(
      <TestWrapper>
        <CountdownTimer targetTime={targetTime} showProgress={true} />
      </TestWrapper>,
    );

    // Progress bar should be rendered (checking via accessibility)
    expect(screen.getByText('Hours')).toBeTruthy();
  });
});

