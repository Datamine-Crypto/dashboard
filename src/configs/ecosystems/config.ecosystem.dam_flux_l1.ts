import ecosystemLogoSvg from '../../svgs/logo.svg';
import { EcosystemConfig, Layer, LiquidityPoolType } from '../config.common';

export const getDamFluxEcosystemConfig = (): EcosystemConfig => {
	// This file defines the complete configuration for the Ethereum Mainnet (L1) ecosystem.
	// It includes network details, token addresses, smart contract ABIs, and feature flags specific to this chain.
	// This allows the dashboard to dynamically adapt its functionality based on the connected network.
	return {
		lockableTokenFullName: 'Datamine (DAM)',
		lockableTokenShortName: 'DAM',
		lockableTokenContractAddress: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df',
		lockableUniswapV3L1EthTokenContractAddress: '0xBd233D685eDE81E00faaEFEbD55150C76778a34e',

		mintableTokenShortName: 'FLUX',
		mintableTokenContractAddress: '0x469eda64aed3a3ad6f868c44564291aa415cb1d9',
		mintableUniswapV3L1EthTokenContractAddress: '0x07aa6584385cca15c2c6e13a5599ffc2d177e33b',

		marketAddress: null, // @todo

		failsafeStartBlockNumber: 10224578,
		layer: Layer.Layer1,

		lockableTokenLogoFileName: 'dam',
		mintableTokenLogoFileName: 'flux',
		timestampGenesis: 1591626738000,
		liquidityPoolType: LiquidityPoolType.Uniswap,

		mintableTokenMintPerBlockDivisor: 8,
		mintableTokenPriceDecimals: 4,

		ecosystemLogoSvg,

		minBurnMultiplier: 1,

		marketTopBurningaddresses: [], //@todo
	};
};
