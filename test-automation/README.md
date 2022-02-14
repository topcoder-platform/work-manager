# Work Manager App - E2E Tests

#### Software Required

* Nodejs v8.11.4+
* Chrome Browser

#### Installation

- Install Dependencies using command
  `npm install`

- To run tests

  `cd test-automation`

  `npm run test`

- To run Tests locally
  `npm run test:local`

- To run Tests agains production environment
  `npm run test:prod`

- To run Tests agains dev environment
  `npm run test:dev`

- Test results are generated in `test-results/` folder

```
HTML report - TestResult.html
Junit report - junitresults-WorkManagerCreateChallengeTests.xml and junitresults-WorkMangerDashboardPageTests.xml
```

- To view junit reports into html, install xunit-viewer
  `npm i -g xunit-viewer`

- HTML report from Junit reports can be generated using this command
  `xunit-viewer --results=test-results/ --output=./result.html`

As of now, the tests are running in headless mode. To view the actual chrome browser running the tests, you can remove `--headless` option from `chromeOptions.args` in `config.ts`

#### Test Data and Config

- All the test data which doesn't depend on the environment should be placed in `/test-data/test-data.json` file.
- All the test data which dose depend on the environment should be placed inside a `config/wm-automation-config-{ENV}.json` file:
  - ⚠️ Don't push production config `config/wm-automation-config-prod.json` to the repository for security reasons

##### Test Data and Config for CircleCI

When running test automation using CricleCI it would use config files which should be placed inside Topcoder S3:

- DEV `s3://tc-platform-dev/securitymanager/wm-automation-config-dev.json`
- PROD `s3://tc-platform-prod/securitymanager/wm-automation-config-prod.json`

Production config should be filled with production data like production user login/password, production project id with billing account as so on. For reference you may use file [wm-automation-config-dev.json](config/wm-automation-config-dev.json).

These configs should be updated by someone from Topcoder.
#### Configuration details:

- `config.json` holds the data level configuration, like user credentials etc
- `conf.ts` holds the application configuration, like jasmine reporters to be configured, specs to be run etc.