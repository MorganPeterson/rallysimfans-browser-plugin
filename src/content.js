import { addDiffColumn } from './userstats.js';
import { addLocalLegTimes } from './rallyDetails.js';
import { addRallyResultsDiff } from './rallyResults.js';
import { addRallySearchFilter } from './rallySearch.js';
import { addStagesFilter } from './stages.js';

function init() {
  const page = window.location.pathname.split("/").pop();
  const params = new URLSearchParams(window.location.search);
  const centerbox = params.get("centerbox");
  const rallyId = params.get("rally_id");

  switch (page) {
    case "rally_online.php":
      if (centerbox === "rally_results.php" && rallyId) {
        addRallyResultsDiff(rallyId);
      } else if (centerbox === "rally_list_details.php") {
        addLocalLegTimes();
      } else if (!centerbox) {
        addRallySearchFilter();
      }
      break;

    case "usersstats.php":
      addDiffColumn();
      break;

    case "stages.php":
      addStagesFilter();
      break;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}