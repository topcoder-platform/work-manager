# Topcoder - Challenge Creation App UI

It contains UI of the app for creating challenges.

### Development deployment status
[![CircleCI](https://circleci.com/gh/topcoder-platform/challenge-engine-ui/tree/develop.svg?style=svg)](https://circleci.com/gh/topcoder-platform/challenge-engine-ui/tree/develop)

### Production deployment status
[![CircleCI](https://circleci.com/gh/topcoder-platform/challenge-engine-ui/tree/master.svg?style=svg)](https://circleci.com/gh/topcoder-platform/challenge-engine-ui/tree/master)

## Intended use

- UI for creating challenges

## Related repos
-  [Challenge API](https://github.com/topcoder-platform/challenge-api)
-  [ES Processor](https://github.com/topcoder-platform/challenge-processor-es) - Updates data in ElasticSearch
-  [Legacy Processor](https://github.com/topcoder-platform/legacy-challenge-processor) - Moves data from DynamoDB back to Informix
-  [Legacy Migration Script](https://github.com/topcoder-platform/legacy-challenge-migration-script) - Moves data from Informix to DynamoDB
-  [Accounts App](https://github.com/appirio-tech/accounts-app)

## Prerequisites
-  [NodeJS](https://nodejs.org/en/) (v10.15+)
-  [Docker](https://www.docker.com/)
-  [Docker Compose](https://docs.docker.com/compose/)

## Configuration

You can see the configuration paramaters below.
Production configuration is in `config/constants/production.js`
Development configuration is in `config/constants/development.js`

-  `ACCOUNTS_APP_CONNECTOR_URL`: The url of Accounts app connector
-  `ACCOUNTS_APP_LOGIN_URL`: The url of Accounts app login page
-  `COMMUNITY_APP_URL`: The base url of community app
-  `MEMBER_API_URL`: The members api endpoint
-  `MEMBER_API_V3_URL`: v3 members api endpoint
-  `DEV_APP_URL`: (Development) The URL to start the app from (eg http://local.topcoder-dev.com)
-  `CHALLENGE_API_URL`: The challenge API URL
-  `PROJECT_API_URL`: The project API URL
-  `API_V3_URL`: The API v3 URL

## Local Deployment

### Foreman Setup

To install foreman follow this [link](https://theforeman.org/manuals/1.24/#3.InstallingForeman)

To know how to use foreman follow this [link](https://theforeman.org/manuals/1.24/#2.Quickstart)

### Development

To run the app in development mode run

```bash
npm run dev
```

You can access the app from [http://localhost:3000](http://localhost:3000)

The page will reload if you make edits.

You will also see any lint errors in the console.

`NOTE`: Redirection from login page doesn't work with localhost urls because account app doesn't allow it, in order to test it you can add `127.0.0.1 local.topcoder-dev.com` to your /etc/hosts file and access the app from

[http://local.topcoder-dev.com:3000](http://local.topcoder-dev.com:3000) address

### Lint check

To test the app for lint errors

```bash
npm run lint
```

*Use the `--fix` flag to automatically fix errors.*

## Production deployment

To build the app for production

```bash
npm run build
```

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

If you want to test to production build locally you can run

```bash
npm install -g serve
serve -s build
```

It serves the build folder locally.

### Heroku Deployment

To deploy the app on heroku run

```bash
git init
heroku create tc-challenge-creation-app --buildpack mars/create-react-app
git add .
git commit -m "Heroku commit"
git push heroku master
```

You can access the app by running

```bash
heroku open
```

## Running tests

### Configuration

Test configuration is at `config/env.js`. You don't need to change them.
for testing run below command

```bash
npm run test
```

## Running tests in CI
- TBD

## Verification
- TBD