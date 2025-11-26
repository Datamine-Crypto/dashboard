_Preface: For true decentralization and openness we've decided to open source 6 years of work for Datamine Network dApp. We believe this will close another gap of centralization and bring us closer to true vision of DeFi._ 🔮

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

- **Node.js**: We recommend using Node.js v18 or higher. You can download it from [nodejs.org](https://nodejs.org/en/).
- **Yarn**: This project uses Yarn v4. You can install it globally via npm: `npm install -g yarn@^4.0.0`

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

## Available Scripts

In the project directory, you can run the following scripts:

- `yarn start`: Runs the app in development mode.
- `yarn build`: Builds the app for production to the `build` folder.
- `yarn deploy`: Creates a production build with a specific base path for deployment.
- `yarn format`: Formats code using Prettier.
- `yarn lint`: Lints the project using ESLint.

Welcome to the Datamine Network Dashboard! This project is a web-based dashboard for the Datamine Network, built with React and TypeScript. It provides users with tools to interact with Datamine smart contracts, view analytics, and manage their assets across different blockchain layers.

## ✨ Core Technologies

- **Framework:** React v19 ⚛️
- **UI Library:** Material-UI (MUI) v7 🎨
- **Blockchain Interaction:** Web3.js v4, @walletconnect/ethereum-provider 🔗
- **Language:** TypeScript 💻
- **Build Tool:** Vite ⚡
- **Package Manager:** Yarn v4 🧶

## 🏛️ Key Architectural Patterns

The `src` directory is meticulously organized to ensure a clear separation of concerns and maintainability. Here's a breakdown of its core structure:

- **`src/`**: This directory serves as the heart of the application, encapsulating its fundamental logic and shared functionalities.
  - **`src/react/`**: Dedicated to the user interface, this sub-directory houses all React components, pages, and UI-related elements. Styling is primarily handled using `tss-react` and `useStyles` from `tss.create()`, with Material-UI themes defined in `src/styles.ts`. Think of it as where the visual magic happens! ✨
  - **`src/web3/`**: This is where all blockchain interactions are managed. It includes Web3 provider setup, smart contract bindings, and ABI definitions (found in `src/web3/abis/`). State management for Web3 interactions is handled by `src/web3/web3Reducer.ts` and `src/web3/web3Bindings.ts` in tandem, utilizing a "Commands & Queries" pattern. `Web3Reducer` controls state and updates `pendingQueries`, which are then converted into asynchronous calls to `Web3Bindings`. It's the bridge to the decentralized world. 🌉
  - **`src/utils/`**: A versatile collection of helper functions for common tasks such as data formatting, complex calculations, and clipboard interaction. These are the handy tools that keep the application running smoothly. 🔧
- **`src/configs/`**: This directory is responsible for managing all environment-specific and application-wide configurations.
  - **`src/configs/ecosystems/`**: A crucial part of the multi-chain functionality, this sub-directory defines specific configurations for each blockchain environment the dashboard can connect to (e.g., Ethereum Mainnet L1 and Arbitrum L2). This enables seamless operation across different networks. 🔗

This structured approach ensures that the codebase remains modular, scalable, and easy to navigate for developers.

## ⚙️ Configuration

The Datamine Network Dashboard is highly configurable to adapt to different blockchain environments and user preferences. Key configuration files are located in the `src/configs/` directory:

- **`src/configs/config.ts`**: The main configuration file, where you can adjust general application settings.
- **`src/configs/ecosystems/`**: This directory contains specific configurations for each supported blockchain ecosystem (e.g., `config.ecosystem.dam_flux_l1.ts` for Ethereum Mainnet, `config.ecosystem.arbiflux_lockquidity_l2.ts` for Arbitrum L2). These files define network details, contract addresses, and other ecosystem-specific parameters.

To switch between ecosystems or customize settings, you can modify these files directly. For development, you might also leverage environment variables if your setup supports them.

## 💡 Core Datamine Concepts

The Datamine Network operates on several key principles and components, with their core logic implemented across various parts of the codebase:

- **DAM (Datamine Token)**: The primary token of the Datamine Network, often used for staking and participating in the network's economic activities. 💰
- **FLUX (Flux Token)**: A secondary token, often earned through mining or other network activities, representing a form of reward or utility within the ecosystem. ⚡
- **Liquidity Pools**: Decentralized exchanges (DEXs) like Uniswap are crucial for providing liquidity for DAM and FLUX tokens, enabling seamless trading. 💧
- **Multi-chain Ecosystem**: The dashboard supports interactions across different blockchain layers (e.g., Ethereum Mainnet L1 and Arbitrum L2), allowing users to manage assets and participate in activities on their preferred chain. ⛓️
- **Decentralized Minting**: A core mechanism where new tokens are generated through a decentralized process, often involving staking or mining. The logic for initiating, tracking, or claiming decentralized minting rewards is primarily found in `src/web3/Web3Bindings.ts` (e.g., `GetMintFluxResponse`) and its UI interaction in `src/react/pages/DashboardPage.tsx`. ⛏️
- **Liquidity Management**: The core logic for interacting with Uniswap (or other DEXs) for adding/removing liquidity or performing swaps is located in `src/utils/swap/performSwap.ts` and `src/web3/Web3Bindings.ts` (e.g., `GetTradeResponse`).
- **Analytics Data Flow**: On-chain data is fetched and processed in `src/web3/Web3Bindings.ts` (e.g., `FindAccountState`) and then displayed by various components in `src/react/elements/Cards/`.

These concepts work together to create a robust and decentralized ecosystem for data mining and asset management.

## 📜 Key Smart Contracts and ABIs

The project interacts with several key smart contracts, whose Application Binary Interfaces (ABIs) are located in `src/web3/abis/`. Understanding these contracts is essential for comprehending the blockchain interactions:

- **`dam.json`**: ABI for the Datamine (DAM) token contract, used for token transfers, approvals, and other DAM-specific operations.
- **`flux.json`**: ABI for the Flux (FLUX) token contract, enabling minting, burning, and other FLUX-related functionalities.
- **`market.json`**: ABI for the core Datamine Network market contract, which handles the primary logic for decentralized minting, burning, and staking within the ecosystem.
- **`uniswapv2router.json`**: ABI for the Uniswap V2 Router contract, crucial for facilitating token swaps and managing liquidity on Uniswap V2 compatible decentralized exchanges.
- **`uniswapPair.json`**: ABI for Uniswap V2 Pair contracts, used for direct interactions with liquidity pools.
- **`uniswapPairV3.json`**: ABI for Uniswap V3 Pair contracts, used for interactions with Uniswap V3 liquidity pools.
- **`multicall.json`**: ABI for the Multicall contract, which allows for aggregating multiple read-only contract calls into a single blockchain transaction, significantly improving data fetching efficiency.

## 🚨 Error Handling Strategy

Robust error handling is implemented to provide a smooth user experience, especially during blockchain interactions:

- Global error handling for Web3 transactions is managed via `src/web3/helpers.ts` (specifically the `rethrowWeb3Error` function). This function attempts to extract human-readable error messages from raw Web3 errors.
- Errors are then propagated to `src/web3/web3Reducer.ts` to update the application's central `error` state.
- User-facing error messages are typically displayed through Material-UI Snackbars or custom dialogs, triggered by changes in the `dialog` state within `web3Reducer`.

## 🔌 Third-Party Integrations

Beyond core Web3.js and Material-UI, the project integrates with other third-party libraries and APIs to enhance functionality:

- **Help Article Content**: All help article content is fetched dynamically from Markdown files located in `public/helpArticles/` using standard browser `fetch` API calls.
- **Search Functionality**: The search capability for help articles is powered by `fuse.js`, a powerful fuzzy-searching library.

## ✨ Features

- **Realtime Analytics**: Instant access to Datamine (DAM), FLUX, and on-chain Uniswap USD pricing. 📈
- **Multi-Ecosystem Support**: Seamlessly interact with different blockchain environments like Ethereum Mainnet (L1) and Arbitrum (L2). 🌐
- **Full Privacy Mode**: No analytics, tracking, cookies, external resources, or 3rd parties utilized. Your data stays yours! 🔒
- **No Installation Required**: Just drag & drop onto any local or remote web server. 🚀
- **IPFS, SWARM & TOR Compatible**: Move one step closer to true decentralization by hosting on Distributed Web. 🕸️
- **Decentralized Minting & Burning**: Tools to manage your DAM and FLUX tokens directly from the dashboard. 🔥
- **Comprehensive Help & Knowledgebase**: Integrated instant help desk for common questions. 📖

## 📸 Screenshots

![Dashboard Screenshot 1](docs/images/screenshot.png)

![Dashboard Screenshot 2](docs/images/screenshot2.png)

## 🤝 Contributing

We welcome contributions from the community! If you'd like to contribute, please follow these steps:

1.  **Fork** this repository.
2.  **Clone** your forked repository.
3.  **Create a new branch** for your feature or bug fix.
4.  **Make your changes** and ensure they adhere to the existing code style.
5.  **Test** your changes thoroughly.
6.  **Commit** your changes with a clear and concise message.
7.  **Push** your branch to your forked repository.
8.  **Open a Pull Request** to the `main` branch of this repository.

Please ensure your pull requests are well-documented and address a specific issue or feature. For major changes, please open an issue first to discuss your ideas. Thank you for making the Datamine Network Dashboard better! 🙏

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

- **Audited Smart Contracts**: Our core smart contracts have undergone thorough audits (see [audits folder](https://github.com/Datamine-Crypto/white-paper/tree/master/audits)), ensuring their reliability and security. This mitigates concerns about the underlying blockchain logic.
- **Direct MetaMask Communication**: The UI primarily communicates directly with MetaMask, acting as a thin client to immutable smart contracts. This reduces the complexity and risk typically associated with backend integrations.

Given these factors, we find it more efficient to iterate quickly on the UI, leveraging the stability of the audited contracts and the direct, secure wallet interaction. Future development may include UI tests as the project matures and UI stability becomes a higher priority.

## 📚 Learn More

You can learn more in the [Vite documentation](https://vite.dev/).

To learn React, check out the [React documentation](https://reactjs.org/).

## ❓ Support

If you have any questions, issues, or just want to connect with the community, please reach out through our:

- **Discord**: Join our [Discord server](https://discord.gg/2dQ7XAB22u) for real-time discussions and support. 💬
- **GitHub Issues**: For bug reports or feature requests, please open an issue on our [GitHub repository](https://github.com/Datamine-Crypto/dashboard/issues). 🐛

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. ⚖️
