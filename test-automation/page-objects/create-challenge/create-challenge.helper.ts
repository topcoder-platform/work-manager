import { BrowserHelper } from 'topcoder-testing-lib';
import * as config from '../../config/app-config.json';
import { logger } from '../../logger/logger';
import { CommonHelper } from '../common-page/common.helper';
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
	 */
	public static async open() {
		await CreateChallengePageObject.open();
		await CommonHelper.waitForPageDisplayed();
		await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.launchNewButton);
	}

	public static async verifyUserCanCreateWorkFormat(data: any, workFormat: string, handle: string) {
		// Click on Launch New Button
		await this.createChallengePageObject.launchNewButton.click();
		logger.info('Clicked on Launch New Button');

		// Verify Challenge Editor page title
		await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.challengeEditorTitle);
		expect(await this.createChallengePageObject.challengeEditorTitle.getText()).toEqual(data.createNewWork)
		logger.info(`Verified Challenge Editor Page title: ${data.createNewWork}`)

		// Click Work Type Button
		await this.createChallengePageObject.workTypeButton(data.workType[0]).click();
		logger.info(`Clicked on Domain button: ${data.workType[0]}`);

		// Click Work Form Input and Select Format from the list
		await this.createChallengePageObject.workFormatInput.click();
		await CommonHelper.searchTextFromListAndClick(await this.createChallengePageObject.workFormatList, workFormat);
		logger.info(`Selected Work Format: ${workFormat} from the list`);

		// Specify Work Name
		const workName = CommonHelper.appendDate(`${data.workType[0]}${workFormat}${data.automation}`);
		await this.createChallengePageObject.workNameTextbox.sendKeys(workName);
		logger.info(`Specified Work Name: ${workName}`);

		// Click Continue Setup Button
		await this.createChallengePageObject.continueSetupButton.click();
		logger.info('Click on Continue Setup Button');
		await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.descriptionFieldEditor);

		if(workFormat === data.workFormat[0]) {
			// Click Assign To Me link
			await this.createChallengePageObject.assignToMeLink.click();
			logger.info('Clicked on Assign To Me link.');
		} else {
			await CommonHelper.searchTextFromListAndClick(await this.createChallengePageObject.copilotList, handle);
		}

		// Specify Public Specification Text
		await this.createChallengePageObject.descriptionFieldEditor.click();
		await this.createChallengePageObject.publicSpecificationTextArea.sendKeys(data.publicSpecification);
		logger.info(`Specified ${data.publicSpecification} in text area.`);

		// Click Tags Input and Select tag from the list
		await this.createChallengePageObject.tagsInput.click();
		await CommonHelper.searchTextFromListAndClick(await this.createChallengePageObject.tagsList, data.tag);
		logger.info(`Selected Tag: ${data.tag} from the list`);

		// Specify Prize in the Prize Text box
		await this.createChallengePageObject.prizeTextBox.clear();
		await this.createChallengePageObject.prizeTextBox.sendKeys(data.prize);
		logger.info(`Specified ${data.prize} in the textbox`);

		// Click on Save Draft Button
		await this.createChallengePageObject.saveDraftButton.click();
		logger.info('Clicked Save Draft button');
		await this.verifyDialogBoxMessage(data.success, data.draftMessage);
		
		// Click on View Challenges Button
		await this.createChallengePageObject.viewChallengesButton.click();
		logger.info('Clicked on View Challenges link.');

		const details = await this.getChallengeDetails(data, workFormat);
		expect(details[0]).toContain(data.workType[0]);
		expect(details[1]).toContain(workFormat);
		expect(details[2]).toContain(data.draft);
		expect(details[3]).toContain(workName);
		expect(details[4]).toContain(handle);
		expect(details[5]).toContain(data.publicSpecification);
		expect(details[6]).toContain(data.tag);
		expect(details[7]).toContain(data.prize);
		logger.info(`Verified Challenge Details: ${details}`);

		// Wait for Launch button to get Enabled for Challenge / F2F
		if(workFormat !== data.workFormat[0]) {
			for(let cnt=0;cnt<config.Timeout.ActiveChallengeTimeout;cnt++) {
				const element = await this.createChallengePageObject.launchButton;
				const classValue = await element.getAttribute('class');
				if(classValue.includes('disabled')) {
					await BrowserHelper.refresh();
					await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.backButton);
					await CommonHelper.waitForSpinnerToDisappear();
				} else {
					break;
				}
			}
		}

		// Click on Launch Button
		await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.launchButton);
		await this.createChallengePageObject.launchButton.click();
		logger.info('Clicked Launch Button');
		await this.verifyDialogBoxMessage(data.confirmLaunch, `${data.launchMessage} "${workName}"`)

		// Click on Confirm Button
		await this.createChallengePageObject.confirmButton.click();
		logger.info('Clicked Confirm Button');
		await BrowserHelper.waitUntilInVisibilityOf(this.createChallengePageObject.processingButton(data.processing));
		await this.verifyDialogBoxMessage(data.success, data.activationMessage);

		// Click on Ok Button
		await this.createChallengePageObject.okButton.click();
		logger.info('Clicked Ok button');

		if(workFormat === data.workFormat[0]) {
			await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.launchButton);

			// Click on Launch Button
			await this.createChallengePageObject.launchButton.click();
			logger.info('Clicked Launch Button');
			await this.verifyDialogBoxMessage(data.confirmCloseTask, `${data.taskCloseMessage} "${workName}"`)

			// Click on Confirm Button
			await this.createChallengePageObject.confirmButton.click();
			logger.info('Clicked Confirm Button');
			await BrowserHelper.waitUntilInVisibilityOf(this.createChallengePageObject.processingButton(data.processing));
			await this.verifyDialogBoxMessage(data.success, data.taskClosedMessage);

			// Click on Ok button
			await this.createChallengePageObject.okButton.click();
			await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.backButton);
			logger.info('Clicked Ok button');
		}

		// Click on Back button
		await this.createChallengePageObject.backButton.click();
		await CommonHelper.waitForElementToGetDisplayed(this.createChallengePageObject.pageTitle);
		await CommonHelper.waitForSpinnerToDisappear();

		if(workFormat === data.workFormat[0]) {
			await CommonHelper.searchTextFromListAndClick(await this.createChallengePageObject.tabs, data.completed);
		} else {
			await CommonHelper.searchTextFromListAndClick(await this.createChallengePageObject.tabs, data.active);
		}
		await CommonHelper.waitForSpinnerToDisappear();

		// Verify newly created project
		const elements = await this.createChallengePageObject.challengeList;
		const challengeName = (await elements[0].getText()).trim();
		expect(challengeName).toContain(workName);
	}

	/**
	 * Verify Dialog box title and message.
	 * 
	 * @param title 	Title for the dialog box
	 * @param message 	Dialog box message
	 */
	public static async verifyDialogBoxMessage(title: string, message: string) {
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
	 * 
	 * @returns Challenge Details
	 */
	public static async getChallengeDetails(data: any, workFormat: string) {
		const details = []
		details.push(await this.createChallengePageObject.trackName.getText());
		details.push(await this.createChallengePageObject.getAttributeValue(data.type).getText());
		details.push(await this.createChallengePageObject.getAttributeValue(data.status).getText());
		details.push(await this.createChallengePageObject.getAttributeValue(data.challengeName).getText());
		const value = (workFormat === data.workFormat[0])? data.assignedMember : data.copilot;;
		details.push(await this.createChallengePageObject.getAssignedMember(value).getText());
		details.push(await this.createChallengePageObject.descriptionFieldEditorValue.getText());
		details.push(await this.createChallengePageObject.getTagsValue(data.tagsLabel).getText());
		details.push(await this.createChallengePageObject.getPrizeValue(data.prizeLabel).getText());
		
		return details;
	}

	private static createChallengePageObject: CreateChallengePageObject;
}