import { parseDiffToSeconds } from "./parse.js";
import { setSecondsPerKmCell } from "./format.js";
import { getDirectTableRows } from "./userstats";

export async function addRallyResultsDiff(rallyId) {
    const totalKm = await fetchRallyTotalKm();
    if (!totalKm || totalKm <= 0) return;

    const resultTables = document.querySelectorAll('table.rally_results');

    for (const table of resultTables) {
        if (table.dataset.rsfResultsDiffDone) continue;

        const rows = getDirectTableRows(table);
        if (!rows.length) continue;

        let touched = false;

        for (const row of rows) {
            if (row.classList.contains('fejlec2')) {
                insertRallyResultsHeaderCell(row, totalKm);
                touched = true;
                continue;
            }

            const diffCell = row.querySelector('.rally_results_diff_first');
            if (!diffCell) continue;

            insertRallyResultsDataCell(row, diffCell.textContent, totalKm);
            touched = true;
        }

        if (touched) {
            table.dataset.rsfResultsDiffDone = '1';
        }
    }
}

async function fetchRallyTotalKm() {
    const descParams = new URLSearchParams(window.location.search);
    descParams.set('centerbox', 'rally_list_details.php');

    const descUrl = `${window.location.pathname}?${descParams.toString()}`;

    try {
        const resp = await fetch(descUrl, { credentials: 'include' });
        if (!resp.ok) return null;

        const html = await resp.text();
        return extractTotalKmFromHtml(html);
    } catch (_) {
        return null;
    }
}

function extractTotalKmFromHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent || '';
    const match = text.match(/Total\s+Distance\s+Rally[^0-9]*([\d]+(?:[.,]\d+)?)\s*km/i);

    if (!match) return null;

    const km = Number(match[1].replace(',', '.'));
    return Number.isFinite(km) ? km : null;
}

function insertRallyResultsHeaderCell(row, totalKm) {
    if (row.querySelector('.rsf-plugin-header')) return;

    const th = document.createElement('td');
    th.className = 'rsf-plugin-header';
    th.align = 'center';
    th.style.width = '13%';
    th.textContent = 's/km';
    th.title = `Seconds per km behind the leader (total rally distance: ${totalKm} km)`;

    row.appendChild(th);
}

function insertRallyResultsDataCell(row, diffText, totalKm) {
    if (row.querySelector('.rsf-plugin-diff')) return;

    const td = document.createElement('td');
    td.align = 'center';

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

