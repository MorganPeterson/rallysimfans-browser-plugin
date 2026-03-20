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

export function summarizeStageResults(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      totalDrivers: 0,
      srCount: 0,
      srRate: null,
      classifiedCount: 0,
      top5Compression: null,
      top10Compression: null,
      positionSensitivity: null,
    };
  }

  const totalDrivers = rows.length;
  const srCount = rows.filter(row => row?.isSR).length;

  const classified = rows
    .filter(row => row && !row.isSR && Number.isFinite(row.gapToLeaderSec))
    .sort((a, b) => {
      if (Number.isFinite(a.position) && Number.isFinite(b.position)) {
        return a.position - b.position;
      }
      return a.gapToLeaderSec - b.gapToLeaderSec;
    });

  const classifiedCount = classified.length;

  let top5Compression = null;
  let top10Compression = null;
  let positionSensitivity = null;

  if (classifiedCount >= 5) {
    top5Compression = classified[4].gapToLeaderSec - classified[0].gapToLeaderSec;
  }

  if (classifiedCount >= 10) {
    top10Compression = classified[9].gapToLeaderSec - classified[0].gapToLeaderSec;
  }

  if (classifiedCount >= 2) {
    let sum = 0;
    let count = 0;

    for (let i = 1; i < classified.length; i++) {
      const prev = classified[i - 1].gapToLeaderSec;
      const curr = classified[i].gapToLeaderSec;
      const gap = curr - prev;

      if (Number.isFinite(gap)) {
        sum += gap;
        count++;
      }
    }

    positionSensitivity = count > 0 ? sum / count : null;
  }

  return {
    totalDrivers,
    srCount,
    srRate: totalDrivers > 0 ? srCount / totalDrivers : null,
    classifiedCount,
    top5Compression,
    top10Compression,
    positionSensitivity,
  };
}

export function summarizeOverallResults(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      totalDrivers: 0,
      srCount: 0,
      srRate: null,
      classifiedCount: 0,
      top5Compression: null,
      top10Compression: null,
      positionSensitivity: null,
    };
  }

  const totalDrivers = rows.length;
  const srCount = rows.filter(row => row?.isSR).length;

  const classified = rows
    .filter(row => row && !row.isSR && Number.isFinite(row.gapToLeaderSec))
    .sort((a, b) => {
      if (Number.isFinite(a.position) && Number.isFinite(b.position)) {
        return a.position - b.position;
      }
      return a.gapToLeaderSec - b.gapToLeaderSec;
    });

  const classifiedCount = classified.length;

  let top5Compression = null;
  let top10Compression = null;
  let positionSensitivity = null;

  if (classifiedCount >= 5) {
    top5Compression = classified[4].gapToLeaderSec - classified[0].gapToLeaderSec;
  }

  if (classifiedCount >= 10) {
    top10Compression = classified[9].gapToLeaderSec - classified[0].gapToLeaderSec;
  }

  if (classifiedCount >= 2) {
    let sum = 0;
    let count = 0;

    for (let i = 1; i < classified.length; i++) {
      const gap = classified[i].gapToLeaderSec - classified[i - 1].gapToLeaderSec;
      if (Number.isFinite(gap)) {
        sum += gap;
        count++;
      }
    }

    positionSensitivity = count > 0 ? sum / count : null;
  }

  return {
    totalDrivers,
    srCount,
    srRate: totalDrivers > 0 ? srCount / totalDrivers : null,
    classifiedCount,
    top5Compression,
    top10Compression,
    positionSensitivity,
  };
}