import { CommonHelper } from "../../page-objects/common-page/common.helper";
import { DashboardPageHelper } from "../../page-objects/dashboard/dashboard.helper";
import * as testData from '../../test-data/test-data.json';
import { ConfigHelper } from "../../utils/config-helper";

describe('Work Manger - Dashboard Page Tests', () => {
  const copilotRole = ConfigHelper.getCopilotUser();

  beforeEach(async () => {
    DashboardPageHelper.initialize();
  });

  it('[TC_001] Should verify whether the user can login/log out the system.', async () => {
    await DashboardPageHelper.verifyLoginLogout(copilotRole, testData.dashboard);
  });

  describe('Using Copilot Role', () => {
    /**
     * Sets up the browser and login
     */
    beforeAll(async () => {
      // Precondition: User should be logged in with Specified User Role
      await CommonHelper.login(copilotRole.email, copilotRole.password);
    });

    /**
     * Logs out
     */
    afterAll(async () => {
      await CommonHelper.logout();
    });

    it('[TC_002] Should verify user can Search the project by text and ID.', async () => {
      await DashboardPageHelper.verifyUserCanSearchByTextAndId(testData.dashboard);
    });

    it('[TC_003] Should verify All Work and Application feedback link is working.', async () => {
      await DashboardPageHelper.allWorkAndApplicationFeedbackLink(testData.dashboard);
    });
  });

  describe('Using Copilot Manager Role', () => {
    let copilotManagerRole: any;

    /**
     * Sets up the browser and login
     */
    beforeAll(async () => {
      // Precondition: User should be logged in with Specified User Role
      copilotManagerRole = ConfigHelper.getCopilotManagerUser();
      await CommonHelper.login(copilotManagerRole.email, copilotManagerRole.password);
    });

    /**
     * Logs out
     */
    afterAll(async () => {
      await CommonHelper.logout();
    });

    it('[TC_004] Should verify user can filter the project as Member only or All project.', async () => {
      await DashboardPageHelper.verifyUserCanFilterTheProject();
    });
  });
});