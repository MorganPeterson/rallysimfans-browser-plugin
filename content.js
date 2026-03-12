(function () {
  'use strict';

  // Convert "MM:SS.mmm" or "H:MM:SS.mmm" to total seconds. Returns null on failure.
  function parseTimeToSeconds(timeStr) {
    if (!timeStr) return null;
    timeStr = timeStr.trim();
    if (!timeStr || timeStr === '-' || timeStr.toLowerCase() === 'n/a') return null;

    const parts = timeStr.split(':');
    try {
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10);
        const seconds = parseFloat(parts[1].replace(',', '.'));
        if (isNaN(minutes) || isNaN(seconds)) return null;
        return minutes * 60 + seconds;
      }
      if (parts.length === 3) {
        const hours   = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseFloat(parts[2].replace(',', '.'));
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
        return hours * 3600 + minutes * 60 + seconds;
      }
    } catch (_) {}
    return null;
  }

  // Extract km from "13.4 km", "9,7 km", etc.
  function parseKm(lenStr) {
    if (!lenStr) return null;
    const match = lenStr.replace(',', '.').match(/([\d]+\.?[\d]*)/);
    return match ? parseFloat(match[1]) : null;
  }

  // Find PR and WR indices from header text; find km by scanning first full data row.
  function detectColumns(headerRow, dataRows) {
    const headerCells = Array.from(headerRow.querySelectorAll('th, td'));
    let prIdx = -1, wrIdx = -1;

    headerCells.forEach((cell, idx) => {
      const text = cell.textContent.trim().toUpperCase();
      if (text === 'PR') prIdx = idx;
      if (text === 'WR') wrIdx = idx;
    });

    if (prIdx === -1 || wrIdx === -1) return null;

    // km header is blank on this site — find it by looking at the first full data row.
    let kmIdx = -1;
    for (const row of dataRows) {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length < wrIdx + 1) continue; // skip short rows (country banners)
      for (let i = 0; i < cells.length; i++) {
        if (/[\d][.,][\d]+ km/.test(cells[i].textContent.trim())) {
          kmIdx = i;
          break;
        }
      }
      if (kmIdx !== -1) break;
    }

    if (kmIdx === -1) return null;
    return { kmIdx, prIdx, wrIdx };
  }

  function addDiffColumn() {
    const tables = document.querySelectorAll('table');

    for (const table of tables) {
      if (table.dataset.rsfPluginDone) continue;

      // Use :scope to get only rows that directly belong to THIS table,
      // not rows inside any nested tables within cells.
      const rows = Array.from(table.querySelectorAll(
        ':scope > tr, :scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr'
      ));
      if (rows.length < 2) continue;

      // Find the header row that has both PR and WR cells.
      let headerRow = null, headerRowIdx = -1;
      for (let i = 0; i < rows.length; i++) {
        const texts = Array.from(rows[i].querySelectorAll('th, td'))
          .map(c => c.textContent.trim().toUpperCase());
        if (texts.includes('PR') && texts.includes('WR')) {
          headerRow = rows[i];
          headerRowIdx = i;
          break;
        }
      }
      if (!headerRow) continue;

      const dataRows = rows.slice(headerRowIdx + 1);
      const cols = detectColumns(headerRow, dataRows);
      if (!cols) continue;

      table.dataset.rsfPluginDone = '1';

      // Lock the table's current rendered width so adding a column doesn't shrink it.
      table.style.minWidth = table.offsetWidth + 'px';

      // Insert s/km header cell immediately after the WR header cell.
      const th = document.createElement('td');
      th.className = 'rsf-plugin-header';
      th.textContent = 's/km';
      th.title = 'Seconds per km slower than WR  =  (PR − WR) ÷ stage length';
      const headerCells = Array.from(headerRow.querySelectorAll('th, td'));
      headerCells[cols.wrIdx].insertAdjacentElement('afterend', th);

      // Process every row after the header.
      let undrivenCount = 0;
      for (const row of dataRows) {
        const cells = Array.from(row.querySelectorAll('td'));

        // Country-banner rows (too few cells to contain WR): skip entirely.
        // Their colspan already covers all columns; no cell insertion needed.
        if (cells.length <= cols.wrIdx) continue;

        const td = document.createElement('td');
        td.className = 'rsf-plugin-diff';

        const km    = parseKm(cells[cols.kmIdx].textContent);
        const prSec = parseTimeToSeconds(cells[cols.prIdx].textContent);
        const wrSec = parseTimeToSeconds(cells[cols.wrIdx].textContent);

        if (km && km > 0 && prSec !== null && wrSec !== null) {
          const diff = (prSec - wrSec) / km;
          td.textContent = `+${diff.toFixed(2)} s/km`;

          if      (diff <= 1) td.classList.add('rsf-plugin-diff--great');
          else if (diff <= 3) td.classList.add('rsf-plugin-diff--ok');
          else if (diff <= 6) td.classList.add('rsf-plugin-diff--slow');
          else                td.classList.add('rsf-plugin-diff--bad');
        } else {
          td.textContent = '—';
          td.classList.add('rsf-plugin-diff--na');
          // Mark row as undriven only when there is a WR but no PR
          if (wrSec !== null) {
            row.classList.add('rsf-plugin-row-undriven');
            undrivenCount++;
          }
        }

        // Insert immediately after the WR cell — never append to the row end.
        cells[cols.wrIdx].insertAdjacentElement('afterend', td);
      }

      // Inject filter checkbox above the table (only if there are undriven stages).
      if (undrivenCount > 0) {
        const filterBar = document.createElement('div');
        filterBar.className = 'rsf-plugin-filter';
        filterBar.innerHTML =
          `<label><input type="checkbox" class="rsf-plugin-filter-cb"> ` +
          `Hide undriven stages (${undrivenCount})</label>`;
        table.insertAdjacentElement('beforebegin', filterBar);

        filterBar.querySelector('.rsf-plugin-filter-cb').addEventListener('change', (e) => {
          table.querySelectorAll('.rsf-plugin-row-undriven').forEach(row => {
            row.style.display = e.target.checked ? 'none' : '';
          });
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Rally search filter — rally_online.php
  // ---------------------------------------------------------------------------

  function addRallySearchFilter() {
    const FAVS_KEY = 'rsf-plugin-rally-favs';

    function loadFavs() {
      try { return new Set(JSON.parse(localStorage.getItem(FAVS_KEY) || '[]')); }
      catch (_) { return new Set(); }
    }
    function saveFavs(set) {
      localStorage.setItem(FAVS_KEY, JSON.stringify([...set]));
    }
    // Use the first link href in the row as a stable ID, fall back to trimmed text.
    function getRallyId(row) {
      const link = row.querySelector('a[href]');
      if (link) return link.getAttribute('href');
      const cell = row.querySelector('td');
      return (cell ? cell.textContent : row.textContent).trim().slice(0, 80);
    }

    // Find the largest table on the page — that's the rally list.
    const tables = Array.from(document.querySelectorAll('table'));
    if (!tables.length) return;

    const table = tables.reduce((best, t) => {
      const a = t.querySelectorAll(':scope > tr, :scope > thead > tr, :scope > tbody > tr').length;
      const b = best.querySelectorAll(':scope > tr, :scope > thead > tr, :scope > tbody > tr').length;
      return a > b ? t : best;
    });

    const allRows = Array.from(table.querySelectorAll(
      ':scope > tr, :scope > thead > tr, :scope > tbody > tr'
    ));
    if (allRows.length < 2) return;

    const headerRow = allRows[0];
    const dataRows  = allRows.slice(1);
    const dataParent = dataRows[0].parentNode;

    // Re-order DOM: pinned rows first, then the rest.
    function reorderRows() {
      const favs = loadFavs();
      const pinned   = dataRows.filter(r => favs.has(getRallyId(r)));
      const unpinned = dataRows.filter(r => !favs.has(getRallyId(r)));
      for (const row of pinned)   dataParent.appendChild(row);
      for (const row of unpinned) dataParent.appendChild(row);
    }

    // Add star-toggle cell to the header.
    const starTh = document.createElement('td');
    starTh.className = 'rsf-plugin-fav-header';
    headerRow.insertBefore(starTh, headerRow.firstChild);

    // Add a star button as the first cell of every data row.
    const initialFavs = loadFavs();
    for (const row of dataRows) {
      const id    = getRallyId(row);
      const isFav = initialFavs.has(id);
      if (isFav) row.classList.add('rsf-plugin-pinned');

      const td  = document.createElement('td');
      td.className = 'rsf-plugin-fav-cell';
      const btn = document.createElement('button');
      btn.className = 'rsf-plugin-fav-btn';
      btn.textContent = isFav ? '★' : '☆';
      btn.title = isFav ? 'Unpin' : 'Pin to top';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const favs = loadFavs();
        if (favs.has(id)) {
          favs.delete(id);
          btn.textContent = '☆';
          btn.title = 'Pin to top';
          row.classList.remove('rsf-plugin-pinned');
        } else {
          favs.add(id);
          btn.textContent = '★';
          btn.title = 'Unpin';
          row.classList.add('rsf-plugin-pinned');
        }
        saveFavs(favs);
        reorderRows();
        applyFilters();
      });

      td.appendChild(btn);
      row.insertBefore(td, row.firstChild);
    }

    // Apply saved pinning order on load.
    reorderRows();

    // Build the search / filter bar.
    const bar = document.createElement('div');
    bar.className = 'rsf-plugin-search-bar';
    bar.innerHTML =
      `<input type="text" class="rsf-plugin-search-input"
              placeholder="Search rallies…"
              autocomplete="off" spellcheck="false">
       <label class="rsf-plugin-search-label">
         <input type="checkbox" class="rsf-plugin-hide-pw-cb">
         Hide password-protected
       </label>
       <span class="rsf-plugin-search-count"></span>`;
    table.insertAdjacentElement('beforebegin', bar);

    const input    = bar.querySelector('.rsf-plugin-search-input');
    const hidePwCb = bar.querySelector('.rsf-plugin-hide-pw-cb');
    const countEl  = bar.querySelector('.rsf-plugin-search-count');

    function applyFilters() {
      const term   = input.value.trim().toLowerCase();
      const hidePw = hidePwCb.checked;
      let visible = 0;

      for (const row of dataRows) {
        const isPassword = row.classList.contains('lista_password');
        const text = row.textContent.toLowerCase();
        const show = (!term || text.includes(term)) && !(hidePw && isPassword);
        row.style.display = show ? '' : 'none';
        if (show) visible++;
      }

      const total = dataRows.length;
      countEl.textContent = visible === total
        ? `${total} rallies`
        : `${visible} / ${total} rallies`;
    }

    applyFilters();
    input.addEventListener('input', applyFilters);
    hidePwCb.addEventListener('change', applyFilters);

    // Focus the search box with Alt+F for convenience.
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'f') { e.preventDefault(); input.focus(); }
    });
  }

  // ---------------------------------------------------------------------------
  // Rally results s/km column — rally_results.php centerbox
  // ---------------------------------------------------------------------------

  async function addRallyResultsDiff(rallyId) {
    // Build description page URL by swapping the centerbox param.
    const descParams = new URLSearchParams(window.location.search);
    descParams.set('centerbox', 'rally_list_details.php');
    const descUrl = `${window.location.pathname}?${descParams.toString()}`;

    // Fetch description page and extract "Total Distance Rally" km.
    let totalKm = null;
    try {
      const resp = await fetch(descUrl, { credentials: 'include' });
      if (resp.ok) {
        const html = await resp.text();
        const doc  = new DOMParser().parseFromString(html, 'text/html');
        const text = doc.body.textContent || '';
        const m = text.match(/Total\s+Distance\s+Rally[^0-9]*([\d.,]+)\s*km/i);
        if (m) totalKm = parseFloat(m[1].replace(',', '.'));
      }
    } catch (_) {}

    if (!totalKm || totalKm <= 0) return;

    // Parse a diff-from-first string: handles both "SS.mmm" and "MM:SS.mmm".
    function parseDiff(str) {
      if (!str) return null;
      str = str.trim();
      if (!str || str.includes('-')) return null;  // "- - -" or empty
      if (!str.includes(':')) {
        const s = parseFloat(str.replace(',', '.'));
        return isNaN(s) ? null : s;
      }
      return parseTimeToSeconds(str);  // reuse existing MM:SS.mmm parser
    }

    // There are two separate <table class="rally_results"> elements on the page:
    // one holds only the fejlec2 header row, the other holds the data rows.
    // We process both in one pass.
    const resultTables = document.querySelectorAll('table.rally_results');
    for (const table of resultTables) {
      const rows = table.querySelectorAll(
        ':scope > tr, :scope > thead > tr, :scope > tbody > tr'
      );
      for (const row of rows) {
        if (row.classList.contains('fejlec2')) {
          // Add header cell.
          const th = document.createElement('td');
          th.className = 'rsf-plugin-header';
          th.align = 'center';
          th.style.width = '13%';
          th.innerHTML = '<b>s/km</b>';
          th.title = `Seconds per km behind the leader (total rally distance: ${totalKm} km)`;
          row.appendChild(th);

        } else if (row.querySelector('.rally_results_diff_first')) {
          // Add data cell.
          const td = document.createElement('td');
          td.className = 'rsf-plugin-diff';
          td.align = 'center';

          const diffCell = row.querySelector('.rally_results_diff_first');
          const diffSec  = diffCell ? parseDiff(diffCell.textContent) : null;

          if (diffSec !== null) {
            const spkm = diffSec / totalKm;
            if (spkm === 0) {
              td.textContent = '—';
              td.classList.add('rsf-plugin-diff--great');
            } else {
              td.textContent = `+${spkm.toFixed(2)} s/km`;
              if      (spkm <= 1) td.classList.add('rsf-plugin-diff--great');
              else if (spkm <= 3) td.classList.add('rsf-plugin-diff--ok');
              else if (spkm <= 6) td.classList.add('rsf-plugin-diff--slow');
              else                td.classList.add('rsf-plugin-diff--bad');
            }
          } else {
            td.textContent = '—';
            td.classList.add('rsf-plugin-diff--na');
          }

          row.appendChild(td);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Stages surface filter — stages.php
  // ---------------------------------------------------------------------------

  function addStagesFilter() {
    const SURFACES = ['gravel', 'tarmac', 'snow'];

    // Find the table that has a "Surface" column header (scan all rows, not just rows[0]).
    let targetTable = null, surfaceColIdx = -1, headerRow = null, headerRowIdx = -1, dataRows = [];

    outer:
    for (const table of document.querySelectorAll('table')) {
      const rows = Array.from(table.querySelectorAll(
        ':scope > tr, :scope > thead > tr, :scope > tbody > tr'
      ));
      if (rows.length < 2) continue;

      for (let i = 0; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll('th, td'));
        // Find the first cell whose text is exactly "surface" — that's the stage-type column.
        const idx = cells.findIndex(c => c.textContent.trim().toLowerCase() === 'surface');
        if (idx !== -1) {
          // Verify that at least one data row below has a known surface value in that column.
          const hasData = rows.slice(i + 1).some(r => {
            const dc = Array.from(r.querySelectorAll('td'));
            return dc.length > idx && SURFACES.includes(dc[idx].textContent.trim().toLowerCase());
          });
          if (!hasData) continue;

          targetTable   = table;
          surfaceColIdx = idx;
          headerRow     = rows[i];
          headerRowIdx  = i;
          dataRows      = rows.slice(i + 1);
          break outer;
        }
      }
    }
    if (!targetTable) return;

    // Build the filter bar with one checkbox per surface type.
    const bar = document.createElement('div');
    bar.className = 'rsf-plugin-filter rsf-plugin-surface-bar';
    bar.innerHTML = SURFACES.map(s =>
      `<label class="rsf-plugin-surface-label rsf-plugin-surface-${s}">
         <input type="checkbox" class="rsf-plugin-surface-cb" value="${s}" checked>
         ${s[0].toUpperCase() + s.slice(1)}
       </label>`
    ).join('');
    targetTable.insertAdjacentElement('beforebegin', bar);

    function applyFilter() {
      const checked = new Set(
        [...bar.querySelectorAll('.rsf-plugin-surface-cb:checked')].map(cb => cb.value)
      );
      const showAll = checked.size === 0 || checked.size === SURFACES.length;

      for (const row of dataRows) {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length <= surfaceColIdx) continue; // country/section banner rows
        const surface = cells[surfaceColIdx].textContent.trim().toLowerCase();
        row.style.display = showAll || checked.has(surface) ? '' : 'none';
      }
    }

    bar.querySelectorAll('.rsf-plugin-surface-cb').forEach(cb =>
      cb.addEventListener('change', applyFilter)
    );
    applyFilter();
  }

  // ---------------------------------------------------------------------------
  // Entry point — run the right feature for the current page.
  // ---------------------------------------------------------------------------

  function init() {
    const page    = window.location.pathname.split('/').pop();
    const params  = new URLSearchParams(window.location.search);
    const centerbox = params.get('centerbox');
    const rallyId   = params.get('rally_id');

    if (page === 'rally_online.php') {
      if (centerbox === 'rally_results.php' && rallyId) {
        addRallyResultsDiff(rallyId);
      } else if (!centerbox) {
        addRallySearchFilter();
      }
    } else if (page === 'usersstats.php') {
      addDiffColumn();
    } else if (page === 'stages.php') {
      addStagesFilter();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
