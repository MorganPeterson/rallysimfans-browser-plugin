import { describe, it, expect, beforeEach } from 'vitest';
import {
  findFirstMatchingTable,
  findBestMatchingTable,
  findHeaderRow,
  tableHasMatchingRow,
  findColumnIndexByHeaderText,
} from '../src/core/tableDetection.js';

describe('tableDetection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('findHeaderRow finds a header row by labels', () => {
    document.body.innerHTML = `
      <table id="t">
        <tbody>
          <tr><td>Banner</td></tr>
          <tr id="header-row">
            <td>PR</td>
            <td>WR</td>
            <td>Km</td>
          </tr>
          <tr><td>1:00.0</td><td>0:58.0</td><td>5.0 km</td></tr>
        </tbody>
      </table>
    `;

    const rows = Array.from(document.querySelectorAll('#t > tbody > tr'));
    const result = findHeaderRow(rows, ['PR', 'WR']);

    expect(result).not.toBeNull();
    expect(result.headerRow.id).toBe('header-row');
    expect(result.headerRowIdx).toBe(1);
  });

  it('tableHasMatchingRow returns true when a predicate matches', () => {
    document.body.innerHTML = `
      <table id="t">
        <tbody>
          <tr><td>Leg 1:</td><td>2026-01-01 10:00 - 2026-01-01 12:00</td></tr>
          <tr><td>Other:</td><td>Value</td></tr>
        </tbody>
      </table>
    `;

    const rows = Array.from(document.querySelectorAll('#t > tbody > tr'));
    const hasLeg = tableHasMatchingRow(rows, (row) => {
      const firstCell = row.cells[0];
      return !!firstCell && /^Leg\s+\d+:$/i.test(firstCell.textContent.trim());
    });

    expect(hasLeg).toBe(true);
  });

  it('findFirstMatchingTable returns the first matching table context', () => {
    document.body.innerHTML = `
      <table id="bad">
        <tbody>
          <tr><td>Foo</td><td>Bar</td></tr>
        </tbody>
      </table>

      <table id="good">
        <tbody>
          <tr><td>Banner</td></tr>
          <tr><td>Surface</td><td>Name</td></tr>
          <tr><td>Gravel</td><td>Stage A</td></tr>
        </tbody>
      </table>
    `;

    const found = findFirstMatchingTable({
      selector: 'table',
      includeTfoot: false,
      match: ({ rows }) => {
        const headerInfo = findHeaderRow(rows, ['Surface']);
        return !!headerInfo;
      },
    });

    expect(found).not.toBeNull();
    expect(found.table.id).toBe('good');
    expect(found.rows).toHaveLength(3);
  });

  it('findBestMatchingTable returns the highest scoring table', () => {
    document.body.innerHTML = `
      <table id="weak">
        <tbody>
          <tr><td><a href="?centerbox=rally_list.php">Link</a></td></tr>
        </tbody>
      </table>

      <table id="strong">
        <tbody>
          <tr><td><a href="?centerbox=rally_results.php&rally_id=1">Rally 1</a></td><td>Open</td></tr>
          <tr><td><a href="?centerbox=rally_results.php&rally_id=2">Rally 2</a></td><td>Open</td></tr>
        </tbody>
      </table>
    `;

    const found = findBestMatchingTable({
      selector: 'table',
      includeTfoot: false,
      minScore: 1,
      score: ({ rows }) => {
        let score = 0;
        for (const row of rows) {
          const link = row.querySelector('a[href]');
          if (link) score += 1;
          if (row.cells.length >= 2) score += 2;
        }
        return score;
      },
    });

    expect(found).not.toBeNull();
    expect(found.table.id).toBe('strong');
    expect(found.score).toBeGreaterThan(0);
  });

  it('findColumnIndexByHeaderText finds a column case-insensitively', () => {
    document.body.innerHTML = `
      <table>
        <tbody>
          <tr id="header">
            <td>#</td>
            <td>Driver</td>
            <td>Diff. First</td>
          </tr>
        </tbody>
      </table>
    `;

    const headerRow = document.getElementById('header');

    expect(findColumnIndexByHeaderText(headerRow, 'Diff. First')).toBe(2);
    expect(findColumnIndexByHeaderText(headerRow, 'diff. first')).toBe(2);
    expect(findColumnIndexByHeaderText(headerRow, 'Surface')).toBe(-1);
  });
});