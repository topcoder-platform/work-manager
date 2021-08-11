import moment = require('moment');
import { BrowserHelper, ElementHelper } from 'topcoder-testing-lib';
import * as config from '../../config/app-config.json';
import { logger } from '../../logger/logger';
import TcElement from '../../node_modules/topcoder-testing-lib/dist/src/tc-element';
import { TcElementImpl } from '../../node_modules/topcoder-testing-lib/dist/src/tc-element-impl';
import { LoginPageHelper } from '../login/login.helper';

/**
 * Wait until condition return true
 * @param func function for checking condition
 * @param extraMessage extra error message when timeout
 * @param isPageLoad wait for loading page
 */
const waitUntil = async (
  func: () => any,
  extraMessage: string,
  isPageLoad: boolean
) => {
  await BrowserHelper.waitUntil(
    func,
    isPageLoad
      ? config.Timeout.PageLoad
      : config.Timeout.ElementVisibility,
    (isPageLoad
      ? config.LoggerErrors.PageLoad
      : config.LoggerErrors.ElementVisibility) +
    '.' +
    extraMessage
  );
};

export const CommonHelper = {
  /**
   * Log in browser
   * @param username user name
   * @param password password
   */
   async login(username: string, password: string) {
    await BrowserHelper.initialize();
    await BrowserHelper.maximize();

    await LoginPageHelper.open();
    await LoginPageHelper.login(username, password);
  },

  /**
   * Log out browser
   */
  async logout() {
    try {
      await LoginPageHelper.logout();
    } catch (e) {
      await BrowserHelper.restart();
    }
  },

  /**
   * Wait until the element becomes visible
   * @param {TcElementImpl} tcElement element
   * @param {TcElementImpl} extraMessage extra message
   * @param {Boolean} isPageLoad is loading page
   */
   async waitUntilVisibilityOf(
    func: () => TcElement,
    extraMessage: string,
    isPageLoad: boolean
  ) {
    await waitUntil(
      () => async () => {
        try {
          return await func().isDisplayed();
        } catch {
          // element is not attached to the DOM of a page.
          return false;
        }
      },
      extraMessage,
      isPageLoad
    );
  },

  /**
   * Wait for Page Element to be displayed
   */
   async waitForElementToGetDisplayed(element) {
    await CommonHelper.waitUntilVisibilityOf(
      () => element,
      'Wait for Element To get Displayed',
      true
    );
    return element;
  },

  /**
   * Wait until the element is present
   * @param {TcElementImpl} tcElement element
   * @param {TcElementImpl} extraMessage extra message
   * @param {Boolean} isPageLoad is loading page
   */
   async waitUntilPresenceOf(
    func: () => TcElement,
    extraMessage: string,
    isPageLoad: boolean
  ) {
    await BrowserHelper.waitUntil(
      () => async () => {
        try {
          return await func().isPresent();
        } catch {
          // element is not attached to the DOM of a page.
          return false;
        }
      },
      isPageLoad
        ? config.Timeout.PageLoad
        : config.Timeout.ElementPresence,
      (isPageLoad
        ? config.LoggerErrors.PageLoad
        : config.LoggerErrors.ElementPresence) +
      '.' +
      extraMessage
    );
  },

  /**
   * Wait for Page to be displayed
   */
   async waitForPageDisplayed() {
    const rootId = ElementHelper.getElementById('root');

    await CommonHelper.waitUntilVisibilityOf(
      () => rootId,
      'Wait for home page',
      true
    );
    return rootId;
  },

  /**
   * Verifies Browser Title
   * 
   * @param titleToVerify Title to verify
   */
   async verifyBrowserTitle(titleToVerify: string) {
		const browserTitle = await BrowserHelper.getTitle();
		expect(browserTitle).toEqual(titleToVerify)
    logger.info(`Verified Browser title: ${browserTitle}`);
	},

  /**
   * Performs Operation on Checkbox check / uncheck
   * 
   * @param element   Element on which the operation to be performed.
   * @param selectionFlag   Selection flag true / false
   */
  async performOperationOnCheckbox(element: TcElementImpl, selectionFlag: boolean) {
		const isChecked = await element.isSelected();
		if(isChecked && selectionFlag === false) {
			await element.click()
		} else if(false === isChecked && selectionFlag) {
			await element.click()
		} 
    const value = (selectionFlag === true)? 'Checked': 'Un-checked';
    logger.info(`Performed Operation on Checkbox: ${value}`);
		await this.waitForSpinnerToDisappear();
	},

  /**
   * Append date time to given input text
   * @param inputText input text
   */
   appendDate(inputText: string) {
    return `${inputText}-${moment().format()}`;
  },

  /**
   * Matches element text from the list of elements and clicks on that element
   * 
   * @param list  List of Elements
   * @param value   Value to match with element text
   */
  async searchTextFromListAndClick(list: any, value: string) {
    let isClicked = false;
		const size = list.length
		for(let index=0;index<size;index++) {
			await list[index].getText().then((text: string) => {
				if(text === value) {
					list[index].click();
					isClicked = true;
          logger.info(`Clicked on ${value}`);
				}
			})
			if(isClicked) {
				break;
			}
		}	
  },

  /**
   * Waits for the Spinner to Disappear
   */
  async waitForSpinnerToDisappear() {
    let elements: TcElementImpl[];
    const loaderXpath = '//div[contains(@class, "Loader_loader")]';

    await BrowserHelper.sleep(1000);

    for(let cnt=0;cnt<config.Timeout.PageLoad;cnt++) {
      elements = await ElementHelper.getAllElementsByXPath(loaderXpath);
      const size =  elements.length;
      if(0 === size) {
        break;
      }
      for(let innerCnt=0;innerCnt<size;innerCnt++) {
        try {
          await BrowserHelper.waitUntilInVisibilityOf(elements[innerCnt]);
        } catch (error) {
          await BrowserHelper.sleep(500);
          break;
        }
      }
    }
    await BrowserHelper.sleep(1000);
  }
};
