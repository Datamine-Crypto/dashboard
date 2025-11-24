import Big from 'big.js';
import BN from 'bn.js';
import { Ecosystem, Layer } from '@/core/app/configs/config.common';
import {
	AddressLockDetailsViewModel,
	DialogType,
	FluxAddressDetails,
	FluxAddressLock,
	FluxAddressTokenDetails,
	Game,
	Token,
} from '@/core/app/interfaces';
import { ReducerDispatch } from '@/core/utils/reducer/sideEffectReducer';
import { SwapToken, SwapTokenWithAmount } from '@/core/web3/swap/swapOptions';

export {
	DialogType,
	Game,
	Token,
	type AddressLockDetailsViewModel,
	type FluxAddressDetails,
	type FluxAddressLock,
	type FluxAddressTokenDetails,
	type ReducerDispatch,
};

/**
 * Enum for wallet connection methods.
 */
export enum ConnectionMethod {
	MetaMask = 'MetaMask',
	WalletConnect = 'WalletConnect',
}

/**
 * Interfaces for Uniswap reserve data.
 */
interface UniswapReservesDam {
	dam: BN;
	eth: BN;
	ethPrice: Big;
	damPrice: Big;
}
interface UniswapReservesFlux {
	flux: BN;
	eth: BN;
	ethPrice: Big;
	fluxPrice: Big;
}
interface UniswapReservesUsdcEth {
	usdc: BN;
	eth: BN;
}

/**
 * Enum for forecasting multiplier types.
 */
export enum ForecastMultiplierType {
	Burn = 'Burn',
	LockIn = 'LockIn',
}

/**
 * State for the forecasting calculator.
 */
export interface ForecastSettings {
	enabled: boolean;
	amount: BN;
	blocks: number;

	forecastBurn: number;
	forecastBurnAmount: string;

	forecastTime: number;
	forecastTimeAmount: string;

	forecastAmount: string;
	forecastBlocks: string;
	forecastStartBlocks: string;

	forecastFluxPrice: string;
	alreadyMintedBlocks: number;
}

/**
 * State for user's on-chain balances.
 */
export interface Balances {
	damToken: BN;
	fluxToken: BN;
	eth: BN | null;
	fluxTotalSupply: BN;
	damTotalSupply: BN;
	uniswapDamTokenReserves: UniswapReservesDam;
	uniswapFluxTokenReserves: UniswapReservesFlux;
	uniswapUsdcEthTokenReserves: UniswapReservesUsdcEth;
	arbitrumBridgeBalance: BN;

	/**
	 * We'll add this to balances so we can override global FLUX price
	 */
	forecastFluxPrice: string;

	lockedLiquidtyUniTotalSupply: BN;
	lockedLiquidityUniAmount: BN;
}

/**
 * State for client-side settings, persisted in localStorage.
 */
export interface ClientSettings {
	priceMultiplier: number;
	priceMultiplierAmount: string;
	useEip1559: boolean;
	currency: string;
}

/**
 * State for the token swap interface.
 */
export interface SwapState {
	input: SwapTokenWithAmount;
	output: SwapTokenWithAmount;
}

/**
 * State for all swappable token balances across different layers.
 */
export interface SwapTokenBalances {
	[Layer.Layer1]: {
		[SwapToken.DAM]: BN;
		[SwapToken.FLUX]: BN;
		[SwapToken.ETH]: BN;
	};
	[Layer.Layer2]: {
		[SwapToken.ArbiFLUX]: BN;
		[SwapToken.FLUX]: BN;
		[SwapToken.LOCK]: BN;
		[SwapToken.ETH]: BN;
	};
}

/**
 * State for all market addresses.
 */
export interface MarketAddresses {
	targetBlock: number;
	addresses: AddressLockDetailsViewModel[];
}

/**
 * State for the Datamine Gems GameFi feature.
 */
export interface MarketDetails {
	gemAddresses: {
		[Ecosystem.Flux]: string[];
		[Ecosystem.ArbiFlux]: string[];
		[Ecosystem.Lockquidity]: string[];
	};
	gemsCollected: {
		count: 0;
		sumDollarAmount: 0;
	};
}
