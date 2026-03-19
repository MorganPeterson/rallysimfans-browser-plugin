import { describe, it, expect } from 'vitest';
import { parseTimeToSeconds, parseKm } from '../src/parse.js';

describe('parseTimeToSeconds', () => {
  describe('valid inputs', () => {
    it('parses whole seconds', () => {
      expect(parseTimeToSeconds('45')).toBe(45);
    });

    it('parses decimal seconds with dot', () => {
      expect(parseTimeToSeconds('45.321')).toBe(45.321);
    });

    it('parses decimal seconds with comma', () => {
      expect(parseTimeToSeconds('45,321')).toBe(45.321);
    });

    it('parses minutes and seconds', () => {
      expect(parseTimeToSeconds('1:23')).toBe(83);
    });

    it('parses minutes and decimal seconds', () => {
      expect(parseTimeToSeconds('1:23.456')).toBe(83.456);
    });

    it('parses hours, minutes, and seconds', () => {
      expect(parseTimeToSeconds('2:01:09')).toBe(7269);
    });

    it('parses hours, minutes, and decimal seconds', () => {
      expect(parseTimeToSeconds('2:01:09.5')).toBe(7269.5);
    });

    it('trims surrounding whitespace', () => {
      expect(parseTimeToSeconds('  1:23.5  ')).toBe(83.5);
    });

    it('accepts leading zeros', () => {
      expect(parseTimeToSeconds('01:02:03.400')).toBe(3723.4);
    });
  });

  describe('invalid inputs', () => {
    it('returns null for null', () => {
      expect(parseTimeToSeconds(null)).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(parseTimeToSeconds(undefined)).toBeNull();
    });

    it('returns null for non-strings', () => {
      expect(parseTimeToSeconds(123)).toBeNull();
      expect(parseTimeToSeconds({})).toBeNull();
      expect(parseTimeToSeconds([])).toBeNull();
    });

    it('returns null for empty strings', () => {
      expect(parseTimeToSeconds('')).toBeNull();
      expect(parseTimeToSeconds('   ')).toBeNull();
    });

    it('returns null for placeholder values', () => {
      expect(parseTimeToSeconds('-')).toBeNull();
      expect(parseTimeToSeconds('n/a')).toBeNull();
      expect(parseTimeToSeconds('N/A')).toBeNull();
    });

    it('rejects too many parts', () => {
      expect(parseTimeToSeconds('1:2:3:4')).toBeNull();
    });

    it('rejects malformed numbers', () => {
      expect(parseTimeToSeconds('abc')).toBeNull();
      expect(parseTimeToSeconds('1:xx')).toBeNull();
      expect(parseTimeToSeconds('1:23abc')).toBeNull();
      expect(parseTimeToSeconds('12abc')).toBeNull();
    });

    it('rejects decimals in non-final parts', () => {
      expect(parseTimeToSeconds('1.5:23')).toBeNull();
      expect(parseTimeToSeconds('1:2.5:10')).toBeNull();
    });

    it('rejects invalid minute/second ranges', () => {
      expect(parseTimeToSeconds('1:60')).toBeNull();
      expect(parseTimeToSeconds('1:99')).toBeNull();
      expect(parseTimeToSeconds('1:60:10')).toBeNull();
      expect(parseTimeToSeconds('1:10:60')).toBeNull();
    });

    it('rejects negative values', () => {
      expect(parseTimeToSeconds('-1')).toBeNull();
      expect(parseTimeToSeconds('-1:23')).toBeNull();
      expect(parseTimeToSeconds('1:-23')).toBeNull();
    });

    it('rejects repeated separators', () => {
      expect(parseTimeToSeconds('1::23')).toBeNull();
      expect(parseTimeToSeconds('1:23.4.5')).toBeNull();
      expect(parseTimeToSeconds('1:23,4,5')).toBeNull();
    });
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