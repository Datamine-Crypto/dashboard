*Preface: For true decentralization and openness we've decided to open source 3 years of work for Datamine Network dApp. We believe this will close another gap of centralization and bring us closer to true vision of DeFi.* 🔮

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Material-UI](https://img.shields.io/badge/Material--UI-v7-0081CB?logo=mui&logoColor=white)](https://mui.com/)
[![Web3.js](https://img.shields.io/badge/Web3.js-v4-F16822?logo=web3.js&logoColor=white)](https://web3js.org/)
[![Yarn](https://img.shields.io/badge/Yarn-v4-2C8EBB?logo=yarn&logoColor=white)](https://yarnpkg.com/)
[![Status](https://img.shields.io/badge/Status-Under%20Active%20Development-blue)](https://github.com/Datamine-Crypto/realtime-decentralized-dashboard)
[![Discord](https://img.shields.io/badge/Discord-Join%20our%20Community-5865F2?logo=discord&logoColor=white)](https://discord.gg/2dQ7XAB22u)

You can access the latest version of Datamine Realtime Decentralized Dashboard by clicking the following link:

<https://datamine-crypto.github.io/realtime-decentralized-dashboard/>

# 🚀 Realtime Decentralized Dashboard

## Table of Contents

- ✨ [Core Technologies](#-core-technologies)
- 🏛️ [Key Architectural Patterns](#️-key-architectural-patterns)
- 💡 [Core Datamine Concepts](#-core-datamine-concepts)
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

-   **`src/core/`**: This directory serves as the heart of the application, encapsulating its fundamental logic and shared functionalities.
    -   **`src/core/react/`**: Dedicated to the user interface, this sub-directory houses all React components, pages, and UI-related elements. Styling is primarily handled using `tss-react` and `useStyles` from `tss.create()`, with Material-UI themes defined in `src/core/styles.ts`. Think of it as where the visual magic happens! ✨
    -   **`src/core/web3/`**: This is where all blockchain interactions are managed. It includes Web3 provider setup, smart contract bindings, and ABI definitions (found in `src/core/web3/abis/`). State management for Web3 interactions is handled by `src/core/web3/web3Reducer.ts` and `src/core/web3/web3Bindings.ts` in tandem, utilizing a "Commands & Queries" pattern. `Web3Reducer` controls state and updates `pendingQueries`, which are then converted into asynchronous calls to `Web3Bindings`. It's the bridge to the decentralized world. 🌉
    -   **`src/core/utils/`**: A versatile collection of helper functions for common tasks such as data formatting, complex calculations, and clipboard interaction. These are the handy tools that keep the application running smoothly. 🔧
-   **`src/configs/`**: This directory is responsible for managing all environment-specific and application-wide configurations.
    -   **`src/configs/ecosystems/`**: A crucial part of the multi-chain functionality, this sub-directory defines specific configurations for each blockchain environment the dashboard can connect to (e.g., Ethereum Mainnet L1 and Arbitrum L2). This enables seamless operation across different networks. 🔗

This structured approach ensures that the codebase remains modular, scalable, and easy to navigate for developers.

## ⚙️ Configuration

The Datamine Network Dashboard is highly configurable to adapt to different blockchain environments and user preferences. Key configuration files are located in the `src/configs/` directory:

-   **`src/configs/config.ts`**: The main configuration file, where you can adjust general application settings.
-   **`src/configs/ecosystems/`**: This directory contains specific configurations for each supported blockchain ecosystem (e.g., `config.ecosystem.dam_flux_l1.ts` for Ethereum Mainnet, `config.ecosystem.arbiflux_lockquidity_l2.ts` for Arbitrum L2). These files define network details, contract addresses, and other ecosystem-specific parameters.

To switch between ecosystems or customize settings, you can modify these files directly. For development, you might also leverage environment variables if your setup supports them.

## 💡 Core Datamine Concepts

The Datamine Network operates on several key principles and components:

- **DAM (Datamine Token)**: The primary token of the Datamine Network, often used for staking and participating in the network's economic activities. 💰
- **FLUX (Flux Token)**: A secondary token, often earned through mining or other network activities, representing a form of reward or utility within the ecosystem. ⚡
- **Liquidity Pools**: Decentralized exchanges (DEXs) like Uniswap are crucial for providing liquidity for DAM and FLUX tokens, enabling seamless trading. 💧
- **Multi-chain Ecosystem**: The dashboard supports interactions across different blockchain layers (e.g., Ethereum Mainnet L1 and Arbitrum L2), allowing users to manage assets and participate in activities on their preferred chain. ⛓️
- **Decentralized Minting**: A core mechanism where new tokens are generated through a decentralized process, often involving staking or mining. ⛏️

These concepts work together to create a robust and decentralized ecosystem for data mining and asset management.

## ✨ Features

*   **Realtime Analytics**: Instant access to Datamine (DAM), FLUX, and on-chain Uniswap USD pricing. 📈
*   **Multi-Ecosystem Support**: Seamlessly interact with different blockchain environments like Ethereum Mainnet (L1) and Arbitrum (L2). 🌐
*   **Full Privacy Mode**: No analytics, tracking, cookies, external resources, or 3rd parties utilized. Your data stays yours! 🔒
*   **No Installation Required**: Just drag & drop onto any local or remote web server. 🚀
*   **IPFS, SWARM & TOR Compatible**: Move one step closer to true decentralization by hosting on Distributed Web. 🕸️
*   **Decentralized Minting & Burning**: Tools to manage your DAM and FLUX tokens directly from the dashboard. 🔥
*   **Comprehensive Help & Knowledgebase**: Integrated instant help desk for common questions. 📖

## 📸 Screenshots

![Dashboard Screenshot 1](ABOUT/images/screenshot.png)

![Dashboard Screenshot 2](ABOUT/images/screenshot2.png)

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
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### To Deploy

#### `yarn build`

This will create a new build in build/ folder that you can host. We currently host this on github(<https://datamine-crypto.github.io/realtime-decentralized-dashboard/>) for decentralization reasons & proof of builds.

The builds can be hosted in subfolders and do not perform external http calls for security & decentralization.

This project was bootstrapped with [Vite](https://vite.dev/).

## 🧪 Testing Strategy

Currently, this project does not have dedicated unit or integration tests due to time constraints. Future development may include implementing tests using frameworks like Jest and React Testing Library.

## 📚 Learn More

You can learn more in the [Vite documentation](https://vite.dev/).

To learn React, check out the [React documentation](https://reactjs.org/).

## ❓ Support

If you have any questions, issues, or just want to connect with the community, please reach out through our:

-   **Discord**: Join our [Discord server](https://discord.gg/2dQ7XAB22u) for real-time discussions and support. 💬
-   **GitHub Issues**: For bug reports or feature requests, please open an issue on our [GitHub repository](https://github.com/Datamine-Crypto/realtime-decentralized-dashboard/issues). 🐛

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. ⚖️