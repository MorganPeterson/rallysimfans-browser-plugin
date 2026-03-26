import { getDirectTableRows } from "./domTable.js";
import { appendSecondsPerKmDataCell, appendSecondsPerKmHeader } from "./secondsPerKmColumn.js";
import { parseDiffToSeconds } from "./parse.js";

export async function addRallyResultsDiff(rallyId) {
    const totalKm = await fetchRallyTotalKm();
    if (!totalKm || totalKm <= 0) return;

    const resultTables = document.querySelectorAll('table.rally_results');

    for (const table of resultTables) {
        if (table.dataset.rsfResultsDiffDone) continue;

        const rows = getDirectTableRows(table, { includeTfoot: false });
        if (!rows.length) continue;

        let touched = false;

        for (const row of rows) {
            if (row.classList.contains('fejlec2')) {
                appendSecondsPerKmHeader(row, `Seconds per km (Total: ${totalKm} km)`);
                touched = true;
                continue;
            }

            const diffCell = row.querySelector('.rally_results_diff_first');
            if (!diffCell) continue;

            const diffSec = parseDiffToSeconds(diffCell.textContent);
            const spkm = diffSec === null ? null : diffSec / totalKm;

            appendSecondsPerKmDataCell(row, spkm, { zeroAsDash: true });
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
