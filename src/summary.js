import { summarizeStageStats } from './stats.js';
import {
  formatSecondsPerKm,
  formatConsistency,
  getSecondsPerKmClass,
  getConsistencyClass,
} from './format.js';
import { renderSummaryMetric } from './summaryMetric.js';

const SUMMARY_TOOLTIPS = {
  average: 'Average seconds per kilometer slower than the world record across visible driven stages.',
  median: 'The middle s/km value across visible driven stages. This represents your typical pace and is less affected by one very bad stage.',
  consistency: 'Average minus median. Lower is better. A larger value usually means one or more bad stages hurt your rally.',
  best: 'Your best visible stage pace in seconds per kilometer slower than the world record.',
  worst: 'Your worst visible stage pace in seconds per kilometer slower than the world record.',
  drivenCount: 'Number of visible stages with both a personal record and a world record time.',
  undrivenCount: 'Number of visible stages that have a world record but no personal record.',
  totalCount: 'Total number of visible stages included in this summary.',
};

export function insertStageStatsPanel(table) {
  let panel = table.previousElementSibling;
  if (panel && panel.classList.contains('rsf-plugin-summary')) {
    return panel;
  }

  panel = document.createElement('div');
  panel.className = 'rsf-plugin-summary';
  table.insertAdjacentElement('beforebegin', panel);

  return panel;
}

export function updateStageStatsPanel(panel, stats) {
  const summary = summarizeStageStats(stats);

  panel.innerHTML = `
    ${renderSummaryMetric({
      label: 'Avg',
      value: formatSecondsPerKm(summary.average),
      valueClass: getSecondsPerKmClass(summary.average),
      tooltip: SUMMARY_TOOLTIPS.average
    })}
    ${renderSummaryMetric({
      label: 'Median',
      value: formatSecondsPerKm(summary.median),
      valueClass: getSecondsPerKmClass(summary.median),
      tooltip: SUMMARY_TOOLTIPS.median
    })}
    ${renderSummaryMetric({
      label: 'Consistency',
      value: formatConsistency(summary.consistency),
      valueClass: getConsistencyClass(summary.consistency),
      tooltip: SUMMARY_TOOLTIPS.consistency
    })}
    ${renderSummaryMetric({
      label: 'Best',
      value: formatSecondsPerKm(summary.best),
      valueClass: getSecondsPerKmClass(summary.best),
      tooltip: SUMMARY_TOOLTIPS.best
    })}
    ${renderSummaryMetric({
      label: 'Worst',
      value: formatSecondsPerKm(summary.worst),
      valueClass: getSecondsPerKmClass(summary.worst),
      tooltip: SUMMARY_TOOLTIPS.worst
    })}
    ${renderSummaryMetric({
      label: 'Driven',
      value: String(summary.drivenCount),
      valueClass: '',
      tooltip: SUMMARY_TOOLTIPS.drivenCount
    })}
    ${renderSummaryMetric({
      label: 'Undriven',
      value: String(summary.undrivenCount),
      valueClass: '',
      tooltip: SUMMARY_TOOLTIPS.undrivenCount
    })}
    ${renderSummaryMetric({
      label: 'Total',
      value: String(summary.totalCount),
      valueClass: '',
      tooltip: SUMMARY_TOOLTIPS.totalCount
    })}
  `;
}
