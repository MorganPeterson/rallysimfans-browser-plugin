import { describe, it, expect } from 'vitest';
import {
  parseTimeToSeconds,
  parseKm,
  parseStageResultsTable,
  parseStageResultsRow,
  parseStageResultGap
} from '../src/parse.js';

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

describe('parseStageResultGap', () => {
  it('parses plain second diffs', () => {
    expect(parseStageResultGap('00.000')).toBe(0);
    expect(parseStageResultGap('02.619')).toBe(2.619);
    expect(parseStageResultGap('26.769')).toBe(26.769);
  });

  it('parses minute-second diffs', () => {
    expect(parseStageResultGap('1:12.189')).toBe(72.189);
    expect(parseStageResultGap('2:12.529')).toBe(132.529);
  });

  it('rejects placeholder dash values', () => {
    expect(parseStageResultGap('-')).toBeNull();
    expect(parseStageResultGap('- - -')).toBeNull();
    expect(parseStageResultGap('--')).toBeNull();
    expect(parseStageResultGap('—')).toBeNull();
    expect(parseStageResultGap('   ')).toBeNull();
  });

  it('accepts negative values', () => {
    expect(parseStageResultGap('-0.500')).toBe(-0.5);
    expect(parseStageResultGap('-1.250')).toBe(-1.25);
  });

  it('rejects malformed values', () => {
    expect(parseStageResultGap('abc')).toBeNull();
    expect(parseStageResultGap('1:99')).toBeNull();
    expect(parseStageResultGap('1:12.1.2')).toBeNull();
  });
});

describe('parseStageResultsRow', () => {
  it('parses a classified finisher row', () => {
    document.body.innerHTML = `
      <table>
        <tbody>
          <tr class="lista_kiemelt2">
            <td class="stage_results_poz" align="center">12</td>
            <td class="stage_results_name" align="left">
              <a href="usersstats.php?user_stats=98705" title="Stats">
                <samp><img src="images/flag/US.png" width="16" title="United States of America"> <b>Morgan P</b></samp>
                <samp> / Morgan Peterson</samp>
              </a>
              <br>
              <samp>Audi 200 quattro GrpA</samp>
            </td>
            <td class="stage_results_time" align="center">- - -</td>
            <td class="stage_results_diff_prev" align="center">08.157</td>
            <td class="stage_results_diff_first" align="center">45.420</td>
            <td class="stage_results_comment" align="center">
              <img src="images/comment.png" title="big spin undid the whole stage">
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const row = document.querySelector('tr');
    const parsed = parseStageResultsRow(row);

    expect(parsed).toEqual({
      position: 12,
      isSR: false,
      stageTimeSec: null,
      gapToPrevSec: 8.157,
      gapToLeaderSec: 45.42,
      rowClassName: 'lista_kiemelt2',
    });
  });

  it('parses an SR row', () => {
    document.body.innerHTML = `
      <table>
        <tbody>
          <tr class="paros_sr">
            <td class="stage_results_poz" align="center">SR</td>
            <td class="stage_results_name" align="left">
              <a href="usersstats.php?user_stats=134389" title="Stats">
                <samp><img src="images/flag/ES.png" width="16" title="Spain"> <b>A_Rovira</b></samp>
                <samp> / Arnau Rovira</samp>
              </a>
              <br>
              <samp>Citroen DS3 R1</samp>
            </td>
            <td class="stage_results_time" align="center">- - -</td>
            <td class="stage_results_diff_prev" align="center">48.738</td>
            <td class="stage_results_diff_first" align="center">2:12.529</td>
            <td class="stage_results_comment" align="center"></td>
          </tr>
        </tbody>
      </table>
    `;

    const row = document.querySelector('tr');
    const parsed = parseStageResultsRow(row);

    expect(parsed).toEqual({
      position: null,
      isSR: true,
      stageTimeSec: null,
      gapToPrevSec: 48.738,
      gapToLeaderSec: 132.529,
      rowClassName: 'paros_sr',
    });
  });

  it('returns null for invalid rows', () => {
    document.body.innerHTML = `<table><tbody><tr><td>bad</td></tr></tbody></table>`;
    const row = document.querySelector('tr');
    expect(parseStageResultsRow(row)).toBeNull();
  });
});

describe('parseStageResultsTable', () => {
  it('parses multiple rows from a stage results table', () => {
    document.body.innerHTML = `
      <table class="rally_results_stres_left" cellspacing="1" cellpadding="1">
        <tbody>
          <tr class="paros">
            <td class="stage_results_poz" align="center">1</td>
            <td class="stage_results_name" align="left">
              <a href="usersstats.php?user_stats=37259">
                <samp><img src="images/flag/FI.png" title="Finland"><b>Snapou</b></samp>
                <samp> / Sami Juvonen</samp>
              </a>
              <br>
              <samp>Ford Focus Mk II RS WRC 2006</samp>
            </td>
            <td class="stage_results_time" align="center">- - -</td>
            <td class="stage_results_diff_prev" align="center">00.000</td>
            <td class="stage_results_diff_first" align="center">00.000</td>
            <td class="stage_results_comment" align="center"></td>
          </tr>
          <tr class="paros_sr">
            <td class="stage_results_poz" align="center">SR</td>
            <td class="stage_results_name" align="left">
              <a href="usersstats.php?user_stats=134389">
                <samp><img src="images/flag/ES.png" title="Spain"><b>A_Rovira</b></samp>
                <samp> / Arnau Rovira</samp>
              </a>
              <br>
              <samp>Citroen DS3 R1</samp>
            </td>
            <td class="stage_results_time" align="center">- - -</td>
            <td class="stage_results_diff_prev" align="center">48.738</td>
            <td class="stage_results_diff_first" align="center">2:12.529</td>
            <td class="stage_results_comment" align="center"></td>
          </tr>
        </tbody>
      </table>
    `;

    const table = document.querySelector('table');
    const rows = parseStageResultsTable(table);

    expect(rows).toHaveLength(2);
    expect(rows[0].position).toBe(1);
    expect(rows[0].isSR).toBe(false);
    expect(rows[1].position).toBeNull();
    expect(rows[1].isSR).toBe(true);
  });
});