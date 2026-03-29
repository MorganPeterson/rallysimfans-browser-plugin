import { describe, it, expect } from 'vitest';
import {
  calculateMedian,
  summarizeStageResults
} from '../src/core/stats.js';

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

describe('summarizeStageResults', () => {
  it('returns empty summary for no rows', () => {
    expect(summarizeStageResults([])).toEqual({
      totalDrivers: 0,
      srCount: 0,
      srRate: null,
      classifiedCount: 0,
      classifiedRows: [],
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
      positionSensitivity: 2.75,
      classifiedRows: [
        {
          gapToLeaderSec: 0,
          isSR: false,
          position: 1,
        },
        {
          gapToLeaderSec: 2.5,
          isSR: false,
          position: 2,
        },
        {
          gapToLeaderSec: 5,
          isSR: false,
          position: 3,
        },
        {
          gapToLeaderSec: 9,
          isSR: false,
          position: 4,
        },
        {
          gapToLeaderSec: 12,
          isSR: false,
          position: 5,
        },
      ],
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