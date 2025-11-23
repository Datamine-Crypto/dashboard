import Big from 'big.js';
import BN from 'bn.js';
import Web3 from 'web3';
import { Ecosystem, Layer, NetworkType } from '@/core/configs/config.common';
import { HelpArticle } from '@/core/web3/helpArticles';
import {
	AddressLockDetailsViewModel,
	DialogType,
	FluxAddressDetails,
	FluxAddressLock,
	FluxAddressTokenDetails,
	Game,
	Token,
} from '@/core/interfaces';
import { ReducerQuery } from '@/core/web3/sideEffectReducer';
import { SwapToken, SwapTokenWithAmount } from '@/core/web3/utils/swap/swapOptions';
import { commonLanguage } from '@/core/web3/reducer/common';

export {
	DialogType,
	Game,
	Token,
	type AddressLockDetailsViewModel,
	type FluxAddressDetails,
	type FluxAddressLock,
	type FluxAddressTokenDetails,
};

type Commands = typeof commonLanguage.commands;
type Queries = typeof commonLanguage.queries;

/**
 * A utility type to recursively get all possible dot-notation paths of an object's keys.
 */
type RecursiveKeyOf<TObj extends object> = {
	[TKey in keyof TObj & (string | number)]: TObj[TKey] extends object
		? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
		: `${TKey}`;
}[keyof TObj & (string | number)];

type CommandType = RecursiveKeyOf<Commands>;
type QueryType = RecursiveKeyOf<Queries>;

// Augment the existing interfaces to be more specific for this reducer
declare module '../sideEffectReducer' {
	interface ReducerCommand {
		type: CommandType;
	}
	interface ReducerQuery {
		type: QueryType;
	}
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

/**
 * The main state shape for the entire Web3 context.
 */
export interface Web3State {
	forecastSettings: ForecastSettings;
	isInitialized: boolean;
	isDisplayingLinks: boolean;
	hasWeb3: boolean | null;
	web3?: Web3;

	error: string | null;

	selectedAddress: string | null;
	balances: Balances | null;
	addressLock: FluxAddressLock | null;
	addressDetails: FluxAddressDetails | null;
	addressTokenDetails: FluxAddressTokenDetails | null;

	dialog: DialogType | null;
	dialogParams?: any;

	pendingQueries: ReducerQuery[];
	query?: ReducerQuery[];
	queriesCount: number;
	lastDismissedPendingActionCount: number;

	address: string | null;

	isIncorrectNetwork: boolean;
	isLate: boolean;

	searchQuery: string;

	/**
	 * Currently opened help article
	 */
	helpArticle: HelpArticle | null;
	helpArticles: HelpArticle[];
	helpArticlesNetworkType: NetworkType;

	isMobileDrawerOpen: boolean;
	connectionMethod: ConnectionMethod;

	walletConnectRpc: string | null;

	clientSettings: ClientSettings;

	/**
	 * Keeps track of last time we called account refresh (we'll rate limit this to ensure we don't call refreshing multiple times in a row)
	 */
	lastAccountRefreshTimestampMs: number;

	ecosystem: Ecosystem;

	/**
	 * What is the ecosystem the user is trying to target? (Usually with ecosystem dropdown)
	 */
	targetEcosystem: Ecosystem | null;

	swapState: SwapState;

	/**
	 * All swap token balances are kept separate from balances
	 * This allows us to keep track of them separately. For example you might switch layers but remember the balances from the old layer
	 */
	swapTokenBalances: SwapTokenBalances | null;

	lastSwapThrottle: number | null;

	//marketAddressLock: MarketAddressLock | null;
	//currentAddressMarketAddressLock: MarketAddressLock | null;

	/**
	 * What is unminted balance of currently selected address? (We use this in deposit dialog to prefill/see how much you can deposit)
	 */
	currentAddresMintableBalance: BN | null;

	games: {
		[Game.DatamineGems]: {
			/**
			 * All the addresses participating in the current game
			 */
			marketAddresses: MarketAddresses | null;

			/**
			 * @todo remove Not used in this game
			 */
			totalContractRewardsAmount: BN | null;
			/**
			 * @todo remove Not used in this game
			 */
			totalContractLockedAmount: BN | null;
		};
		[Game.HodlClicker]: {
			/**
			 * All the addresses participating in the current game
			 */
			marketAddresses: MarketAddresses | null;

			/**
			 * @todo Keeps track of total balance (rewards + locked)
			 */
			totalContractRewardsAmount: BN | null;

			/**
			 * @todo Keeps track of locked balance (just locked)
			 */
			totalContractLockedAmount: BN | null;
		};
	};

	market: MarketDetails;
	game: Game;
}
