import {
    parseStageResultsTable,
    parseStageResultsRow,
    normalizeText,
} from "./parse.js";
import { summarizeStageResults } from "./stats.js";
import { formatSeconds, formatPercent, formatTime } from "./format.js";
import { renderSummaryMetric } from './summaryMetric.js';
import { findFirstMatchingTable, tableHasMatchingRow } from "./tableDetection.js";

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

function isStageResultsDataRow(row) {
  const posCell = row.querySelector('.stage_results_poz');
  const diffFirstCell = row.querySelector('.stage_results_diff_first');
  const nameCell = row.querySelector('.stage_results_name');

  if (!posCell || !diffFirstCell || !nameCell) return false;

  const posText = normalizeText(posCell.textContent);
  return /^\d+$/.test(posText) || posText.toUpperCase() === 'SR';
}

export function findStageResultsDataTable() {
  const found = findFirstMatchingTable({
    selector: 'table.rally_results_stres_left',
    includeTfoot: false,
    match: ({ rows }) => tableHasMatchingRow(rows, isStageResultsDataRow),
  });

  return found?.table ?? null;
}

function renderCurrentUserStageSection(row) {
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
    ${renderSummaryMetric({
      label: 'Stage Time',
      value: row ? `${formatSeconds(row.stageTimeSec)}` : '—',
      tooltip: 'Your recorded stage time.'
    })}
  `;
}

function updateStageResultsSummaryPanel(panel, summary, currentUser) {
  panel.innerHTML = `
    <div class="rsf-plugin-stage-summary-layout">
    <div class="rsf-plugin-stage-summary-main">
    <div class="rsf-plugin-stage-summary-user">
    <div class="rsf-plugin-summary-title">Stage Summary</div>
    ${renderCurrentUserStageSection(currentUser)}
    ${renderSummaryMetric({
      label: 'Typical Gap',
      value: `+${formatSeconds(summary.positionSensitivity)}`,
      tooltip: STAGE_RESULTS_TOOLTIPS.positionSensitivity
    })}
    ${renderSummaryMetric({
      label: 'Stage SR Rate',
      value: `${formatPercent(summary.srRate)}%`,
      tooltip: STAGE_RESULTS_TOOLTIPS.srRate
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

function applySubclassFilter(leftItems, rightItems, selectedSubgroupId) {
  recalculateTable(leftItems, selectedSubgroupId);
  recalculateTable(rightItems, selectedSubgroupId);
}

function getParsedStageTableRows(selector) {
  return [...document.querySelectorAll(selector)]
    .map((row, index) => {
      const parsed = parseStageResultsRow(row);
      return parsed ? { row, originalOrder: index, ...parsed } : null;
    })
    .filter(Boolean);
}

function getLeftTableRows() {
  return getParsedStageTableRows('.rally_results_stres_left tr');
}

function getRightTableRows() {
  return getParsedStageTableRows('.rally_results_stres_right tr');
}

function cacheOriginalRowValues(row) {
  if (!row || row.dataset.rsfSubclassInit === '1') return;

  const posCell = row.querySelector('.stage_results_poz');
  const timeCell = row.querySelector('.stage_results_time');
  const diffPrevCell = row.querySelector('.stage_results_diff_prev');
  const diffFirstCell = row.querySelector('.stage_results_diff_first');

  row.dataset.rsfSubclassInit = '1';
  row.dataset.origPos = posCell?.textContent ?? '';
  row.dataset.origTime = timeCell?.textContent ?? '';
  row.dataset.origDiffPrev = diffPrevCell?.textContent ?? '';
  row.dataset.origDiffFirst = diffFirstCell?.textContent ?? '';
  row.dataset.origDisplay = row.style.display ?? '';
}

function cacheOriginalValues(items) {
  for (const item of items) {
    cacheOriginalRowValues(item.row);
  }
}

function restoreRowValues(row) {
  if (!row || row.dataset.rsfSubclassInit !== '1') return;

  const posCell = row.querySelector('.stage_results_poz');
  const timeCell = row.querySelector('.stage_results_time');
  const diffPrevCell = row.querySelector('.stage_results_diff_prev');
  const diffFirstCell = row.querySelector('.stage_results_diff_first');

  if (posCell) posCell.textContent = row.dataset.origPos ?? '';
  if (timeCell) timeCell.textContent = row.dataset.origTime ?? '';
  if (diffPrevCell) diffPrevCell.textContent = row.dataset.origDiffPrev ?? '';
  if (diffFirstCell) diffFirstCell.textContent = row.dataset.origDiffFirst ?? '';
  row.style.display = row.dataset.origDisplay ?? '';
}

function collectAvailableSubclasses(items, selectedBaseGroupId, subgroupNames = {}) {
  const subgroupMap = new Map();

  for (const item of items) {
    const carDetails = item.carDetails;
    if (!carDetails) continue;
    if (carDetails.base_class_id !== selectedBaseGroupId) continue;
    if (!carDetails.sub_class_id) continue;

    const subClassId = carDetails.sub_class_id;
    const subClassName = carDetails.sub_class_name;

    if (!subgroupMap.has(subClassId)) {
      subgroupMap.set(subClassId, {
        id: subClassId,
        label: subgroupNames[subClassId] ?? subClassName ?? `Subclass ${subClassId}`,
      });
    }
  }

  return [...subgroupMap.values()];
}

function recalculateTable(items, selectedSubgroupId) {
  for (const item of items) {
    restoreRowValues(item.row);

    const subgroupId = item.carDetails?.sub_class_id ?? null;
    const visible = !selectedSubgroupId || subgroupId === selectedSubgroupId;

    item.visible = visible;
    item.row.style.display = visible ? '' : 'none';
  }

  if (!selectedSubgroupId) {
    return;
  }

  const ranked = items
    .filter(item => item.visible)
    .filter(item => !item.isSR)
    .sort((a, b) => {
      const aHasTime = Number.isFinite(a.stageTimeSec);
      const bHasTime = Number.isFinite(b.stageTimeSec);

      if (aHasTime && bHasTime) {
        return a.stageTimeSec - b.stageTimeSec;
      }

      if (aHasTime && !bHasTime) {
        return -1;
      }

      if (!aHasTime && bHasTime) {
        return 1;
      }

      return a.originalOrder - b.originalOrder;
    });

  if (!ranked.length) {
    return;
  }

  const leaderWithTime = ranked.find(item => Number.isFinite(item.stageTimeSec));
  const leaderTime = leaderWithTime?.stageTimeSec ?? null;

  for (let i = 0; i < ranked.length; i += 1) {
    const item = ranked[i];
    const newPosition = i + 1;

    const posCell = item.row.querySelector('.stage_results_poz');
    const timeCell = item.row.querySelector('.stage_results_time');
    const diffPrevCell = item.row.querySelector('.stage_results_diff_prev');
    const diffFirstCell = item.row.querySelector('.stage_results_diff_first');

    if (posCell) posCell.textContent = String(newPosition);

    if (!Number.isFinite(item.stageTimeSec)) {
      continue;
    }

    let prevTimed = null;
    for (let j = i - 1; j >= 0; j -= 1) {
      if (Number.isFinite(ranked[j].stageTimeSec)) {
        prevTimed = ranked[j];
        break;
      }
    }

    const gapPrev = prevTimed ? item.stageTimeSec - prevTimed.stageTimeSec : 0;
    const gapLeader = leaderTime != null ? item.stageTimeSec - leaderTime : 0;

    if (timeCell) timeCell.textContent = formatTime(item.stageTimeSec);
    if (diffPrevCell) diffPrevCell.textContent = newPosition === 1 ? '-' : formatTime(gapPrev);
    if (diffFirstCell) diffFirstCell.textContent = newPosition === 1 ? '-' : formatTime(gapLeader);
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

  const leftItems = getLeftTableRows().filter(
    item => item.carDetails?.base_class_id === selectedBaseGroupId
  );

  const rightItems = getRightTableRows().filter(
    item => item.carDetails?.base_class_id === selectedBaseGroupId
  );

  cacheOriginalValues(leftItems);
  cacheOriginalValues(rightItems);

  const subclasses = collectAvailableSubclasses(
    [...leftItems, ...rightItems],
    selectedBaseGroupId,
    subgroupNames
  );

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
      All subclasses
    </button>
    ${subclasses
      .map(
        s => `
          <button type="button" class="rsf-plugin-subclass-btn" data-subgroup="${s.id}">
            ${s.label}
          </button>
        `
      )
      .join('')}
  `;

  bar.addEventListener('click', event => {
    const btn = event.target.closest('button[data-subgroup]');
    if (!btn) return;

    const selectedSubgroupId = btn.dataset.subgroup
      ? Number(btn.dataset.subgroup)
      : null;

    applySubclassFilter(leftItems, rightItems, selectedSubgroupId);

    for (const button of bar.querySelectorAll('.rsf-plugin-subclass-btn')) {
      button.classList.toggle('is-active', button === btn);
    }
  });

  header.insertAdjacentElement('afterend', bar);

  applySubclassFilter(leftItems, rightItems, null);
}