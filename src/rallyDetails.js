import { DateTime } from 'luxon';
import { findFirstMatchingTable, tableHasMatchingRow } from './tableDetection.js';

const BUDAPEST_TZ = 'Europe/Budapest';

export function parseBudapestDateTime(value) {
  const dt = DateTime.fromFormat(value.trim(), 'yyyy-MM-dd HH:mm', {
    zone: BUDAPEST_TZ,
  });

  return dt.isValid ? dt : null;
}

export function formatLocalDateTimeRange(
  start,
  end,
  targetZone = Intl.DateTimeFormat().resolvedOptions().timeZone
) {
  const localStart = start.setZone(targetZone);
  const localEnd = end.setZone(targetZone);

  return `${localStart.toFormat('yyyy-MM-dd HH:mm')} - ${localEnd.toFormat('yyyy-MM-dd HH:mm')}`;
}

export function parseLegRange(text) {
  const match = text.match(
    /^\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\s*-\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\s*$/
  );

  if (!match) return null;

  const start = parseBudapestDateTime(match[1]);
  const end = parseBudapestDateTime(match[2]);

  if (!start || !end) return null;

  return { start, end };
}

function isLegLabelRow(row) {
  const cells = row.cells;
  if (cells.length < 2) return false;

  const label = cells[0].textContent.trim();
  return /^Leg\s+\d+:$/i.test(label);
}

function findRallyInfoTable() {
  const found = findFirstMatchingTable({
    selector: 'table',
    includeTfoot: false,
    match: ({ rows }) => tableHasMatchingRow(rows, isLegLabelRow),
  });

  return found?.table ?? null;
}

export function addLocalLegTimes() {
  const table = findRallyInfoTable();
  if (!table || table.dataset.rsfLocalTimesDone === '1') return;

  const rows = table.querySelectorAll(':scope tr');

  for (const row of rows) {
    const cells = row.cells;
    if (cells.length < 2) continue;

    const label = cells[0].textContent.trim();
    const valueCell = cells[1];

    if (!/^Leg\s+\d+:$/i.test(label)) continue;
    if (row.querySelector('.rsf-plugin-local-time')) continue;
    if (valueCell.querySelector('.rsf-plugin-local-time')) continue;

    const range = parseLegRange(valueCell.textContent);
    if (!range) continue;

    const localSpan = document.createElement('span');
    localSpan.className = 'rsf-plugin-local-time';
    localSpan.textContent = ` | (Local: ${formatLocalDateTimeRange(range.start, range.end)})`;
    localSpan.title =
      `Converted from Hungary time (${BUDAPEST_TZ}) to your local time ` +
      `(${Intl.DateTimeFormat().resolvedOptions().timeZone})`;

    valueCell.appendChild(localSpan);
  }

  table.dataset.rsfLocalTimesDone = '1';
}