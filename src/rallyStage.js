import {
    parseStageResultsTable,
    normalizeText,
} from "./parse";
import { summarizeStageResults } from "./stats";
import { formatSeconds, formatPercent } from "./format";

const STAGE_RESULTS_TOOLTIPS = {
  top5Compression: 'Gap from 1st to 5th among classified finishers.',
  top10Compression: 'Gap from 1st to 10th among classified finishers.',
  positionSensitivity: 'Average gap between adjacent classified finishers. Lower means a tighter field.',
  srRate: 'Super Rally rate: SR drivers divided by total drivers on this stage.',
};

function findContainingCell(element) {
  return element ? element.closest('td') : null;
}

function insertResultsSummaryPanel(containerCell, className) {
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

export function findStageResultsDataTable() {
  const tables = document.querySelectorAll('table.rally_results_stres_left');

  for (const table of tables) {
    const rows = table.querySelectorAll(':scope > tbody > tr, :scope > tr');

    for (const row of rows) {
      const posCell = row.querySelector('.stage_results_poz');
      const diffFirstCell = row.querySelector('.stage_results_diff_first');
      const nameCell = row.querySelector('.stage_results_name');

      if (!posCell || !diffFirstCell || !nameCell) continue;

      const posText = normalizeText(posCell.textContent);
      const isRealResultRow = /^\d+$/.test(posText) || posText.toUpperCase() === 'SR';

      if (isRealResultRow) {
        return table;
      }
    }
  }

  return null;
}

function renderStageResultsSummaryMetric(label, value, tooltip = '') {
  return `
    <div class="rsf-plugin-summary-item">
      <span class="rsf-plugin-summary-label">${escapeStageResultsSummaryHtml(label)}</span>
      <span
        class="rsf-plugin-summary-value"
        title="${escapeStageResultsSummaryHtml(tooltip)}"
      >${escapeStageResultsSummaryHtml(value)}</span>
    </div>
  `;
}

function escapeStageResultsSummaryHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function updateStageResultsSummaryPanel(panel, summary) {
  panel.innerHTML = `
    <div class="rsf-plugin-summary-title">Stage Summary</div>
    ${renderStageResultsSummaryMetric('P1 -> P5 Gap', `+${formatSeconds(summary.top5Compression)}`, STAGE_RESULTS_TOOLTIPS.top5Compression)}
    ${renderStageResultsSummaryMetric('P1 -> P10 Gap', `+${formatSeconds(summary.top10Compression)}`, STAGE_RESULTS_TOOLTIPS.top10Compression)}
    ${renderStageResultsSummaryMetric('Median Gap', `+${formatSeconds(summary.positionSensitivity)}`, STAGE_RESULTS_TOOLTIPS.positionSensitivity)}
    ${renderStageResultsSummaryMetric('SR Rate', `${formatPercent(summary.srRate)}%`, STAGE_RESULTS_TOOLTIPS.srRate)}
  `;
}

export function addStageResultsSummary() {
  const stageTable = findStageResultsDataTable();

  if (!stageTable || stageTable.dataset.rsfStageSummaryDone === '1') return;

  const stageRows = parseStageResultsTable(stageTable);
  if (!stageRows.length) return;

  const stageSummary = summarizeStageResults(stageRows);
  const stageCell = findContainingCell(stageTable);
  const stagePanel = insertResultsSummaryPanel(
    stageCell,
    'rsf-plugin-stage-results-summary'
  );

  if (!stagePanel) return;

  updateStageResultsSummaryPanel(stagePanel, stageSummary);
  stageTable.dataset.rsfStageSummaryDone = '1';
}