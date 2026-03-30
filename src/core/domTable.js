/**
 * Apply class names for striping of table rows based on their visibility, while 
 * preserving any existing highlight classes.
 * @param {{row: HTMLTableRowElement, visible: boolean}[]} items 
 */
export function applyZebraStriping(items) {
  const visible = items.filter(i => i.visible);

  let stripeIndex = 0;

  for (const item of visible) {
    const row = item.row;

    if (row.classList.contains('lista_kiemelt2')) {
      // Keep the current user's row highlighted
      stripeIndex++;
      continue;
    }

    if (row.classList.contains('paros_sr') || row.classList.contains('paratlan_sr')) {
      row.classList.remove('paros_sr', 'paratlan_sr');
      row.classList.add(stripeIndex % 2 === 0 ? 'paros_sr' : 'paratlan_sr');
    } else {
      row.classList.remove('paros', 'paratlan');
      row.classList.add(stripeIndex % 2 === 0 ? 'paros' : 'paratlan');
    }

    stripeIndex++;
  }
}

/**
 * Returns the direct child rows of a table, optionally including the footer rows.
 * @param {HTMLTableElement} table 
 * @param {{includeTfoot?: boolean}} options 
 * @returns {HTMLTableRowElement[]}
 */
export function getDirectTableRows(table, options = {}) {
  const { includeTfoot = true } = options;

  const baseSelector = ':scope > tr, :scope > thead > tr, :scope > tbody > tr';
  const selector = includeTfoot
    ? `${baseSelector}, :scope > tfoot > tr`
    : baseSelector;

  return Array.from(table.querySelectorAll(selector));
}

/**
 * Returns the direct child cells of a table row, optionally filtered by a selector.
 * @param {HTMLTableRowElement} row 
 * @param {string} selector 
 * @returns {HTMLTableCellElement[]}
 */
export function getDirectCells(row, selector = ':scope > th, :scope > td') {
  return Array.from(row.querySelectorAll(selector));
}

/**
 * Normalizes a text value by converting it to a string, trimming whitespace, and 
 * converting to uppercase.
 * @param {any} text 
 * @returns {string}
 */
export function defaultNormalize(text) {
  return String(text ?? '').trim().toUpperCase();
}

/**
 * Extracts and normalizes the text content of cells in a table row.
 * @param {HTMLTableRowElement} row 
 * @param {function} normalize 
 * @returns {string[]}
 */
export function getCellTexts(row, normalize = (text) => text) {
  return getDirectCells(row).map((cell) => normalize(cell.textContent));
}
