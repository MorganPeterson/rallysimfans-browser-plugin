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
