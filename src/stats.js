// creates an empty summary object for tracking stage statistics
export function createStageStatsSummary() {
    return {
        drivenCount: 0,
        undrivenCount: 0,
        drivenKm: 0,
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
    const { diffs, drivenCount, undrivenCount, drivenKm } = stats;

    if (!diffs.length) {
        return {
            drivenCount,
            undrivenCount,
            drivenKm,
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
        drivenKm,
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