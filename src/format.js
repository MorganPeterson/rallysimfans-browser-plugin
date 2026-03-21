export function formatSeconds(value) {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${formatDuration(value)}`;
}

export function formatPercent(value) {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(1)}`;
}

export function formatSecondsPerKm(spkm) {
  const secs = formatSeconds(spkm);
  if (secs === '—') {
    return '—';
  }
  return `+${secs} s/km`;
}

export function formatConsistency(value) {
  const secs = formatSeconds(value);
  if (secs === '—') {
    return '—';
  }
  return `${secs} s/km`;
}

function getDiffClass(value, thresholds = [1, 3, 6]) {
  if (value === null || !Number.isFinite(value)) return 'rsf-plugin-diff--na';
  if (value <= thresholds[0]) return 'rsf-plugin-diff--great';
  if (value <= thresholds[1]) return 'rsf-plugin-diff--ok';
  if (value <= thresholds[2]) return 'rsf-plugin-diff--slow';
  return 'rsf-plugin-diff--bad';
}

export function getSecondsPerKmClass(spkm) {
  return getDiffClass(spkm);
}

export function getConsistencyClass(value) {
  return getDiffClass(value, [0.25, 0.75, 1.5]);
}

export function setSecondsPerKmCell(cell, spkm, options = {}) {
  const { zeroAsDash = false } = options;

  cell.classList.add('rsf-plugin-diff');

  if (spkm === null || !Number.isFinite(spkm)) {
    cell.textContent = '—';
    cell.classList.add('rsf-plugin-diff--na');
    return;
  }

  if (spkm === 0 && zeroAsDash) {
    cell.textContent = '—';
    cell.classList.add('rsf-plugin-diff--great');
    return;
  }

  cell.textContent = `+${spkm.toFixed(2)}`;
  cell.classList.add(getSecondsPerKmClass(spkm));
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return '—';

  const sign = seconds < 0 ? '-' : '';
  const abs = Math.abs(seconds);

  const totalSeconds = Math.floor(abs);
  const millis = Math.round((abs - totalSeconds) * 1000);

  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);

  const msStr = String(millis).padStart(3, '0');
  const sStr = String(s).padStart(m > 0 || h > 0 ? 2 : 1, '0');

  if (h > 0) {
    return `${sign}${h}:${String(m).padStart(2, '0')}:${sStr}.${msStr}`;
  }

  if (m > 0) {
    return `${sign}${m}:${sStr}.${msStr}`;
  }

  return `${sign}${s}.${msStr}`;
}
