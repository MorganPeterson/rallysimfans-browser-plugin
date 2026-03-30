import { applyZebraStriping, getDirectTableRows } from "./core/domTable.js";
import {
  parseDiffToSeconds,
  normalizeText,
  parseRallyResultsRow,
  parseRallyResultsTable,
} from "./core/parse.js";
import {
  formatTime,
  formatSeconds,
  setSecondsPerKmCell,
} from "./core/format.js";
import {
    collectAvailableSubclasses,
    getAbsoluteValue,
    createSubclassFilterBar,
} from "./core/subclassFilterShared.js";
import { insertResultsSummaryPanel, updateResultsSummaryPanel, renderCurrentUserSection } from "./core/summary.js";
import { findFirstMatchingTable, tableHasMatchingRow } from "./core/tableDetection.js";
import { summarizeRallyResults } from "./core/stats.js";
import { BASE_GROUP_ID_TO_CLASS_NAME } from "./core/cars.js";
import { renderSummaryMetric } from "./core/summary.js";
import { rsfCache } from "./core/cache.js";

function getVisibleParsedRallyRows(items = null) {
  if (Array.isArray(items) && items.length) {
    return items.filter(item => item.visible)
      .map(item => parseRallyResultsRow(item.row))
      .filter(Boolean);
  }

  return getRallyResultsRows()
    .filter(item => item.visible !== false)
    .map(item => parseRallyResultsRow(item.row))
    .filter(Boolean);
}

/**
 * Adds the s/km column to the rally results table, summary panel, and subclass
 * filter functionality.
 * @param {string} rallyId 
 * @returns 
 */
export async function addSecondsPerKmColumn(rallyId) {
  const totalKm = await fetchRallyTotalKm(rallyId);
  if (!totalKm || totalKm <= 0) return;

  const resultTables = document.querySelectorAll("table.rally_results");

  for (const table of resultTables) {
    if (table.dataset.rsfResultsDiffDone) continue;

    const rows = getDirectTableRows(table, { includeTfoot: false });
    if (!rows.length) continue;

    let touched = false;

    for (const row of rows) {
      if (row.classList.contains("fejlec2")) {
        const th = document.createElement('td');
        th.className = 'rsf-plugin-header';
        th.textContent = 's/km';
        th.title = `Seconds per km (Total: ${totalKm} km)`;
        row.appendChild(th);
        touched = true;
        continue;
      }

      const diffCell = row.querySelector(".rally_results_diff_first");
      if (!diffCell) continue;

      const diffSec = parseDiffToSeconds(diffCell.textContent);
      const spkm = diffSec === null ? null : diffSec / totalKm;

      const td = document.createElement('td');
      setSecondsPerKmCell(td, spkm, { zeroAsDash: true });
      row.appendChild(td);
      touched = true;
    }

    if (touched) {
      table.dataset.rsfResultsDiffDone = "1";
    }
  }

  mountRallySubclassFilter(totalKm);
  refreshRallyResultsSummary();
}

function renderCurrentUserResultsSection(row) {
  return `
    ${renderCurrentUserSection(row)}
    ${renderSummaryMetric({
      label: 'Finish Time',
      value: row ? `${formatSeconds(row.rallyTimeSec)}` : '—',
      tooltip: 'Your recorded stage time.'
    })}
  `;
}

function mountRallySubclassFilter(totalKm) {
  const selectedCell = document.querySelector('.car_group_list_select');
  const onclick = selectedCell?.getAttribute('onclick') || '';
  const cgMatches = [...onclick.matchAll(/cg=(\d+)/g)];

  const selectedBaseGroupId = Number(
    cgMatches.length ? cgMatches[cgMatches.length - 1][1] : null
  );

  if (!selectedBaseGroupId || selectedBaseGroupId === 7) {
    return;
  }

  const items = getRallyResultsRows().filter(
    item => item.carDetails?.base_class_id === selectedBaseGroupId
  );

  if (!items.length) {
    return;
  }

  cacheOriginalValues(items);

  const baseClass = BASE_GROUP_ID_TO_CLASS_NAME.get(selectedBaseGroupId);
  const subclasses = collectAvailableSubclasses(
    items,
    selectedBaseGroupId
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

    applyRallySubclassFilter(items, selectedSubgroupId, totalKm);

    for (const button of bar.querySelectorAll('.rsf-plugin-subclass-btn')) {
      button.classList.toggle('is-active', button === btn);
    }
  });

  header.insertAdjacentElement('afterend', bar);

  applyRallySubclassFilter(items, null, totalKm);
}

function getRallyResultsRows() {
  const items = [];
  const tables = document.querySelectorAll("table.rally_results");

  for (const table of tables) {
    const rows = getDirectTableRows(table, { includeTfoot: false });

    for (let i=0; i<rows.length; i++) {
      const row = rows[i];
      const item = parseRallyResultsRow(row);
      if (!item) continue;

      item.originalOrder = items.length;
      item.visible = true;

      items.push(item);
    }
  }

  return items;
}

function cacheOriginalValues(items) {
  for (const item of items) {
    const row = item.row;

    const timeCell = row.querySelector(".rally_results_time");

    item.originalValues = {
      display: row.style.display || "",
      background: row.style.background || "",
      pos: row.querySelector(".rally_results_poz")?.textContent ?? "",
      time: timeCell?.querySelector("b")?.textContent ?? "",
      diffPrev: row.querySelector(".rally_results_diff_prev")?.textContent ?? "",
      diffFirst: row.querySelector(".rally_results_diff_first")?.textContent ?? "",
      spkm: row.lastElementChild?.textContent ?? "",
    };
  }
}

function restoreRowValues(rowItem) {
  const { row, originalValues } = rowItem;
  if (!originalValues) return;

  row.style.display = originalValues.display;
  row.style.background = originalValues.background;

  const posCell = row.querySelector(".rally_results_poz");
  const timeCell = row.querySelector(".rally_results_time");
  const diffPrevCell = row.querySelector(".rally_results_diff_prev");
  const diffFirstCell = row.querySelector(".rally_results_diff_first");
  const spkmCell = row.lastElementChild;

  if (posCell) posCell.textContent = originalValues.pos;
  if (timeCell) timeCell.textContent = originalValues.time;
  if (diffPrevCell) diffPrevCell.textContent = originalValues.diffPrev;
  if (diffFirstCell) diffFirstCell.textContent = originalValues.diffFirst;
  if (spkmCell) spkmCell.textContent = originalValues.spkm;
}

function applyRallySubclassFilter(items, selectedSubgroupId, totalKm) {
  recalculateRallyResultsTable(items, selectedSubgroupId, totalKm);
  refreshRallyResultsSummary(items);
  applyZebraStriping(items);
}

function recalculateRallyResultsTable(items, selectedSubgroupId, totalKm) {
  for (const item of items) {
    restoreRowValues(item);

    const subgroupId = item.carDetails?.sub_class_id ?? null;
    const visible = !selectedSubgroupId || subgroupId === selectedSubgroupId;

    item.visible = visible;
    item.row.style.display = visible ? "" : "none";
  }

  if (!selectedSubgroupId) {
    return;
  }

  const ranked = items
    .filter((item) => item.visible)
    // .filter((item) => !item.position)
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

  const leader = ranked.find((item) => Number.isFinite(getAbsoluteValue(item)));
  const leaderValue = leader ? getAbsoluteValue(leader) : null;

  for (let i = 0; i < ranked.length; i += 1) {
    const item = ranked[i];
    const newPosition = i + 1;

    const posCell = item.row.querySelector(".rally_results_poz");
    const timeCell = item.row.querySelector(".rally_results_time");
    const diffPrevCell = item.row.querySelector(".rally_results_diff_prev");
    const diffFirstCell = item.row.querySelector(".rally_results_diff_first");
    const spkmCell = item.row.lastElementChild;

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

    if (Number.isFinite(item.rallyTimeSec) && timeCell) {
      timeCell.textContent = formatTime(item.rallyTimeSec);
    }

    if (!Number.isFinite(currentValue)) {
      if (diffPrevCell) diffPrevCell.textContent = "-";
      if (diffFirstCell) diffFirstCell.textContent = "-";
      if (spkmCell) setSecondsPerKmCell(spkmCell, null, { zeroAsDash: true });
      continue;
    }

    const gapPrev = prevValue != null ? currentValue - prevValue : 0;
    const gapLeader = leaderValue != null ? currentValue - leaderValue : 0;
    const spkm = totalKm > 0 ? gapLeader / totalKm : null;

    if (diffPrevCell) {
      diffPrevCell.textContent = newPosition === 1 ? "-" : formatTime(gapPrev);
    }

    if (diffFirstCell) {
      diffFirstCell.textContent = newPosition === 1 ? "-" : formatTime(gapLeader);
    }

    if (spkmCell) {
      setSecondsPerKmCell(spkmCell, spkm, { zeroAsDash: true });
    }
  }
}

async function fetchRallyTotalKm(rallyId) {
  const value = rsfCache.get(`rally:${rallyId}:distanceKm`);
  if (value !== null) return Number(value);

  const descParams = new URLSearchParams(window.location.search);
  descParams.set("centerbox", "rally_list_details.php");

  const descUrl = `${window.location.pathname}?${descParams.toString()}`;

  try {
    const resp = await fetch(descUrl, { credentials: "include" });
    if (!resp.ok) return null;

    const html = await resp.text();
    const kms = extractTotalKmFromHtml(html);
    rsfCache.set(`rally:${rallyId}:distanceKm`, String(kms));
    return kms;
  } catch (_) {
    return null;
  }
}

function extractTotalKmFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = doc.body.textContent || "";
  const match = text.match(
    /Total\s+Distance\s+Rally[^0-9]*([\d]+(?:[.,]\d+)?)\s*km/i
  );

  if (!match) return null;

  const km = Number(match[1].replace(",", "."));
  return Number.isFinite(km) ? km : null;
}

function isResultsDataRow(row) {
  const posCell = row.querySelector(".rally_results_poz");

  if (!posCell) return false;

  const posText = normalizeText(posCell.textContent);
  return /^\d+$/.test(posText);
}

function findRallyResultsDataTable() {
  const found = findFirstMatchingTable({
    selector: "table.rally_results",
    includeTfoot: false,
    match: ({ rows }) => tableHasMatchingRow(rows, isResultsDataRow),
  });

  return found?.table ?? null;
}

function refreshRallyResultsSummary(items = null) {
  const resultsTable = findRallyResultsDataTable();
  if (!resultsTable) return;

  const containerCell = resultsTable ? resultsTable.closest('td') : null;
  const resultsPanel = insertResultsSummaryPanel(
    containerCell,
    'rsf-plugin-summary'
  );
  if (!resultsPanel) return;

  const resultsRows = Array.isArray(items) && items.length
    ? getVisibleParsedRallyRows(items)
    : parseRallyResultsTable(resultsTable);

  if (!resultsRows.length) {
    resultsPanel.innerHTML = `
      <div class="rsf-plugin-summary-layout">
        <div class="rsf-plugin-summary-main">
          <div class="rsf-plugin-summary-user">
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

  const summary = summarizeRallyResults(resultsRows);
  const currentUser = resultsRows.find(row => row.isCurrentUser) || null;

  updateResultsSummaryPanel(resultsPanel, summary, currentUser, renderCurrentUserResultsSection)
}