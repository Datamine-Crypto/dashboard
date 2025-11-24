import Big from 'big.js';
import BN from 'bn.js';
import { Ecosystem, Layer } from '@/app/configs/config.common';
import { ReducerDispatch } from '@/utils/reducer/sideEffectReducer';
import { SwapToken, SwapTokenWithAmount } from '@/web3/swap/swapOptions';

export type { ReducerDispatch };

/**
 * Represents the lock details for a validator address in the Flux ecosystem.
 * This interface mirrors the `AddressLock` struct in the Flux smart contract.
 */
export interface FluxAddressLock {
	/**
	 * The amount of DAM (Datamine) tokens locked by this address.
	 */
	amount: BN;
	/**
	 * The Ethereum block number when the tokens were initially locked.
	 */
	blockNumber: number;
	/**
	 * The cumulative amount of FLUX tokens burned by this address.
	 * This contributes to the burn multiplier.
	 */
	burnedAmount: BN;
	/**
	 * The Ethereum block number of the last mint operation performed by this address.
	 * Used to calculate unminted blocks.
	 */
	lastMintBlockNumber: number;
	/**
	 * The Ethereum address designated to mint FLUX on behalf of this validator.
	 * Can be the validator's own address or a delegated minter's address.
	 */
	minterAddress: string;
}

/**
 * Provides comprehensive real-time details about a specific Flux address's state and performance.
 * This data is typically fetched from the Flux smart contract's view functions.
 */
export interface FluxAddressDetails {
	/**
	 * The current Ethereum block number at the time of data retrieval.
	 */
	blockNumber: number;
	/**
	 * The current balance of FLUX tokens held by the address.
	 */
	fluxBalance: BN;
	/**
	 * The calculated amount of FLUX tokens available for minting for this address,
	 * considering all bonuses and unminted blocks.
	 */
	mintAmount: BN;
	/**
	 * The time-based multiplier applied to minting rewards (e.g., 1x, 3x).
	 * This is a human-readable, scaled value.
	 */
	addressTimeMultiplier: number;
	/**
	 * The burn-based multiplier applied to minting rewards (e.g., 1x, 10x).
	 * This is a human-readable, scaled value.
	 */
	addressBurnMultiplier: number;
	/**
	 * The raw BigNumber value of the address's time multiplier as returned by the smart contract.
	 */
	addressTimeMultiplierRaw: BN;
	/**
	 * The raw BigNumber value of the address's burn multiplier as returned by the smart contract.
	 */
	addressBurnMultiplierRaw: BN;
	/**
	 * The total amount of DAM tokens locked across all validators in the entire ecosystem.
	 */
	globalLockedAmount: BN;
	/**
	 * The total amount of FLUX tokens burned across all validators in the entire ecosystem.
	 */
	globalBurnedAmount: BN;
}

/**
 * Provides token-specific details for a Flux address, including DAM balance and burn ratios.
 */
export interface FluxAddressTokenDetails {
	/**
	 * The current Ethereum block number at the time of data retrieval.
	 */
	blockNumber: number;
	/**
	 * Indicates if the Flux smart contract is an operator for the address's DAM tokens.
	 * This is required for the `lock` function.
	 */
	isFluxOperator: boolean;
	/**
	 * The current balance of DAM tokens held by the address.
	 */
	damBalance: BN;
	/**
	 * The individual burn-to-locked-DAM ratio for this specific address.
	 * Used in calculating the `addressBurnMultiplier`.
	 */
	myRatio: BN;
	/**
	 * The global average burn-to-locked-DAM ratio across the entire ecosystem.
	 * Used in calculating the `addressBurnMultiplier`.
	 */
	globalRatio: BN;
}

/**
 * Defines the types of modal dialogs that can be displayed within the application.
 * Each type corresponds to a specific user interaction or information display.
 */
export enum DialogType {
	/** Dialog for initiating the locking of DAM tokens to start a validator. */
	LockIn = 'LOCK_IN',
	/** Dialog for minting (claiming) generated FLUX/ArbiFLUX tokens. */
	Mint = 'MINT',
	/** Dialog for burning FLUX/ArbiFLUX tokens to increase burn multiplier. */
	Burn = 'BURN',
	/** Dialog for unlocking (withdrawing) locked DAM tokens from a validator. */
	Unlock = 'UNLOCK',
	/** Dialog displayed when the user has insufficient ETH for a transaction. */
	ZeroEth = 'ZERO_ETH',
	/** Dialog displayed when the user has insufficient DAM for a transaction. */
	ZeroDam = 'ZERO_DAM',
	/** Dialog for performing token swaps (e.g., on Uniswap). */
	Trade = 'TRADE',
	/** Generic dialog for displaying a title and a message. */
	TitleMessage = 'TITLE_MESSAGE',
	/** Dialog related to WalletConnect RPC connection issues or information. */
	WalletConnectRpc = 'WALLET_CONNECT_RPC',
	/** Dialog for client-side application settings. */
	ClientSettings = 'CLIENT_SETTINGS',
	/** Dialog for collecting rewards from the Datamine Market (GameFi). */
	MarketCollectRewards = 'MARKET_COLLECT_REWARDS',
	/** Dialog for depositing or withdrawing tokens from the Datamine Market. */
	MarketDepositWithdraw = 'MARKET_DEPOSIT_WITHDRAW',
	/** Dialog for managing things like delegated minter */
	MintSettings = 'MINT_SETTINGS',
}

export enum Game {
	DatamineGems = 'DatamineGems',
	HodlClicker = 'HodlClicker',
}

/**
 * Defines the primary types of tokens recognized and supported by the application.
 */
export enum Token {
	/** Represents a token that can be minted (e.g., FLUX, ArbiFLUX). */
	Mintable = 'Mintable',
	/** Represents a token that can be locked (e.g., DAM, FLUX for ArbiFLUX). */
	Lockable = 'Lockable',
	/** Ethereum's native cryptocurrency. */
	ETH = 'ETH',
	/** USD Coin stablecoin. */
	USDC = 'USDC',
}

export interface AddressLockDetailsViewModel {
	currentAddress: string;
	mintAmount: BN;
	rewardsAmount: BN;

	/**
	 * This would need to be divided by 10000
	 */
	rewardsPercent: number;

	minBlockNumber: number;
	minBurnAmount: BN;
	isPaused: boolean;

	//lastMintBlockNumber: number;
	//mintPerBlock: BN;

	minterAddress: string;
	//prevBlockMintAmount: BN;
}

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
