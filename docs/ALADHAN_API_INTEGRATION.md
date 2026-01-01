# AlAdhan Prayer Times API Integration

## Overview

The Salah Companion app now uses the [AlAdhan Prayer Times API](https://aladhan.com/prayer-times-api) as the primary source for accurate prayer times. This API provides prayer times that match local mosque timings and government authorities.

**API Base URL**: `https://api.aladhan.com/v1`  
**Documentation**: https://aladhan.com/prayer-times-api  
**Calculation Methods**: https://aladhan.com/calculation-methods

## Why AlAdhan API?

1. **Accuracy**: Prayer times match local mosque and government authority timings
2. **Reliability**: Well-established API used by thousands of applications
3. **Multiple Methods**: Supports all major calculation methods (ISNA, MWL, Egypt, etc.)
4. **No API Key Required**: Free to use without authentication
5. **Global Coverage**: Works for any location worldwide

## Implementation

### Service Location
`src/services/prayer/aladhanApiService.ts`

### Key Features

1. **Automatic Method Selection**: Maps our calculation methods to AlAdhan's method numbers
2. **Caching**: 1-hour cache to reduce API calls
3. **Fallback**: Gracefully falls back to local calculation if API is unavailable
4. **Error Handling**: Comprehensive error handling with fallback mechanisms

### Calculation Method Mapping

| Our Method | AlAdhan Method ID | Description |
|-----------|------------------|-------------|
| ISNA | 2 | Islamic Society of North America (default for North America) |
| MWL | 3 | Muslim World League |
| Makkah | 4 | Umm al-Qura, Makkah |
| Egypt | 5 | Egyptian General Authority of Survey |
| Karachi | 1 | University of Islamic Sciences, Karachi |
| Tehran | 7 | Institute of Geophysics, University of Tehran |
| Jafari | 0 | Shia Ithna-Ashari, Leva Institute, Qum |

### Asr Method Mapping

| Our Method | AlAdhan School ID | Description |
|-----------|-------------------|-------------|
| Shafi | 0 | Standard (Shafi, Hanafi, Maliki, Hanbali) |
| Hanafi | 1 | Hanafi school |

## Usage

### Primary Flow

1. **API First**: Attempts to fetch from AlAdhan API
2. **Local Fallback**: If API fails, uses local calculation
3. **Caching**: Results are cached for 1 hour

### Example Request

```typescript
const prayerTimes = await fetchPrayerTimesFromAlAdhan(
  40.7128,  // latitude (New York)
  -74.006,  // longitude
  'ISNA',   // calculation method
  'Shafi',  // Asr method
  new Date() // date (optional, defaults to today)
);
```

### API Endpoint

```
GET https://api.aladhan.com/v1/timings/{date}
?latitude={lat}
&longitude={lon}
&method={method}
&school={school}
```

**Parameters:**
- `date`: DD-MM-YYYY format (e.g., "28-12-2025")
- `latitude`: Location latitude
- `longitude`: Location longitude
- `method`: Calculation method number (see mapping above)
- `school`: Asr method (0 = Shafi, 1 = Hanafi)

## Response Format

```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "timings": {
      "Fajr": "05:58",
      "Sunrise": "07:19",
      "Dhuhr": "11:58",
      "Asr": "14:18",
      "Maghrib": "16:36",
      "Isha": "17:58"
    },
    "date": {
      "readable": "28 Dec 2025",
      "timestamp": "1735401600"
    },
    "meta": {
      "latitude": 40.7128,
      "longitude": -74.006,
      "timezone": "America/New_York",
      "method": {
        "id": 2,
        "name": "Islamic Society of North America",
        "params": {
          "Fajr": 15,
          "Isha": 15
        }
      }
    }
  }
}
```

## Caching Strategy

- **Cache Duration**: 1 hour
- **Cache Key**: `{latitude},{longitude},{method},{asrMethod},{date}`
- **Cache Invalidation**: Automatic after 1 hour or manual via `clearPrayerTimesCache()`

## Error Handling

The service implements graceful degradation:

1. **API Unavailable**: Falls back to local calculation
2. **Network Error**: Falls back to local calculation
3. **Invalid Response**: Falls back to local calculation
4. **Timeout**: 10-second timeout, then fallback

## Integration Points

### usePrayerTimes Hook

The `usePrayerTimes` hook automatically:
1. Tries AlAdhan API first
2. Falls back to local calculation if API fails
3. Maintains the same interface (no breaking changes)

### Location

- `src/hooks/usePrayerTimes.ts`: Main hook that uses the API
- `src/services/prayer/aladhanApiService.ts`: API service implementation

## Benefits

1. **Accuracy**: Matches ICCNY and other local mosque timings
2. **Reliability**: Well-tested API with high uptime
3. **Flexibility**: Supports all calculation methods
4. **Offline Support**: Local calculation fallback ensures app works offline
5. **Performance**: Caching reduces API calls

## Testing

To test the API integration:

```typescript
import { fetchPrayerTimesFromAlAdhan } from '@services/prayer/aladhanApiService';

// Test with New York coordinates (ICCNY location)
const times = await fetchPrayerTimesFromAlAdhan(
  40.7128,
  -74.006,
  'ISNA',
  'Shafi'
);

console.log('Fajr:', times.fajr);
console.log('Dhuhr:', times.dhuhr);
// ... etc
```

## References

- **AlAdhan API**: https://aladhan.com/prayer-times-api
- **Calculation Methods**: https://aladhan.com/calculation-methods
- **ICCNY Prayer Times**: https://icc-ny.us/

## Notes

- The API is free and does not require an API key
- Rate limiting: No official limits, but we implement caching to be respectful
- The API handles timezone conversions automatically
- Prayer times are calculated for the exact date provided

