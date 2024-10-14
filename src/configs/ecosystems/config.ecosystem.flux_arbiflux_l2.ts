import { EcosystemConfig, Layer, LiquidityPoolType } from "../config.common"

export const getFluxArbiFluxEcosystemConfig = (): EcosystemConfig => {
	return {
		lockableTokenFullName: 'FLUX (L2)',
		lockableTokenShortName: 'FLUX (L2)',
		lockableTokenContractAddress: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df',
		lockableSushiSwapL2EthPair: '0x088f6dcde862781db7b01feb67afd265abbc6d90',

		mintableTokenShortName: 'ArbiFLUX',
		mintableTokenContractAddress: '0x64081252c497fcfec247a664e9d10ca8ed71b276',
		mintableSushiSwapL2EthPair: '0xbF719D56c5f19ae0833ADC4080BEfC48A9B415b5',

		failsafeStartBlockNumber: 13463591,
		layer: Layer.Layer2,

		lockableTokenLogoFileName: 'flux',
		mintableTokenLogoFileName: 'arbiFlux',
		timestampGenesis: 1634936388000,
		liquidityPoolType: LiquidityPoolType.SushiSwap,

		mintableTokenMintPerBlockDivisor: 8,
		mintableTokenPriceDecimals: 8,
	}
}
