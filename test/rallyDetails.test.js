import { describe, it, expect } from 'vitest';
import {
  parseBudapestDateTime,
  parseLegRange,
  formatLocalDateTimeRange,
} from '../src/rallyListDetails/rallyDetails.js';

describe('parseBudapestDateTime', () => {
  it('parses a valid Budapest datetime', () => {
    const dt = parseBudapestDateTime('2026-03-12 23:59');

    expect(dt).not.toBeNull();
    expect(dt.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-03-12 23:59');
    expect(dt.zoneName).toBe('Europe/Budapest');
  });

  it('returns null for invalid input', () => {
    expect(parseBudapestDateTime('not a date')).toBeNull();
    expect(parseBudapestDateTime('2026/03/12 23:59')).toBeNull();
    expect(parseBudapestDateTime('')).toBeNull();
  });
});

describe('parseLegRange', () => {
  it('parses a valid leg range', () => {
    const range = parseLegRange('2026-03-12 23:59 - 2026-03-19 23:59');

    expect(range).not.toBeNull();
    expect(range.start.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-03-12 23:59');
    expect(range.end.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-03-19 23:59');
    expect(range.start.zoneName).toBe('Europe/Budapest');
    expect(range.end.zoneName).toBe('Europe/Budapest');
  });

  it('returns null for malformed ranges', () => {
    expect(parseLegRange('2026-03-12 23:59')).toBeNull();
    expect(parseLegRange('2026-03-12 23:59 to 2026-03-19 23:59')).toBeNull();
    expect(parseLegRange('abc - def')).toBeNull();
  });
});

describe('formatLocalDateTimeRange', () => {
  it('formats a Budapest range in Phoenix time', () => {
    const range = parseLegRange('2026-03-12 23:59 - 2026-03-19 23:59');

    const formatted = formatLocalDateTimeRange(
      range.start,
      range.end,
      'America/Phoenix'
    );

    expect(formatted).toBe('2026-03-12 15:59 - 2026-03-19 15:59');
  });

  it('formats a Budapest range in UTC', () => {
    const range = parseLegRange('2026-03-12 23:59 - 2026-03-19 23:59');

    const formatted = formatLocalDateTimeRange(
      range.start,
      range.end,
      'UTC'
    );

    expect(formatted).toBe('2026-03-12 22:59 - 2026-03-19 22:59');
  });
});