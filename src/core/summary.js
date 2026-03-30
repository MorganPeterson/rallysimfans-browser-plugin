import { formatSeconds } from './format.js';
import { escapeHtml, escapeHtmlAttr } from './html.js';

const RESULTS_TOOLTIPS = {
  positionSensitivity: 'Average gap between adjacent classified finishers. Lower means a tighter field.',
  srRate: 'Percentage of drivers marked SR in this stage’s results table.',
};

/**
 * Inserts a summary panel into the results page. It first tries to insert into 
 * the sticky header if it exists, otherwise it falls back to inserting into the provided container cell.
 * @param {HTMLElement} containerCell 
 * @param {string} className 
 * @returns {HTMLElement|null}
 */
export function insertResultsSummaryPanel(containerCell, className) {
  const stickyHeader = document.querySelector('.rally_results_header_sticky');

  if (stickyHeader) {
    const headerTable = stickyHeader.querySelector('table');

    if (headerTable) {
      let panel = stickyHeader.querySelector(`.${className}`);
      if (panel) return panel;

      const rows = headerTable.querySelectorAll(':scope > tbody > tr, :scope > tr');
      const firstRow = rows[0] || null;
      const colCount = firstRow && firstRow.cells.length > 0 ? firstRow.cells.length : 1;

      const tr = document.createElement('tr');
      tr.className = `${className}-row`;

      const td = document.createElement('td');
      td.colSpan = colCount;
      td.className = `${className}-cell`;

      panel = document.createElement('div');
      panel.className = `rsf-plugin-summary ${className}`;

      td.appendChild(panel);
      tr.appendChild(td);

      const tbody = headerTable.querySelector(':scope > tbody');

      if (tbody) {
        tbody.appendChild(tr);
      } else {
        headerTable.appendChild(tr);
      }

      return panel;
    }
  }

  if (!containerCell) return null;

  let panel = containerCell.querySelector(`:scope > .${className}`);
  if (panel) return panel;

  panel = document.createElement('div');
  panel.className = `rsf-plugin-summary ${className}`;

  const firstElementChild = Array.from(containerCell.childNodes)
    .find(node => node.nodeType === Node.ELEMENT_NODE);

  if (firstElementChild) {
    containerCell.insertBefore(panel, firstElementChild);
  } else {
    containerCell.appendChild(panel);
  }

  return panel;
}

/**
 * Renders the current user's summary section for a stage results summary panel.
 * @param {{position: number|null, isSR: boolean, gapToLeaderSec: number, gapToPrevSec: number}} row 
 * @returns {string}
 */
export function renderCurrentUserSection(row) {
  return `
    ${renderSummaryMetric({
      label: 'Position',
      value: row ? (row.position !== null && row.position !== undefined ? String(row.position) : (row.isSR ? 'SR' : '—')) : '—',
      tooltip: 'Your finishing position on this stage.'
    })}
    ${renderSummaryMetric({
      label: 'Gap to Leader',
      value: row ? `+${formatSeconds(row.gapToLeaderSec)}` : '—',
      tooltip: 'Your time difference to the stage winner.'
    })}
    ${renderSummaryMetric({
      label: 'Gap to Previous',
      value: row ? `+${formatSeconds(row.gapToPrevSec)}` : '—',
      tooltip: 'Your time difference to the driver immediately ahead of you.'
    })}
    `;
}

export function renderSummaryMetric({
    label,
    value,
    tooltip = '',
    valueClass = '',
    itemClass = 'rsf-plugin-summary-item',
    labelClass = 'rsf-plugin-summary-label',
    valueBaseClass = 'rsf-plugin-summary-value',
}) {
    const classes = [valueBaseClass, valueClass].filter(Boolean).join(' ');

    return `
      <div class="${itemClass}">
        <span class="${labelClass}">
          ${escapeHtml(label)}
        </span>
        <span class="${classes}" title="${escapeHtmlAttr(tooltip)}">
          ${escapeHtml(value)}
        </span>
      </div>
    `;
}

/**
 * if the stage results table is present, extracts the stage results data, 
 * computes summary statistics, and updates the summary panel.
 * @param {HTMLElement} panel 
 * @param {{positionSensitivity: number, srRate: number, classifiedRows: Array<Object>}} summary 
 * @param {{position: number|null, isSR: boolean, gapToLeaderSec: number, gapToPrevSec: number}} currentUser 
 * @param {Function} renderUser 
 */
export function updateResultsSummaryPanel(panel, summary, currentUser, renderUser) {
  panel.innerHTML = `
    <div class="rsf-plugin-stage-summary-layout">
    <div class="rsf-plugin-stage-summary-main">
    <div class="rsf-plugin-stage-summary-user">
    <div class="rsf-plugin-summary-title">Summary</div>
    ${renderUser(currentUser)}
    ${renderSummaryMetric({
      label: 'Typical Gap',
      value: `+${formatSeconds(summary.positionSensitivity)}`,
      tooltip: RESULTS_TOOLTIPS.positionSensitivity
    })}
    ${renderSummaryMetric({
      label: 'SR Rate',
      value: `${formatPercent(summary.srRate)}%`,
      tooltip: RESULTS_TOOLTIPS.srRate
    })}
    </div>
    <div class="rsf-plugin-stage-summary-side">
    ${renderGapComparisonSection(summary.classifiedRows)}
    </div>
    </div>
    </div>
  `;

  bindGapComparisonControls(panel, summary.classifiedRows);
}

/**
 * Binds the gap comparison controls within the summary panel.
 * @param {HTMLElement} panel 
 * @param {Array<{position: number|null, gapToLeaderSec: number}>} classifiedRows 
 * @returns {void}
 */
function bindGapComparisonControls(panel, classifiedRows) {
  const fromSelect = panel.querySelector('.rsf-plugin-gap-from');
  const toSelect = panel.querySelector('.rsf-plugin-gap-to');
  const resultEl = panel.querySelector('.rsf-plugin-gap-result');

  if (!fromSelect || !toSelect || !resultEl) return;

  if (classifiedRows.length > 0) {
    fromSelect.value = String(classifiedRows[0].position);
    toSelect.value = String(classifiedRows[Math.min(4, classifiedRows.length - 1)].position);
  }

  function updateGap() {
    const fromPosition = Number(fromSelect.value);
    const toPosition = Number(toSelect.value);

    if (fromPosition >= toPosition) {
      resultEl.textContent = '—';
      return;
    }

    const gap = getGapBetweenPositions(classifiedRows, fromPosition, toPosition);
    resultEl.textContent = `+${formatSeconds(gap)}`;
  }

  fromSelect.addEventListener('change', updateGap);
  toSelect.addEventListener('change', updateGap);

  updateGap();
}

/**
 * format a decimal value as a percentage string, or return '—' if the value is 
 * null or not finite.
 * @param {number|null} value 
 * @returns {string}
 */
function formatPercent(value) {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(1)}`;
}

/**
 * get the gap in seconds between two positions in the classified results.
 * @param {Array<{position: number|null, gapToLeaderSec: number}>} rows 
 * @param {number} from 
 * @param {number} to 
 * @returns {number|null}
 */
function getGapBetweenPositions(rows, from, to) {
  const fromRow = rows.find(row => row.position === from);
  const toRow = rows.find(row => row.position === to);

  if (!fromRow || !toRow) return null;
  if (!Number.isFinite(fromRow.gapToLeaderSec) || !Number.isFinite(toRow.gapToLeaderSec)) return null;

  return toRow.gapToLeaderSec - fromRow.gapToLeaderSec;
}

/**
 * Renders the gap comparison section of the summary panel, which allows users to select two positions and see the gap between them.
 * @param {Array<{position: number|null, gapToLeaderSec: number}>} classifiedRows 
 * @returns {string}
 */
function renderGapComparisonSection(classifiedRows) {
  if (!classifiedRows.length) {
    return `
      <div class="rsf-plugin-summary-item">
        <span class="rsf-plugin-summary-label">Result</span>
        <span class="rsf-plugin-summary-value">—</span>
      </div>
    `;
  }

  const options = classifiedRows
    .filter(row => row.position !== null && row.position !== undefined)
    .map(row => `<option value="${row.position}">P${row.position}</option>`)
    .join('');

    return `
    <div class="rsf-plugin-summary-title">Gap Comparison</div>
    <div class="rsf-plugin-gap-comparison">
      <label class="rsf-plugin-gap-label">
        <span>From</span>
        <select class="rsf-plugin-gap-from">
          ${options}
        </select>
      </label>

      <label class="rsf-plugin-gap-label">
        <span>To</span>
        <select class="rsf-plugin-gap-to">
          ${options}
        </select>
      </label>

      <div class="rsf-plugin-gap-result-wrap">
        <span class="rsf-plugin-summary-label">Gap</span>
        <span class="rsf-plugin-gap-result">—</span>
      </div>
    </div>
  `;
}
