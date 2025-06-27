import BN from 'bn.js';

/**
 * Represents the lock details for a Flux address.
 */
export interface FluxAddressLock {
	/** The amount of tokens locked. */
	amount: BN;
	/** The block number when the lock occurred. */
	blockNumber: number;
	/** The amount of burned tokens. */
	burnedAmount: BN;
	/** The block number of the last mint operation. */
	lastMintBlockNumber: number;
	/** The address of the minter. */
	minterAddress: string;
}

/**
 * Represents detailed information about a Flux address.
 */
export interface FluxAddressDetails {
	/** The current block number. */
	blockNumber: number;
	/** The balance of Flux tokens. */
	fluxBalance: BN;
	/** The amount available for minting. */
	mintAmount: BN;
	/** Multiplier based on address activity over time. */
	addressTimeMultiplier: number;
	/** Multiplier based on burned tokens from the address. */
	addressBurnMultiplier: number;
	/** Raw BN value of the address time multiplier. */
	addressTimeMultiplierRaw: BN;
	/** Raw BN value of the address burn multiplier. */
	addressBurnMultiplierRaw: BN;
	/** Global total amount of locked tokens. */
	globalLockedAmount: BN;
	/** Global total amount of burned tokens. */
	globalBurnedAmount: BN;
}

/**
 * Represents token-related details for a Flux address.
 */
export interface FluxAddressTokenDetails {
	/** The current block number. */
	blockNumber: number;
	/** Indicates if the address is a Flux operator. */
	isFluxOperator: boolean;
	/** The balance of DAM tokens. */
	damBalance: BN;
	/** The ratio specific to this address. */
	myRatio: BN;
	/** The global ratio. */
	globalRatio: BN;
}

/**
 * Defines the types of dialogs that can be displayed in the application.
 */
export enum DialogType {
	LockIn = 'LOCK_IN',
	Mint = 'MINT',
	Burn = 'BURN',
	Unlock = 'UNLOCK',
	ZeroEth = 'ZERO_ETH',
	ZeroDam = 'ZERO_DAM',
	Trade = 'TRADE',
	TitleMessage = 'TITLE_MESSAGE',
	WalletConnectRpc = 'WALLET_CONNECT_RPC',
	ClientSettings = 'CLIENT_SETTINGS',
	MarketCollectRewards = 'MARKET_COLLECT_REWARDS',
	MarketDepositWithdraw = 'MARKET_DEPOSIT_WITHDRAW',
}

/**
 * Defines the types of tokens supported in the application.
 */
export enum Token {
	Mintable = 'Mintable',
	Lockable = 'Lockable',
	ETH = 'ETH',
	USDC = 'USDC',
}

/**
 * Represents the lock details for a market address.
 */
export interface MarketAddressLock {
	/** The amount of rewards. */
	rewardsAmount: BN;
	/** The percentage of rewards. */
	rewardsPercent: number;
	/** The minimum block number. */
	minBlockNumber: BN;
	/** Indicates if the market is paused. */
	isPaused: boolean;
	/** The minimum burn amount. */
	minBurnAmount: BN;
}
