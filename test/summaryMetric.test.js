import { describe, it, expect } from 'vitest';
import { renderSummaryMetric } from '../src/summaryMetric.js';

describe('summaryMetric', () => {
  it('renders default classes and escaped content', () => {
    const html = renderSummaryMetric({
      label: 'Avg < pace',
      value: '1.23 & fast',
      tooltip: `"quoted" tooltip`,
    });

    expect(html).toContain('class="rsf-plugin-summary-item"');
    expect(html).toContain('class="rsf-plugin-summary-label"');
    expect(html).toContain('class="rsf-plugin-summary-value"');
    expect(html).toContain('Avg &lt; pace');
    expect(html).toContain('1.23 &amp; fast');
    expect(html).toContain('title="&quot;quoted&quot; tooltip"');
  });

  it('includes valueClass when provided', () => {
    const html = renderSummaryMetric({
      label: 'Best',
      value: '0.45',
      valueClass: 'rsf-fast',
    });

    expect(html).toContain('class="rsf-plugin-summary-value rsf-fast"');
  });

  it('supports custom wrapper and label/value classes', () => {
    const html = renderSummaryMetric({
      label: 'Custom',
      value: '42',
      itemClass: 'my-item',
      labelClass: 'my-label',
      valueBaseClass: 'my-value',
    });

    expect(html).toContain('class="my-item"');
    expect(html).toContain('class="my-label"');
    expect(html).toContain('class="my-value"');
  });
});