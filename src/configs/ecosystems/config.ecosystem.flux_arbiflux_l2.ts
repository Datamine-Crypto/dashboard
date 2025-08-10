import ecosystemLogoSvg from '../../svgs/arbiFluxLogo.svg';
import { EcosystemConfig, Layer, LiquidityPoolType } from '../config.common';

/**
 * Provides the complete configuration for the Arbitrum L2 (FLUX/ArbiFLUX) ecosystem.
 * This configuration includes network details, token addresses, smart contract ABIs, and feature flags
 * specific to this blockchain, allowing the dashboard to dynamically adapt its functionality.
 * @returns An `EcosystemConfig` object tailored for the FLUX/ArbiFLUX L2 ecosystem.
 */
export const getFluxArbiFluxEcosystemConfig = () => {
	return {
		// Full and short names for the lockable token (FLUX L2)
		lockableTokenFullName: 'FLUX (L2)',
		lockableTokenShortName: 'FLUX (L2)',
		// Contract address for the lockable token
		lockableTokenContractAddress: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df',
		// Sushiswap L2 ETH pair address for FLUX
		lockableSushiSwapL2EthPair: '0x088f6dcde862781db7b01feb67afd265abbc6d90',

		// Short name for the mintable token (ArbiFLUX)
		mintableTokenShortName: 'ArbiFLUX',
		// Contract address for the mintable token
		mintableTokenContractAddress: '0x64081252c497fcfec247a664e9d10ca8ed71b276',
		// Sushiswap L2 ETH pair address for ArbiFLUX
		mintableSushiSwapL2EthPair: '0xbF719D56c5f19ae0833ADC4080BEfC48A9B415b5',

		// Market contract address for Time-in-Market (TIM)
		marketAddress: '0x65fD37023d5E66eB37a84242ABE3F05063051B59',

		// Block number at which the failsafe limit for token lock-up begins
		failsafeStartBlockNumber: 13463591,
		// Blockchain layer (Layer 2 for Arbitrum)
		layer: Layer.Layer2,

		// File names for token logos in the public/logos folder
		lockableTokenLogoFileName: 'flux',
		mintableTokenLogoFileName: 'arbiFlux',
		// Genesis timestamp for minting
		timestampGenesis: 1634936388000,
		// Primary liquidity pool type for this ecosystem
		liquidityPoolType: LiquidityPoolType.SushiSwap,

		// Mint per block divisor from the smart contract
		mintableTokenMintPerBlockDivisor: 8,
		// Number of decimal places for displaying mintable token prices
		mintableTokenPriceDecimals: 8,

		// SVG asset for the ecosystem logo
		ecosystemLogoSvg,

		// Minimum burn multiplier
		minBurnMultiplier: 1,

		// Top burning addresses for this ecosystem
		marketTopBurningaddresses: [
			'0x66FC9b2c58ef14B95571B9F2FCD994Db66098EaB',
			'0x618543F369fda50595b60FB98d1c4974E71b55e2',
			'0x45009E579e3e088F8C776dD8873b437c18e2eaf4',
			'0x29Df1Bd05dd83611E2F9DbFBfBAEADcC67C073f8',
			'0x3c633795872589b460160d0661626bec057f2eED',
			//@todo add more
		],
	} satisfies EcosystemConfig;
};
