# Topcoder - Challenge Creation App UI

### Requirements

Node.js 10.15+

### Dependencies

To install dependencies run
```bash
npm install
```

### Configuration
You can see the configuration paramaters below.
Production configuration is in `config/constants/production.js`
Development configuration is in `config/constants/development.js`

- `ACCOUNTS_APP_CONNECTOR_URL`: The url of Accounts app connector
- `ACCOUNTS_APP_LOGIN_URL`: The url of Accounts app login page
- `COMMUNITY_APP_URL`: The base url of community app
- `MEMBER_API_URL`: The members api endpoint
- `MEMBER_API_V3_URL`: v3 members api endpoint
- `DEV_APP_URL`: (Development) The URL to start the app from (eg http://local.topcoder-dev.com)
- `CHALLENGE_API_URL`: The challenge API URL
- `PROJECT_API_URL`: The project API URL
- `API_V3_URL`: The API v3 URL

### Development

To run the app in development mode run
```bash
npm run dev
```
You can access the app from [http://localhost:3000](http://localhost:3000)

The page will reload if you make edits.

You will also see any lint errors in the console.

`NOTE`: Redirection from login page doesn't work with localhost urls because account app doesn't allow it,
in order to test it you can add `127.0.0.1 	local.topcoder-dev.com` to your /etc/hosts file and access the app from
[http://local.topcoder-dev.com:3000](http://local.topcoder-dev.com:3000) address

### Lint check

To test the app for lint errors

```bash
npm run lint
```

*Use the `--fix` flag to automatically fix errors.*

### Production

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
