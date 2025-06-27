Read the information about this project in ABOUT/deck.md file

Source is located in `/src` folder. Read that folder as it contains a lot of comments which explain many concepts

Be sure to read package.json for all the packages/frameworks that we are using as it's very important to know what versions of React and Material UI we are using.

I will sometimes ask you to add some suggested content for GEMINI.md to improve your understand of this project in future runs (so you don't have to do as much research).

Be sure to make your own suggestions to update GEMINI.md as you learn of new concepts you might find useful on a restart. But these have to be new contexts, not your list of updates.

This project is a React-based web application for interacting with the Datamine Network. It uses Material-UI for components and styling and Web3.js for blockchain interactions. The project is configured to work with multiple blockchain
     ecosystems, as defined in the `src/configs/ecosystems` directory. The core logic is separated into three main directories: `react` for UI components, `utils` for utility functions, and `web3` for blockchain-related logic. The project uses
     Vite for building and development, with scripts defined in `package.json`.

# Gemini Project Context: Datamine Network Dashboard

## Project Overview
This project is a web-based dashboard for the Datamine Network, built with React and TypeScript. It provides users with tools to interact with Datamine smart contracts, view analytics, and manage their assets across different blockchain layers.

## Core Technologies
- **Framework:** React v19.0.0
- **UI Library:** Material-UI (MUI) v7.1.2
- **Blockchain Interaction:** Web3.js v4.16.0, @walletconnect/ethereum-provider
- **Language:** TypeScript v5.7.3
- **Build Tool:** Vite v7.0.0
- **Package Manager:** Yarn v4.9.2

## Key Architectural Patterns
The `src` directory is organized with a clear separation of concerns:

- **`src/core/`**: Contains the application's core logic.
  - **`src/core/react/`**: Houses all React components, pages, and UI-related elements.
  - **`src/core/web3/`**: Manages all blockchain interactions, including Web3 provider setup, contract bindings, and ABI definitions (located in `src/core/web3/abis/`).
  - **`src/core/utils/`**: A collection of helper functions for tasks like formatting, calculations, and clipboard interaction.
- **`src/configs/`**: Manages all environment and application configurations.
  - **`src/configs/ecosystems/`**: Defines specific configurations for different blockchain environments the dashboard can connect to, such as Ethereum Mainnet (L1) and Arbitrum (L2). This is a critical directory for understanding multi-chain functionality.

## Development Workflow
The following commands are used for development:

- `yarn start`: Runs the application in development mode using Vite.
- `yarn build`: Compiles and bundles the application for production.
- `yarn deploy`: Creates a production build with a specific base path for deployment.
- `yarn format`: Formats code using Prettier.

Extra information help you understand the Datamine ecosystem better:

#### 1. Styling Conventions & Theming

- For styling we're using `tss-react` and `useStyles` from `tss.create()`
- `src/core/styles.ts` contains our MUI themes

#### 2. State Management

- `src/core/web3/web3Reducer.ts` and `src/core/web3/web3Bindings.ts` work in tandem. We use `commonLanguage` (in `web3Reducer`) as "Commands & Queries" pattern.
- `sideEffectReducer.ts` contains the logic for handling queries
- `Web3Reducer` controls sate and updates `pendingQueries`. `pendingQueries` are converted into async calls to `Web3Bindings`. This is a creative way to manage state & seperate out async logic.
- The `Web3State` interface in `web3Reducer.ts` defines the complete application state.
- The reducer persists user settings (e.g., selected ecosystem, currency) in `localStorage`.

#### 3. Ecosystem Configuration Details

- There are 3 ecosystems in Datamine Network: DAM->FLUX(L1), FLUX(L2)->ArbiFLUX(L2), ArbiFLUX(L2)->LOCK(L2)
- You can toggle between any ecosystem in the decentralized dashboard.
- Settings for each of these ecosystems are located in `/src/configs/ecosystems`. Each file (e.g., `config.ecosystem.dam_flux_l1.ts`) contains all necessary parameters for a specific chain.
- L2 here means Arbitrum Layer 2.

#### 4. Build & Development (`vite.config.mts`)
- **Build Output:** The project builds to a `build` directory with hashed asset filenames.
- **Development Server:** Runs on port `3000` and opens the browser on start.
- **Optimizations:** Includes experimental optimizations for `@mui/material` and `@mui/icons-material`.

#### 5. Application Structure (`src/App.tsx`)
- **Root Component:** `App.tsx` is the main entry point.
- **Core Providers:** It sets up `ThemeProvider` (MUI), `ErrorBoundary`, and `Web3ContextProvider`.
- **Code Splitting:** Uses `React.lazy` and `Suspense` to lazy-load major components, improving initial load times.

#### 6. Key Smart Contracts and ABIs

- `src/core/web3/abis/dam.json`: ABI for the Datamine (DAM) token contract.
- `src/core/web3/abis/flux.json`: ABI for the Flux (FLUX) token contract.
- `src/core/web3/abis/market.json`: ABI for the core Datamine Network market contract (minting, burning, staking).
- `src/core/web3/abis/uniswapv2router.json`: ABI for the Uniswap V2 Router.
- `src/core/web3/abis/uniswapPair.json`: ABI for Uniswap V2 Pair contracts.
- `src/core/web3/abis/uniswapPairV3.json`: ABI for Uniswap V3 Pair contracts.
- `src/core/web3/abis/multicall.json`: ABI for the Multicall contract.

#### 7. Error Handling Strategy

- Global error handling for Web3 transactions is managed via `src/core/web3/helpers.ts` (`rethrowWeb3Error`) and then propagated to `web3Reducer.ts` to update the `error` state. User-facing error messages are typically displayed via Material-UI Snackbars or custom dialogs triggered by the `dialog` state in `web3Reducer`.

#### 8. Third-Party Integrations (Beyond Web3)

- Help article content is fetched from Markdown files in `public/helpArticles/` via standard `fetch` API calls.
- Search functionality for help articles uses `fuse.js`.

#### 9. Testing Strategy
- No tests are currently implemented.