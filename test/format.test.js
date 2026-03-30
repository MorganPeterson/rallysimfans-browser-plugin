import { describe, it, expect } from 'vitest';
import {
  getSecondsPerKmClass,
  getConsistencyClass,
} from '../src/core/format.js';

describe('getSecondsPerKmClass', () => {
  it('returns na for null', () => {
    expect(getSecondsPerKmClass(null)).toBe('rsf-plugin-diff--na');
  });

  it('uses great for <= 1', () => {
    expect(getSecondsPerKmClass(1)).toBe('rsf-plugin-diff--great');
  });

  it('uses ok for > 1 and <= 3', () => {
    expect(getSecondsPerKmClass(2)).toBe('rsf-plugin-diff--ok');
  });

  it('uses slow for > 3 and <= 6', () => {
    expect(getSecondsPerKmClass(5)).toBe('rsf-plugin-diff--slow');
  });

  it('uses bad for > 6', () => {
    expect(getSecondsPerKmClass(7)).toBe('rsf-plugin-diff--bad');
  });
});

describe('getConsistencyClass', () => {
  it('returns na for null', () => {
    expect(getConsistencyClass(null)).toBe('rsf-plugin-diff--na');
  });

  it('uses great for <= 0.25', () => {
    expect(getConsistencyClass(0.25)).toBe('rsf-plugin-diff--great');
  });

  it('uses ok for > 0.25 and <= 0.75', () => {
    expect(getConsistencyClass(0.5)).toBe('rsf-plugin-diff--ok');
  });

  it('uses slow for > 0.75 and <= 1.5', () => {
    expect(getConsistencyClass(1.0)).toBe('rsf-plugin-diff--slow');
  });

  it('uses bad for > 1.5', () => {
    expect(getConsistencyClass(2.0)).toBe('rsf-plugin-diff--bad');
  });
});