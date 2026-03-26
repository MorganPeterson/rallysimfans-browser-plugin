import { parseKm, parseTimeToSeconds } from './parse.js';
import { addUndrivenStage, addDrivenStage, createStageStatsSummary } from './stats.js';
import { insertStageStatsPanel, updateStageStatsPanel } from './summary.js';
import { insertSecondsPerKmHeaderAfter, insertSecondsPerKmDataCellAfter } from './secondsPerKmColumn.js';
import { findFirstMatchingTable, findHeaderRow } from './tableDetection.js';

export function addDiffColumn() {
  const found = findFirstMatchingTable({
    selector: 'table',
    includeTfoot: true,
    match: ({ rows }) => {
      if (rows.length < 2) return false;

      const headerInfo = findHeaderRow(rows, ['PR', 'WR']);
      if (!headerInfo) return false;

      const dataRows = rows.slice(headerInfo.headerRowIdx + 1);
      return !!detectColumns(headerInfo.headerRow, dataRows);
    },
  });

  if (!found) return;

  const table = found.table;
  if (table.dataset.rsfPluginDone) return;

  const rows = found.rows;
  const headerInfo = findHeaderRow(rows, ['PR', 'WR']);
  if (!headerInfo) return;

  const { headerRow, headerRowIdx } = headerInfo;
  const dataRows = rows.slice(headerRowIdx + 1);
  const cols = detectColumns(headerRow, dataRows);
  if (!cols) return;

  processStatsTable(table, headerRow, dataRows, cols);
}

// Find PR and WR indices from header text.
// Find km by scanning the first usable data row that contains a km value.
function detectColumns(headerRow, dataRows) {
  const headerCells = headerRow.cells;
  let prIdx = -1;
  let wrIdx = -1;

  for (let i = 0; i < headerCells.length; i++) {
    const text = headerCells[i].textContent.trim().toUpperCase();
    if (text === 'PR') prIdx = i;
    else if (text === 'WR') wrIdx = i;
  }

  if (prIdx === -1 || wrIdx === -1) return null;

  let kmIdx = -1;

  for (const row of dataRows) {
    const cells = row.cells;

    // Skip short/banner rows that cannot contain the needed columns.
    if (cells.length <= wrIdx) continue;

    for (let i = 0; i < cells.length; i++) {
      if (parseKm(cells[i].textContent) !== null) {
        kmIdx = i;
        break;
      }
    }

    if (kmIdx !== -1) break;
  }

  if (kmIdx === -1) return null;

  return { kmIdx, prIdx, wrIdx };
}

function processStatsTable(table, headerRow, dataRows, cols) {
  table.dataset.rsfPluginDone = '1';
  table.style.minWidth = table.offsetWidth + 'px';

  insertSecondsPerKmHeaderAfter(
    headerRow,
    cols.wrIdx,
    'Seconds per km slower than WR = (PR − WR) ÷ stage length'
  );

  let stats = createStageStatsSummary();

  for (const row of dataRows) {
    const result = insertDiffDataCell(row, cols, stats);
    if (result === 'undriven') {
      stats = addUndrivenStage(stats);
    }
  }

  const summaryPanel = insertStageStatsPanel(table);
  updateStageStatsPanel(summaryPanel, stats);

  if (stats.undrivenCount > 0) {
    insertUndrivenFilter(table, stats.undrivenCount);
  }
}

function insertDiffDataCell(row, cols, stats) {
  const cells = row.cells;

  if (
    cells.length <= cols.wrIdx ||
    cells.length <= cols.prIdx ||
    cells.length <= cols.kmIdx
  ) {
    return 'skip';
  }

  const km = parseKm(cells[cols.kmIdx].textContent);
  const prSec = parseTimeToSeconds(cells[cols.prIdx].textContent);
  const wrSec = parseTimeToSeconds(cells[cols.wrIdx].textContent);

  if (km && km > 0 && prSec !== null && wrSec !== null) {
    const diff = (prSec - wrSec) / km;
    insertSecondsPerKmDataCellAfter(row, cols.wrIdx, diff);
    stats = addDrivenStage(stats, diff, km);
    return 'ok';
  }

  insertSecondsPerKmDataCellAfter(row, cols.wrIdx, null);

  if (wrSec !== null) {
    row.classList.add('rsf-plugin-row-undriven');
    return 'undriven';
  }

  return 'na';
}

function insertUndrivenFilter(table, undrivenCount) {
  const filterBar = document.createElement('div');
  filterBar.className = 'rsf-plugin-filter';
  filterBar.innerHTML = `
    <label>
      <input type="checkbox" class="rsf-plugin-filter-cb">
      Hide undriven stages (${undrivenCount})
    </label>
  `;

  table.insertAdjacentElement('beforebegin', filterBar);

  const checkbox = filterBar.querySelector('.rsf-plugin-filter-cb');
  checkbox.addEventListener('change', (e) => {
    const hide = e.target.checked;
    table.querySelectorAll('.rsf-plugin-row-undriven').forEach((row) => {
      row.style.display = hide ? 'none' : '';
    });
  });
}