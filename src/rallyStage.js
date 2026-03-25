import {
    parseStageResultsTable,
    parseStageResultsRow,
    normalizeText,
} from "./parse";
import { summarizeStageResults } from "./stats";
import { formatSeconds, formatPercent } from "./format";

const STAGE_RESULTS_TOOLTIPS = {
  positionSensitivity: 'Average gap between adjacent classified finishers. Lower means a tighter field.',
  srRate: 'Percentage of drivers marked SR in this stage’s results table.',
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

function findCurrentUserStageResult(rows) {
  return rows.find(row => row.isCurrentUser) || null;
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

function renderCurrentUserStageSection(row) {
  return `
    ${renderStageResultsSummaryMetric(
      'Position',
      row ? (row.isSR ? 'SR' : (row.position !== null ? String(row.position) : '—')) : '—',
      'Your finishing position on this stage.'
    )}
    ${renderStageResultsSummaryMetric(
      'Gap to Leader',
      row ? `+${formatSeconds(row.gapToLeaderSec)}` : '—',
      'Your time difference to the stage winner.'
    )}
    ${renderStageResultsSummaryMetric(
      'Gap to Previous',
      row ? `+${formatSeconds(row.gapToPrevSec)}` : '—',
      'Your time difference to the driver immediately ahead of you.'
    )}
    ${renderStageResultsSummaryMetric(
      'Stage Time',
      row ? `${formatSeconds(row.stageTimeSec)}` : '—',
      'Your recorded stage time.'
    )}
  `;
}

function updateStageResultsSummaryPanel(panel, summary, currentUser) {
  panel.innerHTML = `
    <div class="rsf-plugin-stage-summary-layout">
    <div class="rsf-plugin-stage-summary-main">
    <div class="rsf-plugin-stage-summary-user">
    <div class="rsf-plugin-summary-title">Stage Summary</div>
    ${renderCurrentUserStageSection(currentUser)}
    ${renderStageResultsSummaryMetric('Typical Gap', `+${formatSeconds(summary.positionSensitivity)}`, STAGE_RESULTS_TOOLTIPS.positionSensitivity)}
    ${renderStageResultsSummaryMetric('Stage SR Rate', `${formatPercent(summary.srRate)}%`, STAGE_RESULTS_TOOLTIPS.srRate)}
    </div>
    <div class="rsf-plugin-stage-summary-side">
    ${renderGapComparisonSection(summary.classifiedRows)}
    </div>
    </div>
    </div>
  `;

  bindGapComparisonControls(panel, summary.classifiedRows);
}

function calculateGapBetweenPositions(rows, from, to) {
  const fromRow = rows.find(row => row.position === from);
  const toRow = rows.find(row => row.position === to);

  if (!fromRow || !toRow) return null;
  if (!Number.isFinite(fromRow.gapToLeaderSec) || !Number.isFinite(toRow.gapToLeaderSec)) return null;

  return toRow.gapToLeaderSec - fromRow.gapToLeaderSec;
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

    const gap = calculateGapBetweenPositions(classifiedRows, fromPosition, toPosition);
    resultEl.textContent = `+${formatSeconds(gap)}`;
  }

  fromSelect.addEventListener('change', updateGap);
  toSelect.addEventListener('change', updateGap);

  updateGap();
}

export function addStageResultsSummary() {
  const stageTable = findStageResultsDataTable();

  if (!stageTable || stageTable.dataset.rsfStageSummaryDone === '1') return;

  const stageRows = parseStageResultsTable(stageTable);
  if (!stageRows.length) return;

  const stageSummary = summarizeStageResults(stageRows);
  const currentUser = findCurrentUserStageResult(stageRows);

  const stageCell = findContainingCell(stageTable);
  const stagePanel = insertResultsSummaryPanel(
    stageCell,
    'rsf-plugin-stage-results-summary'
  );

  if (!stagePanel) return;

  updateStageResultsSummaryPanel(stagePanel, stageSummary, currentUser);
  stageTable.dataset.rsfStageSummaryDone = '1';
}

function getSelectedBaseClassCell() {
  return document.querySelector('.car_group_list_select');
}

function getSelectedBaseClassName() {
  return normalizeText(getSelectedBaseClassCell()?.textContent || '');
}

function applySubclassFilter(parsedRows, selectedSubgroupId) {
  for (const item of parsedRows) {
    const rowSubgroupId = item.carDetails?.sub_class_id ?? null;

    const show =
      !selectedSubgroupId || rowSubgroupId === selectedSubgroupId;

    item.row.style.display = show ? '' : 'none';
  }
}

export function mountSubclassFilter({ subgroupNames = {} } = {}) {
  const selectedCell = document.querySelector('.car_group_list_select');
  const onclick = selectedCell?.getAttribute('onclick') || '';
  const cgMatches = [...onclick.matchAll(/cg=(\d+)/g)];

  const selectedBaseGroupId = Number(
    cgMatches.length ? cgMatches[cgMatches.length - 1][1] : null
  );

  if (!selectedBaseGroupId || selectedBaseGroupId === 7) {
    return;
  }

  const rows = [
    ...document.querySelectorAll('.rally_results_stres_left tr'),
    ...document.querySelectorAll('.rally_results_stres_right tr'),
  ];

  const parsedRows = rows
    .map(row => {
      const parsed = parseStageResultsRow(row);
      return parsed ? { row, ...parsed } : null;
    })
    .filter(Boolean);

  const matchingRows = parsedRows.filter(
    r => r.carDetails?.base_class_id === selectedBaseGroupId
  );

  const subgroupMap = new Map();

  for (const row of matchingRows) {
    const subClassId = row.carDetails?.sub_class_id;
    const subClassName = row.carDetails?.sub_class_name;

    if (!subClassId) continue;

    if (!subgroupMap.has(subClassId)) {
      subgroupMap.set(subClassId, {
        id: subClassId,
        label: subgroupNames[subClassId] ?? subClassName ?? `Subclass ${subClassId}`,
      });
    }
  }

  const subclasses = [...subgroupMap.values()];

  if (subclasses.length < 2) {
    return;
  }

  const header = document.querySelector('.fejlec4');
  if (!header) {
    return;
  }

  let bar = document.querySelector('.rsf-plugin-subclass-bar');
  if (bar) bar.remove();

  bar = document.createElement('div');
  bar.className = 'rsf-plugin-subclass-bar';
  bar.innerHTML = `
  <button type="button" class="rsf-plugin-subclass-btn is-active" data-subgroup="">
    All
  </button>
  ${subclasses
    .map(
      s => `
        <button
          type="button"
          class="rsf-plugin-subclass-btn"
          data-subgroup="${s.id}">
          ${s.label}
        </button>
      `
    )
    .join('')}
  `;

  bar.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-subgroup]");
    if (!btn) return;

    const selectedSubgroupId = btn.dataset.subgroup
      ? Number(btn.dataset.subgroup)
      : null;

    applySubclassFilter(matchingRows, selectedSubgroupId);

    for (const button of bar.querySelectorAll(".rsf-plugin-subclass-btn")) {
      button.classList.toggle("is-active", button === btn);
    }
  });

  header.insertAdjacentElement('afterend', bar);
}