/**
 * Returns project details only when they match the current project context.
 *
 * This prevents stale project data from rendering on another project page while
 * still handling APIs that may return ids as strings.
 *
 * @param {Object} projectDetail Loaded project details from redux.
 * @param {string|number} projectId Project id from the current route.
 * @param {number} activeProjectId Active project id stored in the sidebar state.
 * @returns {Object} The matching project detail object, or an empty object.
 */
export function getActiveProject (projectDetail, projectId, activeProjectId) {
  if (!projectDetail) {
    return {}
  }

  const scopedProjectId = projectId != null
    ? `${projectId}`
    : (activeProjectId != null && activeProjectId !== -1 ? `${activeProjectId}` : '')

  if (!scopedProjectId || `${projectDetail.id}` !== scopedProjectId) {
    return {}
  }

  return projectDetail
}
