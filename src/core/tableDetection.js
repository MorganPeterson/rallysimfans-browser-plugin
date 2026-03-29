import {
  getDirectTableRows,
  getDirectCells,
  getCellTexts,
  defaultNormalize,
} from './domTable.js';

function inspectTable(table, options = {}) {
  const { includeTfoot = true } = options;
  const rows = getDirectTableRows(table, { includeTfoot });
  return { table, rows };
}

/**
 * findFirstMatchingTable iterates over tables matching the selector and returns 
 * the first one for which the match function returns true.
 * @param {{selector?: string, includeTfoot?: boolean, match: function}} options 
 * @returns {{table: HTMLTableElement, rows: HTMLTableRowElement[]}|null}
 */
export function findFirstMatchingTable(options = {}) {
  const {
    selector = 'table',
    includeTfoot = true,
    match,
  } = options;

  if (typeof match !== 'function') {
    throw new Error('findFirstMatchingTable requires a match function');
  }

  const tables = Array.from(document.querySelectorAll(selector));

  for (const table of tables) {
    const ctx = inspectTable(table, { includeTfoot });
    if (match(ctx)) {
      return ctx;
    }
  }

  return null;
}

export function findBestMatchingTable(options = {}) {
  const {
    selector = 'table',
    includeTfoot = true,
    score,
    minScore = 1,
  } = options;

  if (typeof score !== 'function') {
    throw new Error('findBestMatchingTable requires a score function');
  }

  const tables = Array.from(document.querySelectorAll(selector));

  let best = null;
  let bestScore = -Infinity;

  for (const table of tables) {
    const ctx = inspectTable(table, { includeTfoot });
    const value = Number(score(ctx));

    if (!Number.isFinite(value)) continue;
    if (value < minScore) continue;

    if (value > bestScore) {
      best = ctx;
      bestScore = value;
    }
  }

  return best ? { ...best, score: bestScore } : null;
}

function rowHasCellText(row, labels, normalize = defaultNormalize) {
  const wanted = labels.map(normalize);
  const texts = getCellTexts(row, normalize);

  return wanted.every((label) => texts.includes(label));
}

export function findHeaderRow(rows, labels, normalize = defaultNormalize) {
  for (let i = 0; i < rows.length; i++) {
    if (rowHasCellText(rows[i], labels, normalize)) {
      return {
        headerRow: rows[i],
        headerRowIdx: i,
      };
    }
  }

  return null;
}

export function tableHasMatchingRow(rows, predicate) {
  return rows.some((row, index) => predicate(row, index));
}

export function findColumnIndexByHeaderText(headerRow, label, normalize = defaultNormalize) {
  const wanted = normalize(label);
  const cells = getDirectCells(headerRow);

  for (let i = 0; i < cells.length; i++) {
    if (normalize(cells[i].textContent) === wanted) {
      return i;
    }
  }

  return -1;
}