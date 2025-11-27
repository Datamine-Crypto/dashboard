// Imports for token swap options and SVG logos
import { SwapToken } from '@/web3/swap/swapOptions';
import arbiFluxLogo from '@/react/svgs/arbiFluxLogo.svg';
import fluxLogo from '@/react/svgs/fluxLogo.svg';
import lockquidityLogo from '@/react/svgs/lockquidity.svg';

import logo from '@/react/svgs/logo.svg';
// Common configuration for ecosystems
import { Ecosystem } from '@/app/configs/config.common';
// Ecosystem-specific configurations
import { getArbiFluxLockquidityEcosystemConfig } from '@/app/configs/ecosystems/config.ecosystem.arbiflux_lockquidity_l2';
import { getDamFluxEcosystemConfig } from '@/app/configs/ecosystems/config.ecosystem.dam_flux_l1';
import { getFluxArbiFluxEcosystemConfig } from '@/app/configs/ecosystems/config.ecosystem.flux_arbiflux_l2';

/**
 * Maps each ecosystem to its specific configuration function.
 */
export const ecosystemConfigs = {
	[Ecosystem.Flux]: getDamFluxEcosystemConfig(),
	[Ecosystem.ArbiFlux]: getFluxArbiFluxEcosystemConfig(),
	[Ecosystem.Lockquidity]: getArbiFluxLockquidityEcosystemConfig(),
};

/**
 * Returns the base configuration for the given ecosystem, combining common settings with ecosystem-specific details.
 * This function also defines the structure for liquidity pool groups and various feature flags for the dashboard.
 * @param ecosystem The ecosystem for which to retrieve the base configuration.
 * @returns The base configuration object.
 */
export const getBaseConfig = (ecosystem: Ecosystem) => {
	const ecosystemConfig = ecosystemConfigs[ecosystem];

	const { layer } = ecosystemConfig;

	/**
	 * Configuration for the "Explore Liquidity Pools" dropdown.
	 * If `isLiquidityPoolsEnabled` is set to `false`, this section will not be displayed.
	 */
	const liquidityPoolGroups = [
		[
			// FLUX on L1 pool is hidden to focus liquidity on L2
			/*
			{
				name: 'FLUX',
				swapToken: SwapToken.FLUX,
				isBuiltinSwapEnabled: false,
				links: {
					info: 'https://www.defined.fi/eth/0x07aa6584385cca15c2c6e13a5599ffc2d177e33b',
					buy: 'https://app.uniswap.org/explore/tokens/ethereum/0x469eda64aed3a3ad6f868c44564291aa415cb1d9',
					addLiquidity: 'https://app.uniswap.org/explore/pools/ethereum/0x07AA6584385cCA15C2c6e13A5599fFc2D177E33b'
				},
				image: fluxLogo,
				layer: 1
			},
			*/
			{
				name: 'DAM',
				swapToken: SwapToken.DAM,
				isBuiltinSwapEnabled: false,
				links: {
					info: 'https://www.defined.fi/eth/0xbd233d685ede81e00faaefebd55150c76778a34e',
					buy: 'https://app.uniswap.org/explore/tokens/ethereum/0xf80d589b3dbe130c270a69f1a69d050f268786df',
					addLiquidity: 'https://app.uniswap.org/explore/pools/ethereum/0xBd233D685eDE81E00faaEFEbD55150C76778a34e',
				},
				image: logo,
				layer: 1,
				isHot: false,
			},
		],
		[
			{
				name: 'FLUX',
				swapToken: SwapToken.FLUX,
				isBuiltinSwapEnabled: true,
				links: {
					info: 'https://www.defined.fi/arb/0x088f6dcde862781db7b01feb67afd265abbc6d90',
					buy: 'https://swap.defillama.com/?chain=arbitrum&from=0x0000000000000000000000000000000000000000&to=0xF80D589b3Dbe130c270a69F1a69D050f268786Df',
					addLiquidity: 'https://www.sushi.com/arbitrum/pool/v2/0x088F6dCDe862781db7b01fEB67afd265aBbC6d90/add',
				},
				image: fluxLogo,
				layer: 2,
				isHot: false,
			},
			{
				name: 'ArbiFLUX',
				swapToken: SwapToken.ArbiFLUX,
				isBuiltinSwapEnabled: true,
				links: {
					info: 'https://www.defined.fi/arb/0xbf719d56c5f19ae0833adc4080befc48a9b415b5',
					buy: 'https://swap.defillama.com/?chain=arbitrum&from=0x0000000000000000000000000000000000000000&to=0x64081252c497FCfeC247a664e9D10Ca8eD71b276',
					addLiquidity: 'https://www.sushi.com/arbitrum/pool/v2/0xbf719d56c5f19ae0833adc4080befc48a9b415b5/add',
				},
				image: arbiFluxLogo,
				layer: 2,
				isHot: false,
			},
			{
				name: SwapToken.LOCK,
				swapToken: SwapToken.LOCK,
				isBuiltinSwapEnabled: true,
				links: {
					info: 'https://www.defined.fi/arb/0x0c93a1d3f68a0554d37f3e7af3a1442a94405e7a',
					buy: 'https://app.uniswap.org/swap?outputCurrency=0x454F676D44DF315EEf9B5425178d5a8B524CEa03&inputCurrency=ETH&chain=arbitrum',
					addLiquidity: 'https://app.uniswap.org/add/v2/0x454F676D44DF315EEf9B5425178d5a8B524CEa03/ETH?chain=arbitrum',
				},
				image: lockquidityLogo,
				layer: 2,
				isHot: true,
			},
		],
	];

	const baseConfig = {
		...ecosystemConfig,

		ecosystem,
		layer,

		failsafeDuration: 161280,

		network: {
			type: 'main',
			typeDisplay: 'Ethereum Mainnet',
		},

		liquidityPoolGroups,

		/**
		 * Enable various "Explore Liquidity" buttons on website.
		 * If your token doesn't have liquidity pools setup yet set this to false
		 */
		isLiquidityPoolsEnabled: true,

		/**
		 * There is an option set of Buy/Sell/Add To Pool buttons that can be present inside the dashboard
		 * We've disabled these on 2023-05-09 to simplify the UI. Users are directed to "Explore Liquidity Pools" button instead (Which has all these features for entire ecosystem)
		 */
		isLiquidityPoolAdditionalButtonsEnabled: false,

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
		ecosystemSlogan: 'The Yield-Bearing Cryptocurrency',

		/**
		 * In a few places we'll have this absolute url to the dashboard (ex: Terms page and add to metamask button)
		 */
		dashboardAbsoluteUrl: 'https://github.com/Datamine-Crypto/dashboard',

		/**
		 * For your MIT license, what copyright year do you want to show
		 */
		mitCopyrightYear: 2020,

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
			discordInviteLink: 'https://discord.gg/2dQ7XAB22u' as string | null,
		},
	};

	return baseConfig;
};
