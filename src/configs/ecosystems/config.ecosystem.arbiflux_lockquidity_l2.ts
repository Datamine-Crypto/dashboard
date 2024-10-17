import { EcosystemConfig, Layer, LiquidityPoolType } from "../config.common"
import ecosystemLogoSvg from '../../svgs/lockquidity.svg';

export const getArbiFluxLockquidityEcosystemConfig = (): EcosystemConfig => {
	return {
		lockableTokenFullName: 'ArbiFLUX',
		lockableTokenShortName: 'ArbiFLUX',
		lockableTokenContractAddress: '0x64081252c497FCfeC247a664e9D10Ca8eD71b276',
		lockableSushiSwapL2EthPair: '0xbF719D56c5f19ae0833ADC4080BEfC48A9B415b5',
		lockableSushiSwapL2EthPairSwapPairs: true,

		mintableTokenShortName: 'LOCK',
		mintableTokenContractAddress: '0x454F676D44DF315EEf9B5425178d5a8B524CEa03',
		mintableSushiSwapL2EthPair: '0x0C93A1D3F68a0554d37F3e7AF3a1442a94405E7A',

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

		minBurnMultiplier: 0.0001
	}
}
