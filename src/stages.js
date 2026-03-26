import { getDirectCells } from './domTable.js';
import { findFirstMatchingTable, findHeaderRow } from './tableDetection.js';

const SURFACES = ['gravel', 'tarmac', 'snow'];

export function addStagesFilter() {
  const found = findStagesSurfaceTable();
  if (!found) return;

  const { table: targetTable, surfaceColIdx, dataRows } = found;
  if (targetTable.dataset.rsfStagesFilterDone === '1') return;
  targetTable.dataset.rsfStagesFilterDone = '1';

  const bar = document.createElement('div');
  bar.className = 'rsf-plugin-filter rsf-plugin-surface-bar';
  bar.innerHTML = SURFACES.map((surface) => `
    <label class="rsf-plugin-surface-label rsf-plugin-surface-${surface}">
      <input
        type="checkbox"
        class="rsf-plugin-surface-cb"
        value="${surface}"
        checked
      >
      ${surface[0].toUpperCase() + surface.slice(1)}
    </label>
  `).join('');

  targetTable.insertAdjacentElement('beforebegin', bar);

  function applyFilter() {
    const checked = new Set(
      Array.from(
        bar.querySelectorAll('.rsf-plugin-surface-cb:checked'),
        (cb) => cb.value
      )
    );

    const showAll = checked.size === 0 || checked.size === SURFACES.length;

    for (const row of dataRows) {
      const cells = getDirectCells(row, ':scope > td');
      if (cells.length <= surfaceColIdx) continue;

      const surface = cells[surfaceColIdx].textContent.trim().toLowerCase();
      row.style.display = showAll || checked.has(surface) ? '' : 'none';
    }
  }

  bar.querySelectorAll('.rsf-plugin-surface-cb').forEach((cb) => {
    cb.addEventListener('change', applyFilter);
  });

  applyFilter();
}

function findStagesSurfaceTable() {
  const found = findFirstMatchingTable({
    selector: 'table',
    includeTfoot: false,
    match: ({ rows }) => {
      const headerInfo = findSurfaceHeader(rows);
      if (!headerInfo) return false;

      const { headerRowIdx, surfaceColIdx } = headerInfo;
      const dataRows = rows.slice(headerRowIdx + 1);

      return hasKnownSurfaceData(dataRows, surfaceColIdx);
    },
  });

  if (!found) return null;

  const headerInfo = findSurfaceHeader(found.rows);
  if (!headerInfo) return null;

  const { headerRow, headerRowIdx, surfaceColIdx } = headerInfo;
  const dataRows = found.rows.slice(headerRowIdx + 1);

  return {
    table: found.table,
    rows: found.rows,
    headerRow,
    headerRowIdx,
    surfaceColIdx,
    dataRows,
  };
}

function findSurfaceHeader(rows) {
  const headerInfo = findHeaderRow(rows, ['Surface']);
  if (!headerInfo) return null;

  const headerCells = getDirectCells(headerInfo.headerRow);
  const surfaceColIdx = headerCells.findIndex(
    (cell) => cell.textContent.trim().toLowerCase() === 'surface'
  );

  if (surfaceColIdx === -1) return null;

  return {
    ...headerInfo,
    surfaceColIdx,
  };
}

function hasKnownSurfaceData(rows, surfaceColIdx) {
  return rows.some((row) => {
    const cells = getDirectCells(row, ':scope > td');
    if (cells.length <= surfaceColIdx) return false;

    const value = cells[surfaceColIdx].textContent.trim().toLowerCase();
    return SURFACES.includes(value);
  });
}