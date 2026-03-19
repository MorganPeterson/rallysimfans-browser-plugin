export function addRallySearchFilter() {
    const table = findRallyListTable();
    if (!table || table.dataset.rsfSearchDone) return;

    const allRows = getDirectTableRowsBasic(table);
    if (allRows.length < 2) return;

    const headerRow = allRows[0];
    const dataRows = allRows.slice(1);
    const dataParent = dataRows[0]?.parentNode;

    if (!dataParent) return;

    table.dataset.rsfSearchDone = '1';

    insertFavoriteHeaderCell(headerRow);
    insertFavoriteButtons(dataRows);
    reorderFavoriteRows(dataRows, dataParent);

    const ui = insertRallySearchBar(table, dataRows.length);

    function applyFilters() {
        const term = ui.input.value.trim().toLowerCase();
        const hidePasswordProtected = ui.hidePwCb.checked;

        let visibleCount = 0;

        for (const row of dataRows) {
            const isPasswordProtected = row.classList.contains('lista_password');
            const rowText = row.textContent.toLowerCase();

            const matchesSearch = !term || rowText.includes(term);
            const matchesPasswordFilter = !(hidePasswordProtected && isPasswordProtected);
            const show = matchesSearch && matchesPasswordFilter;

            row.style.display = show ? '' : 'none';
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

    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'f') {
            e.preventDefault();
            ui.input.focus();
        }
    });

    applyFilters();
}

function getDirectTableRowsBasic(table) {
    return Array.from(table.querySelectorAll(
        ':scope > tr, :scope > thead > tr, :scope > tbody > tr'
    ));
}

function findRallyListTable() {
    const tables = document.querySelectorAll('table');

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

        const link = row.querySelector('a[href]');
        if (link) {
            linkedRows++;
            score += 2;

            const href = link.getAttribute('href') || '';
            if (/rally|online|rally_id|centerbox/i.test(href)) {
                score += 3;
            }
        }

        if (row.classList.contains('lista_password')) {
            passwordRows++;
            score += 3;
        }
    }

    // Require some evidence that this is actually the rally list.
    if (linkedRows === 0) return 0;
    if (multiCellRows === 0) return 0;

    return score;
}

function getRallyFavoritesKey() {
    return 'rsf-plugin-rally-favs';
}

function loadRallyFavorites() {
    try {
        const raw = localStorage.getItem(getRallyFavoritesKey());
        const parsed = JSON.parse(raw || '[]');
        return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (_) {
        return new Set();
    }
}

function saveRallyFavorites(favs) {
    localStorage.setItem(getRallyFavoritesKey(), JSON.stringify([...favs]));
}

function getRallyRowId(row) {
    const link = row.querySelector('a[href]');
    if (link) return link.getAttribute('href');

    const firstCell = row.cells[0];
    return (firstCell ? firstCell.textContent : row.textContent).trim().slice(0, 80);
}

function insertFavoriteHeaderCell(headerRow) {
    if (headerRow.querySelector('.rsf-plugin-fav-header')) return;

    const th = document.createElement('td');
    th.className = 'rsf-plugin-fav-header';
    headerRow.insertBefore(th, headerRow.firstChild);
}

function insertFavoriteButtons(dataRows) {
    const favs = loadRallyFavorites();

    for (const row of dataRows) {
        if (row.querySelector('.rsf-plugin-fav-cell')) continue;

        const id = getRallyRowId(row);
        const isFav = favs.has(id);

        if (isFav) row.classList.add('rsf-plugin-pinned');

        const td = document.createElement('td');
        td.className = 'rsf-plugin-fav-cell';

        const btn = document.createElement('button');
        btn.className = 'rsf-plugin-fav-btn';
        btn.textContent = isFav ? '★' : '☆';
        btn.title = isFav ? 'Unpin' : 'Pin to top';
        btn.dataset.rallyId = id;

        td.appendChild(btn);
        row.insertBefore(td, row.firstChild);
    }
}

function bindFavoriteButtons(dataRows, onChange) {
    for (const row of dataRows) {
        const btn = row.querySelector('.rsf-plugin-fav-btn');
        if (!btn || btn.dataset.rsfBound === '1') continue;

        btn.dataset.rsfBound = '1';

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const id = btn.dataset.rallyId;
            const favs = loadRallyFavorites();

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

    const input = bar.querySelector('.rsf-plugin-search-input');
    const hidePwCb = bar.querySelector('.rsf-plugin-hide-pw-cb');
    const countEl = bar.querySelector('.rsf-plugin-search-count');

    updateRallyCount(countEl, totalRows, totalRows);

    return { bar, input, hidePwCb, countEl };
}

function bindSearchUi(ui, applyFilters) {
    ui.input.addEventListener('input', applyFilters);
    ui.hidePwCb.addEventListener('change', applyFilters);
}

function updateRallyCount(countEl, visible, total) {
    countEl.textContent = visible === total
        ? `${total} rallies`
        : `${visible} / ${total} rallies`;
}
