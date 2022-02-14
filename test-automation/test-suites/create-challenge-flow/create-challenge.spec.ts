import { CommonHelper } from '../../page-objects/common-page/common.helper';
import { CreateChallengePageHelper } from '../../page-objects/create-challenge/create-challenge.helper';
import { WorkFormat, WorkType } from '../../page-objects/create-challenge/create-challenge.model';
import * as testData from '../../test-data/test-data.json';
import { ConfigHelper } from '../../utils/config-helper';

describe('Work Manager - Create Challenge Tests: ', () => {
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


  describe("Create Challenge Tests: ", async () => {
    const activeProjectUrl = ConfigHelper.getActiveProjectUrl();
    beforeEach(async () => {
      CreateChallengePageHelper.initialize();
      await CreateChallengePageHelper.open(activeProjectUrl);
    });

    // We are testing combination of workType(4) and workFormat(3) challenges which is 12 tests in total.
    // Instead of listing all 12 tests, we are looping through each item below.
    const { workTypes, workFormats } = testData.createChallenge;
    let index = 1;
    workTypes.forEach(async (workType) => {
      workFormats.forEach(async (workFormat) => {
        it(`[TC_${index.toString().padStart(3, '0')}] should verify user can create new ${workType} Challenge - ${workFormat}`, async () => {
          await CreateChallengePageHelper.verifyChallengeCreation(testData.createChallenge, workFormat as WorkFormat, workType as WorkType);
        });
        index++;
      });
    });
  });

  describe("BA Expiration/Activation Prevent: ", async () => {
    const expiredProjectUrl = ConfigHelper.getExpiredProjectUrl();
    beforeEach(async () => {
      CreateChallengePageHelper.initialize();
      await CreateChallengePageHelper.open(expiredProjectUrl);
    });

    it("[TC_013] should verify user can prevent activation of challenge when BA associated to the project is not active", async () => {
      await CreateChallengePageHelper.verifyExpiredBAchallenge(testData.createChallenge);
    })
  });

  describe("Milestone Verification: ", async () => {
    const milestoneProjectUrl = ConfigHelper.getMilestoneProjectUrl();
    beforeEach(async () => {
      CreateChallengePageHelper.initialize();
      await CreateChallengePageHelper.open(milestoneProjectUrl);
    });

    it("[TC_014] should verify user can have milestone when BA associated to the project is not active or active", async () => {
      await CreateChallengePageHelper.verifyChallengesWithMilestone(testData.createChallenge);
    })

    it("[TC_015] should verify user can click 'MANAGE MILESTONES' to redirect with connect app for particular project", async () => {
      await CreateChallengePageHelper.verifyManageMilestonesRedirection(testData.createChallenge);
    })

    it("[TC_016] should verify user can validate NDA of challenge", async () => {
      const ndaVerificationUrl = ConfigHelper.getNdaVerificationUrl();
      await CreateChallengePageHelper.verifyNDAValidation(testData.createChallenge, ndaVerificationUrl);
    })
  });
});
