// Convert "MM:SS.mmm" or "H:MM:SS.mmm" to total seconds. Returns null on failure.
export function parseTimeToSeconds(timeStr) {
    if (typeof timeStr !== 'string') return null;

    const s = timeStr.trim();
    if (!s || s === '-' || s.toLowerCase() === 'n/a') return null;

    const parts = s.split(':').map(p => p.trim());
    if (parts.length < 1 || parts.length > 3) return null;

    const intPattern = /^\d+$/;
    const lastPattern = /^\d+(?:[.,]\d+)?$/;

    // All non-final parts must be integers.
    for (let i = 0; i < parts.length - 1; i++) {
        if (!intPattern.test(parts[i])) return null;
    }

    // Final part may have decimals.
    if (!lastPattern.test(parts[parts.length - 1])) return null;

    const nums = parts.map((part, i) =>
        Number(i === parts.length - 1 ? part.replace(',', '.') : part)
    );

    if (nums.some(n => !Number.isFinite(n))) return null;

    if (parts.length === 1) {
        const [seconds] = nums;
        return seconds;
    }

    if (parts.length === 2) {
        const [minutes, seconds] = nums;

        if (minutes < 0) return null;
        if (seconds < 0 || seconds >= 60) return null;

        return minutes * 60 + seconds;
    }

    const [hours, minutes, seconds] = nums;

    if (hours < 0) return null;
    if (minutes < 0 || minutes >= 60) return null;
    if (seconds < 0 || seconds >= 60) return null;

    return hours * 3600 + minutes * 60 + seconds;
}

export function parseDiffToSeconds(str) {
  if (typeof str !== 'string') return null;

  const s = str.trim();
  if (!s) return null;

  // Reject placeholder dash patterns like "-", "- - -", "--", "—"
  if (/^[-—\s]+$/.test(s)) return null;

  if (!s.includes(':')) {
    if (!/^-?\d+(?:[.,]\d+)?$/.test(s)) return null;
    const seconds = Number(s.replace(',', '.'));
    return Number.isFinite(seconds) ? seconds : null;
  }

  return parseTimeToSeconds(s);
}

// Extract km from "13.4 km", "9,7 km", etc.
export function parseKm(lenStr) {
    if (typeof lenStr !== 'string') return null;

    const s = lenStr.trim();
    if (!s) return null;

    const match = s.match(/^(\d+(?:[.,]\d+)?)\s*km$/i);
    if (!match) return null;

    const km = Number(match[1].replace(',', '.'));
    return Number.isFinite(km) ? km : null;
}

function parseResultsTable(table, rowParser) {
  if (!table) return [];

  const rows = Array.from(table.querySelectorAll(':scope > tbody > tr, :scope > tr'));
  const results = [];

  for (const row of rows) {
    const parsed = rowParser(row);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}

export function parseStageResultsTable(table) {
  return parseResultsTable(table, parseStageResultsRow);
}

export function parseStageResultsRow(row) {
  if (!row || !row.cells || row.cells.length < 6) return null;

  const posCell = row.querySelector('.stage_results_poz');
  const timeCell = row.querySelector('.stage_results_time');
  const diffPrevCell = row.querySelector('.stage_results_diff_prev');
  const diffFirstCell = row.querySelector('.stage_results_diff_first');
  const isCurrentUser = row.classList.contains('lista_kiemelt2');

  if (!posCell || !timeCell || !diffPrevCell || !diffFirstCell) {
    return null;
  }

  const posText = normalizeText(posCell.textContent);

  if (!/^\d+$/.test(posText) && posText.toUpperCase() !== 'SR') {
    return null;
  }

  const isSR = posText.toUpperCase() === 'SR';
  const position = isSR ? null : parseIntegerStrict(posText);

  return {
    position,
    isSR,
    isCurrentUser,
    stageTimeSec: parseStageResultGap(timeCell.textContent),
    gapToPrevSec: parseStageResultGap(diffPrevCell.textContent),
    gapToLeaderSec: parseStageResultGap(diffFirstCell.textContent),
    rowClassName: row.className || '',
  };
}

export function parseStageResultGap(value) {
  return parseDiffToSeconds(normalizeText(value));
}

export function parseIntegerStrict(value) {
  const s = normalizeText(value);
  if (!/^\d+$/.test(s)) return null;
  return Number(s);
}

export function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
}
