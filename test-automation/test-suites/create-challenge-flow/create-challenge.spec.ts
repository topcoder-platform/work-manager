import { CommonHelper } from '../../page-objects/common-page/common.helper';
import { CreateChallengePageHelper } from '../../page-objects/create-challenge/create-challenge.helper';
import * as testData from '../../test-data/test-data.json';
import { ConfigHelper } from '../../utils/config-helper';

describe('Work Manager - Create Challenge Tests', () => {
  let user: any;
  /**
   * Sets up the browser and login
   */
  beforeAll(async () => {
    // Precondition: User should be logged in with Specified User Role  
    user = ConfigHelper.getCopilotUser();
    await CommonHelper.login(user.email, user.password);
  });

  /**
   * Logs out
   */
  afterAll(async () => {
    await CommonHelper.logout();
  });

  beforeEach(async () => {
    CreateChallengePageHelper.initialize();
    await CreateChallengePageHelper.open();
  });

  it('[TC_001] Should verify user can create new Challenge -Task', async () => {
    await CreateChallengePageHelper.verifyUserCanCreateWorkFormat(testData.createChallenge, testData.createChallenge.workFormat[0], user.handle);
  });

  it('[TC_002] Should verify user can create new Challenge - Challenge', async () => {
    await CreateChallengePageHelper.verifyUserCanCreateWorkFormat(testData.createChallenge, testData.createChallenge.workFormat[1], user.handle);
  });

  it('[TC_003] Should verify user can create new Challenge - F2F', async () => {
    await CreateChallengePageHelper.verifyUserCanCreateWorkFormat(testData.createChallenge, testData.createChallenge.workFormat[2], user.handle);
  });
});
