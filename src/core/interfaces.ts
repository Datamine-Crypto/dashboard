import BN from 'bn.js';

/**
 * @interface FluxAddressLock
 * @description Represents the lock details for a validator address in the Flux ecosystem.
 * This interface mirrors the `AddressLock` struct in the Flux smart contract.
 */
export interface FluxAddressLock {
	/**
	 * @property {BN} amount
	 * @description The amount of DAM (Datamine) tokens locked by this address.
	 */
	amount: BN;
	/**
	 * @property {number} blockNumber
	 * @description The Ethereum block number when the tokens were initially locked.
	 */
	blockNumber: number;
	/**
	 * @property {BN} burnedAmount
	 * @description The cumulative amount of FLUX tokens burned by this address.
	 * This contributes to the burn multiplier.
	 */
	burnedAmount: BN;
	/**
	 * @property {number} lastMintBlockNumber
	 * @description The Ethereum block number of the last mint operation performed by this address.
	 * Used to calculate unminted blocks.
	 */
	lastMintBlockNumber: number;
	/**
	 * @property {string} minterAddress
	 * @description The Ethereum address designated to mint FLUX on behalf of this validator.
	 * Can be the validator's own address or a delegated minter's address.
	 */
	minterAddress: string;
}

/**
 * @interface FluxAddressDetails
 * @description Provides comprehensive real-time details about a specific Flux address's state and performance.
 * This data is typically fetched from the Flux smart contract's view functions.
 */
export interface FluxAddressDetails {
	/**
	 * @property {number} blockNumber
	 * @description The current Ethereum block number at the time of data retrieval.
	 */
	blockNumber: number;
	/**
	 * @property {BN} fluxBalance
	 * @description The current balance of FLUX tokens held by the address.
	 */
	fluxBalance: BN;
	/**
	 * @property {BN} mintAmount
	 * @description The calculated amount of FLUX tokens available for minting for this address,
	 * considering all bonuses and unminted blocks.
	 */
	mintAmount: BN;
	/**
	 * @property {number} addressTimeMultiplier
	 * @description The time-based multiplier applied to minting rewards (e.g., 1x, 3x).
	 * This is a human-readable, scaled value.
	 */
	addressTimeMultiplier: number;
	/**
	 * @property {number} addressBurnMultiplier
	 * @description The burn-based multiplier applied to minting rewards (e.g., 1x, 10x).
	 * This is a human-readable, scaled value.
	 */
	addressBurnMultiplier: number;
	/**
	 * @property {BN} addressTimeMultiplierRaw
	 * @description The raw BigNumber value of the address's time multiplier as returned by the smart contract.
	 */
	addressTimeMultiplierRaw: BN;
	/**
	 * @property {BN} addressBurnMultiplierRaw
	 * @description The raw BigNumber value of the address's burn multiplier as returned by the smart contract.
	 */
	addressBurnMultiplierRaw: BN;
	/**
	 * @property {BN} globalLockedAmount
	 * @description The total amount of DAM tokens locked across all validators in the entire ecosystem.
	 */
	globalLockedAmount: BN;
	/**
	 * @property {BN} globalBurnedAmount
	 * @description The total amount of FLUX tokens burned across all validators in the entire ecosystem.
	 */
	globalBurnedAmount: BN;
}

/**
 * @interface FluxAddressTokenDetails
 * @description Provides token-specific details for a Flux address, including DAM balance and burn ratios.
 */
export interface FluxAddressTokenDetails {
	/**
	 * @property {number} blockNumber
	 * @description The current Ethereum block number at the time of data retrieval.
	 */
	blockNumber: number;
	/**
	 * @property {boolean} isFluxOperator
	 * @description Indicates if the Flux smart contract is an operator for the address's DAM tokens.
	 * This is required for the `lock` function.
	 */
	isFluxOperator: boolean;
	/**
	 * @property {BN} damBalance
	 * @description The current balance of DAM tokens held by the address.
	 */
	damBalance: BN;
	/**
	 * @property {BN} myRatio
	 * @description The individual burn-to-locked-DAM ratio for this specific address.
	 * Used in calculating the `addressBurnMultiplier`.
	 */
	myRatio: BN;
	/**
	 * @property {BN} globalRatio
	 * @description The global average burn-to-locked-DAM ratio across the entire ecosystem.
	 * Used in calculating the `addressBurnMultiplier`.
	 */
	globalRatio: BN;
}

/**
 * @enum DialogType
 * @description Defines the types of modal dialogs that can be displayed within the application.
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
}

export enum Game {
	DatamineGems = 'DatamineGems',
	HodlClicker = 'HodlClicker',
}

/**
 * @enum Token
 * @description Defines the primary types of tokens recognized and supported by the application.
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
