(() => {
  // src/parse.js
  function parseTimeToSeconds(timeStr) {
    if (typeof timeStr !== "string") return null;
    const s = timeStr.trim();
    if (!s || s === "-" || s.toLowerCase() === "n/a") return null;
    const parts = s.split(":").map((p) => p.trim());
    if (parts.length < 1 || parts.length > 3) return null;
    const intPattern = /^\d+$/;
    const lastPattern = /^\d+(?:[.,]\d+)?$/;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!intPattern.test(parts[i])) return null;
    }
    if (!lastPattern.test(parts[parts.length - 1])) return null;
    const nums = parts.map(
      (part, i) => Number(i === parts.length - 1 ? part.replace(",", ".") : part)
    );
    if (nums.some((n) => !Number.isFinite(n))) return null;
    if (parts.length === 1) {
      const [seconds2] = nums;
      return seconds2;
    }
    if (parts.length === 2) {
      const [minutes2, seconds2] = nums;
      if (minutes2 < 0) return null;
      if (seconds2 < 0 || seconds2 >= 60) return null;
      return minutes2 * 60 + seconds2;
    }
    const [hours, minutes, seconds] = nums;
    if (hours < 0) return null;
    if (minutes < 0 || minutes >= 60) return null;
    if (seconds < 0 || seconds >= 60) return null;
    return hours * 3600 + minutes * 60 + seconds;
  }
  function parseDiffToSeconds(str) {
    if (typeof str !== "string") return null;
    const s = str.trim();
    if (!s || s.includes("-")) return null;
    if (!s.includes(":")) {
      if (!/^\d+(?:[.,]\d+)?$/.test(s)) return null;
      const seconds = Number(s.replace(",", "."));
      return Number.isFinite(seconds) ? seconds : null;
    }
    return parseTimeToSeconds(s);
  }
  function parseKm(lenStr) {
    if (typeof lenStr !== "string") return null;
    const s = lenStr.trim();
    if (!s) return null;
    const match = s.match(/^(\d+(?:[.,]\d+)?)\s*km$/i);
    if (!match) return null;
    const km = Number(match[1].replace(",", "."));
    return Number.isFinite(km) ? km : null;
  }

  // src/stats.js
  function createStageStatsSummary() {
    return {
      drivenCount: 0,
      undrivenCount: 0,
      drivenKm: 0,
      diffs: []
    };
  }
  function calculateMedian(values) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }
  function summarizeStageStats(stats) {
    const { diffs, drivenCount, undrivenCount, drivenKm } = stats;
    if (!diffs.length) {
      return {
        drivenCount,
        undrivenCount,
        drivenKm,
        totalCount: drivenCount + undrivenCount,
        average: null,
        median: null,
        best: null,
        worst: null,
        consistency: null
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
      drivenKm,
      totalCount: drivenCount + undrivenCount,
      average,
      median,
      best,
      worst,
      consistency: average - median
    };
  }
  function addDrivenStage(stats, diff, km) {
    if (!stats || !Number.isFinite(diff) || !Number.isFinite(km) || km <= 0) {
      return stats;
    }
    stats.drivenCount += 1;
    stats.drivenKm += km;
    stats.diffs.push(diff);
    return stats;
  }
  function addUndrivenStage(stats) {
    if (!stats) return stats;
    stats.undrivenCount += 1;
    return stats;
  }

  // src/format.js
  function formatSecondsPerKm(spkm) {
    if (spkm === null || !Number.isFinite(spkm)) return "\u2014";
    return `+${spkm.toFixed(2)} s/km`;
  }
  function formatConsistency(value) {
    if (value === null || !Number.isFinite(value)) return "\u2014";
    return `${value.toFixed(2)} s/km`;
  }
  function getSecondsPerKmClass(spkm) {
    if (spkm === null || !Number.isFinite(spkm)) return "rsf-plugin-diff--na";
    if (spkm <= 1) return "rsf-plugin-diff--great";
    if (spkm <= 3) return "rsf-plugin-diff--ok";
    if (spkm <= 6) return "rsf-plugin-diff--slow";
    return "rsf-plugin-diff--bad";
  }
  function getConsistencyClass(value) {
    if (value === null || !Number.isFinite(value)) return "rsf-plugin-diff--na";
    if (value <= 0.25) return "rsf-plugin-diff--great";
    if (value <= 0.75) return "rsf-plugin-diff--ok";
    if (value <= 1.5) return "rsf-plugin-diff--slow";
    return "rsf-plugin-diff--bad";
  }
  function setSecondsPerKmCell(cell, spkm, options = {}) {
    const { zeroAsDash = false } = options;
    cell.classList.add("rsf-plugin-diff");
    if (spkm === null || !Number.isFinite(spkm)) {
      cell.textContent = "\u2014";
      cell.classList.add("rsf-plugin-diff--na");
      return;
    }
    if (spkm === 0 && zeroAsDash) {
      cell.textContent = "\u2014";
      cell.classList.add("rsf-plugin-diff--great");
      return;
    }
    cell.textContent = `+${spkm.toFixed(2)} s/km`;
    cell.classList.add(getSecondsPerKmClass(spkm));
  }

  // src/summary.js
  var SUMMARY_TOOLTIPS = {
    average: "Average seconds per kilometer slower than the world record across visible driven stages.",
    median: "The middle s/km value across visible driven stages. This represents your typical pace and is less affected by one very bad stage.",
    consistency: "Average minus median. Lower is better. A larger value usually means one or more bad stages hurt your rally.",
    best: "Your best visible stage pace in seconds per kilometer slower than the world record.",
    worst: "Your worst visible stage pace in seconds per kilometer slower than the world record.",
    drivenCount: "Number of visible stages with both a personal record and a world record time.",
    undrivenCount: "Number of visible stages that have a world record but no personal record.",
    totalCount: "Total number of visible stages included in this summary.",
    drivenKm: "Total visible kilometers across driven stages."
  };
  function insertStageStatsPanel(table) {
    let panel = table.previousElementSibling;
    if (panel && panel.classList.contains("rsf-plugin-summary")) {
      return panel;
    }
    panel = document.createElement("div");
    panel.className = "rsf-plugin-summary";
    table.insertAdjacentElement("beforebegin", panel);
    return panel;
  }
  function updateStageStatsPanel(panel, stats) {
    const summary = summarizeStageStats(stats);
    panel.innerHTML = `
    ${renderSummaryMetric(
      "Avg",
      formatSecondsPerKm(summary.average),
      getSecondsPerKmClass(summary.average),
      SUMMARY_TOOLTIPS.average
    )}
    ${renderSummaryMetric(
      "Median",
      formatSecondsPerKm(summary.median),
      getSecondsPerKmClass(summary.median),
      SUMMARY_TOOLTIPS.median
    )}
    ${renderSummaryMetric(
      "Consistency",
      formatConsistency(summary.consistency),
      getConsistencyClass(summary.consistency),
      SUMMARY_TOOLTIPS.consistency
    )}
    ${renderSummaryMetric(
      "Best",
      formatSecondsPerKm(summary.best),
      getSecondsPerKmClass(summary.best),
      SUMMARY_TOOLTIPS.best
    )}
    ${renderSummaryMetric(
      "Worst",
      formatSecondsPerKm(summary.worst),
      getSecondsPerKmClass(summary.worst),
      SUMMARY_TOOLTIPS.worst
    )}
    ${renderSummaryMetric(
      "Driven",
      String(summary.drivenCount),
      "",
      SUMMARY_TOOLTIPS.drivenCount
    )}
    ${renderSummaryMetric(
      "Undriven",
      String(summary.undrivenCount),
      "",
      SUMMARY_TOOLTIPS.undrivenCount
    )}
    ${renderSummaryMetric(
      "Total",
      String(summary.totalCount),
      "",
      SUMMARY_TOOLTIPS.totalCount
    )}
    ${renderSummaryMetric(
      "Driven km",
      `${summary.drivenKm.toFixed(1)} km`,
      "",
      SUMMARY_TOOLTIPS.drivenKm
    )}
  `;
  }
  function renderSummaryMetric(label, value, valueClass = "", tooltip = "") {
    const classAttr = valueClass ? ` rsf-plugin-summary-value ${valueClass}` : " rsf-plugin-summary-value";
    const titleAttr = escapeHtmlAttr(tooltip);
    return `
    <div class="rsf-plugin-summary-item">
      <span class="rsf-plugin-summary-label">${escapeHtml(label)}</span>
      <span class="${classAttr.trim()}" title="${titleAttr}">${escapeHtml(value)}</span>
    </div>
  `;
  }
  function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function escapeHtmlAttr(value) {
    return escapeHtml(value);
  }

  // src/userstats.js
  function addDiffColumn() {
    const tables = document.querySelectorAll("table");
    for (const table of tables) {
      if (table.dataset.rsfPluginDone) continue;
      const rows = getDirectTableRows(table);
      if (rows.length < 2) continue;
      const headerInfo = findHeaderRow(rows);
      if (!headerInfo) continue;
      const { headerRow, headerRowIdx } = headerInfo;
      const dataRows = rows.slice(headerRowIdx + 1);
      const cols = detectColumns(headerRow, dataRows);
      if (!cols) continue;
      processStatsTable(table, headerRow, dataRows, cols);
    }
  }
  function getDirectTableRows(table) {
    return Array.from(table.querySelectorAll(
      ":scope > tr, :scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr"
    ));
  }
  function findHeaderRow(rows) {
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].cells;
      let hasPR = false;
      let hasWR = false;
      for (let j = 0; j < cells.length; j++) {
        const text = cells[j].textContent.trim().toUpperCase();
        if (text === "PR") hasPR = true;
        else if (text === "WR") hasWR = true;
      }
      if (hasPR && hasWR) {
        return { headerRow: rows[i], headerRowIdx: i };
      }
    }
    return null;
  }
  function detectColumns(headerRow, dataRows) {
    const headerCells = headerRow.cells;
    let prIdx = -1;
    let wrIdx = -1;
    for (let i = 0; i < headerCells.length; i++) {
      const text = headerCells[i].textContent.trim().toUpperCase();
      if (text === "PR") prIdx = i;
      else if (text === "WR") wrIdx = i;
    }
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
  function insertDiffHeaderCell(headerRow, wrIdx) {
    const headerCells = headerRow.cells;
    if (wrIdx < 0 || wrIdx >= headerCells.length) return;
    const th = document.createElement("td");
    th.className = "rsf-plugin-header";
    th.textContent = "s/km";
    th.title = "Seconds per km slower than WR  =  (PR \u2212 WR) \xF7 stage length";
    headerCells[wrIdx].insertAdjacentElement("afterend", th);
  }
  function processStatsTable(table, headerRow, dataRows, cols) {
    table.dataset.rsfPluginDone = "1";
    table.style.minWidth = table.offsetWidth + "px";
    insertDiffHeaderCell(headerRow, cols.wrIdx);
    var stats = createStageStatsSummary();
    for (const row of dataRows) {
      const result = insertDiffDataCell(row, cols, stats);
      if (result === "undriven") {
        stats = addUndrivenStage(stats);
      }
    }
    const summaryPanel = insertStageStatsPanel(table);
    updateStageStatsPanel(summaryPanel, stats);
    if (stats.undrivenCount > 0) {
      insertUndrivenFilter(table, stats.undrivenCount);
    }
  }
  function insertDiffDataCell(row, cols, stats) {
    const cells = row.cells;
    if (cells.length <= cols.wrIdx || cells.length <= cols.prIdx || cells.length <= cols.kmIdx) {
      return "skip";
    }
    const td = document.createElement("td");
    const km = parseKm(cells[cols.kmIdx].textContent);
    const prSec = parseTimeToSeconds(cells[cols.prIdx].textContent);
    const wrSec = parseTimeToSeconds(cells[cols.wrIdx].textContent);
    if (km && km > 0 && prSec !== null && wrSec !== null) {
      const diff = (prSec - wrSec) / km;
      setSecondsPerKmCell(td, diff);
      cells[cols.wrIdx].insertAdjacentElement("afterend", td);
      stats = addDrivenStage(stats, diff, km);
      return "ok";
    }
    setSecondsPerKmCell(td, null);
    if (wrSec !== null) {
      row.classList.add("rsf-plugin-row-undriven");
      cells[cols.wrIdx].insertAdjacentElement("afterend", td);
      return "undriven";
    }
    cells[cols.wrIdx].insertAdjacentElement("afterend", td);
    return "na";
  }
  function insertUndrivenFilter(table, undrivenCount) {
    const filterBar = document.createElement("div");
    filterBar.className = "rsf-plugin-filter";
    filterBar.innerHTML = `<label><input type="checkbox" class="rsf-plugin-filter-cb"> Hide undriven stages (${undrivenCount})</label>`;
    table.insertAdjacentElement("beforebegin", filterBar);
    const checkbox = filterBar.querySelector(".rsf-plugin-filter-cb");
    checkbox.addEventListener("change", (e) => {
      const hide = e.target.checked;
      table.querySelectorAll(".rsf-plugin-row-undriven").forEach((row) => {
        row.style.display = hide ? "none" : "";
      });
    });
  }

  // src/rallyResults.js
  async function addRallyResultsDiff(rallyId) {
    const totalKm = await fetchRallyTotalKm();
    if (!totalKm || totalKm <= 0) return;
    const resultTables = document.querySelectorAll("table.rally_results");
    for (const table of resultTables) {
      if (table.dataset.rsfResultsDiffDone) continue;
      const rows = getDirectTableRows(table);
      if (!rows.length) continue;
      let touched = false;
      for (const row of rows) {
        if (row.classList.contains("fejlec2")) {
          insertRallyResultsHeaderCell(row, totalKm);
          touched = true;
          continue;
        }
        const diffCell = row.querySelector(".rally_results_diff_first");
        if (!diffCell) continue;
        insertRallyResultsDataCell(row, diffCell.textContent, totalKm);
        touched = true;
      }
      if (touched) {
        table.dataset.rsfResultsDiffDone = "1";
      }
    }
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
    const match = text.match(/Total\s+Distance\s+Rally[^0-9]*([\d]+(?:[.,]\d+)?)\s*km/i);
    if (!match) return null;
    const km = Number(match[1].replace(",", "."));
    return Number.isFinite(km) ? km : null;
  }
  function insertRallyResultsHeaderCell(row, totalKm) {
    if (row.querySelector(".rsf-plugin-header")) return;
    const th = document.createElement("td");
    th.className = "rsf-plugin-header";
    th.align = "center";
    th.style.width = "13%";
    th.textContent = "s/km";
    th.title = `Seconds per km behind the leader (total rally distance: ${totalKm} km)`;
    row.appendChild(th);
  }
  function insertRallyResultsDataCell(row, diffText, totalKm) {
    if (row.querySelector(".rsf-plugin-diff")) return;
    const td = document.createElement("td");
    td.align = "center";
    const diffSec = parseDiffToSeconds(diffText);
    if (diffSec === null) {
      setSecondsPerKmCell(td, null);
      row.appendChild(td);
      return;
    }
    const spkm = diffSec / totalKm;
    setSecondsPerKmCell(td, spkm, { zeroAsDash: true });
    row.appendChild(td);
  }

  // src/rallySearch.js
  function addRallySearchFilter() {
    const table = findRallyListTable();
    if (!table || table.dataset.rsfSearchDone) return;
    const allRows = getDirectTableRowsBasic(table);
    if (allRows.length < 2) return;
    const headerRow = allRows[0];
    const dataRows = allRows.slice(1);
    const dataParent = dataRows[0]?.parentNode;
    if (!dataParent) return;
    table.dataset.rsfSearchDone = "1";
    insertFavoriteHeaderCell(headerRow);
    insertFavoriteButtons(dataRows);
    reorderFavoriteRows(dataRows, dataParent);
    const ui = insertRallySearchBar(table, dataRows.length);
    function applyFilters() {
      const term = ui.input.value.trim().toLowerCase();
      const hidePasswordProtected = ui.hidePwCb.checked;
      let visibleCount = 0;
      for (const row of dataRows) {
        const isPasswordProtected = row.classList.contains("lista_password");
        const rowText = row.textContent.toLowerCase();
        const matchesSearch = !term || rowText.includes(term);
        const matchesPasswordFilter = !(hidePasswordProtected && isPasswordProtected);
        const show = matchesSearch && matchesPasswordFilter;
        row.style.display = show ? "" : "none";
        if (show) visibleCount++;
      }
      updateRallyCount(ui.countEl, visibleCount, dataRows.length);
    }
    function refreshView() {
      reorderFavoriteRows(dataRows, dataParent);
      applyFilters();
    }
    bindFavoriteButtons(dataRows, refreshView);
    bindSearchUi(ui, applyFilters);
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        ui.input.focus();
      }
    });
    applyFilters();
  }
  function getDirectTableRowsBasic(table) {
    return Array.from(table.querySelectorAll(
      ":scope > tr, :scope > thead > tr, :scope > tbody > tr"
    ));
  }
  function findRallyListTable() {
    const tables = document.querySelectorAll("table");
    let bestTable = null;
    let bestScore = -1;
    for (const table of tables) {
      const rows = getDirectTableRowsBasic(table);
      if (rows.length < 2) continue;
      const score = scoreRallyListTable(rows);
      if (score > bestScore) {
        bestScore = score;
        bestTable = table;
      }
    }
    return bestScore > 0 ? bestTable : null;
  }
  function scoreRallyListTable(rows) {
    const dataRows = rows.slice(1);
    if (!dataRows.length) return 0;
    let score = 0;
    let linkedRows = 0;
    let passwordRows = 0;
    let multiCellRows = 0;
    for (const row of dataRows) {
      const cells = row.cells;
      if (cells.length >= 2) {
        multiCellRows++;
        score += 1;
      }
      const link = row.querySelector("a[href]");
      if (link) {
        linkedRows++;
        score += 2;
        const href = link.getAttribute("href") || "";
        if (/rally|online|rally_id|centerbox/i.test(href)) {
          score += 3;
        }
      }
      if (row.classList.contains("lista_password")) {
        passwordRows++;
        score += 3;
      }
    }
    if (linkedRows === 0) return 0;
    if (multiCellRows === 0) return 0;
    return score;
  }
  function getRallyFavoritesKey() {
    return "rsf-plugin-rally-favs";
  }
  function loadRallyFavorites() {
    try {
      const raw = localStorage.getItem(getRallyFavoritesKey());
      const parsed = JSON.parse(raw || "[]");
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (_) {
      return /* @__PURE__ */ new Set();
    }
  }
  function saveRallyFavorites(favs) {
    localStorage.setItem(getRallyFavoritesKey(), JSON.stringify([...favs]));
  }
  function getRallyRowId(row) {
    const link = row.querySelector("a[href]");
    if (link) return link.getAttribute("href");
    const firstCell = row.cells[0];
    return (firstCell ? firstCell.textContent : row.textContent).trim().slice(0, 80);
  }
  function insertFavoriteHeaderCell(headerRow) {
    if (headerRow.querySelector(".rsf-plugin-fav-header")) return;
    const th = document.createElement("td");
    th.className = "rsf-plugin-fav-header";
    headerRow.insertBefore(th, headerRow.firstChild);
  }
  function insertFavoriteButtons(dataRows) {
    const favs = loadRallyFavorites();
    for (const row of dataRows) {
      if (row.querySelector(".rsf-plugin-fav-cell")) continue;
      const id = getRallyRowId(row);
      const isFav = favs.has(id);
      if (isFav) row.classList.add("rsf-plugin-pinned");
      const td = document.createElement("td");
      td.className = "rsf-plugin-fav-cell";
      const btn = document.createElement("button");
      btn.className = "rsf-plugin-fav-btn";
      btn.textContent = isFav ? "\u2605" : "\u2606";
      btn.title = isFav ? "Unpin" : "Pin to top";
      btn.dataset.rallyId = id;
      td.appendChild(btn);
      row.insertBefore(td, row.firstChild);
    }
  }
  function bindFavoriteButtons(dataRows, onChange) {
    for (const row of dataRows) {
      const btn = row.querySelector(".rsf-plugin-fav-btn");
      if (!btn || btn.dataset.rsfBound === "1") continue;
      btn.dataset.rsfBound = "1";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.rallyId;
        const favs = loadRallyFavorites();
        if (favs.has(id)) {
          favs.delete(id);
          btn.textContent = "\u2606";
          btn.title = "Pin to top";
          row.classList.remove("rsf-plugin-pinned");
        } else {
          favs.add(id);
          btn.textContent = "\u2605";
          btn.title = "Unpin";
          row.classList.add("rsf-plugin-pinned");
        }
        saveRallyFavorites(favs);
        onChange();
      });
    }
  }
  function reorderFavoriteRows(dataRows, dataParent) {
    const favs = loadRallyFavorites();
    const pinnedRows = [];
    const unpinnedRows = [];
    for (const row of dataRows) {
      if (favs.has(getRallyRowId(row))) {
        pinnedRows.push(row);
      } else {
        unpinnedRows.push(row);
      }
    }
    for (const row of pinnedRows) {
      dataParent.appendChild(row);
    }
    for (const row of unpinnedRows) {
      dataParent.appendChild(row);
    }
  }
  function insertRallySearchBar(table, totalRows) {
    const bar = document.createElement("div");
    bar.className = "rsf-plugin-search-bar";
    bar.innerHTML = `<input type="text" class="rsf-plugin-search-input"
            placeholder="Search rallies\u2026"
            autocomplete="off" spellcheck="false">
     <label class="rsf-plugin-search-label">
       <input type="checkbox" class="rsf-plugin-hide-pw-cb">
       Hide password-protected
     </label>
     <span class="rsf-plugin-search-count"></span>`;
    table.insertAdjacentElement("beforebegin", bar);
    const input = bar.querySelector(".rsf-plugin-search-input");
    const hidePwCb = bar.querySelector(".rsf-plugin-hide-pw-cb");
    const countEl = bar.querySelector(".rsf-plugin-search-count");
    updateRallyCount(countEl, totalRows, totalRows);
    return { bar, input, hidePwCb, countEl };
  }
  function bindSearchUi(ui, applyFilters) {
    ui.input.addEventListener("input", applyFilters);
    ui.hidePwCb.addEventListener("change", applyFilters);
  }
  function updateRallyCount(countEl, visible, total) {
    countEl.textContent = visible === total ? `${total} rallies` : `${visible} / ${total} rallies`;
  }

  // src/stages.js
  function addStagesFilter() {
    const SURFACES = ["gravel", "tarmac", "snow"];
    let targetTable = null, surfaceColIdx = -1, headerRow = null, headerRowIdx = -1, dataRows = [];
    outer:
      for (const table of document.querySelectorAll("table")) {
        const rows = Array.from(table.querySelectorAll(
          ":scope > tr, :scope > thead > tr, :scope > tbody > tr"
        ));
        if (rows.length < 2) continue;
        for (let i = 0; i < rows.length; i++) {
          const cells = Array.from(rows[i].querySelectorAll("th, td"));
          const idx = cells.findIndex((c) => c.textContent.trim().toLowerCase() === "surface");
          if (idx !== -1) {
            const hasData = rows.slice(i + 1).some((r) => {
              const dc = Array.from(r.querySelectorAll("td"));
              return dc.length > idx && SURFACES.includes(dc[idx].textContent.trim().toLowerCase());
            });
            if (!hasData) continue;
            targetTable = table;
            surfaceColIdx = idx;
            headerRow = rows[i];
            headerRowIdx = i;
            dataRows = rows.slice(i + 1);
            break outer;
          }
        }
      }
    if (!targetTable) return;
    const bar = document.createElement("div");
    bar.className = "rsf-plugin-filter rsf-plugin-surface-bar";
    bar.innerHTML = SURFACES.map(
      (s) => `<label class="rsf-plugin-surface-label rsf-plugin-surface-${s}">
         <input type="checkbox" class="rsf-plugin-surface-cb" value="${s}" checked>
         ${s[0].toUpperCase() + s.slice(1)}
       </label>`
    ).join("");
    targetTable.insertAdjacentElement("beforebegin", bar);
    function applyFilter() {
      const checked = new Set(
        [...bar.querySelectorAll(".rsf-plugin-surface-cb:checked")].map((cb) => cb.value)
      );
      const showAll = checked.size === 0 || checked.size === SURFACES.length;
      for (const row of dataRows) {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length <= surfaceColIdx) continue;
        const surface = cells[surfaceColIdx].textContent.trim().toLowerCase();
        row.style.display = showAll || checked.has(surface) ? "" : "none";
      }
    }
    bar.querySelectorAll(".rsf-plugin-surface-cb").forEach(
      (cb) => cb.addEventListener("change", applyFilter)
    );
    applyFilter();
  }

  // src/content.js
  function init() {
    const page = window.location.pathname.split("/").pop();
    const params = new URLSearchParams(window.location.search);
    const centerbox = params.get("centerbox");
    const rallyId = params.get("rally_id");
    if (page === "rally_online.php") {
      if (centerbox === "rally_results.php" && rallyId) {
        addRallyResultsDiff(rallyId);
      } else if (!centerbox) {
        addRallySearchFilter();
      }
    } else if (page === "usersstats.php") {
      addDiffColumn();
    } else if (page === "stages.php") {
      addStagesFilter();
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
