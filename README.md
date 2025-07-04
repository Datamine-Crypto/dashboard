*Preface: For true decentralization and openness we've decided to open source 6 years of work for Datamine Network dApp. We believe this will close another gap of centralization and bring us closer to true vision of DeFi.* 🔮

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Material-UI](https://img.shields.io/badge/Material--UI-v7-0081CB?logo=mui&logoColor=white)](https://mui.com/)
[![Web3.js](https://img.shields.io/badge/Web3.js-v4-F16822?logo=web3.js&logoColor=white)](https://web3js.org/)
[![Yarn](https://img.shields.io/badge/Yarn-v4-2C8EBB?logo=yarn&logoColor=white)](https://yarnpkg.com/)
[![Status](https://img.shields.io/badge/Status-Under%20Active%20Development-blue)](https://github.com/Datamine-Crypto/dashboard)
[![Deploy to GitHub Pages](https://github.com/Datamine-Crypto/dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/Datamine-Crypto/dashboard/actions/workflows/deploy.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord](https://img.shields.io/badge/Discord-Join%20our%20Community-5865F2?logo=discord&logoColor=white)](https://discord.gg/2dQ7XAB22u)

You can access the latest version of Datamine Realtime Decentralized Dashboard by clicking the following link:

<https://datamine-crypto.github.io/dashboard/>

# 🚀 Datamine Realtime Decentralized Dashboard

## Table of Contents

- 🚀 [Quick Start Guide](#-quick-start-guide)
- ✨ [Core Technologies](#-core-technologies)
- 🏛️ [Key Architectural Patterns](#️-key-architectural-patterns)
- 💡 [Core Datamine Concepts](#-core-datamine-concepts)
- 📜 [Key Smart Contracts and ABIs](#-key-smart-contracts-and-abis)
- 🚨 [Error Handling Strategy](#-error-handling-strategy)
- 🔌 [Third-Party Integrations](#-third-party-integrations)
- ⚙️ [Configuration](#%EF%B8%8F-configuration)
- ✨ [Features](#-features)
- 📸 [Screenshots](#-screenshots)
- 🤝 [Contributing](#-contributing)
- 🛠️ [Development Workflow](#️-development-workflow)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running dApp Locally](#running-dapp-locally)
  - [To Deploy](#to-deploy)
- 📚 [Learn More](#-learn-more)
- ❓ [Support](#-support)
- 📄 [License](#-license)

## 🚀 Quick Start Guide

This guide will help you get the Datamine Realtime Decentralized Dashboard up and running on your local machine.

### Prerequisites

To run this project locally, you will need to have Node.js and Yarn installed.

*   **Node.js**: We recommend using Node.js v18 or higher. You can download it from [nodejs.org](https://nodejs.org/en/).
*   **Yarn**: This project uses Yarn v4. You can install it globally via npm: `npm install -g yarn@^4.0.0`

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Datamine-Crypto/dashboard.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd dashboard
    ```
3.  **Install dependencies:**
    ```bash
    yarn install
    ```

### Running the Application

Once the dependencies are installed, you can start the development server:

```bash
yarn start
```

This will open the application in your browser at `https://localhost:3000`. The page will automatically reload if you make any code changes.

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

## Available Scripts

In the project directory, you can run the following scripts:

*   `yarn start`: Runs the app in development mode.
*   `yarn build`: Builds the app for production to the `build` folder.
*   `yarn deploy`: Creates a production build with a specific base path for deployment.
*   `yarn format`: Formats code using Prettier.
*   `yarn lint`: Lints the project using ESLint.

Welcome to the Datamine Network Dashboard! This project is a web-based dashboard for the Datamine Network, built with React and TypeScript. It provides users with tools to interact with Datamine smart contracts, view analytics, and manage their assets across different blockchain layers.

## ✨ Core Technologies

- **Framework:** React v19 ⚛️
- **UI Library:** Material-UI (MUI) v7 🎨
- **Blockchain Interaction:** Web3.js v4, @walletconnect/ethereum-provider 🔗
- **Language:** TypeScript 💻
- **Build Tool:** Vite ⚡
- **Package Manager:** Yarn v4 🧶

## 🏛️ Key Architectural Patterns

The [`src`](src) directory is meticulously organized to ensure a clear separation of concerns and maintainability. Here's a breakdown of its core structure:

-   [`src/core/`](src/core): This directory serves as the heart of the application, encapsulating its fundamental logic and shared functionalities.
    -   [`src/core/react/`](src/core/react): Dedicated to the user interface, this sub-directory houses all React components, pages, and UI-related elements. Styling is primarily handled using `tss-react` and `useStyles` from `tss.create()`, with Material-UI themes defined in [`src/core/styles.ts`](src/core/styles.ts). Think of it as where the visual magic happens! ✨
    -   [`src/core/web3/`](src/core/web3): This is where all blockchain interactions are managed. It includes Web3 provider setup, smart contract bindings, and ABI definitions (found in [`src/core/web3/abis/`](src/core/web3/abis)). State management for Web3 interactions is handled by [`src/core/web3/web3Reducer.ts`](src/core/web3/web3Reducer.ts) and [`src/core/web3/web3Bindings.ts`](src/core/web3/web3Bindings.ts) in tandem, utilizing a "Commands & Queries" pattern. `Web3Reducer` controls state and updates `pendingQueries`, which are then converted into asynchronous calls to `Web3Bindings`. It's the bridge to the decentralized world. 🌉
    -   [`src/core/utils/`](src/core/utils): A versatile collection of helper functions for common tasks such as data formatting, complex calculations, and clipboard interaction. These are the handy tools that keep the application running smoothly. 🔧
-   [`src/configs/`](src/configs): This directory is responsible for managing all environment-specific and application-wide configurations.
    -   [`src/configs/ecosystems/`](src/configs/ecosystems): A crucial part of the multi-chain functionality, this sub-directory defines specific configurations for each blockchain environment the dashboard can connect to (e.g., Ethereum Mainnet L1 and Arbitrum L2). This enables seamless operation across different networks. 🔗

This structured approach ensures that the codebase remains modular, scalable, and easy to navigate for developers.

## ⚙️ Configuration

The Datamine Network Dashboard is highly configurable to adapt to different blockchain environments and user preferences. Key configuration files are located in the [`src/configs/`](src/configs) directory:

-   [`src/configs/config.ts`](src/configs/config.ts): The main configuration file, where you can adjust general application settings.
-   [`src/configs/ecosystems/`](src/configs/ecosystems): This directory contains specific configurations for each supported blockchain ecosystem (e.g., [`config.ecosystem.dam_flux_l1.ts`](src/configs/ecosystems/config.ecosystem.dam_flux_l1.ts) for Ethereum Mainnet, [`config.ecosystem.arbiflux_lockquidity_l2.ts`](src/configs/ecosystems/config.ecosystem.arbiflux_lockquidity_l2.ts) for Arbitrum L2). These files define network details, contract addresses, and other ecosystem-specific parameters.

To switch between ecosystems or customize settings, you can modify these files directly. For development, you might also leverage environment variables if your setup supports them.

## 💡 Core Datamine Concepts

The Datamine Network operates on several key principles and components, with their core logic implemented across various parts of the codebase:

- **DAM (Datamine Token)**: The primary token of the Datamine Network, often used for staking and participating in the network's economic activities. 💰
- **FLUX (Flux Token)**: A secondary token, often earned through mining or other network activities, representing a form of reward or utility within the ecosystem. ⚡
- **Liquidity Pools**: Decentralized exchanges (DEXs) like Uniswap are crucial for providing liquidity for DAM and FLUX tokens, enabling seamless trading. 💧
- **Multi-chain Ecosystem**: The dashboard supports interactions across different blockchain layers (e.g., Ethereum Mainnet L1 and Arbitrum L2), allowing users to manage assets and participate in activities on their preferred chain. ⛓️
- **Decentralized Minting**: A core mechanism where new tokens are generated through a decentralized process, often involving staking or mining. The logic for initiating, tracking, or claiming decentralized minting rewards is primarily found in [`src/core/web3/Web3Bindings.ts`](https://github.com/Datamine-Crypto/dashboard/blob/main/src/core/web3/Web3Bindings.ts) (e.g., `GetMintFluxResponse`) and its UI interaction in [`src/core/react/pages/DashboardPage.tsx`](https://github.com/Datamine-Crypto/dashboard/blob/main/src/core/react/pages/DashboardPage.tsx). ⛏️
- **Liquidity Management**: The core logic for interacting with Uniswap (or other DEXs) for adding/removing liquidity or performing swaps is located in [`src/core/utils/swap/performSwap.ts`](https://github.com/Datamine-Crypto/dashboard/blob/main/src/core/utils/swap/performSwap.ts) and [`src/core/web3/Web3Bindings.ts`](https://github.com/Datamine-Crypto/dashboard/blob/main/src/core/web3/Web3Bindings.ts) (e.g., `GetTradeResponse`).
- **Analytics Data Flow**: On-chain data is fetched and processed in [`src/core/web3/Web3Bindings.ts`](https://github.com/Datamine-Crypto/dashboard/blob/main/src/core/web3/Web3Bindings.ts) (e.g., `FindAccountState`) and then displayed by various components in [`src/core/react/elements/Cards/`](https://github.com/Datamine-Crypto/dashboard/tree/main/src/core/react/elements/Cards/).

These concepts work together to create a robust and decentralized ecosystem for data mining and asset management.

## 📜 Key Smart Contracts and ABIs

The project interacts with several key smart contracts, whose Application Binary Interfaces (ABIs) are located in [`src/core/web3/abis/`](src/core/web3/abis/). Understanding these contracts is essential for comprehending the blockchain interactions:

-   [`dam.json`](src/core/web3/abis/dam.json): ABI for the Datamine (DAM) token contract, used for token transfers, approvals, and other DAM-specific operations.
-   [`flux.json`](src/core/web3/abis/flux.json): ABI for the Flux (FLUX) token contract, enabling minting, burning, and other FLUX-related functionalities.
-   [`market.json`](src/core/web3/abis/market.json): ABI for the core Datamine Network market contract, which handles the primary logic for decentralized minting, burning, and staking within the ecosystem.
-   [`uniswapv2router.json`](src/core/web3/abis/uniswapv2router.json): ABI for the Uniswap V2 Router contract, crucial for facilitating token swaps and managing liquidity on Uniswap V2 compatible decentralized exchanges.
-   [`uniswapPair.json`](src/core/web3/abis/uniswapPair.json): ABI for Uniswap V2 Pair contracts, used for direct interactions with liquidity pools.
-   [`uniswapPairV3.json`](src/core/web3/abis/uniswapPairV3.json): ABI for Uniswap V3 Pair contracts, used for interactions with Uniswap V3 liquidity pools.
-   [`multicall.json`](src/core/web3/abis/multicall.json): ABI for the Multicall contract, which allows for aggregating multiple read-only contract calls into a single blockchain transaction, significantly improving data fetching efficiency.

## 🚨 Error Handling Strategy

-   Global error handling for Web3 transactions is managed via [`src/core/web3/helpers.ts`](src/core/web3/helpers.ts) (specifically the `rethrowWeb3Error` function). This function attempts to extract human-readable error messages from raw Web3 errors.
-   Errors are then propagated to [`src/core/web3/web3Reducer.ts`](src/core/web3/web3Reducer.ts) to update the application's central `error` state.
-   User-facing error messages are typically displayed through Material-UI Snackbars or custom dialogs, triggered by changes in the `dialog` state within `web3Reducer`.

## 🔌 Third-Party Integrations

Beyond core Web3.js and Material-UI, the project integrates with other third-party libraries and APIs to enhance functionality:

-   **Help Article Content**: All help article content is fetched dynamically from Markdown files located in [`public/helpArticles/`](public/helpArticles/) using standard browser `fetch` API calls.
-   **Search Functionality**: The search capability for help articles is powered by `fuse.js`, a powerful fuzzy-searching library.

### Help Article Conventions

-   **Location:** Help articles are Markdown files located in [`public/helpArticles/`](public/helpArticles/).
-   **Rendering:** These Markdown files are rendered by the `HelpDialog` component (`src/core/react/elements/Dialogs/HelpDialog.tsx`) and displayed on the `HelpPage` (`src/core/react/pages/help/HelpPage.tsx`).
-   **Styling:**
    -   Code blocks (`<code>`, `<pre>`) within help articles are styled in `src/core/react/elements/Dialogs/HelpDialog.tsx` to use `theme.palette.primary.main` (white) for background and `theme.palette.secondary.main` (teal) for text, improving readability.
    -   Help article category tags (Material-UI `Chip` components) on the `HelpPage` are styled in `src/core/styles.ts`.
        -   `primary` colored chips (selected) use a teal background (`#00FFFF`) with white text (`#fff`).
        -   `default` colored chips (unselected) use the `classes.palette.background` (dark) with white text (`#fff`).
-   **Titles:** All help article titles should include a unique emoji for better visual organization and engagement.
-   **Content Updates:** Help articles now comprehensively include information about the LOCK token across relevant guides (e.g., burning, minting, growing validators, and Uniswap buying guides).

## ✨ Features

*   **Realtime Analytics**: Instant access to Datamine (DAM), FLUX, and on-chain Uniswap USD pricing. 📈
*   **Multi-Ecosystem Support**: Seamlessly interact with different blockchain environments like Ethereum Mainnet (L1) and Arbitrum (L2). 🌐
*   **Full Privacy Mode**: No analytics, tracking, cookies, external resources, or 3rd parties utilized. Your data stays yours! 🔒
*   **No Installation Required**: Just drag & drop onto any local or remote web server. 🚀
*   **IPFS, SWARM & TOR Compatible**: Move one step closer to true decentralization by hosting on Distributed Web. 🕸️
*   **Decentralized Minting & Burning**: Tools to manage your DAM and FLUX tokens directly from the dashboard. 🔥
*   **Comprehensive Help & Knowledgebase**: Integrated instant help desk for common questions. 📖

## 💡 Key Features and Concepts

The Datamine Network Dashboard is continuously evolving, incorporating innovative features and concepts to enhance user interaction and ecosystem functionality.

### Datamine Market (Decentralized "Time-in-market" solution)
A revolutionary approach to decentralize "Time-in-market" and create true decentralized demand. Validators can offer a percentage reward for others to burn LOCK to their account, effectively decentralizing demand and increasing market efficiency. This process is seamlessly executed in a single Ethereum transaction.

### Datamine Gems #GameFi
A real-time game where users collect "gems" (public market addresses with unminted balances) by burning tokens. It features a new V2 Public Market smart contract for even greater throughput, atomic batch burning from multiple addresses, and optimized reward distribution. A "Collect all gems" button allows for single-transaction collection from multiple addresses, aiming to increase monetary velocity and transactional throughput.

### LOCK (Lockquidity) Token
Our newest token, LOCK, is designed to enhance stability by contributing to a permanent liquidity pool. It is minted by locking ArbiFLUX. Uniquely, burning LOCK redirects value to the liquidity pool instead of reducing supply, ensuring long-term stability. A new metric, "Market Efficiency," is introduced, defined as 100% minus the percentage of LOCK inside the market. Higher market efficiency indicates more trading volatility and benefits validators.

### Core Values & Ecosystem Principles
The Datamine Network is built on core values that drive its unique approach to DeFi:
*   **Transaction-incentivized Liquidity Pools:** DAM and FLUX offer unique incentives for providing liquidity on Uniswap & Balancer pools, ensuring constant token movement.
*   **On-Chain Linear Deflation:** FLUX supply is non-fixed and features predictable deflation through a burning mechanism, with its generation tied to DAM staking.
*   **Realtime Multi-Smart Contract Analytics:** The dashboard provides real-time on-chain market sentiment, balances in USD, and analytics through deep Uniswap integration.
*   **Secure By Design & Professionally Audited:** All business logic is executed via audited smart contracts, ensuring fund safety and security without third-party involvement.
*   **Built For The Community:** Utilizes serverless, web3, and mobile technologies for a seamless and secure user experience.
*   **Global Problem Solved:** The Datamine Ecosystem aims to solve inflation through its deflationary tokenomics and on-chain demand generation.

### Token Specifications & Mechanics
The ecosystem comprises several tokens with distinct roles and mechanics:
*   **DAM (Datamine Token):** Fixed supply (16,876,778 tokens), ERC-777 standard, primarily used for staking to power validators.
*   **FLUX (Flux Token):** Non-fixed supply, base currency of the ecosystem, features linear and predictable deflation through burning.
*   **Validator (Mint Start/Stop):** The process of locking DAM tokens to generate FLUX.
*   **Delegated Minting:** Allows a different Ethereum address to mint FLUX tokens on behalf of a validator.
*   **Remote Minting/Burning:** Features for minting FLUX from a phone to any Ethereum address, and burning FLUX to any address with an active mint.
*   **Partial Minting:** Ability to specify a percentage of minting (0-100%) and mint smaller amounts to other addresses.
*   **Mint Age Multiplier:** Increases over time (up to 3x after 28 days) for continuous validator operation.
*   **Burn Multiplier:** Variable multiplier (up to 10x) based on FLUX burned relative to global averages.

### Smart Contracts - In-Depth Breakdown
The project's smart contracts are the backbone of the Datamine Network, built with a strong emphasis on security and transparency:
*   **Technology Stack:** Smart contracts are written in Solidity (v0.6.9) and are ERC-777 compatible, built upon OpenZeppelin secure libraries.
*   **Security Features:** Includes SafeMath for arithmetic operations, Mutex and Checks-Effects-Interactions Pattern for re-entrancy protection, custom modifiers (`preventSameBlock()`, `requireLocked()`), immutable state variables, and a unique ERC-1820 ERC777TokensRecipient implementation.
*   **Core Functions:** Detailed explanation of `lock()`, `unlock()`, `burnToAddress()`, and `mintToAddress()` functions, including their security considerations and how they modify the contract's state.
*   **View-Only Functions:** Functions like `getMintAmount()`, `getAddressTimeMultiplier()`, `getAddressBurnMultiplier()`, `getAddressRatio()`, and `getGlobalRatio()` provide real-time analytics without modifying state.
*   **Data Aggregation:** Helper functions (`getAddressDetails()`, `getAddressTokenDetails()`) are provided to reduce network calls for dashboard data.
*   **Additional Security Considerations (ConsenSys):** Adherence to best practices like preparing for failure, careful rollout, keeping contracts simple, staying up to date, awareness of blockchain properties, and secure development recommendations (external calls, public data, integer handling, assert/require/revert usage, modifiers, rounding, fallback functions, visibility, pragma locking, events, `tx.origin`, timestamp dependence, EIP20 approve/transferFrom attack).

## 📸 Screenshots

![Dashboard Screenshot 1](ABOUT/images/screenshot.png)

![Dashboard Screenshot 2](ABOUT/images/screenshot2.png)

## 🤝 Vibe Code Contribute

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

Join us in building the future of DeFi with a truly modern and efficient development experience. We look forward to your "vibe coded" contributions! 🙏

## 🛠️ Development Workflow

### Prerequisites

To run this project locally you will need to download Node.js: <https://nodejs.org/en>

This project was originally developed using Node v16 but it's compatible with Node v18.

### Installation

1.  Navigate to your project directory.
2.  Run `yarn install` (this is a one time requirement).

### Running dApp Locally

After completing previous getting started steps you can now run the project:

#### `yarn start`

Runs the app in the development mode.
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### To Deploy

#### `yarn build`

This will create a new build in build/ folder that you can host. We currently host this on github(<https://datamine-crypto.github.io/dashboard/>) for decentralization reasons & proof of builds.

The `homepage` field in `package.json` is set to `.`, which is crucial for GitHub Pages deployments when the site is hosted in a subfolder (e.g., `your-username.github.io/your-repo-name/`). This ensures that relative paths for assets are correctly resolved.

The builds can be hosted in subfolders and do not perform external http calls for security & decentralization.

This project was bootstrapped with [Vite](https://vite.dev/).

## 🧪 Testing Strategy

While comprehensive UI testing is valuable, our current focus prioritizes rapid UI experimentation. This approach is informed by:

-   **Audited Smart Contracts**: Our core smart contracts have undergone thorough audits (see [`audits folder`](https://github.com/Datamine-Crypto/white-paper/tree/master/audits)), ensuring their reliability and security. This mitigates concerns about the underlying blockchain logic.
-   **Direct MetaMask Communication**: The UI primarily communicates directly with MetaMask, acting as a thin client to immutable smart contracts. This reduces the complexity and risk typically associated with backend integrations.

Given these factors, we find it more efficient to iterate quickly on the UI, leveraging the stability of the audited contracts and the direct, secure wallet interaction. Future development may include UI tests as the project matures and UI stability becomes a higher priority.

## 📚 Learn More

You can learn more in the [Vite documentation](https://vite.dev/).

To learn React, check out the [React documentation](https://reactjs.org/).

## ❓ Support

If you have any questions, issues, or just want to connect with the community, please reach out through our:

-   **Discord**: Join our [Discord server](https://discord.gg/2dQ7XAB22u) for real-time discussions and support. 💬
-   **GitHub Issues**: For bug reports or feature requests, please open an issue on our [GitHub repository](https://github.com/Datamine-Crypto/dashboard/issues). 🐛

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. ⚖️