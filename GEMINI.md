Read the information about this project in ABOUT/deck.md file

Source is located in `/src` folder. Read that folder as it contains a lot of comments which explain many concepts

Be sure to read package.json for all the packages/frameworks that we are using as it's very important to know what versions of React and Material UI we are using.

I will sometimes ask you to add some suggested content for GEMINI.md to improve your understand of this project in future runs (so you don't have to do as much research).

Be sure to make your own suggestions to update GEMINI.md as you learn of new concepts you might find useful on a restart. But these have to be new contexts, not your list of updates.

### Context Map Instructions

The "Context Map" has been added to `README.md` right after the "Quick Start Guide" section. The "Context Map" represents a nested navigation of all the paths and concepts within the Datamine Network.

This project is a React-based web application for interacting with the Datamine Network. It uses Material-UI for components and styling and Web3.js for blockchain interactions. The project is configured to work with multiple blockchain
     ecosystems, as defined in the `src/configs/ecosystems` directory. The core logic is separated into three main directories: `react` for UI components, `utils` for utility functions, and `web3` for blockchain-related logic. The project uses
     Vite for building and development, with scripts defined in `package.json`.


When making Material UI updates please use <Grid size={{}}> which is new in MUI v7.1 (Do not use <Grid item xs=...> style)

<Grid size={{ xs: 12, md:6 }}> is CORRECT. <Grid item xs={12} md={6}> is INCORRECT

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
- `yarn lint`: Lints the project using ESLint.

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
- **Development Server:** Runs on port `3000` and opens the browser on start. HTTPS is enabled via `vite-plugin-mkcert` for secure local development.
- **Optimizations:** Includes experimental optimizations for `@mui/material` and `@mui/icons-material`.

#### 5. Linting (`.eslintrc.json`)
- The `.eslintrc.json` file has been configured to exclude the `build` directory from linting and to recognize `BigInt` and `globalThis` by setting the `browser`, `es2021`, and `node` environments.

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

#### 10. GitHub Pages Deployment
- The `homepage` field in `package.json` is set to `.`, which is crucial for GitHub Pages deployments when the site is hosted in a subfolder (e.g., `your-username.github.io/your-repo-name/`). This ensures that relative paths for assets are correctly resolved.
- The GitHub Actions workflow (`.github/workflows/deploy.yml`) now explicitly sets `yarn-version: 4.9.2` in the `setup-node` step, ensuring the correct Yarn version is used during the build process.

#### 11. Additional Development Setup & Tools
- **HTTPS for Localhost**: Implemented using `vite-plugin-mkcert` in `vite.config.mts` for secure local development.
- **ESLint Configuration**: The `.eslintrc.json` file has been updated to exclude the `build` directory from linting and to correctly recognize `BigInt` and `globalThis` by setting the `browser`, `es2021`, and `node` environments.
- **Pre-commit Hooks**: `husky` and `lint-staged` are configured to automatically run ESLint and Prettier on staged files before committing, ensuring code quality and consistency.
- **VS Code Workspace Hiding**: The `.vscode/settings.json` file is configured to hide various development-related files and folders (e.g., `.husky`, `.yarn`, `.vscode`, `.github`, `.env`, `.eslintrc.json`, `.gitignore`, `.pnp.cjs`, `.pnp.loader.mjs`, `.prettierrc.json`, `index.html`, `LICENSE`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.mts`, `yarn.lock`, `build`, `node_modules`, `src/react-app-env.d.ts`, `src/service-worker.ts`, `src/serviceWorkerRegistration.ts`, `src/vite-env.d.ts`) from the VS Code explorer to reduce clutter.
- **`yarn lint` script**: A new `lint` script has been added to `package.json` to easily run ESLint across the project.

#### 12. New Features & GameFi (from 2025-05-27 onwards)

- **Datamine Market (Decentralized "Time-in-market" solution):** A revolutionary way to decentralize "Time-in-market" and create true decentralized demand. Validators can offer a percentage reward for others to burn LOCK to their account, effectively decentralizing demand and increasing market efficiency. This happens seamlessly in a single Ethereum transaction.
- **Datamine Gems #GameFi:** A real-time game where users collect "gems" (public market addresses with unminted balances) by burning tokens. It features a new V2 Public Market smart contract for even greater throughput, atomic batch burning from multiple addresses, and optimized reward distribution. A "Collect all gems" button allows for single-transaction collection from multiple addresses. This aims to increase monetary velocity and transactional throughput.

#### 13. Lockquidity (LOCK) Token

- **Purpose:** Enhances stability by contributing to a permanent liquidity pool.
- **Minting:** Minted by locking ArbiFLUX.
- **Burning Mechanism:** Burning LOCK redirects value to the liquidity pool instead of reducing supply, ensuring long-term stability.
- **Market Efficiency:** A new metric defined as 100% - percentage of LOCK inside the market. Higher market efficiency indicates more trading volatility and benefits validators.

#### 14. Core Values & Ecosystem Principles

- **Transaction-incentivized Liquidity Pools:** DAM and FLUX offer unique incentives for providing liquidity on Uniswap & Balancer pools, ensuring constant token movement.
- **On-Chain Linear Deflation:** FLUX supply is non-fixed and features predictable deflation through a burning mechanism, with its generation tied to DAM staking.
- **Realtime Multi-Smart Contract Analytics:** The dashboard provides real-time on-chain market sentiment, balances in USD, and analytics through deep Uniswap integration.
- **Secure By Design & Professionally Audited:** All business logic is executed via audited smart contracts, ensuring fund safety and security without third-party involvement.
- **Built For The Community:** Utilizes serverless, web3, and mobile technologies for a seamless and secure user experience.
- **Global Problem Solved:** The Datamine Ecosystem aims to solve inflation through its deflationary tokenomics and on-chain demand generation.

#### 15. Token Specifications & Mechanics

- **DAM (Datamine Token):** Fixed supply (16,876,778 tokens), ERC-777 standard, primarily used for staking to power validators.
- **FLUX (Flux Token):** Non-fixed supply, base currency of the ecosystem, features linear and predictable deflation through burning.
- **Validator (Mint Start/Stop):** Process of locking DAM tokens to generate FLUX.
- **Delegated Minting:** Allows a different Ethereum address to mint FLUX tokens on behalf of a validator.
- **Remote Minting/Burning:** Features for minting FLUX from a phone to any Ethereum address, and burning FLUX to any address with an active mint.
- **Partial Minting:** Ability to specify a percentage of minting (0-100%) and mint smaller amounts to other addresses.
- **Mint Age Multiplier:** Increases over time (up to 3x after 28 days) for continuous validator operation.
- **Burn Multiplier:** Variable multiplier (up to 10x) based on FLUX burned relative to global averages.

#### 16. Uniswap Integration

- **Adding Liquidity:** Guides on how to add liquidity to Uniswap pools, specifically the ETH-DAM pair, to earn fees from trading activity.
- **Buying Datamine Tokens:** Instructions on how to purchase DAM tokens on Uniswap by swapping with ETH or other ERC-20 tokens.

#### 17. Smart Contracts - In-Depth Breakdown

- **Technology Stack:** Smart contracts are written in Solidity (v0.6.9) and are ERC-777 compatible, built upon OpenZeppelin secure libraries.
- **Security Features:**
    - **SafeMath:** Used for all arithmetic operations to prevent integer overflow and underflow.
    - **Mutex & Checks-Effects-Interactions Pattern:** Over-used for re-entrancy attack protection and ensuring state changes occur after checks and before external interactions.
    - **Modifiers:** Custom modifiers like `preventSameBlock()` and `requireLocked()` enhance security and prevent user errors.
    - **Immutable State Variables:** Key variables are set at contract creation and cannot be changed, improving security.
    - **ERC-1820 ERC777TokensRecipient Implementation:** Unique implementation to control which tokens can be sent to the FLUX smart contract.
- **Core Functions:** Detailed explanation of `lock()`, `unlock()`, `burnToAddress()`, and `mintToAddress()` functions, including their security considerations and how they modify the contract's state.
- **View-Only Functions:** Explanation of `getMintAmount()`, `getAddressTimeMultiplier()`, `getAddressBurnMultiplier()`, `getAddressRatio()`, and `getGlobalRatio()` functions, which provide real-time analytics without modifying state.
- **Data Aggregation:** Helper functions like `getAddressDetails()` and `getAddressTokenDetails()` are provided to reduce network calls for dashboard data.
- **Additional Security Considerations (ConsenSys):** Adherence to best practices like preparing for failure, careful rollout, keeping contracts simple, staying up to date, awareness of blockchain properties, and secure development recommendations (external calls, public data, integer handling, assert/require/revert usage, modifiers, rounding, fallback functions, visibility, pragma locking, events, `tx.origin`, timestamp dependence, EIP20 approve/transferFrom attack).

#### 18. Help Article Conventions

- **Location:** Help articles are Markdown files located in `public/helpArticles/`.
- **Rendering:** These Markdown files are rendered by the `HelpDialog` component (`src/core/react/elements/Dialogs/HelpDialog.tsx`) and displayed on the `HelpPage` (`src/core/react/pages/help/HelpPage.tsx`).
- **Styling:**
    - Code blocks (`<code>`, `<pre>`) within help articles are styled in `src/core/react/elements/Dialogs/HelpDialog.tsx` to use `theme.palette.primary.main` (white) for background and `theme.palette.secondary.main` (teal) for text, improving readability.
    - Help article category tags (Material-UI `Chip` components) on the `HelpPage` are styled in `src/core/styles.ts`.
        - `primary` colored chips (selected) use a teal background (`#00FFFF`) with white text (`#fff`).
        - `default` colored chips (unselected) use the `classes.palette.background` (dark) with white text (`#fff`).
- **Titles:** All help article titles should include a unique emoji for better visual organization and engagement.

# 🤝 Vibe Code Contribute

We welcome contributions from the community, and we're excited to introduce a new way to contribute that aligns with the "vibe coding" philosophy, powered by the Gemini CLI. This approach aims to streamline the development process, reduce friction, and allow you to focus on the creative aspects of building.

### What is "Vibe Coding"?

"Vibe coding" is about staying in a creative flow state, where the technical details and tedious tasks are handled by intelligent tools, allowing you to concentrate on the core problem-solving and innovation. With the Gemini CLI, you can interact with the codebase in a more intuitive and efficient manner.

### How to Contribute with Gemini CLI

1.  **Install Gemini CLI:** If you haven't already, install the Gemini CLI on your system. (Instructions for installation can be found in the Gemini CLI documentation).
2.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Datamine-Crypto/dashboard.git
    cd dashboard
    ```
3.  **Start Vibe Coding:** Launch the Gemini CLI within your cloned repository. The CLI will act as your intelligent co-pilot, understanding your intent and executing complex tasks with simple commands.
    *   **Intent-Driven Development:** Instead of manually navigating files and performing repetitive tasks, you can express your intentions directly to the CLI. For example:
        *   "Add a new feature to the dashboard."
        *   "Refactor this component for better performance."
        *   "Fix this bug in the smart contract interaction."
        *   "Update all help articles to include information about the LOCK token."
    *   **Automated Code Generation & Modification:** The Gemini CLI can read, search, and modify code across the entire project. It can help you:
        *   Generate new components or modules based on existing patterns.
        *   Apply consistent styling changes across multiple files.
        *   Perform complex refactoring operations with precision.
        *   Ensure adherence to project conventions and best practices.
    *   **Contextual Awareness:** The CLI maintains a deep understanding of the project's structure, dependencies, and coding style, ensuring that your contributions seamlessly integrate with the existing codebase.
4.  **Create a Pull Request:** Once you've completed your changes with the help of the Gemini CLI:
    *   **Review Changes:** The CLI can help you review your changes and ensure everything is as expected.
    *   **Commit with Clarity:** The CLI can assist in crafting clear and concise commit messages.
    *   **Open a Pull Request:** Push your changes to your forked repository and open a pull request to the `main` branch.

### Why Vibe Code?

By leveraging the Gemini CLI, we aim to:

*   **Reduce Friction:** Minimize the time spent on mundane tasks, allowing you to focus on innovation.
*   **Accelerate Development:** Speed up the development cycle, bringing new features and improvements to the Datamine Network faster.
*   **Improve Code Quality:** Ensure consistency and adherence to coding standards with automated assistance.
*   **Foster Creativity:** Empower developers to stay in their creative flow, making contributions more enjoyable and impactful.

## src Folder Structure

The `src` directory is organized into the following main subdirectories:

- **`src/configs/`**: Contains application configuration files.
  - `config.base.ts`, `config.common.ts`, `config.network.ts`, `config.overrides.ts`, `config.ts`: Various configuration files.
  - **`src/configs/ecosystems/`**: Holds configurations for different blockchain ecosystems.
    - `config.ecosystem.arbiflux_lockquidity_l2.ts`
    - `config.ecosystem.dam_flux_l1.ts`
    - `config.ecosystem.flux_arbiflux_l2.ts`

- **`src/core/`**: Contains the core application logic.
  - `helpArticles.ts`, `interfaces.ts`, `sideEffectReducer.ts`, `styles.ts`: Core utility and type definition files.
  - **`src/core/react/`**: Houses all React components, pages, and UI-related elements.
    - `ErrorBoundary.tsx`: Error boundary component.
    - **`src/core/react/elements/`**: Reusable UI components.
      - `LightTooltip.tsx`, `Web3Account.tsx`
      - **`src/core/react/elements/Cards/`**: Card components for displaying data.
      - **`src/core/react/elements/Dialogs/`**: Dialog components.
      - **`src/core/react/elements/Fragments/`**: Smaller, reusable UI fragments.
      - **`src/core/react/elements/Onboarding/`**: Components related to the onboarding process.
    - **`src/core/react/pages/`**: Top-level page components.
      - `CommunityPage.tsx`, `DashboardPage.tsx`, `HelpPage.tsx`, `OnboardingPage.tsx`, `PageFragment.tsx`, `RealtimeRewardsGameFiPage.tsx`, `Terms.tsx`, `TokenPage.tsx`
  - **`src/core/utils/`**: Collection of helper functions.
    - `copyToClipboard.ts`, `devLog.ts`, `formatMoney.ts`, `getApy.ts`, `web3multicall.ts`
    - **`src/core/utils/swap/`**: Functions related to token swapping.
      - `performSwap.ts`, `performSwapUniswapV2.ts`, `sampleQuoteSingleSwap.ts`, `swapOptions.ts`
  - **`src/core/web3/`**: Manages all blockchain interactions.
    - `helperElements.tsx`, `helpers.ts`, `Web3Bindings.ts`, `Web3Context.tsx`, `web3Reducer.ts`
    - **`src/core/web3/abis/`**: ABI (Application Binary Interface) JSON files for smart contracts.
      - `dam.json`, `flux.json`, `market.json`, `multicall.json`, `uniswapPair.json`, `uniswapPairV3.json`, `uniswapv2router.json`

- **`src/svgs/`**: Contains SVG assets.

- **Root `src` files**:
  - `App.tsx`: Main application component.
  - `index.tsx`: Entry point for React application.
  - `react-app-env.d.ts`, `service-worker.ts`, `serviceWorkerRegistration.ts`, `vite-env.d.ts`: Environment and service worker related files.

# 🗺️ Context Map: Datamine Network Knowledge Base

This map outlines the key concepts, components, and principles of the Datamine Network, serving as a shared knowledge base.

- **🌐 Datamine Network Overview**
  - **🎯 Purpose:** Web-based dashboard for interacting with Datamine smart contracts, viewing analytics, and managing assets across different blockchain layers.
  - **✨ Core Values & Principles:**
    - 💧 Transaction-incentivized Liquidity Pools
    - 🔥 On-Chain Linear Deflation (FLUX)
    - 📊 Realtime Multi-Smart Contract Analytics
    - 🔒 Secure By Design & Professionally Audited
    - 🤝 Built For The Community
    - 🌍 Global Problem Solved (Inflation)

- **🪙 Tokens**
  - **💰 DAM (Datamine Token)**
    - 🔢 Fixed Supply: 16,876,778 tokens
    - 📜 Standard: ERC-777
    - 💡 Primary Use: Staking to power validators
  - **⚡ FLUX (Flux Token)**
    - 📈 Supply: Non-fixed, linear and predictable deflation through burning
    - 💡 Primary Use: Base currency of the ecosystem, earned through minting
  - **🔵 ArbiFLUX**
    - 🔗 Layer: L2 (Arbitrum)
    - 💡 Primary Use: Combats gas costs of minting FLUX on L1
  - **🔐 LOCK (Lockquidity Token)**
    - 🎯 Purpose: Enhances stability, contributes to permanent liquidity pool
    - ⛏️ Minting: Minted by locking ArbiFLUX
    - 🔥 Burning Mechanism: Redirects value to liquidity pool (not supply reduction)
    - 📊 Market Efficiency: 100% - percentage of LOCK inside the market

- **⚙️ Core Mechanisms & Features**
  - **✅ Validator (Mint Start/Stop)**
    - 🔄 Process: Locking DAM tokens to generate FLUX
  - **🤝 Delegated Minting:** Allows another address to mint FLUX on behalf of a validator
  - **📱 Remote Minting/Burning:** Mint/burn FLUX from phone to any Ethereum address
  - **✂️ Partial Minting:** Specify percentage (0-100%) to mint smaller amounts
  - **⏳ Mint Age Multiplier:** Increases over time (up to 3x after 28 days) for continuous validator operation
  - **🔥 Burn Multiplier:** Variable (up to 10x) based on FLUX burned relative to global averages
  - **🛒 Datamine Market (Decentralized "Time-in-market" solution)**
    - 💡 Concept: Decentralizes "Time-in-market", creates decentralized demand
    - 🔄 Mechanism: Validators offer rewards for burning LOCK to their account (single ETH transaction)
  - **💎 Datamine Gems #GameFi**
    - 🎮 Concept: Real-time game to collect "gems" (public market addresses with unminted balances)
    - 🔄 Mechanism: Burning tokens, V2 Public Market smart contract, atomic batch burning, optimized reward distribution, "Collect all gems" button
    - 🎯 Goal: Increase monetary velocity and transactional throughput

- **🔗 Ecosystems & Layers**
  - **⛓️ Multi-chain Support:** Ethereum Mainnet (L1), Arbitrum (L2)
  - **🌳 Ecosystems Defined:**
    - DAM->FLUX (L1)
    - FLUX (L2)->ArbiFLUX (L2)
    - ArbiFLUX (L2)->LOCK (L2)
  - **⚙️ Configuration:** Managed in `src/configs/ecosystems/`

- **📜 Smart Contracts & ABIs**
  - **📍 Location:** `src/core/web3/abis/`
  - **🔑 Key Contracts:**
    - DAM Token (`dam.json`)
    - FLUX Token (`flux.json`)
    - Market Contract (`market.json`)
    - Uniswap V2 Router (`uniswapv2router.json`)
    - Uniswap Pair (`uniswapPair.json`)
    - Uniswap Pair V3 (`uniswapPairV3.json`)
    - Multicall (`multicall.json`)
  - **🛡️ Security Features:** SafeMath, Mutex, Checks-Effects-Interactions, Modifiers (`preventSameBlock()`, `requireLocked()`), Immutable State Variables, ERC-1820 ERC777TokensRecipient
  - **🛠️ Core Functions:** `lock()`, `unlock()`, `burnToAddress()`, `mintToAddress()`
  - **🔍 View-Only Functions (Analytics):** `getMintAmount()`, `getAddressTimeMultiplier()`, `getAddressBurnMultiplier()`, `getAddressRatio()`, `getGlobalRatio()`
  - **📦 Data Aggregation:** `getAddressDetails()`, `getAddressTokenDetails()`

- **🏗️ Application Architecture (High-Level)**
  - **🖥️ UI:** React components (`src/core/react/`)
  - **🔗 Blockchain Interaction:** Web3.js, Web3Bindings, Web3Context, web3Reducer (`src/core/web3/`)
  - **🧠 State Management:** `web3Reducer.ts` and `Web3Bindings.ts` (Commands & Queries pattern), `sideEffectReducer.ts`
  - **🔧 Utilities:** Helper functions (`src/core/utils/`)
  - **⚙️ Configuration:** `src/configs/`
  - **🎨 Styling:** `tss-react`, `useStyles`, Material-UI themes (`src/core/styles.ts`)
  - **🚨 Error Handling:** `src/core/web3/helpers.ts` (`rethrowWeb3Error`), `web3Reducer.ts` (error state), Material-UI Snackbars/Dialogs

- **🔌 Third-Party Integrations**
  - **📚 Help Articles:** Markdown files in `public/helpArticles/`, fetched via `fetch` API
  - **🔍 Search:** `fuse.js` for help articles

- **🛠️ Development & Deployment**
  - **🏗️ Build Tool:** Vite (`vite.config.mts`)
  - **📦 Package Manager:** Yarn
  - **📜 Scripts:** `yarn start`, `yarn build`, `yarn deploy`, `yarn format`, `yarn lint`
  - **💻 Local Development:** HTTPS via `vite-plugin-mkcert`
  - **🧹 Code Quality:** ESLint, Prettier, Husky, Lint-staged
  - **🚀 Deployment:** GitHub Pages (`.github/workflows/deploy.yml`, `package.json` homepage field)
