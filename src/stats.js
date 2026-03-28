// creates an empty summary object for tracking stage statistics
export function createStageStatsSummary() {
    return {
        drivenCount: 0,
        undrivenCount: 0,
        diffs: [],
    };
}

export function calculateMedian(values) {
    if (!values.length) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }

    return sorted[mid];
}

export function summarizeStageStats(stats) {
    const { diffs, drivenCount, undrivenCount } = stats;

    if (!diffs.length) {
        return {
            drivenCount,
            undrivenCount,
            totalCount: drivenCount + undrivenCount,
            average: null,
            median: null,
            best: null,
            worst: null,
            consistency: null,
        };
    }

    let sum = 0;
    let best = diffs[0];
    let worst = diffs[0];

    for (const diff of diffs) {
        sum += diff;
        if (diff < best) best = diff;
        if (diff > worst) worst = diff;
    }

    const average = sum / diffs.length;
    const median = calculateMedian(diffs);

    return {
        drivenCount,
        undrivenCount,
        totalCount: drivenCount + undrivenCount,
        average,
        median,
        best,
        worst,
        consistency: average - median,
    };
}

export function addDrivenStage(stats, diff, km) {
  if (!stats || !Number.isFinite(diff) || !Number.isFinite(km) || km <= 0) {
    return stats;
  }

  stats.drivenCount += 1;
  stats.drivenKm += km;
  stats.diffs.push(diff);

  return stats;
}

export function addUndrivenStage(stats) {
  if (!stats) return stats;
  stats.undrivenCount += 1;
  return stats;
}

function getClassifiedStageRows(rows) {
  return rows
  .filter(row => !row.isSR && Number.isFinite(row.position) && Number.isFinite(row.gapToLeaderSec))
  .sort((a, b) => a.position - b.position);
}


export function summarizeStageResults(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      totalDrivers: 0,
      srCount: 0,
      srRate: null,
      classifiedCount: 0,
      positionSensitivity: null,
    };
  }

  const totalDrivers = rows.length;
  const srCount = rows.filter(row => row?.isSR).length;

  const classified = getClassifiedStageRows(rows);

  const classifiedCount = classified.length;

  let positionSensitivity = null;

  if (classifiedCount >= 2) {
    let sum = [];
    let count = 0;

    for (let i = 1; i < classified.length; i++) {
      const prev = classified[i - 1].gapToLeaderSec;
      const curr = classified[i].gapToLeaderSec;
      const gap = curr - prev;

      if (Number.isFinite(gap)) {
        sum.push(gap);
        count++;
      }
    }

    positionSensitivity = count > 0 ? calculateMedian(sum) : null;
  }

  return {
    totalDrivers,
    srCount,
    srRate: totalDrivers > 0 ? srCount / totalDrivers : null,
    classifiedCount,
    positionSensitivity,
    classifiedRows: classified,
  };
}

export function summarizeRallyResults(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      classifiedRows: [],
      srRate: 0,
      positionSensitivity: 0,
    };
  }

  const totalDrivers = rows.length;
  const srCount = rows.filter(row => row?.isSR).length;

  const classifiedRows = rows.sort((a, b) => a.position - b.position);

  let positionSensitivity = null;


  let sum = [];
  let count = 0;

  for (let i = 1; i < classifiedRows.length; i += 1) {
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
    classifiedCount: totalDrivers,
    positionSensitivity,
    classifiedRows,
  };
}

export function getGapBetweenPositions(rows, from, to) {
  const fromRow = rows.find(row => row.position === from);
  const toRow = rows.find(row => row.position === to);

  if (!fromRow || !toRow) return null;
  if (!Number.isFinite(fromRow.gapToLeaderSec) || !Number.isFinite(toRow.gapToLeaderSec)) return null;

  return toRow.gapToLeaderSec - fromRow.gapToLeaderSec;
}
