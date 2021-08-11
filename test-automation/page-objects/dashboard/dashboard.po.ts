import { ElementHelper } from 'topcoder-testing-lib';

export class DashboardPageObject {
	/**
	 * Get Page Title
	 */
	 public get pageTitle() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"Sidebar_title")]');
	}

	/**
	 * Get Topbar Details
	 */
	 public get topBarDetails() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"Topbar_details")]');
	}

	/**
	 * Get Logout Icon
	 */
	 public get logoutIcon() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"Topbar_details")]/a[contains(@href,"logout")]');
	}

	/**
	 * Get Search Project Textbox
	 */
	 public get searchProjectTextbox() {
		return ElementHelper.getElementByXPath('//div[contains(@class,"Challenges_projectSearchHeader")]/input[@type="text"]');
	}

	/**
	 * Get Project Names List
	 */
	 public get projectNamesList() {
		return ElementHelper.getAllElementsByXPath('//div[contains(@class,"ProjectCard_name")]');
	}

	/**
	 * Get Challenge Page Title
	 */
	 public get challengePageTitle() {
		return ElementHelper.getElementByXPath('(//div[contains(@class,"ChallengesComponent_title")])[3]');
	}

	/**
	 * Get All Work Link
	 */
	 public get allWorkLink() {
		return ElementHelper.getElementByXPath('//a[@href="/"]/div');
	}

	/**
	 * Get Give Application Feedback Link
	 */
	 public get giveApplicationFeedback() {
		return ElementHelper.getElementByXPath('//a[@class="chameleon-feedback"]/div');
	}

	/**
	 * Get My Projects Checkbox
	 */
	 public get myProjectsCheckbox() {
		return ElementHelper.getElementByXPath('//input[@type="checkbox"]');
	}
}