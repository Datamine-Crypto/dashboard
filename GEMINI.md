Read the information about this project in ABOUT/deck.md file

Be sure to read package.json for all the packages/frameworks that we are using as it's very important to know what versions of React and Material UI we are using.

I will sometimes ask you to add some suggested content for GEMINI.md to improve your understand of this project in future runs (so you don't have to do as much research).

This project is a React-based web application for interacting with the Datamine Network. It uses Material-UI for components and styling and Web3.js for blockchain interactions. The project is configured to work with multiple blockchain
     ecosystems, as defined in the `src/configs/ecosystems` directory. The core logic is separated into three main directories: `react` for UI components, `utils` for utility functions, and `web3` for blockchain-related logic. The project uses
     Vite for building and development, with scripts defined in `package.json`.

# Gemini Project Context: Datamine Network Dashboard

## Project Overview
This project is a web-based dashboard for the Datamine Network, built with React and TypeScript. It provides users with tools to interact with Datamine smart contracts, view analytics, and manage their assets across different blockchain layers.

## Core Technologies
- **Framework:** React v19
- **UI Library:** Material-UI (MUI) v7
- **Blockchain Interaction:** Web3.js v4, @walletconnect/ethereum-provider
- **Language:** TypeScript
- **Build Tool:** Vite
- **Package Manager:** Yarn v4

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

Extra information help you understand the Datamine ecosystem better:

#### 1. Styling Conventions & Theming

- For styling we're using `tss-react` and `useStyles` from `tss.create()`

- `src/core/styles.ts` contains our MUI themes

#### 2. State Management

- `src/core/web3/web3Reducer.ts` and `src/core/web3/web3Bindings.ts` work in tandem. We use `commonLanguage` (in `web3Reducer`) as "Commands & Queries" pattern.

- `sideEffectReducer.ts` contains the logic for handling queries

- `Web3Reducer` controls sate and updates `pendingQueries`. `pendingQueries` are converted into async calls to `Web3Bindings`. This is a creative way to manage state & seperate out async logic.

#### 3. Ecosystem Configuration Details

- There are 3 ecosystems in Datamine Network: DAM->FLUX(L1), FLUX(L2)->ArbiFLUX(L2), ArbiFLUX(L2)->LOCK(L2)

- You can toggle between any ecosystem in the decentralized dashboard.

- Settings for each of these ecosystems are located in `/src/configs/ecosystems`

- L2 here means Arbitrum Layer 2. 

#### 4. Testing Strategy (Current & Future)

- Don't have any tests at the moment and not planning to due to time constraints.