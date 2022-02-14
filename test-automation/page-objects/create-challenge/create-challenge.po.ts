import { BrowserHelper, ElementHelper } from 'topcoder-testing-lib';
import { logger } from '../../logger/logger';
import { ConfigHelper } from '../../utils/config-helper';

export class CreateChallengePageObject {
	/**
	 * Open the Given Project URL
	 * @param url given url
	 */
	public static async open(url: string) {
		await BrowserHelper.open(url);
		logger.info('User navigated to Challenge Page');
	}

	/**
	 * Get Page Title
	 */
	public get pageTitle() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"Sidebar_title")]');
	}

	/**
	 * Get Launch New Button
	 */
	public get launchNewButton() {
		return ElementHelper.getElementByXPath('//button[contains(@class,"PrimaryButton")]/span');
	}

	/**
	 * Get Challenge Editor Title
	 */
	public get challengeEditorTitle() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"ChallengeEditor_title")]');
	}

	/**
	 * Get Work Type Button
	 */
	public workTypeButton(workTypeButton: string) {
		return ElementHelper.getElementByXPath(`//div[contains(@class,"Track_container")]/span[contains(text(), "${workTypeButton}")]`);
	}

	/**
	 * Get Work Format input
	 */
	public async workFormatInput() {
		const els = await ElementHelper.getAllElementsByXPath('//div[contains(@class, "indicatorContainer")]');
		return els[0];
	}

	/**
	 * Get Work Format List
	 */
	public get workFormatList() {
		return ElementHelper.getAllElementsByXPath('//div[contains(@class,"menu")]//div[@id]');
	}

	/**
	 * Get Work Name textbox
	 */
	public get workNameTextbox() {
		return ElementHelper.getElementByXPath('//input[@id="name"]');
	}

	/**
	 * Get Continue Setup button
	 */
	public get continueSetupButton() {
		return ElementHelper.getElementByXPath('//button[@type="submit"]/span');
	}

	/**
	 * Get Assign To Me link
	 */
	public get assignToMeLink() {
		return ElementHelper.getElementByXPath('//a[@href="#"]');
	}

	/**
	 * Get Copilot List
	 */
	public get copilotList() {
		return ElementHelper.getAllElementsByXPath('//div[contains(@class, "CopilotCard_container")]/span');
	}

	/**
	 * Get Description Field Editor
	 */
	public get descriptionFieldEditor() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"CodeMirror-line")]');
	}

	/**
	 * Get Public Specification Text Area
	 */
	public get publicSpecificationTextArea() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"CodeMirror cm-s-paper CodeMirror-wrap")]//textarea');
	}

	/**
	 * Get Tags input
	 */
	public get tagsInput() {
		return ElementHelper.getElementById("track-select");
	}

	/**
	 * Get Internal Reviewer input
	 */
	public async internalReviewerInput() {
		const parentEl = await ElementHelper.getAllElementsByCss(".css-13g796d");
		return ElementHelper.getElementByCss("input", parentEl[0]);
	}

	/**
	 * Get dropdown List for tags or reviewers
	 */
	public get dropdownList() {
		return ElementHelper.getAllElementsByXPath('//div[@id and @class and @tabindex]');
	}

	/**
	 * Get Prize Text box
	 */
	public get prizeTextBox() {
		return ElementHelper.getElementByXPath('//input[@id="amount"]');
	}

	/**
	 * Get Save Draft Button
	 */
	public get saveDraftButton() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"ChallengeEditor_button")]/button');
	}

	/**
	 * Get Dialog Box
	 */
	public get dialogBox() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"Modal_childrenwrapper")]/div');
	}

	/**
	 * Get View Challenges button
	 */
	public get viewChallengesButton() {
		return ElementHelper.getElementByXPath('//a[contains(@href,"view")]');
	}

	/**
	 * Get Launch Button
	 */
	public get launchButton() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"ChallengeViewTabs_button")]/button');
	}

	/**
	 * Get Cancel Button
	 */
	public get cancelButton() {
		return ElementHelper.getElementByXPath('(//div[contains(@class,"ConfirmationModal_button")]/div)[1]');
	}

	/**
	 * Get Confirm Button
	 */
	public get confirmButton() {
		return ElementHelper.getElementByXPath('(//div[contains(@class,"ConfirmationModal_button")]/div)[2]');
	}

	/**
	 * Get Ok button
	 */
	public get okButton() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"ConfirmationModal_buttonGroup")]//span');
	}

	/**
	 * Get Back Button
	 */
	public get backButton() {
		return ElementHelper.getElementByXPath('(//div[contains(@class,"ChallengeViewTabs_actionButtons")]/a)[2]');
	}

	/**
	 * Get Tabs
	 */
	public get tabs() {
		return ElementHelper.getAllElementsByXPath('//div[contains(@class,"ChallengeList_tabs")]//li');
	}

	/**
	 * Get Challenge List
	 */
	public get challengeList() {
		return ElementHelper.getAllElementsByXPath('//span[contains(@class,"ChallengeCard_block")]');
	}

	/**
	 * Get Track Name
	 */
	public get trackName() {
		return ElementHelper.getElementByXPath('//span[contains(text(), "Track")]/following-sibling::div/span');
	}

	/**
	 * Returns the attribute value of the key.
	 *
	 * @param key Key of which value to be retrieved
	 *
	 * @returns Attribute Value
	 */
	public getAttributeValue(key: string) {
		return ElementHelper.getElementByXPath(`(//span[contains(text(), "${key}")]/parent::span)[1]`);
	}

	/**
	 * Get Assigned Member
	 */
	public getAssignedMember(key: string) {
		return ElementHelper.getElementByXPath(`//label[contains(text(),"${key}")]/parent::div/following-sibling::div/div`);
	}

	/**
	 * Get Description Field Editor Value
	 */
	public get descriptionFieldEditorValue() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"Description-Field_editor")]//p');
	}

	/**
	 * Get Tags Value
	 */
	public getTagsValue(key: string) {
		return ElementHelper.getElementByXPath(`//label[contains(text(), "${key}")]/parent::div/following-sibling::div/span`);
	}

	/**
	 * Get Prize Value
	 */
	public getPrizeValue(key: string) {
		return ElementHelper.getElementByXPath(`//label[contains(text(), "${key}")]/parent::div/following-sibling::span`);
	}

	/**
	 * Get Prize Value
	 */
	public processingButton(key: string) {
		return ElementHelper.getElementByXPath(`//span[contains(text(), "${key}")]`);
	}

	/**
	 * Get view advanced settings textbox
	 */
	public get viewAdvancedSettings() {
		return ElementHelper.getElementByXPath('//label[@for="isOpenAdvanceSettings"]');
	}

	/**
	 * Get expired message span element
	 */
	public get expiredMessage() {
		return ElementHelper.getElementByXPath('//span[contains(@class, "ChallengeView_expiredMessage")]');
	}

	/**
	 * Get expired popup message span element
	 */
	public get expiredPopupMessage() {
		return ElementHelper.getElementByXPath('//span[contains(@class, "ConfirmationModal_errorMessage")]');
	}

	/**
	 * Get milestone dropdown
	 */
	public get milestoneDropdown() {
		return ElementHelper.getElementByXPath('//div[contains(@class, "Milestone-Field_col2")]');
	}

	/**
	 * Get milestone tag from challenge view page
	 */
	public async milestonTag() {
		const challengeViewColumns = await ElementHelper.getAllElementsByXPath('//div[contains(@class, "ChallengeView_col")]');
		return ElementHelper.getElementByCss('a', challengeViewColumns[1]);
	}

	/**
	 * Get manage milestones button
	 */
	public get manageMilestonesButton() {
		return ElementHelper.getElementByXPath('//span[text()="MANAGE MILESTONES"]');
	}

	/**
	 * Get project title
	 */
	public get projectTitle() {
		return ElementHelper.getElementByXPath('//div[contains(@class, "ChallengesComponent_title_")]');
	}

	/**
	 * Get Connect App's project status element
	 */
	public get projectStatus() {
		return ElementHelper.getElementByClassName('project-status');
	}

	/**
	 * Get Connect App's project title
	 */
	public get connectProjectTitle() {
		return ElementHelper.getElementByCss('div', this.projectStatus);
	}

	/**
	 * Get NDA Field
	 */
	public get ndaField() {
		return ElementHelper.getElementByXPath('//div[contains(@class, "NDAField_col2")]');
	}

	/**
	 * Get Work Type List
	 */
	public get workTypeList() {
		return ElementHelper.getElementByXPath('(//div[contains(@class, "Track-Field_field")])[2]');
	}
 }