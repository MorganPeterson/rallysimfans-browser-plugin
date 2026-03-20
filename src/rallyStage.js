import {
    parseStageResultsTable,
    parseOverallResultsTable,
    normalizeText,
} from "./parse";
import { summarizeStageResults, summarizeOverallResults } from "./stats";
import { formatSeconds, formatPercent } from "./format";

const STAGE_RESULTS_TOOLTIPS = {
  top5Compression: 'Gap from 1st to 5th among classified finishers.',
  top10Compression: 'Gap from 1st to 10th among classified finishers.',
  positionSensitivity: 'Average gap between adjacent classified finishers. Lower means a tighter field.',
  srRate: 'Super Rally rate: SR drivers divided by total drivers on this stage.',
};

const OVERALL_RESULTS_TOOLTIPS = {
  top5Compression: 'Gap from 1st to 5th among classified overall finishers.',
  top10Compression: 'Gap from 1st to 10th among classified overall finishers.',
  positionSensitivity: 'Average gap between adjacent classified overall finishers. Lower means a tighter field.',
  srRate: 'Share of overall results marked with equalized/SR-style rows.',
};

function findContainingCell(element) {
  return element ? element.closest('td') : null;
}

function insertResultsSummaryPanel(containerCell, className) {
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

export function findOverallResultsDataTable() {
  const tables = document.querySelectorAll('table.rally_results_stres_right');

  for (const table of tables) {
    const rows = table.querySelectorAll(':scope > tbody > tr, :scope > tr');

    for (const row of rows) {
      const posCell = row.querySelector('.stage_results_poz');
      const timeCell = row.querySelector('.stage_results_time');
      const diffFirstCell = row.querySelector('.stage_results_diff_first');
      const nameCell = row.querySelector('.stage_results_name');

      if (!posCell || !timeCell || !diffFirstCell || !nameCell) continue;

      const posText = normalizeText(posCell.textContent);
      const isRealResultRow = /^\d+$/.test(posText) || posText === '=';

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
    ${renderStageResultsSummaryMetric('Top 5', formatSeconds(summary.top5Compression), STAGE_RESULTS_TOOLTIPS.top5Compression)}
    ${renderStageResultsSummaryMetric('Top 10', formatSeconds(summary.top10Compression), STAGE_RESULTS_TOOLTIPS.top10Compression)}
    ${renderStageResultsSummaryMetric('Avg. Time Gap', formatSeconds(summary.positionSensitivity), STAGE_RESULTS_TOOLTIPS.positionSensitivity)}
    ${renderStageResultsSummaryMetric('SR Rate', formatPercent(summary.srRate), STAGE_RESULTS_TOOLTIPS.srRate)}
  `;
}

function updateOverallResultsSummaryPanel(panel, summary) {
  panel.innerHTML = `
    <div class="rsf-plugin-summary-title">Overall Rally</div>
    ${renderStageResultsSummaryMetric('Top 5', formatSeconds(summary.top5Compression), OVERALL_RESULTS_TOOLTIPS.top5Compression)}
    ${renderStageResultsSummaryMetric('Top 10', formatSeconds(summary.top10Compression), OVERALL_RESULTS_TOOLTIPS.top10Compression)}
    ${renderStageResultsSummaryMetric('Avg. Time Gap', formatSeconds(summary.positionSensitivity), OVERALL_RESULTS_TOOLTIPS.positionSensitivity)}
    ${renderStageResultsSummaryMetric('SR Rate', formatPercent(summary.srRate), OVERALL_RESULTS_TOOLTIPS.srRate)}
  `;
}

export function addStageResultsSummary() {
  const stageTable = findStageResultsDataTable();
  const overallTable = findOverallResultsDataTable();

  if (stageTable && stageTable.dataset.rsfStageSummaryDone !== '1') {
    const stageRows = parseStageResultsTable(stageTable);
    if (stageRows.length) {
      const stageSummary = summarizeStageResults(stageRows);
      const stageCell = findContainingCell(stageTable);
      const stagePanel = insertResultsSummaryPanel(
        stageCell,
        'rsf-plugin-stage-results-summary'
      );

      if (stagePanel) {
        updateStageResultsSummaryPanel(stagePanel, stageSummary);
        stageTable.dataset.rsfStageSummaryDone = '1';
      }
    }
  }

  if (overallTable && overallTable.dataset.rsfOverallSummaryDone !== '1') {
    const overallRows = parseOverallResultsTable(overallTable);
    if (overallRows.length) {
      const overallSummary = summarizeOverallResults(overallRows);
      const overallCell = findContainingCell(overallTable);
      const overallPanel = insertResultsSummaryPanel(
        overallCell,
        'rsf-plugin-overall-results-summary'
      );

      if (overallPanel) {
        updateOverallResultsSummaryPanel(overallPanel, overallSummary);
        overallTable.dataset.rsfOverallSummaryDone = '1';
      }
    }
  }
}
