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

export function getAbsoluteValue(item) {
  if (Number.isFinite(item.rallyTimeSec)) {
    return item.rallyTimeSec;
  }

  if (Number.isFinite(item.gapToLeaderSec)) {
    return item.gapToLeaderSec;
  }

  return null;
}

export function createSubclassFilterBar(subclasses) {
  bar = document.createElement('div');
  bar.className = 'rsf-plugin-subclass-bar';
  bar.innerHTML = `
    <button type="button" class="rsf-plugin-subclass-btn is-active" data-subgroup="">
      All subclasses
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

