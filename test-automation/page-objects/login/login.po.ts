import { BrowserHelper, ElementHelper } from 'topcoder-testing-lib';
import * as config from '../../config/app-config.json';
import { logger } from '../../logger/logger';
import { ConfigHelper } from '../../utils/config-helper';
import { CommonHelper } from '../common-page/common.helper';

export class LoginPage {
  /**
   * Get login page
   */
  public async open() {
    const url = ConfigHelper.getGivenUrl();
    await BrowserHelper.open(ConfigHelper.getGivenUrl());
    logger.info(`User navigated to ${url}`);
  }

  /**
   * Logout the user
   */
  public async logout() {
    await BrowserHelper.open(ConfigHelper.getLogoutUrl());
    logger.info('User logged out\n');
  }

  /**
   * Get Username field
   */
  public get loginWindow() {
    return ElementHelper.getElementById('hiw-login-container');
  }

  /**
   * Get Login Button
   */
	public get loginButton() {
		return ElementHelper.getElementByXPath('//a[@id="button_login"] | //span[@class="auth0-label-submit"]');
	}

  /**
   * Get Sign up button
   */
	public get signUpButton() {
		return ElementHelper.getElementByXPath('//a[@id="button_signup"]');
	}

  /**
   * Get Username field
   */
  public get userNameField() {
    return ElementHelper.getElementByName('username');
  }

  /**
   * Get Password field
   */
  public get passwordField() {
    return ElementHelper.getElementByName('password');
  }

  /**
   * Wait for the login form to be displayed
   */
  public async waitForLoginForm() {
    // Wait until login form appears
    await CommonHelper.waitForElementToGetDisplayed(this.loginWindow)
    await BrowserHelper.waitUntilClickableOf(
      this.loginButton,
      config.Timeout.ElementClickable,
      config.LoggerErrors.ElementClickable
    );
    logger.info('Login Form Displayed');
  }

  /**
   * Fill and submit the login form
   */
  public async fillLoginForm(username: string, password: string) {
    await CommonHelper.waitUntilPresenceOf(
      () => this.userNameField,
      'wait for username field',
      false
    );
    await this.userNameField.sendKeys(username);
    await this.passwordField.sendKeys(password);
    logger.info(
      'Login form filled with values: username - ' +
        username +
        ', password - FILTERED'
    );
    await BrowserHelper.waitUntilClickableOf(
      this.loginButton,
      config.Timeout.ElementClickable,
      config.LoggerErrors.ElementClickable
    );
    await this.loginButton.click();
    logger.info('Submitted login form');
  }
}
