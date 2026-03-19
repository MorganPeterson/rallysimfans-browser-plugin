import { parseKm, parseTimeToSeconds } from './parse.js';
import {
  addUndrivenStage,
  addDrivenStage,
  createStageStatsSummary
} from './stats.js';
import {
  setSecondsPerKmCell
} from './format.js';

import { insertStageStatsPanel, updateStageStatsPanel } from './summary.js';

export function addDiffColumn() {
    const tables = document.querySelectorAll('table');

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

export function getDirectTableRows(table) {
    return Array.from(table.querySelectorAll(
        ':scope > tr, :scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr'
    ));
}

function findHeaderRow(rows) {
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;
        let hasPR = false;
        let hasWR = false;

        for (let j = 0; j < cells.length; j++) {
            const text = cells[j].textContent.trim().toUpperCase();
            if (text === 'PR') hasPR = true;
            else if (text === 'WR') hasWR = true;
        }

        if (hasPR && hasWR) {
            return { headerRow: rows[i], headerRowIdx: i };
        }
    }

    return null;
}

// Find PR and WR indices from header text.
// Find km by scanning the first usable data row that contains a km value.
function detectColumns(headerRow, dataRows) {
    const headerCells = headerRow.cells;
    let prIdx = -1;
    let wrIdx = -1;

    for (let i = 0; i < headerCells.length; i++) {
        const text = headerCells[i].textContent.trim().toUpperCase();
        if (text === 'PR') prIdx = i;
        else if (text === 'WR') wrIdx = i;
    }

    if (prIdx === -1 || wrIdx === -1) return null;

    let kmIdx = -1;

    for (const row of dataRows) {
        const cells = row.cells;

        // Skip short/banner rows that cannot contain the needed columns.
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

    const th = document.createElement('td');
    th.className = 'rsf-plugin-header';
    th.textContent = 's/km';
    th.title = 'Seconds per km slower than WR  =  (PR − WR) ÷ stage length';

    headerCells[wrIdx].insertAdjacentElement('afterend', th);
}

function processStatsTable(table, headerRow, dataRows, cols) {
    table.dataset.rsfPluginDone = '1';

    table.style.minWidth = table.offsetWidth + 'px';

    insertDiffHeaderCell(headerRow, cols.wrIdx);

    var stats = createStageStatsSummary();

    for (const row of dataRows) {
        const result = insertDiffDataCell(row, cols, stats);
        if (result === 'undriven') {
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
        return 'skip';
    }

    const td = document.createElement('td');

    const km = parseKm(cells[cols.kmIdx].textContent);
    const prSec = parseTimeToSeconds(cells[cols.prIdx].textContent);
    const wrSec = parseTimeToSeconds(cells[cols.wrIdx].textContent);

    if (km && km > 0 && prSec !== null && wrSec !== null) {
        const diff = (prSec - wrSec) / km;
        setSecondsPerKmCell(td, diff);
        cells[cols.wrIdx].insertAdjacentElement('afterend', td);

        stats = addDrivenStage(stats, diff, km);

        return 'ok';
    }

    setSecondsPerKmCell(td, null);

    if (wrSec !== null) {
        row.classList.add('rsf-plugin-row-undriven');
        cells[cols.wrIdx].insertAdjacentElement('afterend', td);
        return 'undriven';
    }

    cells[cols.wrIdx].insertAdjacentElement('afterend', td);
    return 'na';
}

function insertUndrivenFilter(table, undrivenCount) {
    const filterBar = document.createElement('div');
    filterBar.className = 'rsf-plugin-filter';
    filterBar.innerHTML =
        `<label><input type="checkbox" class="rsf-plugin-filter-cb"> ` +
        `Hide undriven stages (${undrivenCount})</label>`;

    table.insertAdjacentElement('beforebegin', filterBar);

    const checkbox = filterBar.querySelector('.rsf-plugin-filter-cb');
    checkbox.addEventListener('change', (e) => {
        const hide = e.target.checked;
        table.querySelectorAll('.rsf-plugin-row-undriven').forEach(row => {
            row.style.display = hide ? 'none' : '';
        });
    });
}
