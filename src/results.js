export function getVisibleParsedRowsFromItems(items, parseResultsRowFn) {
  return items
    .filter(item => item.visible)
    .map(item => parseResultsRowFn(item.row))
    .filter(Boolean);
}

export function findCurrentUserResult(rows) {
  return rows.find(row => row.isCurrentUser) || null;
}
