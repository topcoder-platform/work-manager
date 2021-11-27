import { BrowserHelper } from 'topcoder-testing-lib';
import * as config from '../../config/app-config.json';
import { logger } from '../../logger/logger';
import { ConfigHelper } from '../../utils/config-helper';
import { CommonHelper } from '../common-page/common.helper';
import { ICreateChallenge, WorkFormat, WorkType } from './create-challenge.model';
import { CreateChallengePageObject } from './create-challenge.po';

export class CreateChallengePageHelper {
	/**
	 * Initialize Create Challenge page object
	 */
	public static initialize() {
		this.createChallengePageObject = new CreateChallengePageObject();
	}

	/**
	 * Open Challenge Url
	 *
	 * @param url given url
	 * @param isDetailPage is given url detail page
	 */
	public static async open(url: string, isDetailPage: boolean = false) {
		await CreateChallengePageObject.open(url);
		await CommonHelper.waitForPageDisplayed();

		if (isDetailPage) {
			await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.viewAdvancedSettings);
		} else {
			await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.launchNewButton);
		}
	}

	/**
	 * Verify User can create Challenges
	 * @param data challenge data
	 * @param workFormat work format
	 * @param workType work type
	 */
	public static async verifyChallengeCreation(
		data: ICreateChallenge,
		workFormat: WorkFormat,
		workType: WorkType
	) {
		const { handle } = ConfigHelper.getCopilotUser();
		const { workName } = await this.createChallenge(data, workFormat, workType);

		await this.verifyChallengeDetails(data, workFormat, workType, workName, handle);
		await this.waitForLaunchButton();
		await this.clickOnLaunchButton(data.confirmLaunch, data.launchMessage, workName);
		await this.clickOnConfirmButton(data.successTitle, data.activationMessage, data.loadingButtonText);
		await this.clickOnOkButton();

		if (workFormat === WorkFormat.Task && workType !== WorkType.Design) {
			await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.launchButton);

			await this.clickOnLaunchButton(data.confirmCloseTask, data.taskCloseMessage, workName);
			await this.clickOnConfirmButton(data.successTitle, data.taskClosedMessage, data.loadingButtonText);
			await this.clickOnOkButton();
		}
		await this.clickOnBackButton();

		if (workFormat === WorkFormat.Task && workType !== WorkType.Design) {
			await this.searchTextFromListAndClick(await this.createChallengePageObject.tabs, data.completed);
		} else {
			await this.searchTextFromListAndClick(await this.createChallengePageObject.tabs, data.active);
		}
		await CommonHelper.waitForSpinnerToDisappear();
		await this.verifyNewlyCreatedChallenge(workName);
	}

	/**
	 * Verify user cannot activate challenge when BA is expired
	 * @param data challenge data
	 */
	public static async verifyExpiredBAchallenge(data: ICreateChallenge) {
		const { workName } = await this.createChallenge(data, WorkFormat.Task, WorkType.Development);
		await this.verifyExpiredMessage(data.expiredMessage, data.expiredPopupMessage);

		// click on cancel and close
		await this.createChallengePageObject.cancelButton.click();
		await this.createChallengePageObject.backButton.click();

		// Challenge should be listed on Draft Tab.
		await this.searchTextFromListAndClick(await this.createChallengePageObject.tabs, data.draft);
		await CommonHelper.waitForSpinnerToDisappear();
		await this.verifyNewlyCreatedChallenge(workName);
	}

	/**
	 * Verify user can have milestone when BA associated to the project is not active or active
	 * @param data challenge data
	 */
	public static async verifyChallengesWithMilestone(data: ICreateChallenge) {
		const { workName, milestoneName } = await this.createChallenge(data, WorkFormat.Task, WorkType.Development, true);

		await this.verifyMilestoneTag(milestoneName);
		await this.waitForLaunchButton();
		await this.clickOnLaunchButton(data.confirmLaunch, data.launchMessage, workName);
		await this.clickOnConfirmButton(data.successTitle, data.activationMessage, data.loadingButtonText);
		await this.clickOnOkButton();
		await this.clickOnBackButton();
		await this.searchTextFromListAndClick(await this.createChallengePageObject.tabs, data.active);
		await CommonHelper.waitForSpinnerToDisappear();
		await this.verifyNewlyCreatedChallenge(workName);
	}

	/**
	 * Verify user can click 'MANAGE MILESTONES' to redirect with connect app for particular project
	 * @param data challenge data
	 */
	public static async verifyManageMilestonesRedirection(data: ICreateChallenge) {
		const expectedProjectTitle = await this.createChallengePageObject.projectTitle.getText();
		await this.clickOnLaunchNewButton();
		await this.verifyChallengePageTitle(data.pageTitle);
		await this.clickOnWorkTypeButton(WorkType.Development);
		await this.fillWorkFormat(WorkFormat.Task);
		await this.fillWorkName(data.workNamePrefix, WorkType.Development, WorkFormat.Task);
		await this.selectMilestone();

		await this.createChallengePageObject.manageMilestonesButton.click();
		// Verify Newly Open tab title
		await BrowserHelper.getAllWindowHandles().then(async (handles) => {
			BrowserHelper.switchToWindow(handles.pop());

			// Verify project title
			await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.projectStatus);
			const projectTitle = await this.createChallengePageObject.connectProjectTitle.getText();
			expect(projectTitle).toBe(expectedProjectTitle);
		});
	}

	/**
	 * Verify user can validate NDA of challenge
	 *
	 * @param data challenge data
	 * @param ndaVerificationUrl NDA verification url
	 */
	public static async verifyNDAValidation(data: ICreateChallenge, ndaVerificationUrl: string) {
		await this.verifyManageMilestonesRedirection(data);

		await this.open(ndaVerificationUrl, true);
		await this.createChallengePageObject.viewAdvancedSettings.click();
		const nda = await (await this.createChallengePageObject.ndaField.getText()).toUpperCase();

		expect(data.NDAFields.includes(nda)).toBe(true)
	}

	private static createChallengePageObject: CreateChallengePageObject;

	/**
	 * Create A Challenge
	 *
	 * @param data challenge data
	 * @param workFormat work format
	 * @param workType work type
	 * @param {Optional} hasMilestone has milestone
	 *
	 * @returns workName work name
	 */
	private static async createChallenge(
		data: ICreateChallenge,
		workFormat: WorkFormat,
		workType: WorkType,
		hasMilestone: boolean = false
	) {
		const { handle } = ConfigHelper.getCopilotUser();
		await this.clickOnLaunchNewButton();
		await this.verifyChallengePageTitle(data.pageTitle);
		await this.clickOnWorkTypeButton(workType);
		await this.fillWorkFormat(workFormat);
		let milestoneName = "";

		if (hasMilestone) {
			milestoneName = await this.selectMilestone();
		}

		const workName = await this.fillWorkName(data.workNamePrefix, workType, workFormat);
		const isDesignChallenge = workType === WorkType.Design && workFormat === WorkFormat.Challenge;
		await this.clickOnContinueButton(isDesignChallenge);

		// Design Challenges (except Design Task) has not supported "Community Review".
		// So we need to select internal reviewer for design challenges.
		if (workType === WorkType.Design && workFormat !== WorkFormat.Task) {
			await this.fillInternalReviewer(handle);
		}

		if (workFormat === WorkFormat.Task) {
			await this.clickOnAssignToMe();
		} else {
			await this.searchTextFromListAndClick(await this.createChallengePageObject.copilotList, handle);
		}

		await this.fillPublicSpecification(data.publicSpecification);
		await this.selectTag(data.tag);
		await this.selectPrize(data.prize);
		await this.saveDraft(data.successTitle, data.draftMessage);

		await BrowserHelper.sleep(5000);
		await this.clickOnViewChallenges();

		return { workName, milestoneName }
	}

	/**
	 * Verify Dialog box title and message.
	 *
	 * @param title 	Title for the dialog box
	 * @param message 	Dialog box message
	 */
	private static async verifyDialogBoxMessage(title: string, message: string) {
		await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.dialogBox);
		const dialogBoxTitle = await this.createChallengePageObject.dialogBox.getText();
		expect(dialogBoxTitle).toContain(title);
		expect(dialogBoxTitle).toContain(message);
		logger.info(`Verified Dialog box with Title ${title} and Message ${message}`);
	}

	/**
	 * Get Challenge Details
	 *
	 * @param data Test Data for the test
	 * @param workFormat Work Format
	 * @param workType Work Type
	 * @param workName Work Name
	 * @param handle handle
	 *
	 * @returns Challenge Details
	 */
	private static async verifyChallengeDetails(
		data: ICreateChallenge,
		workFormat: WorkFormat,
		workType: string,
		workName: string,
		handle: string
	) {
		const value = (workFormat === WorkFormat.Task) ? data.assignedMember : data.copilot;
		expect(await this.createChallengePageObject.trackName.getText()).toContain(workType);
		expect(await this.createChallengePageObject.getAttributeValue(data.type).getText()).toContain(workFormat);
		expect(await this.createChallengePageObject.getAttributeValue(data.status).getText()).toContain(data.draft);
		expect(await this.createChallengePageObject.getAttributeValue(data.challengeName).getText()).toContain(workName);
		expect(await this.createChallengePageObject.getAssignedMember(value).getText()).toContain(handle);
		expect(await this.createChallengePageObject.descriptionFieldEditorValue.getText()).toContain(data.publicSpecification);
		expect(await this.createChallengePageObject.getTagsValue(data.tagsLabel).getText()).toContain(data.tag);
		expect(await this.createChallengePageObject.getPrizeValue(data.prizeLabel).getText()).toContain(data.prize);
	}

	/**
	 * Click on Launch New Button
	 */
	private static async clickOnLaunchNewButton() {
		await this.createChallengePageObject.launchNewButton.click();
		logger.info('Clicked on Launch New Button');
	}

	/**
	 * Verify Challenge Editor page title
	 *
	 * @param pageTitle challenge editor page title
	 */
	private static async verifyChallengePageTitle(pageTitle: string) {
		await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.challengeEditorTitle);
		expect(await this.createChallengePageObject.challengeEditorTitle.getText()).toEqual(pageTitle)
		logger.info(`Verified Challenge Editor Page title: ${pageTitle}`)
	}

	/**
	 * Click on Work Type Button
	 *
	 * @param workType work type
	 */
	private static async clickOnWorkTypeButton(workType: WorkType) {
		await this.createChallengePageObject.workTypeButton(workType).click();
		logger.info(`Clicked on Work Type button: ${workType}`);
	}

	/**
	 * Click on Work Form Input and Select Format from the list
	 *
	 * @param workFormat work format
	 */
	private static async fillWorkFormat(workFormat: WorkFormat) {
		const workFormatInput = await this.createChallengePageObject.workFormatInput();
		await workFormatInput.click();
		await this.searchTextFromListAndClick(await this.createChallengePageObject.workFormatList, workFormat);
		logger.info(`Selected Work Type: ${workFormat} from the list`);
	}

	/**
	 * Fill Work Name field with following format: "Work Type + Work Format + Automation + currentdatetime()"
	 *
	 * @param workNamePrefix work name prefix
	 * @param workType work type
	 * @param workFormat work format
	 *
	 * @returns workName work name
	 */
	private static async fillWorkName(workNamePrefix: string, workType: WorkType, workFormat: WorkFormat) {
		const workName = CommonHelper.appendDate(`${workType}-${workFormat}-${workNamePrefix}`);
		await this.createChallengePageObject.workNameTextbox.sendKeys(workName);
		logger.info(`Filled Work Name Field: ${workName}`);

		return workName;
	}

	/**
	 * Click Continue Setup Button
	 *
	 * @param {Boolean} isDesignChallenge is design challenge type
	 */
	private static async clickOnContinueButton(isDesignChallenge = false) {
		await this.createChallengePageObject.continueSetupButton.click();
		logger.info('Click on Continue Setup Button');
		if (isDesignChallenge) {
			await this.createChallengePageObject.launchNewButton.click();
		}
		await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.descriptionFieldEditor);
	}

	/**
	 * Fill Internal Reviewer Input
	 * @param handle user handle
	 */
	private static async fillInternalReviewer(handle: string) {
		const internalReviewerInput = await this.createChallengePageObject.internalReviewerInput();
		await internalReviewerInput.click();
		await this.searchTextFromListAndClick(await this.createChallengePageObject.dropdownList, handle);
	}

	/**
	 * Click on Assign to me button
	 */
	private static async clickOnAssignToMe() {
		await this.createChallengePageObject.assignToMeLink.click();
		logger.info('Clicked on Assign To Me link.');
	}

	/**
	 * fill public specification text
	 *
	 * @param publicSpecification public specification
	 */
	private static async fillPublicSpecification(publicSpecification: string) {
		await this.createChallengePageObject.descriptionFieldEditor.click();
		await this.createChallengePageObject.publicSpecificationTextArea.sendKeys(publicSpecification);
		logger.info(`Filled ${publicSpecification} in text area.`);
	}

	/**
	 * Click on Tags Input and Select tag from the list
	 *
	 * @param tag tag
	 */
	private static async selectTag(tag: string) {
		await this.createChallengePageObject.tagsInput.click();
		await this.searchTextFromListAndClick(await this.createChallengePageObject.dropdownList, tag);
		logger.info(`Selected Tag: ${tag} from the list`);
	}

	/**
	 * Fill prize input
	 *
	 * @param prize prize
	 */
	private static async selectPrize(prize: string) {
		await this.createChallengePageObject.prizeTextBox.clear();
		await this.createChallengePageObject.prizeTextBox.sendKeys(prize);
		logger.info(`Filled ${prize} in the textbox`);
	}

	/**
	 * Click on Save Draft Button
	 *
	 * @param successTitle success title
	 * @param draftMessage draft message
	 */
	private static async saveDraft(successTitle: string, draftMessage: string) {
		await this.createChallengePageObject.saveDraftButton.click();
		logger.info('Clicked Save Draft button');
		await this.verifyDialogBoxMessage(successTitle, draftMessage);
	}

	/**
	 * Click on View Challenges Button
	 */
	private static async clickOnViewChallenges() {
		await this.createChallengePageObject.viewChallengesButton.click();
		logger.info('Clicked on View Challenges link.');
	}

	/**
	 * Wait for Launch button to get Enabled for Challenges
	 */
	private static async waitForLaunchButton() {
		for (let cnt = 0; cnt < config.Timeout.ActiveChallengeTimeout; cnt++) {
			const element = this.createChallengePageObject.launchButton;
			const classValue = await element.getAttribute('class');
			if (classValue.includes('disabled')) {
				await BrowserHelper.refresh();
				await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.backButton);
				await CommonHelper.waitForSpinnerToDisappear();
			} else {
				break;
			}
		}
	}

	/**
	 * Click on Confirm Button
	 *
	 * @param successTitle success title
	 * @param activationMessage activation message
	 * @param loadingButtonText loading button text
	 */
	private static async clickOnConfirmButton(successTitle: string, activationMessage: string, loadingButtonText: string) {
		await this.createChallengePageObject.confirmButton.click();
		logger.info('Clicked Confirm Button');
		await BrowserHelper.waitUntilInVisibilityOf(this.createChallengePageObject.processingButton(loadingButtonText));
		await this.verifyDialogBoxMessage(successTitle, activationMessage);
	}

	/**
	 * Click on Ok Button
	 */
	private static async clickOnOkButton() {
		await this.createChallengePageObject.okButton.click();
		await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.backButton);
		logger.info('Clicked Ok button');
	}

	/**
	 * Click on Back button
	 */
	private static async clickOnBackButton() {
		await this.createChallengePageObject.backButton.click();
		await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.pageTitle);
		await CommonHelper.waitForSpinnerToDisappear();
	}

	/**
	 * Verify newly created challenge
	 * @param workName work name
	 */
	private static async verifyNewlyCreatedChallenge(workName: string) {
		const elements = await this.createChallengePageObject.challengeList;
		const challengeName = (await elements[0].getText()).trim();
		expect(challengeName).toContain(workName);
	}


	/**
	 * Click on Launch Button
	 *
	 * @param confirmLaunch confirm launch title
	 * @param launchMessage launch message
	 * @param workName work name
	 */
	private static async clickOnLaunchButton(confirmLaunch: string, launchMessage: string, workName: string) {
		const launchButton = this.createChallengePageObject.launchButton;
		const classValue = await launchButton.getAttribute('class');
		if (classValue.includes('disabled')) {
			return;
		}
		await launchButton.click();
		logger.info('Clicked Launch Button');
		await this.verifyDialogBoxMessage(confirmLaunch, `${launchMessage} "${workName}"`)
	}

	/**
	 * Verify expired message on billing accound id
	 *
	 * @param expiredMessage expected expired message
	 * @param expiredPopupMessage expired modal message
	 */
	private static async verifyExpiredMessage(expiredMessage: string, expiredPopupMessage: string) {
		const viewAdvancedSettings = this.createChallengePageObject.viewAdvancedSettings;
		await CommonHelper.waitForElementToGetDisplayed(viewAdvancedSettings);
		await viewAdvancedSettings.click();
		expect(await this.createChallengePageObject.expiredMessage.getText()).toBe(expiredMessage);

		await this.createChallengePageObject.launchButton.click();
		expect(await this.createChallengePageObject.expiredPopupMessage.getText()).toBe(expiredPopupMessage);
	}

	/**
	 * Select milestone from dropdown
	 *
	 * @returns milestoneName milestone name
	 */
	private static async selectMilestone() {
		await this.createChallengePageObject.milestoneDropdown.click();
		const dropdownlists = await this.createChallengePageObject.dropdownList;
		const milestoneName = await dropdownlists[0].getText();
		await dropdownlists[0].click();

		return milestoneName;
	}

	/**
	 * Verify Milestone tag
	 *
	 * @param milestoneText milestone text
	 */
	private static async verifyMilestoneTag(milestoneText: string) {
		const milestonTag = await this.createChallengePageObject.milestonTag();

		expect(await milestonTag.getText()).toBe(milestoneText);
	}

	/**
	 * Matches element text from the list of elements and clicks on that element
	 *
	 * @param list target elements
	 * @param value Value to match with element text
	 */
	private static async searchTextFromListAndClick(list: any, value: string) {
		let isFound = false;
		const size = list.length
		let index = 0;
		for (index = 0; index < size; index++) {
			await list[index].getText().then((text: string) => {
				if (text === value) {
					isFound = true;
				}
			})
			if (isFound) {
				break;
			}
		}
		if (isFound) {
			await list[index].click();
			logger.info(`Clicked on ${value}`);
		}
	}
}