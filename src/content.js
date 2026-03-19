import { addDiffColumn } from './userstats.js';
import { addRallyResultsDiff } from './rallyResults.js';
import { addRallySearchFilter } from './rallySearch.js';
import { addStagesFilter } from './stages.js';

function init() {
  const page = window.location.pathname.split('/').pop();
  const params = new URLSearchParams(window.location.search);
  const centerbox = params.get('centerbox');
  const rallyId = params.get('rally_id');

  if (page === 'rally_online.php') {
    if (centerbox === 'rally_results.php' && rallyId) {
      addRallyResultsDiff(rallyId);
    } else if (!centerbox) {
      addRallySearchFilter();
    }
  } else if (page === 'usersstats.php') {
    addDiffColumn();
  } else if (page === 'stages.php') {
    addStagesFilter();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}