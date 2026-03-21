import { describe, it, expect } from 'vitest';
import {
  createStageStatsSummary,
  calculateMedian,
  summarizeStageStats,
  summarizeStageResults
} from '../src/stats.js';

describe('createStageStatsSummary', () => {
  it('creates an empty stats object', () => {
    expect(createStageStatsSummary()).toEqual({
      drivenCount: 0,
      undrivenCount: 0,
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

describe('summarizeStageResults', () => {
  it('returns empty summary for no rows', () => {
    expect(summarizeStageResults([])).toEqual({
      totalDrivers: 0,
      srCount: 0,
      srRate: null,
      classifiedCount: 0,
      top5Compression: null,
      top10Compression: null,
      positionSensitivity: null,
    });
  });

  it('computes summary stats for classified finishers and SR rows', () => {
    const rows = [
      { position: 1, isSR: false, gapToLeaderSec: 0 },
      { position: 2, isSR: false, gapToLeaderSec: 2.5 },
      { position: 3, isSR: false, gapToLeaderSec: 5.0 },
      { position: 4, isSR: false, gapToLeaderSec: 9.0 },
      { position: 5, isSR: false, gapToLeaderSec: 12.0 },
      { position: null, isSR: true, gapToLeaderSec: 100.0 },
    ];

    expect(summarizeStageResults(rows)).toEqual({
      totalDrivers: 6,
      srCount: 1,
      srRate: 1 / 6,
      classifiedCount: 5,
      top5Compression: 12,
      top10Compression: null,
      positionSensitivity: 2.75,
    });
  });

  it('computes top10 compression when at least 10 classified finishers exist', () => {
    const rows = [
      { position: 1, isSR: false, gapToLeaderSec: 0 },
      { position: 2, isSR: false, gapToLeaderSec: 1 },
      { position: 3, isSR: false, gapToLeaderSec: 2 },
      { position: 4, isSR: false, gapToLeaderSec: 3 },
      { position: 5, isSR: false, gapToLeaderSec: 4 },
      { position: 6, isSR: false, gapToLeaderSec: 5 },
      { position: 7, isSR: false, gapToLeaderSec: 6 },
      { position: 8, isSR: false, gapToLeaderSec: 7 },
      { position: 9, isSR: false, gapToLeaderSec: 8 },
      { position: 10, isSR: false, gapToLeaderSec: 9 },
    ];

    const summary = summarizeStageResults(rows);

    expect(summary.classifiedCount).toBe(10);
    expect(summary.top5Compression).toBe(4);
    expect(summary.top10Compression).toBe(9);
    expect(summary.positionSensitivity).toBe(1);
  });

  it('ignores SR rows for compression and position sensitivity', () => {
    const rows = [
      { position: 1, isSR: false, gapToLeaderSec: 0 },
      { position: 2, isSR: false, gapToLeaderSec: 3 },
      { position: null, isSR: true, gapToLeaderSec: 20 },
      { position: null, isSR: true, gapToLeaderSec: 20 },
    ];

    const summary = summarizeStageResults(rows);

    expect(summary.totalDrivers).toBe(4);
    expect(summary.srCount).toBe(2);
    expect(summary.classifiedCount).toBe(2);
    expect(summary.top5Compression).toBeNull();
    expect(summary.top10Compression).toBeNull();
    expect(summary.positionSensitivity).toBe(3);
  });

  it('sorts by position when available', () => {
    const rows = [
      { position: 3, isSR: false, gapToLeaderSec: 8 },
      { position: 1, isSR: false, gapToLeaderSec: 0 },
      { position: 2, isSR: false, gapToLeaderSec: 3 },
    ];

    const summary = summarizeStageResults(rows);

    expect(summary.classifiedCount).toBe(3);
    expect(summary.positionSensitivity).toBe(4); // (3 + 5) / 2
  });
});