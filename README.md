You can access the latest version of Datamine Realtime Decentralized Dashboard by clicking the following link:

https://datamine-crypto.github.io/realtime-decentralized-dashboard/

# Realtime Decentralized Dashboard

Instant access to Datamine (DAM), FLUX and on-chain Uniswap USD pricing. 

This realtime analytics dashboard builds feature:

- FULL PRIVACY MODE: For privacy and decentralization reasons everything is self-contained in this repository, **NO ANALYTICS, TRACKING, COOKIES, EXTERNAL RESOURCES or 3rd parties** are utilized in our Ethereum multi-smart contract decentralized dApp. 
- No Installation Required: Just drag & drop this onto any local or remote web server.
- Full Version History: Pick and download any previous build of the dashboard.
- Minified: Our single-page application (SPA) app will take up less than 3 MB in uncompressed form.
- Works in any folder structure. Drop this into a subfolder or a subdomain, all paths are relative.
- IPFS, SWARM & TOR compatible. Move one step closer to true decentralization by hosting our dashboard on Distributed Web.

# Configuration

- check out [src/config.ts](src/config.ts) for customization
- You can add in `?devLog=1` to url to get a console output for debugging 3rd party wallet connection. See `vconsole` npm package in [package.json](package.json) for more info.
- [src\core\helpArticles.ts](src\core\helpArticles.ts) contains our unique "instant help desk" solution. You can modify help articles here and they'll be added to "Help" tab
- [src\core\web3\web3Reducer.ts](src\core\web3\web3Reducer.ts) contains the main state & reducer of the project and contains all the actions user can perform
- [src\core\web3\Web3Bindings.ts](src\core\web3\Web3Bindings.ts) contains all the handling of recuder queries (async logic)

## To Deploy

Be sure `GENERATE_SOURCEMAP=false` is in .env file

`npm run deploy`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
