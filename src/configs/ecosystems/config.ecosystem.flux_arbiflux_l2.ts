import ecosystemLogoSvg from '../../svgs/arbiFluxLogo.svg';
import { EcosystemConfig, Layer, LiquidityPoolType } from '../config.common';

export const getFluxArbiFluxEcosystemConfig = () => {
	// This file defines the complete configuration for the Arbitrum L2 (FLUX/ArbiFLUX) ecosystem.
	// It includes network details, token addresses, smart contract ABIs, and feature flags specific to this chain.
	// This allows the dashboard to dynamically adapt its functionality based on the connected network.
	return {
		lockableTokenFullName: 'FLUX (L2)',
		lockableTokenShortName: 'FLUX (L2)',
		lockableTokenContractAddress: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df',
		lockableSushiSwapL2EthPair: '0x088f6dcde862781db7b01feb67afd265abbc6d90',

		mintableTokenShortName: 'ArbiFLUX',
		mintableTokenContractAddress: '0x64081252c497fcfec247a664e9d10ca8ed71b276',
		mintableSushiSwapL2EthPair: '0xbF719D56c5f19ae0833ADC4080BEfC48A9B415b5',

		marketAddress: '0x65fD37023d5E66eB37a84242ABE3F05063051B59',

		failsafeStartBlockNumber: 13463591,
		layer: Layer.Layer2,

		lockableTokenLogoFileName: 'flux',
		mintableTokenLogoFileName: 'arbiFlux',
		timestampGenesis: 1634936388000,
		liquidityPoolType: LiquidityPoolType.SushiSwap,

		mintableTokenMintPerBlockDivisor: 8,
		mintableTokenPriceDecimals: 8,

		ecosystemLogoSvg,

		minBurnMultiplier: 1,

		marketTopBurningaddresses: [
			'0x7Bf1CA964Cb69D7A8D3D9A80E26FBfb5cE96B113',
			'0x66FC9b2c58ef14B95571B9F2FCD994Db66098EaB',
			'0x618543F369fda50595b60FB98d1c4974E71b55e2',
			'0x13970606b124AddC795CE116d41607adD20fFEBc',
			'0x45009E579e3e088F8C776dD8873b437c18e2eaf4',
			'0x29Df1Bd05dd83611E2F9DbFBfBAEADcC67C073f8',
			//@todo add more
		],
	} satisfies EcosystemConfig;
};
