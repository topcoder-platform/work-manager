import { BrowserHelper } from 'topcoder-testing-lib';
import { logger } from '../../logger/logger';
import { ConfigHelper } from '../../utils/config-helper';
import { CommonHelper } from '../common-page/common.helper';
import { LoginPage } from '../login/login.po';
import { DashboardPageObject } from './dashboard.po';

export class DashboardPageHelper {
	/**
	 * Initialize Dashboard page object
	 */
	public static initialize() {
		this.dashboardPageObject = new DashboardPageObject();
		this.loginPage = new LoginPage()
	}

	/**
	 * Verifies Login / Logout Functionality
	 *
	 * @param copilotUser 	User to login
	 * @param testData 		Test Data for the test
	 */
	public static async verifyLoginLogout(user: any, data: any) {
		// Login to Topcoder
		await CommonHelper.login(user.email, user.password);

		// Verify Dashboard Page Title
		const pageTitle = await this.dashboardPageObject.pageTitle.getText()
		expect(pageTitle).toEqual(data.workManager);
		logger.info(`Verified page title ${pageTitle}`);

		// Verify Logged in User Welcome message
		const topBarDetails = await this.dashboardPageObject.topBarDetails.getText()
		expect(topBarDetails).toEqual(`${data.welcome}${user.handle}`);
		logger.info(`Verified Welcome Message:  ${topBarDetails}`);

		// Click on Logout Icon
		await this.dashboardPageObject.logoutIcon.click();
		await CommonHelper.waitForElementToGetDisplayed(this.loginPage.loginButton);
		logger.info('Logout Icon clicked');

		// Verify Logout is successful by checking LOG IN button
		let buttonTitle = await this.loginPage.loginButton.getText()
		expect(buttonTitle).toEqual(data.login);
		logger.info('Verified LOG IN button');

		buttonTitle = await this.loginPage.signUpButton.getText()
		expect(buttonTitle).toEqual(data.signup);
		logger.info('Verified SIGN UP button');
	}

	/**
	 * Verify that User Can Search By Text and ID
	 *
	 * @param data Test data for the test
	 */
	public static async verifyUserCanSearchByTextAndId(data: any) {
		const searchTextProjectId = ConfigHelper.getSearchTextProjectId();
		const projectName = ConfigHelper.getProjectName();
		// Specify Search Text and Verify the result
		await this.specifySearchTextAndVerifyResults(data.searchTextProjectKeyword, data.searchTextProjectKeyword);

		// Specify Search Text as Project ID and Verify the result
		await this.specifySearchTextAndVerifyResults(searchTextProjectId, projectName);
	}

	/**
	 * Specifies the Search Text and Verifies the result
	 *
	 * @param searchText Text to be searched
	 * @param verifyText Text to be verified
	 */
	public static async specifySearchTextAndVerifyResults(searchText: string, verifyText: string) {
		const searchProjectElement = this.dashboardPageObject.searchProjectTextbox;
		await searchProjectElement.clear();
		await searchProjectElement.sendKeys(searchText);
		logger.info(`Specified text ${searchText} in search box`);
		await CommonHelper.waitForSpinnerToDisappear();

		const elements = await this.dashboardPageObject.projectNamesList
		const size = elements.length
		// Assuming all the results would contain the searched keyword. If it doesn't the test will fail.
		for (let count = 0; count < size; count++) {
			await elements[count].getText().then((text) => {
				expect(text.toLowerCase()).toContain(verifyText.toLowerCase());
				logger.info(`Verified text ${verifyText} from the list`);
			})
		}

		await searchProjectElement.clear();
		await CommonHelper.waitForSpinnerToDisappear();
	}

	/**
	 * Verifies All Work and ApplicationFeedBack Links are working as expected.
	 *
	 * @param data	Test Data for the test
	 */
	public static async allWorkAndApplicationFeedbackLink(data: any) {
		await CommonHelper.waitForElementToGetDisplayed(this.dashboardPageObject.pageTitle);
		await CommonHelper.waitForSpinnerToDisappear()

		// Get List of Available Projects and click 1st project
		const elements = await this.dashboardPageObject.projectNamesList
		const projectName = await elements[0].getText();
		await elements[0].click()
		logger.info(`Clicked on 1st project from the list ${projectName}`);
		await CommonHelper.waitForSpinnerToDisappear();

		// Verify Challenge Page title
		const challengePageTitle = await this.dashboardPageObject.challengePageTitle.getText();
		expect(challengePageTitle).toEqual(projectName);
		logger.info(`Verified Challenge Page title: ${challengePageTitle}`)

		// Click on All Work Link
		await this.dashboardPageObject.allWorkLink.click();
		await CommonHelper.waitForSpinnerToDisappear();
		logger.info('Clicked All Work Link');

		// Verify Dashboard Page Title
		const pageTitle = await this.dashboardPageObject.pageTitle.getText()
		expect(pageTitle).toEqual(data.workManager);
		logger.info(`Verified Dashboard Page title: ${pageTitle}`);

		// Click on Give Application Feedback link
		await this.dashboardPageObject.giveApplicationFeedback.click();
		logger.info('Clicked on Give Application Feedback Link');

		// Verify Newly Open tab title
		await BrowserHelper.getAllWindowHandles().then((handles) => {
			// Verify tab count
			expect(handles.length).toEqual(2);
			BrowserHelper.switchToWindow(handles[1]);
			logger.info(`Verified Browser tab count: ${handles.length}`);

			// Verify newly opened tab title
			CommonHelper.verifyBrowserTitle(data.giveApplicationFeedbackTabTitle);

			// Close the newly opened tab
			BrowserHelper.close();
			BrowserHelper.switchToWindow(handles[0]);
			logger.info('Closed Newly opened tab and switched to default window');
		});
	}

	/**
	 * Verify that user can filter the project
	 */
	public static async verifyUserCanFilterTheProject() {
		await CommonHelper.waitForSpinnerToDisappear()

		// Get List of Projects before Un-checking the My Projects Checkbox
		const beforeProjectNameList = await this.getProjectNamesList();
		logger.info(`Get project names list before un-checking My Projects checkbox ${beforeProjectNameList}`)

		// Uncheck My Projects checkbox
		await CommonHelper.performOperationOnCheckbox(this.dashboardPageObject.myProjectsCheckbox, false);
		await BrowserHelper.sleep(2500);

		// Get List of Projects After Un-checking the My Projects Checkbox
		const afterProjectNameList = await this.getProjectNamesList();
		logger.info(`Get project names list after un-checking My Projects checkbox ${afterProjectNameList}`)

		// Verify the List has changed after Un-checking the My Projects Checkbox
		let result = JSON.stringify(beforeProjectNameList) === JSON.stringify(afterProjectNameList)
		expect(result).toEqual(false);
		expect(afterProjectNameList.length).toBeGreaterThanOrEqual(1);
		logger.info('Verified the list has changed after Un-checking the My Projects checkbox');
		logger.info('Verified the list count is greater than or equal to 1');

		// Check My Projects checkbox
		await CommonHelper.performOperationOnCheckbox(this.dashboardPageObject.myProjectsCheckbox, true);

		// Get List of Projects After checking the My Projects Checkbox
		const currentProjectNameList = await this.getProjectNamesList();
		logger.info(`Get project names list after checking My Projects checkbox ${currentProjectNameList}`)

		// Verify current count with before un-checking the My Projects checkbox.
		result = JSON.stringify(beforeProjectNameList) === JSON.stringify(currentProjectNameList)
		expect(result).toEqual(true);
		expect(beforeProjectNameList.length).toEqual(currentProjectNameList.length);
		logger.info('Verified the list is matching and the length of the list is also same.');
	}

	/**
	 * Get Member Project Names List
	 *
	 * @returns List of Member Projects
	 */
	public static async getProjectNamesList() {
		const memberProjectsList = [];
		const elements = await this.dashboardPageObject.projectNamesList;
		const size = (await this.dashboardPageObject.projectNamesList).length;
		for (let cnt = 0; cnt < size; cnt++) {
			const projectName = await elements[cnt].getText();
			memberProjectsList.push(projectName);
		}

		return memberProjectsList;
	}

	private static dashboardPageObject: DashboardPageObject;
	private static loginPage: LoginPage;
}