import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseTimeToSeconds,
  parseKm,
  parseStageResultsTable,
  parseStageResultsRow,
  parseStageResultGap
} from '../src/core/parse.js';

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
      competitorId: 98705,
      carDetails: {
        base_class_id: 30,
        base_class_name: "Group A8",
        car_name: "Audi 200 quattro GrpA",
        carmodel_id: 165,
        id: 72,
        sub_class_id: 30,
        sub_class_name: "Group A8 (pre-1990)",
      },
      position: 12,
      isSR: false,
      isCurrentUser: true,
      stageTimeSec: null,
      gapToPrevSec: 8.157,
      gapToLeaderSec: 45.42,
      rowClassName: "lista_kiemelt2",
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
      competitorId: 134389,
      carDetails: {
        base_class_id: 33,
        base_class_name: "Group R1",
        car_name: "Citroen DS3 R1",
        carmodel_id: 143,
        id: 25,
        sub_class_id: null,
        sub_class_name: undefined,
      },
      position: null,
      isSR: true,
      isCurrentUser: false,
      stageTimeSec: null,
      gapToPrevSec: 48.738,
      gapToLeaderSec: 132.529,
      rowClassName: "paros_sr",
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
    expect(rows[1].position).toBe(2);
    expect(rows[1].isSR).toBe(true);
  });
});

it('marks highlighted row as current user', () => {
  document.body.innerHTML = `
    <table>
      <tbody>
        <tr class="lista_kiemelt2">
          <td class="stage_results_poz">5</td>
          <td class="stage_results_name">
            <a>
              <samp><b>User123</b></samp>
              <samp> / Real Name</samp>
            </a>
            <br>
            <samp>Car Name</samp>
          </td>
          <td class="stage_results_time">1:23.456</td>
          <td class="stage_results_diff_prev">01.000</td>
          <td class="stage_results_diff_first">05.000</td>
          <td class="stage_results_comment"></td>
        </tr>
      </tbody>
    </table>
  `;

  const row = document.querySelector('tr');
  const parsed = parseStageResultsRow(row);

  expect(parsed).not.toBeNull();
  expect(parsed.isCurrentUser).toBe(true);
});

it('does not mark non-highlighted row as current user', () => {
  document.body.innerHTML = `
    <table>
      <tbody>
        <tr>
          <td class="stage_results_poz">5</td>
          <td class="stage_results_name">
            <a>
              <samp><b>User123</b></samp>
              <samp> / Real Name</samp>
            </a>
            <br>
            <samp>Car Name</samp>
          </td>
          <td class="stage_results_time">1:23.456</td>
          <td class="stage_results_diff_prev">01.000</td>
          <td class="stage_results_diff_first">05.000</td>
          <td class="stage_results_comment"></td>
        </tr>
      </tbody>
    </table>
  `;

  const row = document.querySelector('tr');
  const parsed = parseStageResultsRow(row);

  expect(parsed).not.toBeNull();
  expect(parsed.isCurrentUser).toBe(false);
});

describe('parseStageResultsRow', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('treats leader dash gaps as zero for a classified P1 row', () => {
    document.body.innerHTML = `
      <table>
        <tbody>
          <tr class="lista_kiemelt2">
            <td class="stage_results_poz">1</td>
            <td class="stage_results_name">
              Driver Name
              <samp>Ford Escort RS 1600</samp>
            </td>
            <td class="stage_results_time"><b>3:21.500</b></td>
            <td class="stage_results_diff_prev">-</td>
            <td class="stage_results_diff_first">-</td>
          </tr>
        </tbody>
      </table>
    `;

    const row = document.querySelector('tr');
    const parsed = parseStageResultsRow(row);

    expect(parsed).not.toBeNull();
    expect(parsed.position).toBe(1);
    expect(parsed.isSR).toBe(false);
    expect(parsed.gapToPrevSec).toBe(0);
    expect(parsed.gapToLeaderSec).toBe(0);
  });

  it('does not force SR dash gaps to zero', () => {
    document.body.innerHTML = `
      <table>
        <tbody>
          <tr>
            <td class="stage_results_poz">SR</td>
            <td class="stage_results_name">
              Driver Name
              <samp>Ford Escort RS 1600</samp>
            </td>
            <td class="stage_results_time">-</td>
            <td class="stage_results_diff_prev">-</td>
            <td class="stage_results_diff_first">-</td>
          </tr>
        </tbody>
      </table>
    `;

    const row = document.querySelector('tr');
    const parsed = parseStageResultsRow(row);

    expect(parsed).not.toBeNull();
    expect(parsed.position).toBeNull();
    expect(parsed.isSR).toBe(true);
    expect(parsed.gapToPrevSec).toBeNull();
    expect(parsed.gapToLeaderSec).toBeNull();
  });

  it('parses normal classified gaps unchanged for non-leader rows', () => {
    document.body.innerHTML = `
      <table>
        <tbody>
          <tr>
            <td class="stage_results_poz">2</td>
            <td class="stage_results_name">
              Driver Name
              <samp>Ford Escort RS 1600</samp>
            </td>
            <td class="stage_results_time"><b>3:24.000</b></td>
            <td class="stage_results_diff_prev">+2.500</td>
            <td class="stage_results_diff_first">+2.500</td>
          </tr>
        </tbody>
      </table>
    `;

    const row = document.querySelector('tr');
    const parsed = parseStageResultsRow(row);

    expect(parsed).not.toBeNull();
    expect(parsed.position).toBe(2);
    expect(parsed.isSR).toBe(false);
    expect(parsed.gapToPrevSec).toBe(2.5);
    expect(parsed.gapToLeaderSec).toBe(2.5);
  });
});