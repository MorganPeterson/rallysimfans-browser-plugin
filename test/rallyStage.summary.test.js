import { describe, it, expect, beforeEach } from 'vitest';
import { addStageResultsSummary } from '../src/rallyStage.js';

describe('rallyStage summary gap comparison', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('includes P1 in gap comparison dropdown when leader diff cells are dashes', () => {
    document.body.innerHTML = `
      <div class="rally_results_header_sticky">
        <table>
          <tbody>
            <tr>
              <td>Header</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table class="rally_results_stres_left">
        <tbody>
          <tr>
            <td class="stage_results_poz">1</td>
            <td class="stage_results_name">
              Driver One
              <samp>Ford Escort RS 1600</samp>
            </td>
            <td class="stage_results_time"><b>3:21.500</b></td>
            <td class="stage_results_diff_prev">-</td>
            <td class="stage_results_diff_first">-</td>
          </tr>
          <tr>
            <td class="stage_results_poz">2</td>
            <td class="stage_results_name">
              Driver Two
              <samp>Ford Escort RS 1600</samp>
            </td>
            <td class="stage_results_time"><b>3:24.000</b></td>
            <td class="stage_results_diff_prev">+2.500</td>
            <td class="stage_results_diff_first">+2.500</td>
          </tr>
        </tbody>
      </table>
    `;

    addStageResultsSummary();

    const fromSelect = document.querySelector('.rsf-plugin-gap-from');
    const toSelect = document.querySelector('.rsf-plugin-gap-to');

    expect(fromSelect).not.toBeNull();
    expect(toSelect).not.toBeNull();

    const fromOptions = Array.from(fromSelect.options).map((opt) => opt.textContent);
    const toOptions = Array.from(toSelect.options).map((opt) => opt.textContent);

    expect(fromOptions).toContain('P1');
    expect(toOptions).toContain('P1');
    expect(fromOptions).toContain('P2');
    expect(toOptions).toContain('P2');
  });
});