/**
 * Collects available subclasses for a given base group from the provided items.
 * @param {{carDetails: {base_class_id: number, sub_class_id: number, sub_class_name: string}}[]} items 
 * @param {number} selectedBaseGroupId 
 * @param {{[key: number]: string}} subgroupNames 
 * @returns {{id: number, label: string}[]}
 */
export function collectAvailableSubclasses(items, selectedBaseGroupId, subgroupNames = {}) {
  const subgroupMap = new Map();

  for (const item of items) {
    const carDetails = item.carDetails;
    if (!carDetails) continue;
    if (carDetails.base_class_id !== selectedBaseGroupId) continue;
    if (!carDetails.sub_class_id) continue;

    const subClassId = carDetails.sub_class_id;
    const subClassName = carDetails.sub_class_name;

    if (!subgroupMap.has(subClassId)) {
      subgroupMap.set(subClassId, {
        id: subClassId,
        label: subgroupNames[subClassId] ?? subClassName ?? `Subclass ${subClassId}`,
      });
    }
  }

  return [...subgroupMap.values()];
}

/**
 * get the time used for sorting and gap calculations for a stage result item.
 * @param {{rallyTimeSec: number, gapToLeaderSec: number}} item 
 * @returns {number|null}
 */
export function getAbsoluteValue(item) {
  if (Number.isFinite(item.rallyTimeSec)) {
    return item.rallyTimeSec;
  }

  if (Number.isFinite(item.gapToLeaderSec)) {
    return item.gapToLeaderSec;
  }

  return null;
}

/**
 * Creates a subclass filter bar for a given base class and its subclasses.
 * @param {string} baseClass 
 * @param {{id: number, label: string}[]} subclasses 
 * @returns {HTMLDivElement}
 */
export function createSubclassFilterBar(baseClass, subclasses) {
  const bar = document.createElement('div');
  bar.className = 'rsf-plugin-subclass-bar';
  bar.innerHTML = `
    <button type="button" class="rsf-plugin-subclass-btn is-active" data-subgroup="">
      All ${baseClass} 
    </button>
    ${subclasses
      .map(
        s => `
          <button type="button" class="rsf-plugin-subclass-btn" data-subgroup="${s.id}">
            ${s.label}
          </button>
        `
      )
      .join('')}
  `;

  return bar;
}
