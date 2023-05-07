
import fluxLogo from './svgs/fluxLogo.svg';
import arbiFluxLogo from './svgs/arbiFluxLogo.svg';
import logo from './svgs/logo.svg';

export const getBaseConfig = (isArbitrumMainnet: boolean) => {

	const getNetworkConfig = () => {

		const networkType = isArbitrumMainnet ? NetworkType.Arbitrum : NetworkType.Mainnet;
		switch (networkType) {

			case NetworkType.Arbitrum:
				return {
					/**
					 * What is the address of token that you have to "lock-in" (ex: DAM)
					 */
					lockableTokenContractAddress: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df',

					/**
					 * What is the address of token that you have to "mint" (ex: FLUX)
					 */
					mintableTokenContractAddress: '0x64081252c497fcfec247a664e9d10ca8ed71b276',

					uniswapEthDamTokenContractAddress: '0x447f8D287120B66F39856AE5ceb01512A7A47444',
					uniswapFluxEthTokenContractAddress: '0x27fa67302c513f5512bbfa5065800c2d7b3871f4',
					uniswapUsdcEthTokenContractAddress: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',


					failsafeStartBlockNumber: 13463591,
					failsafeDuration: 161280,
					network: {
						type: 'main',
						typeDisplay: 'Ethereum Mainnet'
					},

					uniswapV3EthDamTokenContractAddress: '0xa8e5873b838fa39c381cb3e29cb0b6b9deda7a87',
					uniswapV3EthFluxTokenContractAddress: '0xa99c670879888df9ccfaa46b1f3b0c9cfb771bee',
					uniswapV3UsdcEthTokenContractAddress: '0xc31e54c7a869b9fcbecc14363cf510d1c41fa443',
					uniswapMulticallAdress: '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F',
					wrappedEthAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',

					sushiSwapDamEthPair: '0x088f6dcde862781db7b01feb67afd265abbc6d90',
					sushiSwapFluxEthPair: '0xbF719D56c5f19ae0833ADC4080BEfC48A9B415b5',
					sushiSwapFluxCornPair: '0xc2B3130582904B8aC8E67d6ef9E910322E09Af10',

					solidlizardDamFluxPair: '0xd2b09B01DA93D964F0A906321d61e9Fe777Da6Be',
					solidlizardFluxSlizPair: '0x3e3a7668ab9492a35560fc2f083217af62e33ec4',
				}
			case NetworkType.Mainnet:
				return {
					lockableTokenContractAddress: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df',
					mintableTokenContractAddress: '0x469eda64aed3a3ad6f868c44564291aa415cb1d9',

					uniswapEthDamTokenContractAddress: '0x447f8D287120B66F39856AE5ceb01512A7A47444',
					uniswapFluxEthTokenContractAddress: '0x27fa67302c513f5512bbfa5065800c2d7b3871f4',
					uniswapUsdcEthTokenContractAddress: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
					failsafeStartBlockNumber: 10224578,
					failsafeDuration: 161280,
					network: {
						type: 'main',
						typeDisplay: 'Ethereum Mainnet'
					},

					uniswapV3EthDamTokenContractAddress: '0xBd233D685eDE81E00faaEFEbD55150C76778a34e',
					uniswapV3EthFluxTokenContractAddress: '0x07aa6584385cca15c2c6e13a5599ffc2d177e33b',
					uniswapV3UsdcEthTokenContractAddress: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
					uniswapMulticallAdress: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
					wrappedEthAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
				}

			default:
				// These might change when you `truffle develop`
				// These are some old values for example of how to use Testnet
				return {
					lockableTokenContractAddress: '0x2dBef6c8042e12d4D2aCf766d3019F72f4eA2c61',
					mintableTokenContractAddress: '0xd3Dd50781D88503D1c3445D60155F5a994093f72',

					uniswapEthDamTokenContractAddress: '0x447f8D287120B66F39856AE5ceb01512A7A47444',
					uniswapFluxEthTokenContractAddress: '0x27fa67302c513f5512bbfa5065800c2d7b3871f4',
					uniswapUsdcEthTokenContractAddress: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
					uniswapMulticallAdress: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
					wrappedEthAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
					failsafeStartBlockNumber: 0,
					failsafeDuration: 161280,
					network: {
						type: 'main',
						typeDisplay: 'Localhost'
					},
				}
		}
	}

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
		 * In a few places we'll have this absolute url to the dashboard (ex: Terms page)
		 */
		dashboardAbsoluteUrl: 'https://github.com/Datamine-Crypto/realtime-decentralized-dashboard',

		/**
		 * For your MIT license, what copyright year do you want to show
		 */
		mitCopyrightYear: 2020,

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