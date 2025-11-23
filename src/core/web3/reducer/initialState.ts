import BN from 'bn.js';
import { getEcosystemConfig } from '@/configs/config';
import { Ecosystem, NetworkType } from '@/configs/config.common';
import { HelpArticle } from '@/core/helpArticles';
import { devLog } from '@/core/utils/devLog';
import { ConnectionMethod, Game, AppState } from '@/core/web3/reducer/interfaces';

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

export const initialState: AppState = {
	pendingQueries: [],
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
	hasWeb3: null,
	balances: null,
	selectedAddress: null,
	address: null,
	error: null,

	addressLock: null,
	addressDetails: null,
	addressTokenDetails: null,
	dialog: null,

	queriesCount: 0,
	lastDismissedPendingActionCount: 0,

	isIncorrectNetwork: false,
	isLate: false,

	searchQuery: '',

	/**
	 * These will come from fuse.js search
	 */
	helpArticles: [] as HelpArticle[],
	helpArticle: null,
	helpArticlesNetworkType,

	isMobileDrawerOpen: false,
	connectionMethod: ConnectionMethod.MetaMask,
	ecosystem: defaultEcosystem,
	targetEcosystem: null,

	walletConnectRpc: null,
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
	},
	swapTokenBalances: null,
	lastSwapThrottle: null,

	//@todo merge these into market: {}
	//marketAddressLock: null,
	currentAddresMintableBalance: null,
	//urrentAddressMarketAddressLock: null,

	games: {
		[Game.DatamineGems]: {
			marketAddresses: null,
			totalContractRewardsAmount: null,
			totalContractLockedAmount: null,
		},
		[Game.HodlClicker]: {
			marketAddresses: null,
			totalContractRewardsAmount: null,
			totalContractLockedAmount: null,
		},
	},

	market: {
		gemAddresses: getCustomMarketAddresses(),
		gemsCollected: getMarketGemsCollected(),
	},

	// By default Datamine Gems will be selected as the game, the UI will change the game on selection and update this variable
	game: Game.DatamineGems,
};
