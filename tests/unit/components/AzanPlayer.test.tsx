/**
 * AzanPlayer Component Tests
 */

import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react-native';
import {AzanPlayer} from '@components/index';
import {TestWrapper} from '@tests/utils/testHelpers';
import {azanService} from '@services/azan/azanService';

jest.mock('@services/azan/azanService');

describe('AzanPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <TestWrapper>
        <AzanPlayer />
      </TestWrapper>,
    );

    expect(screen.getByText(/Play Azan/i)).toBeTruthy();
  });

  it('displays prayer name when provided', () => {
    render(
      <TestWrapper>
        <AzanPlayer prayerName="Fajr" />
      </TestWrapper>,
    );

    expect(screen.getByText(/Azan - Fajr/i)).toBeTruthy();
  });

  it('shows voice selection chips', () => {
    render(
      <TestWrapper>
        <AzanPlayer />
      </TestWrapper>,
    );

    expect(screen.getByText('Makkah')).toBeTruthy();
    expect(screen.getByText('Madinah')).toBeTruthy();
  });

  it('displays volume control', () => {
    render(
      <TestWrapper>
        <AzanPlayer />
      </TestWrapper>,
    );

    expect(screen.getByText(/Volume:/i)).toBeTruthy();
  });

  it('calls azanService.playAzan when play button is pressed', async () => {
    const mockPlayAzan = jest.fn().mockResolvedValue(undefined);
    (azanService.playAzan as jest.Mock) = mockPlayAzan;

    render(
      <TestWrapper>
        <AzanPlayer />
      </TestWrapper>,
    );

    const playButton = screen.getByText(/Play Azan/i);
    fireEvent.press(playButton);

    await waitFor(() => {
      expect(mockPlayAzan).toHaveBeenCalled();
    });
  });

  it('displays Azan text', () => {
    render(
      <TestWrapper>
        <AzanPlayer />
      </TestWrapper>,
    );

    expect(screen.getByText('اللهُ أَكْبَر')).toBeTruthy();
    expect(screen.getByText('Allahu Akbar')).toBeTruthy();
    expect(screen.getByText('Allah is the Greatest')).toBeTruthy();
  });

  it('allows voice selection', () => {
    const mockUpdateConfig = jest.fn();
    (azanService.updateConfig as jest.Mock) = mockUpdateConfig;

    render(
      <TestWrapper>
        <AzanPlayer />
      </TestWrapper>,
    );

    const madinahChip = screen.getByText('Madinah');
    fireEvent.press(madinahChip);

    expect(mockUpdateConfig).toHaveBeenCalledWith({voice: 'madinah'});
  });
});

