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

export function findHeaderRowByLabels(rows, labels, normalize = defaultNormalize) {
  const wanted = labels.map(normalize);

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].cells;
    const texts = Array.from(cells, (cell) => normalize(cell.textContent));

    const matchesAll = wanted.every((label) => texts.includes(label));
    if (matchesAll) {
      return {
        headerRow: rows[i],
        headerRowIdx: i,
      };
    }
  }

  return null;
}

export function findColumnIndex(cells, predicate) {
  for (let i = 0; i < cells.length; i++) {
    if (predicate(cells[i], i)) {
      return i;
    }
  }

  return -1;
}