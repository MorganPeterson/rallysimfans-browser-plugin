import {
    parseStageResultsTable,
    parseStageResultsRow,
    normalizeText,
} from "./parse.js";
import { summarizeStageResults } from "./stats.js";
import { formatTime } from "./format.js";
import {
  insertResultsSummaryPanel,
  updateResultsSummaryStagePanel,
} from "./summary.js";
import { findFirstMatchingTable, tableHasMatchingRow } from "./tableDetection.js";
import { applyZebraStriping } from "./domTable.js";
import {
  collectAvailableSubclasses,
  createSubclassFilterBar,
  getAbsoluteValue,
} from "./subclassFilterShared.js";
import { findCurrentUserResult, getVisibleParsedRowsFromItems } from "./results.js";
import { BASE_GROUP_ID_TO_CLASS_NAME } from "./cars.js";

function refreshStageResultsSummary(leftItems = null) {
  const stageTable = findStageResultsDataTable();
  if (!stageTable) return;

  const stageCell = stageTable ? stageTable.closest('td') : null;
  const stagePanel = insertResultsSummaryPanel(
    stageCell,
    'rsf-plugin-stage-results-summary'
  );

  if (!stagePanel) return;

  const stageRows = Array.isArray(leftItems) && leftItems.length
    ? getVisibleParsedRowsFromItems(leftItems, parseStageResultsRow)
    : parseStageResultsTable(stageTable);

  if (!stageRows.length) {
    stagePanel.innerHTML = `
      <div class="rsf-plugin-stage-summary-layout">
        <div class="rsf-plugin-stage-summary-main">
          <div class="rsf-plugin-stage-summary-user">
            <div class="rsf-plugin-summary-title">Summary</div>
            <div class="rsf-plugin-summary-item">
              <span class="rsf-plugin-summary-label">Result</span>
              <span class="rsf-plugin-summary-value">—</span>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const stageSummary = summarizeStageResults(stageRows);
  const currentUser = findCurrentUserResult(stageRows);

  updateResultsSummaryStagePanel(stagePanel, stageSummary, currentUser);
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

export function addStageResultsSummary() {
  const stageTable = findStageResultsDataTable();
  if (!stageTable) return;

  refreshStageResultsSummary();
  stageTable.dataset.rsfStageSummaryDone = '1';
}

function applySubclassFilter(leftItems, rightItems, selectedSubgroupId) {
  recalculateTable(leftItems, selectedSubgroupId);
  recalculateTable(rightItems, selectedSubgroupId);
  applyZebraStriping(leftItems);
  applyZebraStriping(rightItems);

  refreshStageResultsSummary(leftItems);
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
  row.dataset.origTime = timeCell?.querySelector('b')?.textContent ?? '';
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
      const aValue = getAbsoluteValue(a);
      const bValue = getAbsoluteValue(b);

      const aHasValue = Number.isFinite(aValue);
      const bHasValue = Number.isFinite(bValue);

      if (aHasValue && bHasValue) {
        return aValue - bValue;
      }

      if (aHasValue && !bHasValue) {
        return -1;
      }

      if (!aHasValue && bHasValue) {
        return 1;
      }

      return a.originalOrder - b.originalOrder;
    });

  if (!ranked.length) {
    return;
  }

  const leader = ranked.find(item => Number.isFinite(getAbsoluteValue(item)));
  const leaderValue = leader ? getAbsoluteValue(leader) : null;

  for (let i = 0; i < ranked.length; i += 1) {
    const item = ranked[i];
    const newPosition = i + 1;

    const posCell = item.row.querySelector('.stage_results_poz');
    const timeCell = item.row.querySelector('.stage_results_time');
    const diffPrevCell = item.row.querySelector('.stage_results_diff_prev');
    const diffFirstCell = item.row.querySelector('.stage_results_diff_first');

    if (posCell) {
      posCell.textContent = String(newPosition);
    }

    const currentValue = getAbsoluteValue(item);

    let prevRanked = null;
    for (let j = i - 1; j >= 0; j -= 1) {
      if (Number.isFinite(getAbsoluteValue(ranked[j]))) {
        prevRanked = ranked[j];
        break;
      }
    }

    const prevValue = prevRanked ? getAbsoluteValue(prevRanked) : null;

    if (Number.isFinite(item.stageTimeSec) && timeCell) {
      timeCell.textContent = formatTime(item.stageTimeSec);
    }

    if (!Number.isFinite(currentValue)) {
      if (diffPrevCell) diffPrevCell.textContent = '-';
      if (diffFirstCell) diffFirstCell.textContent = '-';
      continue;
    }

    const gapPrev = prevValue != null ? currentValue - prevValue : 0;
    const gapLeader = leaderValue != null ? currentValue - leaderValue : 0;

    if (diffPrevCell) {
      diffPrevCell.textContent = newPosition === 1 ? '-' : formatTime(gapPrev);
    }

    if (diffFirstCell) {
      diffFirstCell.textContent = newPosition === 1 ? '-' : formatTime(gapLeader);
    }
  }
}

export function mountSubclassFilter() {
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

  const baseClass = BASE_GROUP_ID_TO_CLASS_NAME.get(selectedBaseGroupId);
  const subclasses = collectAvailableSubclasses(
    [...leftItems, ...rightItems],
    selectedBaseGroupId,
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

  bar = createSubclassFilterBar(baseClass, subclasses);

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