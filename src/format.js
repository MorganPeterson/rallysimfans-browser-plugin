export function formatSecondsPerKm(spkm) {
  if (spkm === null || !Number.isFinite(spkm)) return '—';
  return `+${spkm.toFixed(2)} s/km`;
}

export function formatConsistency(value) {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(2)} s/km`;
}

export function getSecondsPerKmClass(spkm) {
  if (spkm === null || !Number.isFinite(spkm)) return 'rsf-plugin-diff--na';
  if (spkm <= 1) return 'rsf-plugin-diff--great';
  if (spkm <= 3) return 'rsf-plugin-diff--ok';
  if (spkm <= 6) return 'rsf-plugin-diff--slow';
  return 'rsf-plugin-diff--bad';
}

export function getConsistencyClass(value) {
  if (value === null || !Number.isFinite(value)) return 'rsf-plugin-diff--na';
  if (value <= 0.25) return 'rsf-plugin-diff--great';
  if (value <= 0.75) return 'rsf-plugin-diff--ok';
  if (value <= 1.5) return 'rsf-plugin-diff--slow';
  return 'rsf-plugin-diff--bad';
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

  cell.textContent = `+${spkm.toFixed(2)} s/km`;
  cell.classList.add(getSecondsPerKmClass(spkm));
}