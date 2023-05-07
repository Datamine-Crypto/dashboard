*Preface: For true decentralization and openness we've decided to open source 3 years of work for Datamine Network dApp. We believe this will close another gap of centralization and bring us closer to true vision of DeFi.*

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

## Getting Started

In the project directory, you can run:

### `npm start` or `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

# Configuration

- check out [src/config.ts](src/config.ts) for customization
- You can add in `?devLog=1` to url to get a console output for debugging 3rd party wallet connection. See `vconsole` npm package in [package.json](package.json) for more info.
- [src/core/helpArticles.ts](src/core/helpArticles.ts) contains our unique "instant help desk" solution. You can modify help articles here and they'll be added to "Help" tab
- [src/core/web3/web3Reducer.ts](src/core/web3/web3Reducer.ts) contains the main state & reducer of the project and contains all the actions user can perform
- [src/core/web3/Web3Bindings.ts](src/core/web3/Web3Bindings.ts) contains all the handling of recuder queries (async logic)

This project does not contain any unit tests but this can be improved in the future.

## To Deploy

### `npm run build` or `yarn run build`

This will create a new build in build/ folder that you can host. We currently host this on github(https://datamine-crypto.github.io/realtime-decentralized-dashboard/) for decentralization reasons & proof of builds.

The builds can be hosted in subfolders and do not perform external http calls for security & decentralization.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Be sure `GENERATE_SOURCEMAP=false` is in .env file

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
