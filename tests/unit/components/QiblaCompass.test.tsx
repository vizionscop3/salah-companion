/**
 * QiblaCompass Component Tests
 */

import React from 'react';
import {render, screen, waitFor} from '@testing-library/react-native';
import {QiblaCompass} from '@components/index';
import {TestWrapper} from '@tests/utils/testHelpers';
import * as locationService from '@services/location/locationService';
import * as qiblaService from '@services/qibla/qiblaService';

jest.mock('@services/location/locationService');
jest.mock('@services/qibla/qiblaService');

describe('QiblaCompass', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (locationService.requestLocationPermission as jest.Mock) = jest
      .fn()
      .mockResolvedValue(true);
    (locationService.getCurrentLocation as jest.Mock) = jest.fn().mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(
      <TestWrapper>
        <QiblaCompass />
      </TestWrapper>,
    );

    expect(screen.getByText(/Initializing compass/i)).toBeTruthy();
  });

  it('displays compass after loading', async () => {
    const mockLocation = {
      latitude: 40.7128,
      longitude: -74.006,
    };

    (locationService.requestLocationPermission as jest.Mock) = jest
      .fn()
      .mockResolvedValue(true);
    (locationService.getCurrentLocation as jest.Mock) = jest
      .fn()
      .mockResolvedValue(mockLocation);
    (qiblaService.calculateQiblaFromLocation as jest.Mock) = jest
      .fn()
      .mockReturnValue(58.5);
    (qiblaService.calculateDistanceToKaaba as jest.Mock) = jest
      .fn()
      .mockReturnValue(10000);
    (qiblaService.getCompassDirection as jest.Mock) = jest.fn().mockReturnValue('NE');

    render(
      <TestWrapper>
        <QiblaCompass />
      </TestWrapper>,
    );

    await waitFor(
      () => {
        expect(screen.getByText(/Qibla Direction/i)).toBeTruthy();
      },
      {timeout: 3000},
    );

    // Check for bearing text (format may vary)
    const bearingText = screen.getByText(/59°|58°|NE/i);
    expect(bearingText).toBeTruthy();
  });

  it('shows error when location permission denied', async () => {
    (locationService.requestLocationPermission as jest.Mock) = jest
      .fn()
      .mockResolvedValue(false);

    render(
      <TestWrapper>
        <QiblaCompass />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /Location permission is required to show Qibla direction/i,
        ),
      ).toBeTruthy();
    });
  });

  it('displays distance when showDistance is true', async () => {
    const mockLocation = {
      latitude: 40.7128,
      longitude: -74.006,
    };

    (locationService.requestLocationPermission as jest.Mock) = jest
      .fn()
      .mockResolvedValue(true);
    (locationService.getCurrentLocation as jest.Mock) = jest
      .fn()
      .mockResolvedValue(mockLocation);
    (qiblaService.calculateQiblaFromLocation as jest.Mock) = jest
      .fn()
      .mockReturnValue(58.5);
    (qiblaService.calculateDistanceToKaaba as jest.Mock) = jest
      .fn()
      .mockReturnValue(10000);
    (qiblaService.getCompassDirection as jest.Mock) = jest.fn().mockReturnValue('NE');

    render(
      <TestWrapper>
        <QiblaCompass showDistance={true} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Distance to Kaaba/i)).toBeTruthy();
      expect(screen.getByText(/10000 km/i)).toBeTruthy();
    });
  });
});

