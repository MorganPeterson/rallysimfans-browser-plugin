export function calculateMedian(values) {
    if (!values.length) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }

    return sorted[mid];
}

function getClassifiedStageRows(rows) {
  return rows
  .filter(row => !row.isSR && Number.isFinite(row.position) && Number.isFinite(row.gapToLeaderSec))
  .sort((a, b) => a.position - b.position);
}

export function summarizeStageResults(rows) {
  return summarizeResults(rows, getClassifiedStageRows);
}

function sortClassifiedRows(rows) {
  return rows.sort((a, b) => a.position - b.position);
}

export function summarizeRallyResults(rows) {
  return summarizeResults(rows, sortClassifiedRows);
}

function summarizeResults(rows, getClassifiedRows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      totalDrivers: 0,
      srCount: 0,
      srRate: null,
      classifiedCount: 0,
      classifiedRows: [],
      positionSensitivity: null,
    };
  }

  const totalDrivers = rows.length;
  const srCount = rows.filter(row => row?.isSR).length;

  const classifiedRows = getClassifiedRows(rows);
  const classifiedCount = classifiedRows.length;
  
  let positionSensitivity = null;

  let sum = [];
  let count = 0;

  for (let i = 1; i < classifiedRows.length; i++) {
    const prev = classifiedRows[i - 1].gapToLeaderSec;
    const curr = classifiedRows[i].gapToLeaderSec;
    const gap = curr - prev;

    if (Number.isFinite(gap)) {
      sum.push(gap);
      count++;
    }
  }

  positionSensitivity = count > 0 ? calculateMedian(sum) : null;

  return {
    totalDrivers,
    srCount,
    srRate: totalDrivers > 0 ? srCount / totalDrivers : null,
    classifiedCount,
    classifiedRows,
    positionSensitivity,
  };
}