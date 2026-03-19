import { describe, it, expect } from 'vitest';
import {
  createStageStatsSummary,
  calculateMedian,
  summarizeStageStats,
} from '../src/stats.js';

describe('createStageStatsSummary', () => {
  it('creates an empty stats object', () => {
    expect(createStageStatsSummary()).toEqual({
      drivenCount: 0,
      undrivenCount: 0,
      drivenKm: 0,
      diffs: [],
    });
  });

  it('returns a fresh object each time', () => {
    const a = createStageStatsSummary();
    const b = createStageStatsSummary();

    expect(a).not.toBe(b);
    expect(a.diffs).not.toBe(b.diffs);
  });
});

describe('calculateMedian', () => {
  it('returns null for an empty array', () => {
    expect(calculateMedian([])).toBeNull();
  });

  it('returns the middle value for an odd-length array', () => {
    expect(calculateMedian([3, 1, 2])).toBe(2);
  });

  it('returns the average of the two middle values for an even-length array', () => {
    expect(calculateMedian([4, 1, 3, 2])).toBe(2.5);
  });

  it('works with decimal values', () => {
    expect(calculateMedian([1.2, 3.4, 2.2])).toBe(2.2);
  });

  it('does not mutate the input array', () => {
    const values = [4, 1, 3, 2];
    const copy = [...values];

    calculateMedian(values);

    expect(values).toEqual(copy);
  });
});

describe('summarizeStageStats', () => {
  it('returns null metrics for empty stats', () => {
    const stats = createStageStatsSummary();

    expect(summarizeStageStats(stats)).toEqual({
      drivenCount: 0,
      undrivenCount: 0,
      drivenKm: 0,
      totalCount: 0,
      average: null,
      median: null,
      best: null,
      worst: null,
      consistency: null,
    });
  });

  it('summarizes a single driven stage', () => {
    const stats = {
      drivenCount: 1,
      undrivenCount: 0,
      drivenKm: 12.5,
      diffs: [1.75],
    };

    expect(summarizeStageStats(stats)).toEqual({
      drivenCount: 1,
      undrivenCount: 0,
      drivenKm: 12.5,
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
      drivenKm: 48.3,
      diffs: [1.0, 2.0, 4.0, 5.0],
    };

    expect(summarizeStageStats(stats)).toEqual({
      drivenCount: 4,
      undrivenCount: 2,
      drivenKm: 48.3,
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
      drivenKm: 60,
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
      drivenKm: 30,
      diffs: [3, 1, 2],
    };

    const original = {
      drivenCount: stats.drivenCount,
      undrivenCount: stats.undrivenCount,
      drivenKm: stats.drivenKm,
      diffs: [...stats.diffs],
    };

    summarizeStageStats(stats);

    expect(stats).toEqual(original);
  });

  it('handles negative diff values if present', () => {
    const stats = {
      drivenCount: 3,
      undrivenCount: 0,
      drivenKm: 30,
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
      drivenKm: 40,
      diffs: [1.0, 1.2, 1.3, 20.0],
    };

    const summary = summarizeStageStats(stats);

    expect(summary.median).toBe(1.25);
    expect(summary.average).toBeCloseTo(5.875, 10);
    expect(summary.consistency).toBeCloseTo(4.625, 10);
  });
});