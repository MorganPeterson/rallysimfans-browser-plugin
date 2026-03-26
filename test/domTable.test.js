import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDirectTableRows,
  getDirectCells,
  defaultNormalize,
  getCellTexts,
} from '../src/domTable.js';

describe('domTable', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('getDirectTableRows returns only direct table rows by default including tfoot', () => {
    document.body.innerHTML = `
      <table id="t">
        <thead>
          <tr id="head-row"><th>Header</th></tr>
        </thead>
        <tbody>
          <tr id="body-row-1"><td>A</td></tr>
          <tr id="body-row-2">
            <td>
              <table>
                <tbody>
                  <tr id="nested-row"><td>Nested</td></tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr id="foot-row"><td>Foot</td></tr>
        </tfoot>
      </table>
    `;

    const table = document.getElementById('t');
    const rows = getDirectTableRows(table);

    expect(rows.map((row) => row.id)).toEqual([
      'head-row',
      'body-row-1',
      'body-row-2',
      'foot-row',
    ]);
  });

  it('getDirectTableRows can exclude tfoot rows', () => {
    document.body.innerHTML = `
      <table id="t">
        <thead><tr id="head-row"><th>Header</th></tr></thead>
        <tbody><tr id="body-row"><td>A</td></tr></tbody>
        <tfoot><tr id="foot-row"><td>Foot</td></tr></tfoot>
      </table>
    `;

    const table = document.getElementById('t');
    const rows = getDirectTableRows(table, { includeTfoot: false });

    expect(rows.map((row) => row.id)).toEqual(['head-row', 'body-row']);
  });

  it('getDirectCells returns direct cells only', () => {
    document.body.innerHTML = `
      <table>
        <tbody>
          <tr id="row">
            <th id="th1">Name</th>
            <td id="td1">
              Value
              <table>
                <tbody>
                  <tr><td id="nested-cell">Nested</td></tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const row = document.getElementById('row');
    const cells = getDirectCells(row);

    expect(cells.map((cell) => cell.id)).toEqual(['th1', 'td1']);
  });

  it('defaultNormalize trims and uppercases', () => {
    expect(defaultNormalize('  Diff. First  ')).toBe('DIFF. FIRST');
    expect(defaultNormalize(null)).toBe('');
  });

  it('getCellTexts returns normalized cell text', () => {
    document.body.innerHTML = `
      <table>
        <tbody>
          <tr id="row">
            <th>  pr </th>
            <td> wr </td>
          </tr>
        </tbody>
      </table>
    `;

    const row = document.getElementById('row');
    const texts = getCellTexts(row, defaultNormalize);

    expect(texts).toEqual(['PR', 'WR']);
  });
});