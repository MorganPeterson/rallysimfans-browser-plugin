import { parseTimeToSeconds } from './core/parse.js';
import { internalClassNames } from './core/html.js';
import {
  findFirstMatchingTable,
  findHeaderRow,
  findColumnIndexByHeaderText,
} from './core/tableDetection.js';
import { calculateMedian } from './core/stats.js';
import { renderSummaryMetric } from './core/summary.js';
import {
  formatSeconds,
  getSecondsPerKmClass,
  getConsistencyClass,
  setSecondsPerKmCell,
} from './core/format.js';

const SUMMARY_TOOLTIPS = {
  average: 'Average seconds per kilometer slower than the world record across visible driven stages.',
  median: 'The middle s/km value across visible driven stages. This represents your typical pace and is less affected by one very bad stage.',
  consistency: 'Average minus median. Lower is better. A larger value usually means one or more bad stages hurt your rally.',
  best: 'Your best visible stage pace in seconds per kilometer slower than the world record.',
  worst: 'Your worst visible stage pace in seconds per kilometer slower than the world record.',
  drivenCount: 'Number of visible stages with both a personal record and a world record time.',
  undrivenCount: 'Number of visible stages that have a world record but no personal record.',
  totalCount: 'Total number of visible stages included in this summary.',
};

/**
 * The main function that adds s/km column, processes stats and add the data to
 * the table.
 */
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

/**
 * Parses a string representing a distance in kilometers. Exported for testing.
 * @param {string} lenStr - The string to parse, e.g., "13.4 km" or "9,7 km".
 * @returns {number|null} The distance in kilometers, or null if parsing fails.
 */
export function parseKm(lenStr) {
    if (typeof lenStr !== 'string') return null;

    const s = lenStr.trim();
    if (!s) return null;

    const match = s.match(/^(\d+(?:[.,]\d+)?)\s*km$/i);
    if (!match) return null;

    const km = Number(match[1].replace(',', '.'));
    return Number.isFinite(km) ? km : null;
}

/**
 * Summarizes the stage stats including average, median, best, worst and 
 * consistency for the summary panel. Exported for testing.
 * @param {{drivenCount: number, undrivenCount: number, diffs: number[]}} stats
 * @returns {{drivenCount: number, undrivenCount: number, totalCount: number, average: number|null, median: number|null, best: number|null, worst: number|null, consistency: number|null}}
 */
export function summarizeStageStats(stats) {
    const { diffs, drivenCount, undrivenCount } = stats;

    if (!diffs.length) {
        return {
            drivenCount,
            undrivenCount,
            totalCount: drivenCount + undrivenCount,
            average: null,
            median: null,
            best: null,
            worst: null,
            consistency: null,
        };
    }

    let sum = 0;
    let best = diffs[0];
    let worst = diffs[0];

    for (const diff of diffs) {
        sum += diff;
        if (diff < best) best = diff;
        if (diff > worst) worst = diff;
    }

    const average = sum / diffs.length;
    const median = calculateMedian(diffs);

    return {
        drivenCount,
        undrivenCount,
        totalCount: drivenCount + undrivenCount,
        average,
        median,
        best,
        worst,
        consistency: average - median,
    };
}

/**
 *  Add user driven stage data to stats. 
 * @param {{drivenCount: number, drivenKm: number, diffs: number[]}} stats 
 * @param {number} diff 
 * @param {number} km 
 * @returns {{drivenCount: number, drivenKm: number, diffs: number[]}}
 */
function addDrivenStage(stats, diff, km) {
  if (!stats || !Number.isFinite(diff) || !Number.isFinite(km) || km <= 0) {
    return stats;
  }

  stats.drivenCount += 1;
  stats.drivenKm += km;
  stats.diffs.push(diff);

  return stats;
}

/**
 * Detects the relevant columns (km, PR, WR) from the header and data rows. 
 * @param {HTMLTableRowElement} headerRow 
 * @param {HTMLTableRowElement[]} dataRows 
 * @returns {{kmIdx: number, prIdx: number, wrIdx: number}|null}
 */
function detectColumns(headerRow, dataRows) {
  const prIdx = findColumnIndexByHeaderText(headerRow, 'PR');
  const wrIdx = findColumnIndexByHeaderText(headerRow, 'WR');

  if (prIdx === -1 || wrIdx === -1) return null;

  let kmIdx = -1;

  for (const row of dataRows) {
    const cells = row.cells;

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

function formatConsistency(value) {
  const secs = formatSeconds(value);
  if (secs === '—') {
    return '—';
  }
  return `${secs} s/km`;
}


function formatSecondsPerKm(spkm) {
  const secs = formatSeconds(spkm);
  if (secs === '—') {
    return '—';
  }
  return `+${secs} s/km`;
}

/** 
 * Inserts the s/km data cell into the row and updates the stats. 
 * @param {HTMLTableRowElement} row 
 * @param {{kmIdx: number, prIdx: number, wrIdx: number}} cols
 * @param {{drivenCount: number, drivenKm: number, diffs: number[], undrivenCount: number}} stats
 * @returns {'ok'|'undriven'|'na'|'skip'}
 */
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
    row.classList.add(internalClassNames.rsfPluginRowUndriven);
    return 'undriven';
  }

  return 'na';
}

/**
 * Inserts the s/km data cell into the row after the specified cell index.
 * Returns the inserted cell or null if insertion failed. 
 * @param {HTMLTableRowElement} row 
 * @param {number} afterCellIndex 
 * @param {number} spkm 
 * @param {object} options 
 * @returns {HTMLTableCellElement|null}
 */
function insertSecondsPerKmDataCellAfter(row, afterCellIndex, spkm, options = {}) {
  const cells = row.cells;

  if (afterCellIndex < 0 || afterCellIndex >= cells.length) {
    return null;
  }
  
  const td = document.createElement('td');
  setSecondsPerKmCell(td, spkm, options);

  cells[afterCellIndex].insertAdjacentElement('afterend', td);
  return td;
}

/**
 * Inserts the s/km header cell into the row after the specified cell index.
 * Returns the inserted cell or null if insertion failed.
 * @param {HTMLTableRowElement} row 
 * @param {number} afterCellIndex 
 * @param {string} title 
 * @returns {HTMLTableCellElement|null}
 */
function insertSecondsPerKmHeaderAfter(row, afterCellIndex, title) {
  const cells = row.cells;

  if (afterCellIndex < 0 || afterCellIndex >= cells.length) {
    return null;
  }

  const th = document.createElement('td');
  th.className = 'rsf-plugin-header';
  th.textContent = 's/km';
  th.title = title;

  cells[afterCellIndex].insertAdjacentElement('afterend', th);
  return th;
}

/**
 * Inserts a stage stats panel before the given table if it doesn't already exist.
 * @param {HTMLTableElement} table 
 * @returns {HTMLDivElement} The inserted or existing stage stats panel.
 */
function insertStageStatsPanel(table) {
  let panel = table.previousElementSibling;
  if (panel && panel.classList.contains('rsf-plugin-summary')) {
    return panel;
  }

  panel = document.createElement('div');
  panel.className = 'rsf-plugin-summary';
  table.insertAdjacentElement('beforebegin', panel);

  return panel;
}

/**
 * Inserts a filter checkbox to hide undriven stages.
 * @param {HTMLTableElement} table 
 * @param {number} undrivenCount 
 */
function insertUndrivenCheckbox(table, undrivenCount) {
  const filterBar = document.createElement('div');
  filterBar.className = internalClassNames.rsfPluginFilter;

  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = internalClassNames.rsfPluginFilterCb;
  label.appendChild(checkbox);
  label.append(` Hide undriven stages (${undrivenCount})`);

  filterBar.appendChild(label);

  table.insertAdjacentElement('beforebegin', filterBar);

  checkbox.addEventListener('change', (e) => {
    const hide = e.target.checked;
    table.querySelectorAll(`.${internalClassNames.rsfPluginRowUndriven}`).forEach((row) => {
      row.style.display = hide ? 'none' : '';
    });
  });
}

/**
 * Processes the stats table by adding the s/km column, calculating the diffs and
 * updating the summary panel. 
 * @param {HTMLTableElement} table 
 * @param {HTMLTableRowElement} headerRow 
 * @param {HTMLTableRowElement[]} dataRows 
 * @param {{kmIdx: number, prIdx: number, wrIdx: number}} cols 
 */
function processStatsTable(table, headerRow, dataRows, cols) {
  table.dataset.rsfPluginDone = '1';
  table.style.minWidth = table.offsetWidth + 'px';

  insertSecondsPerKmHeaderAfter(
    headerRow,
    cols.wrIdx,
    'Seconds per km slower than WR = (PR − WR) ÷ stage length'
  );

  let stats = {
    drivenCount: 0,
    undrivenCount: 0,
    diffs: [],
  };

  for (const row of dataRows) {
    const result = insertDiffDataCell(row, cols, stats);
    if (result === 'undriven') {
      if (stats) stats.undrivenCount += 1;
    }
  }

  const summaryPanel = insertStageStatsPanel(table);
  updateStageStatsPanel(summaryPanel, stats);

  if (stats.undrivenCount > 0) {
    insertUndrivenCheckbox(table, stats.undrivenCount);
  }
}

/**
 * Updates the stage stats panel with the summarized stats.
 * @param {HTMLElement} panel 
 * @param {{drivenCount: number, undrivenCount: number, diffs: number[]}} stats 
 */
function updateStageStatsPanel(panel, stats) {
  const summary = summarizeStageStats(stats);

  panel.innerHTML = `
    ${renderSummaryMetric({
      label: 'Avg',
      value: formatSecondsPerKm(summary.average),
      valueClass: getSecondsPerKmClass(summary.average),
      tooltip: SUMMARY_TOOLTIPS.average
    })}
    ${renderSummaryMetric({
      label: 'Median',
      value: formatSecondsPerKm(summary.median),
      valueClass: getSecondsPerKmClass(summary.median),
      tooltip: SUMMARY_TOOLTIPS.median
    })}
    ${renderSummaryMetric({
      label: 'Consistency',
      value: formatConsistency(summary.consistency),
      valueClass: getConsistencyClass(summary.consistency),
      tooltip: SUMMARY_TOOLTIPS.consistency
    })}
    ${renderSummaryMetric({
      label: 'Best',
      value: formatSecondsPerKm(summary.best),
      valueClass: getSecondsPerKmClass(summary.best),
      tooltip: SUMMARY_TOOLTIPS.best
    })}
    ${renderSummaryMetric({
      label: 'Worst',
      value: formatSecondsPerKm(summary.worst),
      valueClass: getSecondsPerKmClass(summary.worst),
      tooltip: SUMMARY_TOOLTIPS.worst
    })}
    ${renderSummaryMetric({
      label: 'Driven',
      value: String(summary.drivenCount),
      valueClass: '',
      tooltip: SUMMARY_TOOLTIPS.drivenCount
    })}
    ${renderSummaryMetric({
      label: 'Undriven',
      value: String(summary.undrivenCount),
      valueClass: '',
      tooltip: SUMMARY_TOOLTIPS.undrivenCount
    })}
    ${renderSummaryMetric({
      label: 'Total',
      value: String(summary.totalCount),
      valueClass: '',
      tooltip: SUMMARY_TOOLTIPS.totalCount
    })}
  `;
}

