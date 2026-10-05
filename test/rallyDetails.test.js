import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseBudapestDateTime,
  parseLegRange,
  formatLocalDateTimeRange,
} from '../src/rallyDetails.js';
import {rsfCache} from '../src/core/cache.js';

beforeEach(() => {
  rsfCache.clear();
});

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

  it('parses different leg ranges for the same rally id', () => {
    const leg1 = parseLegRange('2026-10-02 08:00 - 2026-10-10 23:59');
    const leg2 = parseLegRange('2026-10-03 08:00 - 2026-10-11 23:59');
    const leg3 = parseLegRange('2026-10-04 08:00 - 2026-10-12 23:59');

    expect(leg1).not.toBeNull();
    expect(leg2).not.toBeNull();
    expect(leg3).not.toBeNull();

    expect(leg1.start.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-10-02 08:00');
    expect(leg1.end.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-10-10 23:59');

    expect(leg2.start.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-10-03 08:00');
    expect(leg2.end.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-10-11 23:59');

    expect(leg3.start.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-10-04 08:00');
    expect(leg3.end.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-10-12 23:59');
  });

  it('handles repeated and differing leg ranges within the same rally', () => {
    const ranges = [
      '2026-10-02 08:00 - 2026-10-10 23:59',
      '2026-10-02 08:00 - 2026-10-10 23:59',
      '2026-10-03 08:00 - 2026-10-11 23:59',
      '2026-10-04 08:00 - 2026-10-12 23:59',
      '2026-10-05 08:00 - 2026-10-13 23:59',
      '2026-10-06 08:00 - 2026-10-14 23:59',
    ];

    const parsed = ranges.map((text) => parseLegRange(text));

    expect(
      parsed.map((range) => range.start.toFormat('yyyy-MM-dd HH:mm'))
    ).toEqual([
      '2026-10-02 08:00',
      '2026-10-02 08:00',
      '2026-10-03 08:00',
      '2026-10-04 08:00',
      '2026-10-05 08:00',
      '2026-10-06 08:00',
    ]);

    expect(
      parsed.map((range) => range.end.toFormat('yyyy-MM-dd HH:mm'))
    ).toEqual([
      '2026-10-10 23:59',
      '2026-10-10 23:59',
      '2026-10-11 23:59',
      '2026-10-12 23:59',
      '2026-10-13 23:59',
      '2026-10-14 23:59',
  ]);
});

  it('does not reuse a previous range when only the times differ', () => {
    const first = parseLegRange(
      '2026-10-05 08:00 - 2026-10-10 23:59'
    );

    const second = parseLegRange(
      '2026-10-05 09:00 - 2026-10-10 22:30'
    );

    expect(second.start.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-10-05 09:00');
    expect(second.end.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-10-10 22:30');

    expect(second.start.toMillis()).not.toBe(first.start.toMillis());
    expect(second.end.toMillis()).not.toBe(first.end.toMillis());
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