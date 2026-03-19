export function addStagesFilter() {
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

