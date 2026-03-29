import { urlStringValues } from './core/html.js';
import { addSecondsPerKmColumn } from './rallyResults/rallyResults.js';
import { addStageResultsSummary, mountSubclassFilter } from './rallyResultsStres/rallyStage.js';
import { addLocalLegTimes } from './rallyListDetails/rallyDetails.js';
import { addRallySearchFilter } from './rallyOnline/rallySearch.js';
import { addDiffColumn } from './userstats/userstats.js';
import { addStagesFilter } from './stages/stages.js';

function init() {
  const page = window.location.pathname.split("/").pop();
  const params = new URLSearchParams(window.location.search);
  const centerbox = params.get(urlStringValues.centerBox);
  const rallyId = params.get(urlStringValues.rallyId);

  switch (page) {
    case urlStringValues.paths.rallyOnline:
      if (centerbox === urlStringValues.values.rallyResults && rallyId) {
        addSecondsPerKmColumn();
      } else if (centerbox === urlStringValues.values.rallyResultsStres) {
        addStageResultsSummary();
        mountSubclassFilter();
      } else if (centerbox === urlStringValues.values.rallyListDetails) {
        addLocalLegTimes();
      } else if (!centerbox) {
        addRallySearchFilter();
      }
      break;

    case urlStringValues.paths.usersStats:
      addDiffColumn();
      break;

    case urlStringValues.paths.stages:
      addStagesFilter();
      break;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}