import ecosystemLogoSvg from '../../svgs/lockquidity.svg';
import { EcosystemConfig, Layer, LiquidityPoolType } from '../config.common';

export const getArbiFluxLockquidityEcosystemConfig = (): EcosystemConfig => {
	// This file defines the complete configuration for the Arbitrum L2 (ArbiFLUX/LOCK) ecosystem.
	// It includes network details, token addresses, smart contract ABIs, and feature flags specific to this chain.
	// This allows the dashboard to dynamically adapt its functionality based on the connected network.
	return {
		lockableTokenFullName: 'ArbiFLUX',
		lockableTokenShortName: 'ArbiFLUX',
		lockableTokenContractAddress: '0x64081252c497FCfeC247a664e9D10Ca8eD71b276',
		lockableSushiSwapL2EthPair: '0xbF719D56c5f19ae0833ADC4080BEfC48A9B415b5',
		lockableSushiSwapL2EthPairSwapPairs: true,

		mintableTokenShortName: 'LOCK',
		mintableTokenContractAddress: '0x454F676D44DF315EEf9B5425178d5a8B524CEa03',
		mintableSushiSwapL2EthPair: '0x0C93A1D3F68a0554d37F3e7AF3a1442a94405E7A',

		marketAddress: '0xe948c8417DD2f8e7dfc88ac3F50b3F89Db7c29Dd',

		failsafeStartBlockNumber: 20959397,
		layer: Layer.Layer2,

		lockableTokenLogoFileName: 'artbiFlux',
		mintableTokenLogoFileName: 'lock',
		timestampGenesis: 1728946539,
		liquidityPoolType: LiquidityPoolType.Uniswap,

		mintableTokenMintPerBlockDivisor: 8,
		mintableTokenPriceDecimals: 8,

		ecosystemLogoSvg,

		lockedLiquidityUniswapAddress: '0xE05E43eE517A6D2862f91Be27315318A8E991FCc',

		minBurnMultiplier: 0.0001,

		// Ordered by LOCK/Month
		marketTopBurningaddresses: [
			'0x199a2Fc79825a3a5843fEF0c38Ad92dd7E00e57e',
			'0x66FC9b2c58ef14B95571B9F2FCD994Db66098EaB',
			'0x30a3509FbD34d30C8581069F8Cdd6D9Db65EDa53',
			'0x618543F369fda50595b60FB98d1c4974E71b55e2',
			'0x9c51CeaB11C88c267ead15E8bDc18cC515640Eae',
			'0x3655450CB4D6A09cAa3Adccb44f8B7de66D9a50c',
			'0xFF97ca9e353D463523E29E21cD5C3285F0F5A15C',
			'0x0aa668366919D2EB60F58Af5E9aCfCC1B296286e',
			'0x62fC30839a188e58Cc127a859F2C305f562F464d',
			'0x45009E579e3e088F8C776dD8873b437c18e2eaf4',
			'0x5e21b59AB51185C16254744Ad6F15062a6165794',
			'0xDD8d2fA999b6C3973c87B98AA1529019dF7d3B1B',
			'0x2D1bAa47DBdb317AC076Bd192F75889424Da44E0',
			'0x7a50e45e3C9487c81ae1393f0751aaDA3ce442cA',
			//@todo add more
		],
	};
};
