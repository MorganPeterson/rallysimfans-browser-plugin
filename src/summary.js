import { summarizeStageStats } from './stats.js';
import {
  formatSeconds,
  formatPercent,
  formatSecondsPerKm,
  formatConsistency,
  getSecondsPerKmClass,
  getConsistencyClass,
} from './format.js';
import { renderSummaryMetric } from './summaryMetric.js';
import { getGapBetweenPositions } from "./stats.js";

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

const RESULTS_TOOLTIPS = {
  positionSensitivity: 'Average gap between adjacent classified finishers. Lower means a tighter field.',
  srRate: 'Percentage of drivers marked SR in this stage’s results table.',
};

export function insertStageStatsPanel(table) {
  let panel = table.previousElementSibling;
  if (panel && panel.classList.contains('rsf-plugin-summary')) {
    return panel;
  }

  panel = document.createElement('div');
  panel.className = 'rsf-plugin-summary';
  table.insertAdjacentElement('beforebegin', panel);

  return panel;
}

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

export function renderCurrentUserSection(row) {
  return `
    ${renderSummaryMetric({
      label: 'Position',
      value: row ? (row.isSR ? 'SR' : (row.position !== null ? String(row.position) : '—')) : '—',
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

export function renderCurrentUserStageSection(row) {
  return `
    ${renderCurrentUserSection(row)}
    ${renderSummaryMetric({
      label: 'Stage Time',
      value: row ? `${formatSeconds(row.stageTimeSec)}` : '—',
      tooltip: 'Your recorded stage time.'
    })}
  `;
}

export function updateStageStatsPanel(panel, stats) {
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

export function updateResultsSummaryPanel(panel, summary, currentUser) {
  panel.innerHTML = `
    <div class="rsf-plugin-stage-summary-layout">
    <div class="rsf-plugin-stage-summary-main">
    <div class="rsf-plugin-stage-summary-user">
    <div class="rsf-plugin-summary-title">Summary</div>
    ${renderCurrentUserStageSection(currentUser)}
    ${renderSummaryMetric({
      label: 'Typical Gap',
      value: `+${formatSeconds(summary.positionSensitivity)}`,
      tooltip: RESULTS_TOOLTIPS.positionSensitivity
    })}
    ${renderSummaryMetric({
      label: 'Stage SR Rate',
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
