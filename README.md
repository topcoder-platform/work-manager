# Topcoder - Challenge Creation App UI

This is the frontend application for creating and managing challenges.

### Development deployment status
[![CircleCI](https://circleci.com/gh/topcoder-platform/challenge-engine-ui/tree/develop.svg?style=svg)](https://circleci.com/gh/topcoder-platform/challenge-engine-ui/tree/develop)

### Production deployment status
[![CircleCI](https://circleci.com/gh/topcoder-platform/challenge-engine-ui/tree/master.svg?style=svg)](https://circleci.com/gh/topcoder-platform/challenge-engine-ui/tree/master)

## Intended use

- UI for creating challenges

## Related repos
- [Challenge API](https://github.com/topcoder-platform/challenge-api) - The API endpoint for challenges
- [Resources API](https://github.com/topcoder-platform/resources-api) - The API endpoint for resources
- [Projects API](?)
- [Challenge ES Processor](https://github.com/topcoder-platform/challenge-processor-es) - Updates challenge data in ElasticSearch
- [Resource ES Processor](https://github.com/topcoder-platform/resource-processor-es) - Updates resource data in Elasticsearch

## Prerequisites
-  [NodeJS](https://nodejs.org/en/) (v10.15+)
-  [Docker](https://www.docker.com/)
-  [Docker Compose](https://docs.docker.com/compose/)

## Configuration

Production configuration is in `config/constants/production.js`
Development configuration is in `config/constants/development.js`

## Local Deployment Instructions

1. First install dependancies

```bash
npm install
```

2. copy the environment file in docs/dev.env to /.env

3. If you are using local instances of the API's, change the DEV_API_HOSTNAME in configs/constants/development.js to match your local api endpoint.
    - For example change it to 'http://localhost:3000/',

4. Run the app in development mode

```bash
npm run dev
```

You can access the app from [http://localhost:3000/](http://localhost:3000/)

The page will reload if you make edits.

You will also see any lint errors in the console.

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
