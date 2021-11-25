import * as config from '../config/config.json';

export const ConfigHelper = {
  /**
   * Get current config
   */
  getConfig() {
    return config;
  },

  /**
   * Get Environment
   */
  getEnvironment() {
    return this.getConfig().env;
  },

  /**
   * Gets email, password of copilot user
   */
  getCopilotUser() {
    return this.getConfig().copilotRole;
  },

  /**
   * Gets email, password of copilot manager user
   */
  getCopilotManagerUser() {
    return this.getConfig().copilotManagerRole;
  },

  /**
   * Get Given URL
   */
  getGivenUrl(): string {
    return this.getConfig().givenUrl;
  },

  /**
   * Gets Logout URL
   */
  getLogoutUrl() {
    return this.getConfig().logoutUrl;
  },

  /**
   * Gets active project url
   */
  getActiveProjectUrl() {
    return this.getConfig().activeProjectUrl;
  },

  /**
   * Gets expired project url
   */
  getExpiredProjectUrl() {
    return this.getConfig().expiredProjectUrl;
  },

  /**
   * Gets milestone project url
   */
  getMilestoneProjectUrl() {
    return this.getConfig().milestoneProjectUrl;
  },

  /**
   * Gets NDA verification project url
   */
  getNdaVerificationUrl() {
    return this.getConfig().ndaVerificationUrl;
  },

  /**
   * Gets search text project id
   */
  getSearchTextProjectId() {
    return this.getConfig().searchTextProjectId;
  },

  /**
   * Gets project name
   */
  getProjectName() {
    return this.getConfig().projectName;
  },
};
