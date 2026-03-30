import { describe, it, expect } from 'vitest';
import { parseKm, summarizeStageStats } from '../src/userstats.js';

describe('summarizeStageStats', () => {
  it('summarizes a single driven stage', () => {
    const stats = {
      drivenCount: 1,
      undrivenCount: 0,
      diffs: [1.75],
    };

    expect(summarizeStageStats(stats)).toEqual({
      drivenCount: 1,
      undrivenCount: 0,
      totalCount: 1,
      average: 1.75,
      median: 1.75,
      best: 1.75,
      worst: 1.75,
      consistency: 0,
    });
  });

  it('summarizes multiple driven and undriven stages', () => {
    const stats = {
      drivenCount: 4,
      undrivenCount: 2,
      diffs: [1.0, 2.0, 4.0, 5.0],
    };

    expect(summarizeStageStats(stats)).toEqual({
      drivenCount: 4,
      undrivenCount: 2,
      totalCount: 6,
      average: 3,
      median: 3,
      best: 1,
      worst: 5,
      consistency: 0,
    });
  });

  it('calculates consistency as average minus median', () => {
    const stats = {
      drivenCount: 5,
      undrivenCount: 1,
      diffs: [1.0, 1.1, 1.2, 1.3, 6.0],
    };

    const summary = summarizeStageStats(stats);

    expect(summary.average).toBe(2.12);
    expect(summary.median).toBe(1.2);
    expect(summary.best).toBe(1.0);
    expect(summary.worst).toBe(6.0);
    expect(summary.consistency).toBeCloseTo(0.92, 10);
    expect(summary.totalCount).toBe(6);
  });

  it('does not mutate the input stats object', () => {
    const stats = {
      drivenCount: 3,
      undrivenCount: 1,
      diffs: [3, 1, 2],
    };

    const original = {
      drivenCount: stats.drivenCount,
      undrivenCount: stats.undrivenCount,
      diffs: [...stats.diffs],
    };

    summarizeStageStats(stats);

    expect(stats).toEqual(original);
  });

  it('handles negative diff values if present', () => {
    const stats = {
      drivenCount: 3,
      undrivenCount: 0,
      diffs: [-0.5, 1.0, 2.0],
    };

    const summary = summarizeStageStats(stats);

    expect(summary.best).toBe(-0.5);
    expect(summary.worst).toBe(2.0);
    expect(summary.average).toBeCloseTo(0.8333333333, 10);
  });

  it('handles outlier diff values', () => {
    const stats = {
      drivenCount: 4,
      undrivenCount: 0,
      diffs: [1.0, 1.2, 1.3, 20.0],
    };

    const summary = summarizeStageStats(stats);

    expect(summary.median).toBe(1.25);
    expect(summary.average).toBeCloseTo(5.875, 10);
    expect(summary.consistency).toBeCloseTo(4.625, 10);
  });
});

describe('parseKm', () => {
  describe('valid inputs', () => {
    it('parses integer km values', () => {
      expect(parseKm('12 km')).toBe(12);
    });

    it('parses decimal km values with dot', () => {
      expect(parseKm('13.4 km')).toBe(13.4);
    });

    it('parses decimal km values with comma', () => {
      expect(parseKm('9,7 km')).toBe(9.7);
    });

    it('trims surrounding whitespace', () => {
      expect(parseKm('  8.5 km  ')).toBe(8.5);
    });

    it('accepts uppercase unit', () => {
      expect(parseKm('10 KM')).toBe(10);
    });
  });

  describe('invalid inputs', () => {
    it('returns null for nullish or non-string values', () => {
      expect(parseKm(null)).toBeNull();
      expect(parseKm(undefined)).toBeNull();
      expect(parseKm(12)).toBeNull();
    });

    it('returns null for empty strings', () => {
      expect(parseKm('')).toBeNull();
      expect(parseKm('   ')).toBeNull();
    });

    it('rejects missing unit', () => {
      expect(parseKm('13.4')).toBeNull();
    });

    it('rejects wrong unit', () => {
      expect(parseKm('13.4 mi')).toBeNull();
      expect(parseKm('13.4 m')).toBeNull();
    });

    it('rejects malformed values', () => {
      expect(parseKm('abc')).toBeNull();
      expect(parseKm('13..4 km')).toBeNull();
      expect(parseKm('13,4,5 km')).toBeNull();
      expect(parseKm('13km')).toBe(13); // keep or remove depending on your intended behavior
    });

    it('rejects extra trailing text', () => {
      expect(parseKm('13.4 km extra')).toBeNull();
    });

    it('rejects negative values', () => {
      expect(parseKm('-5 km')).toBeNull();
    });
  });
});

