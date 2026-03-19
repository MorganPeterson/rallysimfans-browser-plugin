import { summarizeStageStats } from './stats.js';
import {
  formatSecondsPerKm,
  formatConsistency,
  getSecondsPerKmClass,
  getConsistencyClass,
} from './format.js';

const SUMMARY_TOOLTIPS = {
  average: 'Average seconds per kilometer slower than the world record across visible driven stages.',
  median: 'The middle s/km value across visible driven stages. This represents your typical pace and is less affected by one very bad stage.',
  consistency: 'Average minus median. Lower is better. A larger value usually means one or more bad stages hurt your rally.',
  best: 'Your best visible stage pace in seconds per kilometer slower than the world record.',
  worst: 'Your worst visible stage pace in seconds per kilometer slower than the world record.',
  drivenCount: 'Number of visible stages with both a personal record and a world record time.',
  undrivenCount: 'Number of visible stages that have a world record but no personal record.',
  totalCount: 'Total number of visible stages included in this summary.',
  drivenKm: 'Total visible kilometers across driven stages.',
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
    ${renderSummaryMetric(
      'Avg',
      formatSecondsPerKm(summary.average),
      getSecondsPerKmClass(summary.average),
      SUMMARY_TOOLTIPS.average
    )}
    ${renderSummaryMetric(
      'Median',
      formatSecondsPerKm(summary.median),
      getSecondsPerKmClass(summary.median),
      SUMMARY_TOOLTIPS.median
    )}
    ${renderSummaryMetric(
      'Consistency',
      formatConsistency(summary.consistency),
      getConsistencyClass(summary.consistency),
      SUMMARY_TOOLTIPS.consistency
    )}
    ${renderSummaryMetric(
      'Best',
      formatSecondsPerKm(summary.best),
      getSecondsPerKmClass(summary.best),
      SUMMARY_TOOLTIPS.best
    )}
    ${renderSummaryMetric(
      'Worst',
      formatSecondsPerKm(summary.worst),
      getSecondsPerKmClass(summary.worst),
      SUMMARY_TOOLTIPS.worst
    )}
    ${renderSummaryMetric(
      'Driven',
      String(summary.drivenCount),
      '',
      SUMMARY_TOOLTIPS.drivenCount
    )}
    ${renderSummaryMetric(
      'Undriven',
      String(summary.undrivenCount),
      '',
      SUMMARY_TOOLTIPS.undrivenCount
    )}
    ${renderSummaryMetric(
      'Total',
      String(summary.totalCount),
      '',
      SUMMARY_TOOLTIPS.totalCount
    )}
    ${renderSummaryMetric(
      'Driven km',
      `${summary.drivenKm.toFixed(1)} km`,
      '',
      SUMMARY_TOOLTIPS.drivenKm
    )}
  `;
}

function renderSummaryMetric(label, value, valueClass = '', tooltip = '') {
  const classAttr = valueClass ? ` rsf-plugin-summary-value ${valueClass}` : ' rsf-plugin-summary-value';
  const titleAttr = escapeHtmlAttr(tooltip);

  return `
    <div class="rsf-plugin-summary-item">
      <span class="rsf-plugin-summary-label">${escapeHtml(label)}</span>
      <span class="${classAttr.trim()}" title="${titleAttr}">${escapeHtml(value)}</span>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeHtmlAttr(value) {
  return escapeHtml(value);
}