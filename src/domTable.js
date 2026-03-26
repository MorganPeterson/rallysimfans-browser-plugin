export function getDirectTableRows(table, options = {}) {
  const { includeTfoot = true } = options;

  const baseSelector = ':scope > tr, :scope > thead > tr, :scope > tbody > tr';
  const selector = includeTfoot
    ? `${baseSelector}, :scope > tfoot > tr`
    : baseSelector;

  return Array.from(table.querySelectorAll(selector));
}

export function getDirectCells(row, selector = ':scope > th, :scope > td') {
  return Array.from(row.querySelectorAll(selector));
}

export function defaultNormalize(text) {
  return String(text ?? '').trim().toUpperCase();
}

export function getCellTexts(row, normalize = (text) => text) {
  return getDirectCells(row).map((cell) => normalize(cell.textContent));
}

export function findColumnIndex(cells, predicate) {
  for (let i = 0; i < cells.length; i++) {
    if (predicate(cells[i], i)) {
      return i;
    }
  }

  return -1;
}