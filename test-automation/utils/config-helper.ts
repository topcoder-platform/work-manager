import * as config from '../config/config.json';

export const ConfigHelper = {
  /**
   * Get current config
   */
  getConfig() {
    return config;
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
   * Get Challenge URL
   */
   getChallengeUrl(): string {
    return this.getConfig().challengeUrl;
  },

  /**
   * Gets Logout URL
   */
   getLogoutUrl() {
    return this.getConfig().logoutUrl;
  },
};
