import { Game } from '@/core/app/interfaces';
import ecosystemLogoSvg from '@/core/react/svgs/lockquidity.svg';
import { EcosystemConfig, Layer, LiquidityPoolType } from '@/core/app/configs/config.common';

/**
 * Provides the complete configuration for the Arbitrum L2 (ArbiFLUX/LOCK) ecosystem.
 * This configuration includes network details, token addresses, smart contract ABIs, and feature flags
 * specific to this blockchain, allowing the dashboard to dynamically adapt its functionality.
 * @returns An `EcosystemConfig` object tailored for the ArbiFLUX/LOCK ecosystem.
 */
export const getArbiFluxLockquidityEcosystemConfig = () => {
	return {
		// Full and short names for the lockable token (ArbiFLUX)
		lockableTokenFullName: 'ArbiFLUX',
		lockableTokenShortName: 'ArbiFLUX',
		// Contract address for the lockable token
		lockableTokenContractAddress: '0x64081252c497FCfeC247a664e9D10Ca8eD71b276',
		// Sushiswap L2 ETH pair address for ArbiFLUX
		lockableSushiSwapL2EthPair: '0xbF719D56c5f19ae0833ADC4080BEfC48A9B415b5',
		// Indicates if the token pair is swapped (e.g., ETH/ArbiFLUX instead of ArbiFLUX/ETH)
		lockableSushiSwapL2EthPairSwapPairs: true,

		// Short name for the mintable token (LOCK)
		mintableTokenShortName: 'LOCK',
		// Contract address for the mintable token
		mintableTokenContractAddress: '0x454F676D44DF315EEf9B5425178d5a8B524CEa03',
		// Sushiswap L2 ETH pair address for LOCK
		mintableSushiSwapL2EthPair: '0x0C93A1D3F68a0554d37F3e7AF3a1442a94405E7A',

		// Market contract address for Time-in-Market (TIM)
		marketAddress: '0xe948c8417DD2f8e7dfc88ac3F50b3F89Db7c29Dd',

		// Hodl Clicker: Rush game address
		gameHodlClickerAddress: '0x012C2a83f854Bd016074195d06611785eF8D27E0',

		// Batch Minter Address
		batchMinterAddress: '0x352c8A363eF1C9e730b8A2EE14Bab90545fd189C',

		// Block number at which the failsafe limit for token lock-up begins
		failsafeStartBlockNumber: 20959397,
		// Blockchain layer (Layer 2 for Arbitrum)
		layer: Layer.Layer2,

		// File names for token logos in the public/logos folder
		lockableTokenLogoFileName: 'artbiFlux',
		mintableTokenLogoFileName: 'lock',
		// Genesis timestamp for minting
		timestampGenesis: 1728946539,
		// Primary liquidity pool type for this ecosystem
		liquidityPoolType: LiquidityPoolType.Uniswap,

		// Mint per block divisor from the smart contract
		mintableTokenMintPerBlockDivisor: 8,
		// Number of decimal places for displaying mintable token prices
		mintableTokenPriceDecimals: 8,

		// SVG asset for the ecosystem logo
		ecosystemLogoSvg,

		// Address holding locked liquidity in Uniswap
		lockedLiquidityUniswapAddress: '0xE05E43eE517A6D2862f91Be27315318A8E991FCc',

		// Minimum burn multiplier
		minBurnMultiplier: 0.0001,

		// Top burning addresses for this ecosystem, ordered by LOCK/Month
		// These are used as default gems in Datamine Gems #GameFi
		// Upodated: 2025-10-06
		marketTopBurningaddresses: {
			[Game.DatamineGems]: [
				'0x3655450CB4D6A09cAa3Adccb44f8B7de66D9a50c',
				'0x3544Fa4F39a5D6586DE28EF029f885551e9884B4',
				'0x0aa668366919D2EB60F58Af5E9aCfCC1B296286e',
				'0x45009E579e3e088F8C776dD8873b437c18e2eaf4',
				'0x17C2CFC0df9Bb898967c3cc67839bBB2eC52B71d',
				'0x3c633795872589b460160d0661626bec057f2eED',
				'0x2D1bAa47DBdb317AC076Bd192F75889424Da44E0',
				'0x7a50e45e3C9487c81ae1393f0751aaDA3ce442cA',
				'0x05ee786cbA2d4BBd45d2B2f8faD52e393f44e215',
			],
			[Game.HodlClicker]: [
				'0x199a2Fc79825a3a5843fEF0c38Ad92dd7E00e57e',
				'0x66FC9b2c58ef14B95571B9F2FCD994Db66098EaB',
				'0x26ad2CEb6Bcc4E9D07E0D1Ea737944B75Ae1450F',
				'0x9c51CeaB11C88c267ead15E8bDc18cC515640Eae',
				'0x30a3509FbD34d30C8581069F8Cdd6D9Db65EDa53',
				'0x618543F369fda50595b60FB98d1c4974E71b55e2',
				'0xC254125F15e57a69080aa5C1aC989c797BA34492',
				'0x3655450CB4D6A09cAa3Adccb44f8B7de66D9a50c',
				'0xFF97ca9e353D463523E29E21cD5C3285F0F5A15C',
				'0xF26f182a0584f5272C006f5D03661c459d3d818B',
				'0x45Eb49d2584b6a432f49f375F5b35522D9A51cab',
				'0x8E272e4ADF77A144adDD9146ef5b2BFAA1ECe4DA',
				'0x62fC30839a188e58Cc127a859F2C305f562F464d',
				'0x5e21b59AB51185C16254744Ad6F15062a6165794',
				'0x19e0568749252Ec5E1c38da83921a5DbC2c3a830',
				'0x7274E2614F910B5B2850e0DC3D2e8e60069234F7',
			],
		},
	} satisfies EcosystemConfig;
};
