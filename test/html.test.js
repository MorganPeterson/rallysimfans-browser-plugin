import { describe, it, expect } from 'vitest';
import { escapeHtml, escapeHtmlAttr } from '../src/html.js';

describe('html', () => {
  it('escapeHtml escapes the five key HTML characters', () => {
    expect(escapeHtml(`<div class="x">'&"</div>`))
      .toBe('&lt;div class=&quot;x&quot;&gt;&#39;&amp;&quot;&lt;/div&gt;');
  });

  it('escapeHtml stringifies non-string values', () => {
    expect(escapeHtml(42)).toBe('42');
    expect(escapeHtml(null)).toBe('null');
  });

  it('escapeHtmlAttr delegates to the same escaping behavior', () => {
    expect(escapeHtmlAttr(`"hello" & 'goodbye'`))
      .toBe('&quot;hello&quot; &amp; &#39;goodbye&#39;');
  });
});