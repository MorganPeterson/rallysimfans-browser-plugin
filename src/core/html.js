export const urlStringValues = {
  centerBox: 'centerbox',
  rallyId: 'rally_id',
  paths: {
    rallyOnline: 'rally_online.php',
    usersStats: 'usersstats.php',
    stages: 'stages.php',
  },
  values: {
    rallyResults: 'rally_results.php',
    rallyResultsStres: 'rally_results_stres.php',
    rallyListDetails: 'rally_list_details.php',
  }, 
}

export const internalClassNames = {
    rsfPluginFilter: 'rsf-plugin-filter',
    rsfPluginFilterCb: 'rsf-plugin-filter-cb',
    rsfPluginRowUndriven: 'rsf-plugin-row-undriven',
}

export function escapeHtml(value) {
    return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function escapeHtmlAttr(value) {
    return escapeHtml(value)
}
