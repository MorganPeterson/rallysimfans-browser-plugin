import { escapeHtml, escapeHtmlAttr } from './html.js';

export function renderSummaryMetric({
    label,
    value,
    tooltip = '',
    valueClass = '',
    itemClass = 'rsf-plugin-summary-item',
    labelClass = 'rsf-plugin-summary-label',
    valueBaseClass = 'rsf-plugin-summary-value',
}) {
    const classes = [valueBaseClass, valueClass].filter(Boolean).join(' ');

    return `
      <div class="${itemClass}">
        <span class="${labelClass}">
          ${escapeHtml(label)}
        </span>
        <span class="${classes}" title="${escapeHtmlAttr(tooltip)}">
          ${escapeHtml(value)}
        </span>
      </div>
    `;
}