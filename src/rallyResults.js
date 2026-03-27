import { applyZebraStriping, getDirectTableRows } from "./domTable.js";
import {
  appendSecondsPerKmDataCell,
  appendSecondsPerKmHeader,
} from "./secondsPerKmColumn.js";
import {
  parseDiffToSeconds,
  parseTimeToSeconds,
  normalizeText,
  isDashValue,
} from "./parse.js";
import { getCarByName } from "./cars.js";
import {
  formatTime,
  setSecondsPerKmCell,
} from "./format.js";
import {
    collectAvailableSubclasses,
    getAbsoluteValue,
    createSubclassFilterBar,
} from "./subclassFilterShared.js";
import { insertResultsSummaryPanel, updateResultsSummaryPanel } from "./summary.js";

const RALLY_RESULTS_TOOLTIPS = {
  positionSensitivity: "Average gap between adjacent classified finishers in the visible rally results.",
  srRate: "Percentage of visible drivers marked SR in the rally results.",
};

function getVisibleParsedRallyRows(items = null) {
  if (Array.isArray(items) && items.length) {
    return items
      .filter(item => item.visible)
      .map(item => parseRallyResultsRow(item.row))
      .filter(Boolean);
  }

  return getRallyResultsRows()
    .filter(item => item.visible !== false)
    .map(item => parseRallyResultsRow(item.row))
    .filter(Boolean);
}

export async function addRallyResultsDiff() {
  const totalKm = await fetchRallyTotalKm();
  if (!totalKm || totalKm <= 0) return;

  const resultTables = document.querySelectorAll("table.rally_results");

  for (const table of resultTables) {
    if (table.dataset.rsfResultsDiffDone) continue;

    const rows = getDirectTableRows(table, { includeTfoot: false });
    if (!rows.length) continue;

    let touched = false;

    for (const row of rows) {
      if (row.classList.contains("fejlec2")) {
        appendSecondsPerKmHeader(row, `Seconds per km (Total: ${totalKm} km)`);
        touched = true;
        continue;
      }

      const diffCell = row.querySelector(".rally_results_diff_first");
      if (!diffCell) continue;

      const diffSec = parseDiffToSeconds(diffCell.textContent);
      const spkm = diffSec === null ? null : diffSec / totalKm;

      appendSecondsPerKmDataCell(row, spkm, { zeroAsDash: true });
      touched = true;
    }

    if (touched) {
      table.dataset.rsfResultsDiffDone = "1";
    }
  }

  mountRallySubclassFilter(totalKm);
  refreshRallyResultsSummary();
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

  const subclasses = collectAvailableSubclasses(
    items,
    selectedBaseGroupId,
    {}
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

  bar = createSubclassFilterBar(subclasses);

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

    for (const row of rows) {
      const item = parseRallyResultsRow(row);
      if (!item) continue;

      item.originalOrder = items.length;
      item.visible = true;
      items.push(item);
    }
  }

  return items;
}

function parseRallyResultsRow(row) {
  if (!row || !row.cells || row.cells.length < 7) return null;
  if (row.classList.contains("fejlec2")) return null;

  const cells = row.cells;

  const posCell = row.querySelector(".rally_results_poz") || cells[0] || null;
  const nameCell = cells[1] || null;
  const carCell = row.querySelector(".rally_results_car") || cells[3] || null;
  const timeCell = row.querySelector(".rally_results_time") || cells[4] || null;
  const diffPrevCell = row.querySelector(".rally_results_diff_prev") || cells[5] || null;
  const diffFirstCell = row.querySelector(".rally_results_diff_first") || cells[6] || null;
  const isCurrentUser = row.classList.contains("lista_kiemelt2");

  if (!posCell || !nameCell || !carCell || !timeCell || !diffPrevCell || !diffFirstCell) {
    return null;
  }

  const posText = normalizeText(posCell.textContent).toUpperCase();
  const isSR = posText === "SR" || posText === "=";

  if (!/^\d+$/.test(posText) && !isSR) {
    return null;
  }

  const position = isSR ? null : Number(posText);
  const carName = normalizeText(carCell.textContent);
  const carDetails = carName ? getCarByName(carName) : null;

  let gapToPrevSec = parseDiffToSeconds(diffPrevCell.textContent);
  let gapToLeaderSec = parseDiffToSeconds(diffFirstCell.textContent);

  const isLeader = position === 1 && !isSR;
  if (isLeader) {
    if (isDashValue(diffPrevCell.textContent) || normalizeText(diffPrevCell.textContent) === "00.000") {
      gapToPrevSec = 0;
    }
    if (isDashValue(diffFirstCell.textContent) || normalizeText(diffFirstCell.textContent) === "00.000") {
      gapToLeaderSec = 0;
    }
  }

  const rawTimeText =
    timeCell.querySelector("b")?.textContent ??
    timeCell.textContent ??
    "";

  return {
    row,
    position,
    isSR,
    isCurrentUser,
    carDetails,
    rallyTimeSec: parseTimeToSeconds(rawTimeText),
    gapToPrevSec,
    gapToLeaderSec,
  };
}

function cacheOriginalValues(items) {
  for (const item of items) {
    const row = item.row;

    item.originalValues = {
      display: row.style.display || "",
      background: row.style.background || "",
      pos: row.querySelector(".rally_results_poz")?.textContent ?? "",
      time: row.querySelector(".rally_results_time")?.textContent ?? "",
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
    applyZebraStriping(items);
    return;
  }

  const ranked = items
    .filter((item) => item.visible)
    .filter((item) => !item.isSR)
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
    applyZebraStriping(items);
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

  applyZebraStriping(items);
}

async function fetchRallyTotalKm() {
  const descParams = new URLSearchParams(window.location.search);
  descParams.set("centerbox", "rally_list_details.php");

  const descUrl = `${window.location.pathname}?${descParams.toString()}`;

  try {
    const resp = await fetch(descUrl, { credentials: "include" });
    if (!resp.ok) return null;

    const html = await resp.text();
    return extractTotalKmFromHtml(html);
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

function findCurrentUserRallyResult(rows) {
  return rows.find(row => row.isCurrentUser) || null;
}

function summarizeRallyResults(rows) {
  const classifiedRows = rows
    .filter(row => !row.isSR)
    .filter(row => Number.isFinite(row.position))
    .filter(row => Number.isFinite(row.gapToLeaderSec))
    .sort((a, b) => a.position - b.position);

  let totalAdjacentGap = 0;
  let adjacentGapCount = 0;

  for (let i = 1; i < classifiedRows.length; i += 1) {
    const prev = classifiedRows[i - 1];
    const curr = classifiedRows[i];

    if (
      !Number.isFinite(prev.gapToLeaderSec) ||
      !Number.isFinite(curr.gapToLeaderSec)
    ) {
      continue;
    }

    totalAdjacentGap += curr.gapToLeaderSec - prev.gapToLeaderSec;
    adjacentGapCount += 1;
  }

  const srCount = rows.filter(row => row.isSR).length;
  const srRate = rows.length ? srCount / rows.length : 0;
  const positionSensitivity = adjacentGapCount
    ? totalAdjacentGap / adjacentGapCount
    : 0;

  return {
    classifiedRows,
    srRate,
    positionSensitivity,
  };
}

function refreshRallyResultsSummary(items = null) {
  const panel = insertResultsSummaryPanel();
  if (!panel) return;

  const rows = getVisibleParsedRallyRows(items);
  if (!rows.length) {
    panel.innerHTML = `
      <div class="rsf-plugin-summary-item">
        <span class="rsf-plugin-summary-label">Result</span>
        <span class="rsf-plugin-summary-value">—</span>
      </div>
    `;
    return;
  }

  const summary = summarizeRallyResults(rows);
  const currentUser = findCurrentUserRallyResult(rows);

  updateResultsSummaryPanel(panel, summary, currentUser);
}