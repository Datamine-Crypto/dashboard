
import fluxLogo from './svgs/fluxLogo.svg';
import arbiFluxLogo from './svgs/arbiFluxLogo.svg';
import logo from './svgs/logo.svg';

export const getBaseConfig = (isArbitrumMainnet: boolean) => {

	const getNetworkConfig = (): NetworkConfig => {
		const networkType = isArbitrumMainnet ? NetworkType.Arbitrum : NetworkType.Mainnet;
		switch (networkType) {

			case NetworkType.Arbitrum: // L2 Configuration
				return {
					lockableTokenFullName: 'FLUX (L2)',
					lockableTokenShortName: 'FLUX (L2)',
					lockableTokenContractAddress: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df',
					lockableSushiSwapL2EthPair: '0x088f6dcde862781db7b01feb67afd265abbc6d90',

					mintableTokenShortName: 'ArbiFLUX',
					mintableTokenContractAddress: '0x64081252c497fcfec247a664e9d10ca8ed71b276',
					mintableSushiSwapL2EthPair: '0xbF719D56c5f19ae0833ADC4080BEfC48A9B415b5',

					failsafeStartBlockNumber: 13463591,
				}
			case NetworkType.Mainnet: // L1 Configuration
				return {
					lockableTokenFullName: 'Datamine (DAM)',
					lockableTokenShortName: 'DAM',
					lockableTokenContractAddress: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df',
					lockableUniswapV3L1EthTokenContractAddress: '0xBd233D685eDE81E00faaEFEbD55150C76778a34e',

					mintableTokenShortName: 'FLUX',
					mintableTokenContractAddress: '0x469eda64aed3a3ad6f868c44564291aa415cb1d9',
					mintableUniswapV3L1EthTokenContractAddress: '0x07aa6584385cca15c2c6e13a5599ffc2d177e33b',

					failsafeStartBlockNumber: 10224578,
				}
		}
	}

	/**
	 * "Explore Liquidity Pools" dropdown
	 * If isLiquidityPoolsEnabled is set to false you don't have to update this
	 */
	const liquidityPoolGroups = [
		[
			{
				name: 'FLUX',
				links: {
					info: 'https://www.defined.fi/eth/0x07aa6584385cca15c2c6e13a5599ffc2d177e33b',
					buy: {
						uniswap: 'https://app.uniswap.org/#/swap?inputCurrency=eth&outputCurrency=0x469eda64aed3a3ad6f868c44564291aa415cb1d9',
						sushiSwap: '#',
						oneInch: '#',
						solidLizard: ''
					},
					addLiquidity: 'https://app.uniswap.org/#/add/0x469eda64aed3a3ad6f868c44564291aa415cb1d9/eth/10000'
				},
				image: fluxLogo,
				layer: 1
			},
			{
				name: 'DAM',
				links: {
					info: 'https://www.defined.fi/eth/0xbd233d685ede81e00faaefebd55150c76778a34e',
					buy: {
						uniswap: 'https://app.uniswap.org/#/swap?inputCurrency=eth&outputCurrency=0xf80d589b3dbe130c270a69f1a69d050f268786df',
						sushiSwap: '#',
						oneInch: '#',
						solidLizard: ''
					},
					addLiquidity: 'https://app.uniswap.org/#/add/0xf80d589b3dbe130c270a69f1a69d050f268786df/eth/10000'
				},
				image: logo,
				layer: 1,
				isHot: false
			},
		],
		[
			{
				name: 'FLUX',
				links: {
					info: 'https://www.defined.fi/arb/0x088f6dcde862781db7b01feb67afd265abbc6d90',
					buy: {
						uniswap: 'https://app.uniswap.org/#/swap?inputCurrency=eth&outputCurrency=0xf80d589b3dbe130c270a69f1a69d050f268786df',
						sushiSwap: 'https://app.sushi.com/swap?inputCurrency=eth&outputCurrency=0xf80d589b3dbe130c270a69f1a69d050f268786df',
						oneInch: 'https://app.1inch.io/#/42161/simple/swap/ETH/0xf80d589b3dbe130c270a69f1a69d050f268786df',
						solidLizard: 'https://solidlizard.finance/swap?from=ETH&to=0xf80d589b3dbe130c270a69f1a69d050f268786df'
					},
					addLiquidity: 'https://app.sushi.com/add/0xf80d589b3dbe130c270a69f1a69d050f268786df/ETH'
				},
				image: fluxLogo,
				layer: 2,
				isHot: false
			},
			{
				name: 'ArbiFLUX',
				links: {
					info: 'https://www.defined.fi/arb/0xbf719d56c5f19ae0833adc4080befc48a9b415b5',
					buy: {
						uniswap: 'https://app.uniswap.org/#/swap?inputCurrency=eth&outputCurrency=0x64081252c497FCfeC247a664e9D10Ca8eD71b276',
						sushiSwap: 'https://app.sushi.com/swap?inputCurrency=eth&outputCurrency=0x64081252c497FCfeC247a664e9D10Ca8eD71b276',
						oneInch: 'https://app.1inch.io/#/42161/simple/swap/ETH/0x64081252c497FCfeC247a664e9D10Ca8eD71b276',
						solidLizard: 'https://solidlizard.finance/swap?from=ETH&to=0x64081252c497fcfec247a664e9d10ca8ed71b276'
					},
					addLiquidity: 'https://app.sushi.com/add/0x64081252c497fcfec247a664e9d10ca8ed71b276/ETH'
				},
				image: arbiFluxLogo,
				layer: 2,
				isHot: true
			},
		],
	]


	const baseConfig = {
		...getNetworkConfig(),

		failsafeDuration: 161280,
		network: {
			type: 'main',
			typeDisplay: 'Ethereum Mainnet'
		},

		liquidityPoolGroups,
		/**
		 * Enable various "Explore Liquidity" buttons on website.
		 * If your token doesn't have liquidity pools setup yet set this to false
		 */
		isLiquidityPoolsEnabled: true,

		/**
		 * If your token doesn't have an explainer video on homepage set this to false
		 */
		isHomepageVideoVisible: true,

		/**
		 * If set to true your token is only deployed on Arbitrum. If a user connects to Ethereum mainnet or other network they'll gen an "Unsupported Network" error
		 * Set this to true if your token is only deployed on Arbitrum
		 */
		isArbitrumOnlyToken: false,

		/**
		 * What is the name of the ecosystem (override to change things like titles and few mentions)
		 */
		ecosystemName: 'Datamine Network',

		/**
		 * What is your token trying to achieve? This will be added in a few places like titles.
		 */
		ecosystemSlogan: 'Cryptocurrency backed by Proof of Burn',

		/**
		 * In a few places we'll have this absolute url to the dashboard (ex: Terms page and add to metamask button)
		 */
		dashboardAbsoluteUrl: 'https://github.com/Datamine-Crypto/realtime-decentralized-dashboard',

		/**
		 * For your MIT license, what copyright year do you want to show
		 */
		mitCopyrightYear: 2020,

		/**
		 * Market sentiment card in validator dashboard. Set this to false if you don't have any meaninful numbers yet
		 */
		isRealtimeOnChainMarketSentimentEnabled: true,

		/**
		 * Is the settings button visible on validator dashoard?
		 * This settings button will let you customize currency and select type of transaction to issue (EIP 1559)
		 * Set this to false if you don't want this advanced customization
		 */
		isSettingsValidatorDashboardButtonEnabled: true,

		/**
		 * If you just made a token and don't have a logo for your token yet we'll hide it in validator dashboard (set to true to show it)
		 */
		isTokenLogoEnabled: true,

		/**
		 * For your tokenomics what is the maximum burn (the default for Datamine is 10x). Be sure to update this if you've updated the smart contract values
		 */
		maxBurnMultiplier: 10,

		/**
		 * Smart contract value from _mintPerBlockDivisor (this is the second number in 10 ** 8)
		 */
		mintableTokenMintPerBlockDivisor: 8,

		/**
		 * Left side navigation (buttons on left side or top right on mobile)
		 */
		navigation: {

			/**
			 * Left side navigation for explaining about L1 Token (Ex: FLUX L1 Ecosystem)
			 */
			isL1PageEnabled: true,

			/**
			 * Left side navigation for explaining about L2 Token (Ex: FLUX L2 Ecosystem)
			 */
			isL2PageEnabled: true,

			/**
			 * Left side navigation for community page (set this to false if your community page is not setup yet)
			 */
			isCommunityPageEnabled: true,

			/**
			 * Left side navigation for analytics (This should only be set to true for Datamine Network)
			 */
			isAnalyticsPagesEnabled: true,

			/**
			 * Left side navigation for help page (Set this to false if you haven't updated help articles yet)
			 */
			isHelpPageEnabled: true,

			/**
			 * Left side button label for the navigation dropdown
			 */
			ecosystemButtonlabel: 'Datamine Ecosystem',

			/**
			 * Create an invite link to your Discord community that doesn't expire.
			 * If you set this to null it won't show the button on link
			 */
			discordInviteLink: 'https://discord.gg/2dQ7XAB22u' as string | null
		}
	}

	return baseConfig
}

export enum NetworkType {
	Localhost = 'LOCALHOST',
	Testnet = 'TESTNET',
	Mainnet = 'MAINNET',
	Arbitrum = 'ARBITRUM',
}

interface NetworkConfig {

	/**
	 * What is the address of token that you have to "lock-in" (ex: DAM)
	 */
	lockableTokenContractAddress: string;

	/**
	 * A longer name ex: "Datamine (DAM)" for lockable token that can be displayed on text
	 */
	lockableTokenFullName: string;

	/**
	 * Shortest name to display ex: "DAM" for lockable token 
	 */
	lockableTokenShortName: string;

	/**
	 * A longer name ex: "FLUX" for lockable token that can be displayed on text
	 */
	mintableTokenShortName: string;

	/**
	 * What is the address of token that you have to "mint" (ex: FLUX)
	 */
	mintableTokenContractAddress: string;

	/**
	 * On L1 this is the Uniswap V3 pool address for Lockable / ETH token
	 */
	lockableUniswapV3L1EthTokenContractAddress?: string;

	/**
	 * On L1 this is the Uniswap V3 pool address for Mintable / ETH token
	 */
	mintableUniswapV3L1EthTokenContractAddress?: string;

	/**
	 * On L2 this is the Sushiswap pool address for Lockable / ETH token
	 */
	lockableSushiSwapL2EthPair?: string;

	/**
	 * You can set this to true if your price is a very large/small number (because you've created Lockable/ETH pair instead of ETH/Lockable)
	 */
	lockableSushiSwapL2EthPairSwapPairs?: boolean;

	/**
	 * On L2 this is the Sushiswap pool address for Mintable / ETH token
	 */
	mintableSushiSwapL2EthPair?: string;

	/**
	 * If your token has a failsafe limit enabled, at what block does it start?
	 * Failsafe allows only a certain amount of tokens to be locked-up in beginning. 
	 * (These are the settings you've set when initializing smart contract)
	 */
	failsafeStartBlockNumber: number;
}