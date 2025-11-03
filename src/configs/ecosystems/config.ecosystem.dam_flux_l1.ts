import { Game } from '../../core/interfaces';
import ecosystemLogoSvg from '../../svgs/logo.svg';
import { EcosystemConfig, Layer, LiquidityPoolType } from '../config.common';

/**
 * Provides the complete configuration for the Ethereum Mainnet (L1) ecosystem.
 * This configuration includes network details, token addresses, smart contract ABIs, and feature flags
 * specific to this blockchain, allowing the dashboard to dynamically adapt its functionality.
 * @returns An `EcosystemConfig` object tailored for the DAM/FLUX L1 ecosystem.
 */
export const getDamFluxEcosystemConfig = () => {
	return {
		// Full and short names for the lockable token (Datamine DAM)
		lockableTokenFullName: 'Datamine (DAM)',
		lockableTokenShortName: 'DAM',
		// Contract address for the lockable token
		lockableTokenContractAddress: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df',
		// Uniswap V3 L1 ETH pair address for DAM
		lockableUniswapV3L1EthTokenContractAddress: '0xBd233D685eDE81E00faaEFEbD55150C76778a34e',

		// Short name for the mintable token (FLUX)
		mintableTokenShortName: 'FLUX',
		// Contract address for the mintable token
		mintableTokenContractAddress: '0x469eda64aed3a3ad6f868c44564291aa415cb1d9',
		// Uniswap V3 L1 ETH pair address for FLUX
		mintableUniswapV3L1EthTokenContractAddress: '0x07aa6584385cca15c2c6e13a5599ffc2d177e33b',

		// Market contract address for Time-in-Market (TIM) - currently null for L1
		marketAddress: null, // @todo

		// Hodl Clicker: Rush game address
		gameHodlClickerAddress: null,

		// Batch Minter Address
		batchMinterAddress: '0x5B4A0d18eBE4f0d2929c5B4D56b555990d62707B',

		// Block number at which the failsafe limit for token lock-up begins
		failsafeStartBlockNumber: 10224578,
		// Blockchain layer (Layer 1 for Ethereum Mainnet)
		layer: Layer.Layer1,

		// File names for token logos in the public/logos folder
		lockableTokenLogoFileName: 'dam',
		mintableTokenLogoFileName: 'flux',
		// Genesis timestamp for minting
		timestampGenesis: 1591626738000,
		// Primary liquidity pool type for this ecosystem
		liquidityPoolType: LiquidityPoolType.Uniswap,

		// Mint per block divisor from the smart contract
		mintableTokenMintPerBlockDivisor: 8,
		// Number of decimal places for displaying mintable token prices
		mintableTokenPriceDecimals: 4,

		// SVG asset for the ecosystem logo
		ecosystemLogoSvg,

		// Minimum burn multiplier
		minBurnMultiplier: 1,

		// Top burning addresses for this ecosystem - currently empty for L1
		marketTopBurningaddresses: {
			[Game.DatamineGems]: [],
			[Game.HodlClicker]: [],
		},
	} satisfies EcosystemConfig;
};
