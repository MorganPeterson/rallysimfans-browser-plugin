import { setSecondsPerKmCell } from './format.js';

export function createSecondsPerKmHeaderCell(title) {
  const th = document.createElement('td');
  th.className = 'rsf-plugin-header';
  th.textContent = 's/km';
  th.title = title;
  return th;
}

export function insertSecondsPerKmHeaderAfter(row, afterCellIndex, title) {
  const cells = row.cells;

  if (afterCellIndex < 0 || afterCellIndex >= cells.length) {
    return null;
  }

  const th = createSecondsPerKmHeaderCell(title);
  cells[afterCellIndex].insertAdjacentElement('afterend', th);
  return th;
}

export function appendSecondsPerKmHeader(row, title) {
  const th = createSecondsPerKmHeaderCell(title);
  row.appendChild(th);
  return th;
}

export function createSecondsPerKmDataCell(spkm, options = {}) {
  const td = document.createElement('td');
  setSecondsPerKmCell(td, spkm, options);
  return td;
}

export function insertSecondsPerKmDataCellAfter(row, afterCellIndex, spkm, options = {}) {
  const cells = row.cells;

  if (afterCellIndex < 0 || afterCellIndex >= cells.length) {
    return null;
  }

  const td = createSecondsPerKmDataCell(spkm, options);
  cells[afterCellIndex].insertAdjacentElement('afterend', td);
  return td;
}

export function appendSecondsPerKmDataCell(row, spkm, options = {}) {
  const td = createSecondsPerKmDataCell(spkm, options);
  row.appendChild(td);
  return td;
}