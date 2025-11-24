import BN from 'bn.js';
import { getEcosystemConfig } from '@/core/app/configs/config';
import { Ecosystem, NetworkType } from '@/core/app/configs/config.common';
import { HelpArticle } from '@/core/app/helpArticles';
import { devLog } from '@/core/utils/devLog';
import { ReducerQuery } from '@/core/utils/reducer/sideEffectReducer';
import Web3 from 'web3';
import {
	ConnectionMethod,
	Game,
	Balances,
	FluxAddressLock,
	FluxAddressDetails,
	FluxAddressTokenDetails,
	DialogType,
	SwapState,
	SwapTokenBalances,
	MarketAddresses,
	MarketDetails,
} from '@/core/app/interfaces';

const getDefaultEcosystem = () => {
	const targetEcosystem = localStorage.getItem('targetEcosystem');
	if (targetEcosystem) {
		return targetEcosystem as Ecosystem;
	}

	// Default to Lockquidity on the first visit.
	// If You are on L1 then it'll auto-fix to Flux (see handling of commonLanguage.queries.FindWeb3Instance)
	return Ecosystem.Lockquidity;
};

const defaultEcosystem = getDefaultEcosystem();

const config = getEcosystemConfig(defaultEcosystem);

const priceMultiplierAmount = localStorage.getItem('clientSettingsPriceMultiplierAmount')
	? (localStorage.getItem('clientSettingsPriceMultiplierAmount') as string)
	: '1.00';
const currency = localStorage.getItem('clientSettingsCurrency')
	? (localStorage.getItem('clientSettingsCurrency') as string)
	: 'USD';
const useEip1559 =
	!localStorage.getItem('clientSettingsUseEip1559') || localStorage.getItem('clientSettingsUseEip1559') === 'true';

const getHelpArticlesNetworkType = () => {
	const defaultHelpArticlesNetworkType = config.isArbitrumOnlyToken ? NetworkType.Arbitrum : NetworkType.Mainnet;
	const helpArticlesNetworkType =
		localStorage.getItem('helpArticlesNetworkType') && !config.isArbitrumOnlyToken
			? (localStorage.getItem('helpArticlesNetworkType') as NetworkType)
			: defaultHelpArticlesNetworkType;

	return helpArticlesNetworkType;
};

const helpArticlesNetworkType = getHelpArticlesNetworkType();

const getCustomMarketAddresses = () => {
	const defaultCustomMarketAddresses = {
		[Ecosystem.Flux]: [],
		[Ecosystem.ArbiFlux]: [],
		[Ecosystem.Lockquidity]: [],
	};

	const marketGemAddressesJson = localStorage.getItem('marketGemAddresses');
	if (!marketGemAddressesJson) {
		return defaultCustomMarketAddresses;
	}
	try {
		const customAddresses = JSON.parse(marketGemAddressesJson);
		return customAddresses;
	} catch (err) {
		devLog('defaultCustomMarketAddresses parse error:', err);
		return defaultCustomMarketAddresses;
	}
};

const getMarketGemsCollected = () => {
	const defaultMarketGemsCollected = {
		count: 0,
		sumDollarAmount: 0,
	};

	const marketGemsCollectedJson = localStorage.getItem('marketGemsCollected');
	if (!marketGemsCollectedJson) {
		return defaultMarketGemsCollected;
	}
	try {
		const marketGemsCollected = JSON.parse(marketGemsCollectedJson);
		return marketGemsCollected;
	} catch (err) {
		devLog('marketGemsCollected parse error:', err);
		return defaultMarketGemsCollected;
	}
};

export const initialState = {
	pendingQueries: [] as ReducerQuery[],
	forecastSettings: {
		amount: new BN(0),
		enabled: false,
		blocks: 0,

		forecastBurn: 0,
		forecastBurnAmount: '0',

		forecastTime: 0,
		forecastTimeAmount: '0',

		forecastAmount: '0',
		forecastBlocks: '0',
		forecastStartBlocks: '0',
		forecastFluxPrice: '',
		alreadyMintedBlocks: 0,
	},
	isInitialized: false,
	isDisplayingLinks: false,
	hasWeb3: null as boolean | null,
	balances: null as Balances | null,
	selectedAddress: null as string | null,
	address: null as string | null,
	error: null as string | null,

	addressLock: null as FluxAddressLock | null,
	addressDetails: null as FluxAddressDetails | null,
	addressTokenDetails: null as FluxAddressTokenDetails | null,
	dialog: null as DialogType | null,
	dialogParams: undefined as any,

	query: undefined as ReducerQuery[] | undefined,
	queriesCount: 0,
	lastDismissedPendingActionCount: 0,

	isIncorrectNetwork: false,
	isLate: false,

	searchQuery: '',

	/**
	 * These will come from fuse.js search
	 */
	helpArticles: [] as HelpArticle[],
	helpArticle: null as HelpArticle | null,
	helpArticlesNetworkType,

	isMobileDrawerOpen: false,
	connectionMethod: ConnectionMethod.MetaMask,
	ecosystem: defaultEcosystem,
	targetEcosystem: null as Ecosystem | null,

	walletConnectRpc: null as string | null,
	clientSettings: {
		priceMultiplier: parseFloat(priceMultiplierAmount),
		priceMultiplierAmount,
		currency,
		useEip1559,
	},

	lastAccountRefreshTimestampMs: 0,

	swapState: {
		input: {
			swapToken: null,
			amount: '',
		},
		output: {
			swapToken: null,
			amount: '',
		},
	} as SwapState,
	swapTokenBalances: null as SwapTokenBalances | null,
	lastSwapThrottle: null as number | null,

	//@todo merge these into market: {}
	//marketAddressLock: null,
	currentAddresMintableBalance: null as BN | null,
	//urrentAddressMarketAddressLock: null,

	games: {
		[Game.DatamineGems]: {
			marketAddresses: null as MarketAddresses | null,
			totalContractRewardsAmount: null as BN | null,
			totalContractLockedAmount: null as BN | null,
		},
		[Game.HodlClicker]: {
			marketAddresses: null as MarketAddresses | null,
			totalContractRewardsAmount: null as BN | null,
			totalContractLockedAmount: null as BN | null,
		},
	},

	market: {
		gemAddresses: getCustomMarketAddresses(),
		gemsCollected: getMarketGemsCollected(),
	} as MarketDetails,

	// By default Datamine Gems will be selected as the game, the UI will change the game on selection and update this variable
	game: Game.DatamineGems,
	web3: undefined as Web3 | undefined,
};

export type AppState = typeof initialState;
