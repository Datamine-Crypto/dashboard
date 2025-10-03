import Big from 'big.js';
import BN from 'bn.js';
import { v4 as uuidv4 } from 'uuid';
import Web3 from 'web3';
import { getEcosystemConfig } from '../../configs/config';
import { Ecosystem, Layer, NetworkType } from '../../configs/config.common';
import { HelpArticle } from '../helpArticles';
import {
	DialogType,
	FluxAddressDetails,
	FluxAddressLock,
	FluxAddressTokenDetails,
	Game,
	MarketAddressLock,
	Token,
} from '../interfaces';
import { Gem } from '../react/elements/Fragments/DatamineGemsGame';
import { ReducerCommand, ReducerQuery, ReducerQueryHandler } from '../sideEffectReducer';
import copyToClipBoard from '../utils/copyToClipboard';
import { devLog } from '../utils/devLog';
import { availableSwapTokens } from '../utils/swap/performSwap';
import { SwapOperation, SwapQuote, SwapToken, SwapTokenWithAmount } from '../utils/swap/swapOptions';
import { BNToDecimal, getPriceToggle, parseBN } from './helpers';

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
 * State for an address in the Datamine Market.
 */
export interface MarketAddress {
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
 * State for all market addresses.
 */
export interface MarketAddresses {
	targetBlock: number;
	addresses: MarketAddress[];
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

	//currentAddresMintableBalance: BN | null;
	marketAddresses: MarketAddresses | null;

	market: MarketDetails;
	game: Game;
}

/**
 * A factory function to create a `withQueries` helper, which simplifies adding new queries to the state.
 * @param state - The current state.
 * @returns A function that takes an array of queries and returns an object to be merged into the new state.
 */
const createWithWithQueries = (state: any) => {
	const withQueries = (queries: ReducerQuery[]) => {
		const queriesWithIds = queries.map((query) => {
			return {
				...query,
				id: uuidv4(),
			};
		});

		return {
			query: queriesWithIds,
			queriesCount: state.queriesCount + queries.length,
		};
	};
	return withQueries;
};

//const config = getConfig()

const localConfig = {
	/**
	 * Make sure we don't refresh accounts more than X miliseconds between each call (for thottling)
	 */
	throttleAccountRefreshMs: 2000,
};

/**
 * Handles responses from asynchronous queries executed by Web3Bindings.
 * It updates the state based on the success or failure of the query.
 * @param state - The current state.
 * @param payload - The query response payload, containing the original query, error (if any), and response data.
 * @returns The new state.
 */
const handleQueryResponse = ({ state, payload }: ReducerQueryHandler<Web3State>) => {
	const { query, err, response } = payload;

	const config = getEcosystemConfig(state.ecosystem);

	const withQueries = createWithWithQueries(state);

	switch (query.type) {
		case commonLanguage.queries.FindWeb3Instance: {
			if (err) {
				devLog('FindWeb3Instance reducer err:', { err, message: (err as any).message });
				return {
					...state,
					hasWeb3: false,
				};
			}

			const { web3, selectedAddress, networkType, chainId, useWalletConnect } = response;

			const isArbitrumMainnet = chainId === 42161;
			devLog('FindWeb3Instance reducer isArbitrumMainnet:', {
				networkType,
				chainId,
				isArbitrumMainnet,
				ecosystem: state.ecosystem,
				targetEcosystem: state.targetEcosystem,
			});

			/**
			 * Possibly override the current ecosystem once we figure out what network we're on
			 * For example if we're on L1 and last known ecosystem selected was L2 then change it to L1 and user doesn't have to refresh anything
			 * @todo the ecosystems are hard-coded here just change it to have some setting for which ecosystem is "default" for that layer (or pick first one from the layers)
			 */
			const getUpdatedEcosystem = (ecosystem: Ecosystem) => {
				const ecosystemConfig = getEcosystemConfig(ecosystem);
				// Default to Flux (L1) if not on Arbitrum
				if (ecosystemConfig.layer == Layer.Layer2 && !isArbitrumMainnet) {
					return Ecosystem.Flux;
				}
				// Default to Lockquidity (L2) if  on Arbitrum
				if (ecosystemConfig.layer == Layer.Layer1 && isArbitrumMainnet) {
					return Ecosystem.Lockquidity;
				}

				// Return whatever user selected last
				return ecosystem;
			};
			const updatedEcosystem = !state.targetEcosystem
				? getUpdatedEcosystem(state.ecosystem)
				: getUpdatedEcosystem(state.targetEcosystem);

			const isUnsupportedNetwork = config.isArbitrumOnlyToken && !isArbitrumMainnet;

			if ((networkType !== 'main' && chainId !== 1) || isUnsupportedNetwork) {
				// private is for cloudflare RPC. chainId 1 is Ehtereum Mainnet (others is BSC for example)

				if (!isArbitrumMainnet || isUnsupportedNetwork) {
					return {
						...state,
						isIncorrectNetwork: true,
					};
				}
			}

			return {
				...state,
				web3,
				hasWeb3: true,
				selectedAddress,
				connectionMethod: useWalletConnect ? ConnectionMethod.WalletConnect : ConnectionMethod.MetaMask,
				isArbitrumMainnet,
				ecosystem: updatedEcosystem,
				...withQueries(
					selectedAddress
						? [
								{ type: commonLanguage.queries.FindAccountState, payload: { updateEthBalance: true } },
								{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse },
							]
						: [{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse }]
				),
			};
		}
		case commonLanguage.queries.EnableWeb3:
		case commonLanguage.queries.EnableWalletConnect: {
			if (err) {
				return state;
			}

			const { selectedAddress } = response;

			const connectionMethod =
				query.type === commonLanguage.queries.EnableWeb3 ? ConnectionMethod.MetaMask : ConnectionMethod.WalletConnect;

			return {
				...state,
				selectedAddress,
				connectionMethod,
				...withQueries(
					selectedAddress
						? [{ type: commonLanguage.queries.FindAccountState, payload: { updateEthBalance: true } }]
						: []
				),
			};
		}
		case commonLanguage.queries.FindAccountState: {
			if (err) {
				console.log('FindAccountState Error:', err);

				return {
					...state,
					isLate: true,
				};
			}

			const {
				balances,
				swapTokenBalances,
				selectedAddress,
				addressLock,
				addressDetails,
				addressTokenDetails,
				//marketAddressLock,
				//currentAddressMarketAddressLock,
				//currentAddresMintableBalance,
			} = response;

			const getBlancesWithForecasting = () => {
				if (!balances) {
					return balances;
				}
				return {
					...balances,
					forecastFluxPrice: state.forecastSettings.forecastFluxPrice,
				};
			};

			return {
				...state,
				isLate: false,
				balances: getBlancesWithForecasting(),
				selectedAddress,
				addressLock,
				addressDetails,
				addressTokenDetails,
				swapTokenBalances,
				//marketAddressLock,
				//currentAddressMarketAddressLock,
				//currentAddresMintableBalance,
			};
		}
		case commonLanguage.queries.GetLockInDamTokensResponse: {
			if (err) {
				return {
					...state,
					error: err,
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}
		case commonLanguage.queries.GetMintFluxResponse: {
			if (err) {
				return {
					...state,
					error: err,
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}
		case commonLanguage.queries.GetBurnFluxResponse:
		case commonLanguage.queries.Market.GetDepositMarketResponse:
		case commonLanguage.queries.Market.GetWithdrawMarketResponse: {
			if (err) {
				if ((err as any).message) {
					return {
						...state,
						error: (err as any).message,
					};
				}
				return {
					...state,
					error: err,
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}
		case commonLanguage.queries.Market.GetMarketBurnFluxResponse: {
			if (err) {
				if ((err as any).message) {
					return {
						...state,
						error: (err as any).message,
					};
				}
				return {
					...state,
					error: err,
				};
			}

			if (!response) {
				return {
					...state,
					// Don't close dialog
					...withQueries([
						{ type: commonLanguage.queries.FindAccountState },
						{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse },
					]),
				};
			}

			const { gems }: { gems: Gem[] } = response;

			const totalDollarAmountOfGems = gems.reduce((total, gem) => total + gem.dollarAmount, 0);

			const gemsCollected = {
				count: state.market.gemsCollected.count + gems.length,
				sumDollarAmount: state.market.gemsCollected.sumDollarAmount + totalDollarAmountOfGems,
			};

			localStorage.setItem('marketGemsCollected', JSON.stringify(gemsCollected));

			return {
				...state,
				// Don't close dialog
				...withQueries([
					{ type: commonLanguage.queries.FindAccountState },
					{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse },
				]),
				market: {
					...state.market,
					gemsCollected,
				},
			};
		}
		case commonLanguage.queries.Market.GetRefreshMarketAddressesResponse: {
			if (err) {
				if ((err as any).message) {
					return {
						...state,
						error: (err as any).message,
					};
				}
				return {
					...state,
					error: err,
				};
			}

			if (!response) {
				return state;
			}

			const { marketAddresses } = response;

			return {
				...state,
				marketAddresses,
			};
		}
		case commonLanguage.queries.GetTradeResponse: {
			if (err) {
				return {
					...state,
					error: err,
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}
		case commonLanguage.queries.GetUnlockDamTokensResponse: {
			if (err) {
				return {
					...state,
					error: err,
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}

		case commonLanguage.queries.GetAuthorizeFluxOperatorResponse: {
			if (err) {
				return state;
			}

			return {
				...state,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}

		case commonLanguage.queries.PerformSearch: {
			return {
				...state,
				helpArticles: response,
			};
		}
		case commonLanguage.queries.GetFullHelpArticle: {
			return {
				...state,
				helpArticle: response,
			};
		}
		case commonLanguage.queries.Swap.GetOutputQuote: {
			if (err) {
				return {
					...state,
					error: err,
				};
			}

			// If we get an empty response, don't update the output. This is useful for throttling
			if (!response) {
				return state;
			}

			const swapQuote = response as SwapQuote;

			console.log('swapQuote:', swapQuote);
			return {
				...state,
				//BNToDecimal(
				swapState: {
					...state.swapState,
					output: {
						...state.swapState.output,
						amount: `${BNToDecimal(new BN(swapQuote.out.minAmount))}`,
					},
				},
			};
		}
	}
	return state;
};

/**
 * Handles synchronous commands dispatched by the UI or other parts of the application.
 * It updates the state and can queue new queries to be executed by Web3Bindings.
 * @param state - The current state.
 * @param command - The command to be executed.
 * @returns The new state.
 */
const handleCommand = (state: Web3State, command: ReducerCommand) => {
	const withQueries = createWithWithQueries(state);

	const config = getEcosystemConfig(state.ecosystem);

	const getForecastAmount = (payload: string, defaultAmount: string, removePeriod: boolean = false) => {
		const getAmount = () => {
			const getTrimmedZerosAmount = () => {
				const amount = payload as string;
				if (amount.indexOf('.') === -1) {
					return amount.replace(/^0+/, '');
				}
				return amount;
			};

			const amount = getTrimmedZerosAmount();
			if (amount === '..') {
				return '0';
			}
			if (amount.endsWith('.') && removePeriod) {
				return amount.slice(0, -1);
			}

			return amount;
		};
		const amount = getAmount().replace('/[^0-9.]+/g', '');

		if (!amount) {
			return '0';
		}
		if (amount === '.') {
			return '0.';
		}

		if (!`${amount}0`.match(/^\d*(\.\d+)?$/) || amount.length > 27) {
			// 27 = max supply + 18 digits + period
			return defaultAmount;
		}

		return amount;
	};

	const getSwapTokenBalance = (swapToken: SwapToken | null) => {
		if (!state.swapTokenBalances) {
			return null;
		}

		switch (swapToken) {
			case SwapToken.LOCK:
				return BNToDecimal(state.swapTokenBalances[Layer.Layer2][SwapToken.LOCK] ?? null);
			case SwapToken.FLUX:
				return BNToDecimal(state.swapTokenBalances[Layer.Layer2][SwapToken.FLUX] ?? null);
			case SwapToken.ArbiFLUX:
				return BNToDecimal(state.swapTokenBalances[Layer.Layer2][SwapToken.ArbiFLUX] ?? null);
			case SwapToken.ETH:
				return BNToDecimal(state.balances?.eth ?? null);
		}
	};
	const getFlipSwapState = () => {
		return {
			...state,
			swapState: {
				input: {
					...state.swapState.input,
					swapToken: state.swapState.output.swapToken,
				},
				output: {
					...state.swapState.output,
					amount: '...',
					swapToken: state.swapState.input.swapToken,
				},
			},
			error: null,

			...withQueries([{ type: commonLanguage.queries.Swap.GetOutputQuote }]),
		};
	};

	/**
	 * When showing the trade window (or chaning a token in the trade window) we want to change the ecosysetem
	 * The change is required because we pull in balances & liquidity for that specific ecosystem
	 */
	const getSwapTokenEcosystem = (swapToken: SwapToken) => {
		const availableSwapToken = availableSwapTokens.find(
			(availableSwapToken) => availableSwapToken.swapToken === swapToken
		);

		// If we are switching to ETH then we don't need to change ecosystem
		if (!availableSwapToken || !availableSwapToken.ecosystem) {
			return state.ecosystem;
		}

		const stateEcosystemConfig = getEcosystemConfig(state.ecosystem);
		const newEcosystemConfig = getEcosystemConfig(availableSwapToken.ecosystem);

		// We don't want to change the ecosystem right away (this will be handled on page reload after user selects to swap network)
		if (stateEcosystemConfig.layer != newEcosystemConfig.layer) {
			return state.ecosystem;
		}

		return newEcosystemConfig.ecosystem;
	};

	switch (command.type) {
		case commonLanguage.commands.UpdateEcosystem: {
			const { ecosystem: newEcosystem } = command.payload;

			const stateEcosystemConfig = getEcosystemConfig(state.ecosystem);
			const newEcosystemConfig = getEcosystemConfig(newEcosystem);
			console.log('stateEcosystemConfig:', stateEcosystemConfig, 'newEcosystemConfig:', newEcosystemConfig);

			// We don't want to change the ecosystem right away (this will be handled on page reload after user selects to swap network)
			if (stateEcosystemConfig.layer != newEcosystemConfig.layer) {
				return state;
			}

			return {
				...state,
				ecosystem: newEcosystem,
				forecastSettings: {
					...state.forecastSettings,
					enabled: false,
				},
			};
		}
		case commonLanguage.commands.QueueQueries: {
			const { queries } = command.payload;

			return {
				...state,
				pendingQueries: [...state.pendingQueries, ...queries],
			};
		}
		case commonLanguage.commands.UpdateAddress: {
			const { address } = command.payload;

			if (address === state.address) {
				return state;
			}

			return {
				...state,
				isLate: false,
				dialog: null,
				forecastSettings: {
					...state.forecastSettings,
					enabled: false, // Disable forecasting calculator when address changes
				},
				address, // Update current selected address
				...withQueries([{ type: commonLanguage.queries.FindAccountState, payload: { updateEthBalance: false } }]),
			};
		}

		case commonLanguage.commands.RefreshAccountState: {
			const { updateEthBalance, closeDialog, forceRefresh = false } = command.payload ?? ({} as any);

			// Apply throttling (only if we're not refreshing ETH balance. ETH balance updates usually happen at important times so think of it like "forced refresh")
			const currentTimestampMs = Date.now();
			if (
				!updateEthBalance &&
				currentTimestampMs < state.lastAccountRefreshTimestampMs + localConfig.throttleAccountRefreshMs &&
				!forceRefresh
			) {
				return state;
			}

			const { web3 } = state;
			if (!web3) {
				return state;
			}

			// Make sure we can't queue double blocks find
			if (
				state.pendingQueries.findIndex(
					(pendingQuery) => pendingQuery.type === commonLanguage.queries.FindAccountState
				) >= 0
			) {
				return state;
			}

			return {
				...state,
				isLate: false,
				dialog: closeDialog ? null : state.dialog,
				lastAccountRefreshTimestampMs: currentTimestampMs,
				...withQueries([
					{ type: commonLanguage.queries.FindAccountState, payload: { updateEthBalance } },
					{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse, payload: {} },
				]),
			};
		}
		case commonLanguage.commands.ConnectToWallet:
			return {
				...state,
				...withQueries([{ type: commonLanguage.queries.EnableWeb3 }]),
			};

		case commonLanguage.commands.ClientSettings.SetUseEip1559: {
			const useEip1559 = command.payload;

			localStorage.setItem('clientSettingsUseEip1559', command.payload.toString());

			return {
				...state,
				clientSettings: {
					...state.clientSettings,
					useEip1559,
				},
			};
		}

		case commonLanguage.commands.ClientSettings.SetPriceMultiplier: {
			try {
				const priceMultiplierAmount = getForecastAmount(
					command.payload,
					state.clientSettings.priceMultiplierAmount,
					false
				);

				const priceMultiplier = parseFloat(
					getForecastAmount(command.payload, state.clientSettings.priceMultiplierAmount, true)
				);
				if (priceMultiplier > 100000) {
					return state;
				}

				localStorage.setItem('clientSettingsPriceMultiplierAmount', priceMultiplierAmount);

				return {
					...state,
					clientSettings: {
						...state.clientSettings,
						priceMultiplier,
						priceMultiplierAmount,
					},
				};
			} catch (err) {
				return state;
			}
		}
		case commonLanguage.commands.ClientSettings.SetCurrency: {
			const currency = command.payload;
			localStorage.setItem('clientSettingsCurrency', currency);

			return {
				...state,
				clientSettings: {
					...state.clientSettings,
					currency,
				},
			};
		}
		case commonLanguage.commands.ToggleForecastMode: {
			if (!state.addressLock || !state.addressDetails) {
				return state;
			}

			const isLocked = !state.addressLock.amount.isZero();

			const getLockAmount = () => {
				if (!state.addressLock || !isLocked) {
					return new BN('1000').mul(new BN(10).pow(new BN(18)));
				}
				return state.addressLock.amount;
			};
			const lockAmount = getLockAmount();

			const getUnmintedBlocks = () => {
				if (!state.addressDetails || !state.addressLock || !isLocked) {
					return 31 * 24 * 60 * (60 / 12); // 1 Month default
				}
				return state.addressDetails.blockNumber - state.addressLock.lastMintBlockNumber;
			};
			const unmintedBlocks = getUnmintedBlocks();

			const forecastAmount = new Big(lockAmount.toString(10)).div(new Big(10).pow(18));
			const blocks = unmintedBlocks;
			const forecastBlocks = isLocked ? 0 : blocks.toString();
			const forecastStartBlocks = (
				state.addressLock.amount.isZero()
					? 0
					: (state.addressDetails.blockNumber - state.addressLock.lastMintBlockNumber) * -1
			).toString();
			const forecastBurn = isLocked ? state.addressDetails.addressBurnMultiplier : 10000;
			const forecastTime = isLocked ? state.addressDetails.addressTimeMultiplier : 30000;

			const forecastBurnAmount = (forecastBurn / 10000).toFixed(4);
			const forecastTimeAmount = (forecastTime / 10000).toFixed(4);

			const alreadyMintedBlocks = state.addressLock.lastMintBlockNumber - state.addressDetails.blockNumber;

			const enabled = !state.forecastSettings.enabled;

			const getForecastFluxPrice = () => {
				if (!state.balances || !enabled) {
					return '';
				}
				return getPriceToggle({
					value: new BN(10).pow(new BN(18)),
					inputToken: Token.Mintable,
					outputToken: Token.USDC,
					balances: state.balances,
					round: config.mintableTokenPriceDecimals,
				});
			};

			const forecastFluxPrice = getForecastFluxPrice();

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					enabled,
					amount: lockAmount,
					forecastAmount,
					forecastBlocks,
					forecastStartBlocks,
					blocks,
					forecastBurn,
					forecastBurnAmount,
					forecastTime,
					forecastTimeAmount,
					forecastFluxPrice,
					alreadyMintedBlocks,
				},
				balances: {
					...state.balances,
					forecastFluxPrice: '',
				},
			};
		}
		case commonLanguage.commands.ForecastSetBurn: {
			const forecastBurn = command.payload as number;
			const forecastBurnAmount = (forecastBurn / 10000).toFixed(4);
			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastBurn,
					forecastBurnAmount,
				},
			};
		}
		case commonLanguage.commands.ForecastSetBurnAmount: {
			const maxBurn = 10000 * config.maxBurnMultiplier;
			const forecastBurnAmountNumberRaw = Math.round(
				parseFloat(getForecastAmount(command.payload, state.forecastSettings.forecastBurnAmount, true)) * 10000
			);
			const forecastBurn = Math.max(10000, Math.min(maxBurn, forecastBurnAmountNumberRaw));

			const getForecastBurnAmount = () => {
				if (forecastBurnAmountNumberRaw < 10000 || forecastBurnAmountNumberRaw > maxBurn) {
					return (forecastBurn / 10000).toFixed(4);
				}

				return getForecastAmount(command.payload, state.forecastSettings.forecastBurnAmount, false);
			};
			const forecastBurnAmount = getForecastBurnAmount();

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastBurn,
					forecastBurnAmount,
				},
			};
		}
		case commonLanguage.commands.ForecastSetTime: {
			const forecastTime = command.payload as number;
			const forecastTimeAmount = (forecastTime / 10000).toFixed(4);

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastTime,
					forecastTimeAmount,
				},
			};
		}

		case commonLanguage.commands.ForecastSetTimeAmount: {
			const forecastTimeAmountNumberRaw = Math.round(
				parseFloat(getForecastAmount(command.payload, state.forecastSettings.forecastTimeAmount, true)) * 10000
			);
			const forecastTime = Math.max(10000, Math.min(100000, forecastTimeAmountNumberRaw));

			const getForecastTimeAmount = () => {
				if (forecastTimeAmountNumberRaw < 10000 || forecastTimeAmountNumberRaw > 100000) {
					return (forecastTime / 10000).toFixed(4);
				}

				return getForecastAmount(command.payload, state.forecastSettings.forecastTimeAmount, false);
			};
			const forecastTimeAmount = getForecastTimeAmount();

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastTime,
					forecastTimeAmount,
				},
			};
		}
		case commonLanguage.commands.ForecastSetBlocks: {
			const forecastBlocks = command.payload;

			const blocks = Math.max(0, parseInt(forecastBlocks) - parseInt(state.forecastSettings.forecastStartBlocks));

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastBlocks,
					blocks,
				},
			};
		}
		case commonLanguage.commands.ForecastSetStartBlocks: {
			const forecastStartBlocks = command.payload;

			const blocks = Math.max(0, parseInt(state.forecastSettings.forecastBlocks) - parseInt(forecastStartBlocks));

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastStartBlocks,
					blocks,
				},
			};
		}

		case commonLanguage.commands.ForecastSetAmount: {
			const forecastAmount = getForecastAmount(command.payload, state.forecastSettings.forecastAmount, false);
			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastAmount,
					amount: new Big(
						getForecastAmount(command.payload, state.forecastSettings.forecastAmount, true).toString()
					).mul(new Big(10).pow(18)),
				},
			};
		}

		case commonLanguage.commands.ForecastSetFluxPrice: {
			const forecastFluxPrice = getForecastAmount(command.payload, state.forecastSettings.forecastFluxPrice, false);
			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastFluxPrice,
				},
				balances: {
					...state.balances,
					forecastFluxPrice,
				},
			};
		}

		case commonLanguage.commands.Initialize: {
			const { address } = command.payload;
			if (state.isInitialized) {
				return state;
			}

			return {
				...state,
				isInitialized: true,
				address,
				...withQueries([{ type: commonLanguage.queries.FindWeb3Instance }]),
			};
		}
		//This is how we can do RPC selection
		/*case commonLanguage.commands.ShowWalletConnectRpc:
			return {
				...state,
				dialog: DialogType.WalletConnectRpc
			}*/
		case commonLanguage.commands.ShowWalletConnectRpc:
		case commonLanguage.commands.InitializeWalletConnect: {
			const { isArbitrumMainnet } = command.payload;

			/*const rpcAddress = (command.payload.rpcAddress as string).trim();

			if (!rpcAddress || rpcAddress.indexOf('wss://') === -1 && rpcAddress.indexOf('http://') === -1 && rpcAddress.indexOf('https://') === -1) {
				return {
					...state,
					error: 'Must be a valid Mainnet Ethereum RPC Endpoint'
				}
			}

			if (localStorage) {
				localStorage.setItem('walletConnectRpc', rpcAddress)
			}*/

			//@todo figure out if we still need this hasWeb3 logic

			/*
			if (state.hasWeb3) {

				return {
					...state,
					isArbitrumMainnet,
					dialog: null,
					error: null,
					...withQueries([{ type: commonLanguage.queries.EnableWalletConnect, payload: { isArbitrumMainnet } }])
				}
			}*/

			//web3provider = await getProvider({ useWalletConnect: false, isArbitrumMainnet: false, ecosystem: state.ecosystem })
			return {
				...state,
				isArbitrumMainnet,
				dialog: null,
				error: null,
				...withQueries([{ type: commonLanguage.queries.FindWeb3Instance, payload: { useWalletConnect: true } }]),
			};
		}
		case commonLanguage.commands.ReinitializeWeb3: {
			const { targetEcosystem } = command.payload;

			return {
				...state,
				targetEcosystem,
				forecastSettings: {
					...state.forecastSettings,
					enabled: false,
				},
				error: null,
				...withQueries([
					{
						type: commonLanguage.queries.FindWeb3Instance,
						payload: { targetEcosystem, useWalletConnect: state.connectionMethod === ConnectionMethod.WalletConnect },
					},
				]),
			};
		}
		case commonLanguage.commands.DisconnectFromWalletConnect:
			return {
				...state,
				...withQueries([{ type: commonLanguage.queries.DisconnectWalletConnect }]),
			};
		case commonLanguage.commands.DisplayAccessLinks:
			if (state.isDisplayingLinks) {
				//return state;
			}

			return {
				...state,
				isDisplayingLinks: true,
				...withQueries([{ type: commonLanguage.queries.FindAccessLinks }]),
			};

		case commonLanguage.commands.AuthorizeFluxOperator:
			if (state.balances?.damToken?.isZero()) {
				return {
					...state,
					dialog: DialogType.ZeroDam,
				};
			}
			if (state.balances?.eth?.isZero()) {
				return {
					...state,
					dialog: DialogType.ZeroEth,
				};
			}
			return {
				...state,
				...withQueries([{ type: commonLanguage.queries.GetAuthorizeFluxOperatorResponse }]),
			};
		case commonLanguage.commands.UnlockDamTokens:
			return {
				...state,
				error: null,
				...withQueries([{ type: commonLanguage.queries.GetUnlockDamTokensResponse }]),
			};
		case commonLanguage.commands.DismissPendingAction:
			return {
				...state,
				lastDismissedPendingActionCount: state.queriesCount,
			};
		case commonLanguage.commands.LockInDamTokens: {
			try {
				const { amount, minterAddress } = command.payload;

				const amountBN = parseBN(amount);

				return {
					...state,
					error: null,
					...withQueries([
						{ type: commonLanguage.queries.GetLockInDamTokensResponse, payload: { amount: amountBN, minterAddress } },
					]),
				};
			} catch (err) {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.MintFluxTokens: {
			const { sourceAddress, targetAddress, blockNumber } = command.payload;

			return {
				...state,
				error: null,
				...withQueries([
					{ type: commonLanguage.queries.GetMintFluxResponse, payload: { sourceAddress, targetAddress, blockNumber } },
				]),
			};
		}

		case commonLanguage.commands.CopyAnalytics: {
			const { balances, addressLock, addressDetails, addressTokenDetails } = state;
			if (!balances || !addressLock || !addressDetails || !addressTokenDetails) {
				return state;
			}
			try {
				const clipboardState = {
					address: state.selectedAddress,
					balances: {
						dam: balances.damToken.toString(10),
						flux: balances.fluxToken.toString(10),
					},
					addressLock: {
						amount: addressLock.amount.toString(10),
						blockNumber: addressLock.blockNumber,
						burnedAmount: addressLock.burnedAmount.toString(10),
						lastMintBlockNumber: addressLock.lastMintBlockNumber,
						minterAddress: addressLock.minterAddress,
					},
					addressDetails: {
						blockNumber: addressDetails.blockNumber,
						fluxBalance: addressDetails.fluxBalance.toString(),
						mintAmount: addressDetails.mintAmount.toString(),
						addressTimeMultiplier: addressDetails.addressTimeMultiplier,
						addressBurnMultiplier: addressDetails.addressBurnMultiplier,
						addressTimeMultiplierRaw: addressDetails.addressTimeMultiplierRaw,
						addressBurnMultiplierRaw: addressDetails.addressBurnMultiplierRaw,
						globalLockedAmount: addressDetails.globalLockedAmount.toString(),
						globalBurnedAmount: addressDetails.globalBurnedAmount.toString(),
					},
					addressTokenDetails: {
						blockNumber: addressTokenDetails.blockNumber,
						isFluxOperator: addressTokenDetails.isFluxOperator,
						damBalance: addressTokenDetails.damBalance.toString(),
						myRatio: addressTokenDetails.myRatio.toString(),
						globalRatio: addressTokenDetails.globalRatio.toString(),
					},
				};
				copyToClipBoard(JSON.stringify(clipboardState));
			} catch (error) {
				console.log(error);
				alert('Failed copying to clipboard. (Check console error log)');
			}
			return state;
		}
		case commonLanguage.commands.ShowDialog: {
			const { dialog, dialogParams } = command.payload;

			return {
				...state,
				error: null,
				dialog,
				dialogParams,
			};
		}
		case commonLanguage.commands.CloseDialog: {
			return {
				...state,
				error: null,
				dialog: null,
			};
		}
		case commonLanguage.commands.DismissError: {
			return {
				...state,
				error: null,
			};
		}
		case commonLanguage.commands.BurnFluxTokens: {
			const { amount, address } = command.payload;

			try {
				const amountBN = parseBN(amount);

				return {
					...state,
					error: null,
					...withQueries([
						{ type: commonLanguage.queries.GetBurnFluxResponse, payload: { amount: amountBN, address } },
					]),
				};
			} catch (err) {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}

		// We can specify which game to open and show a dilog in the same state change
		case commonLanguage.commands.Market.ShowGameDialog: {
			const { game } = command.payload;

			return {
				...state,
				error: null,
				game,
				dialog: DialogType.MarketCollectRewards,
			};
		}
		case commonLanguage.commands.Market.AddGemAddress: {
			const { address } = command.payload;

			const ecosystemAddresses = state.market.gemAddresses[state.ecosystem];

			// Don't add duplicate addresses
			if (ecosystemAddresses.some((ecosystemAddress) => ecosystemAddress === address)) {
				return state;
			}

			const newecosystemAddresses = [...ecosystemAddresses, address];

			const gemAddresses = {
				...state.market.gemAddresses,
				[state.ecosystem]: newecosystemAddresses,
			};

			localStorage.setItem('marketGemAddresses', JSON.stringify(gemAddresses));

			return {
				...state,
				market: {
					...state.market,
					gemAddresses,
				},
			};
		}
		case commonLanguage.commands.Market.MarketBurnFluxTokens: {
			const { amountToBurn, gems } = command.payload;

			try {
				/*if (!state.marketAddressLock) {
					return state;
				}*/

				return {
					...state,
					error: null,
					...withQueries([
						{ type: commonLanguage.queries.Market.GetMarketBurnFluxResponse, payload: { amountToBurn, gems } },
					]),
				};
			} catch (err: any) {
				if (err && err.message) {
					switch (err.message) {
						case commonLanguage.errors.Market.AmountExceedsMaxAddressMintable:
							return {
								...state,
								error: err.toString(),
							};
					}
				}
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Market.DepositTokens: {
			const { amount, address } = command.payload;

			try {
				const amountBN = parseBN(amount);

				/*if (!state.marketAddressLock) {
					return state;
				}*/

				if (amountBN.lte(new BN(0))) {
					throw new Error(commonLanguage.errors.MustExceedZero);
				}

				return {
					...state,
					error: null,
					...withQueries([
						{ type: commonLanguage.queries.Market.GetDepositMarketResponse, payload: { amount: amountBN, address } },
					]),
				};
			} catch (err: any) {
				console.log('err1:', err);
				if (err && err.message) {
					switch (err.message) {
						case commonLanguage.errors.Market.AmountExceedsMaxAddressMintable:
							console.log('err2:', err);
							return {
								...state,
								error: err.toString(),
							};
					}
				}
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Market.WithdrawTokens: {
			try {
				return {
					...state,
					error: null,
					...withQueries([{ type: commonLanguage.queries.Market.GetWithdrawMarketResponse, payload: {} }]),
				};
			} catch (err: any) {
				if (err && err.message) {
					switch (err.message) {
						case commonLanguage.errors.Market.AmountExceedsMaxAddressMintable:
							return {
								...state,
								error: err.toString(),
							};
					}
				}
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Market.RefreshMarketAddresses: {
			try {
				if (!state.web3) {
					return state;
				}

				return {
					...state,
					error: null,
					...withQueries([{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse, payload: {} }]),
				};
			} catch (err: any) {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Swap.Trade: {
			try {
				return {
					...state,
					error: null,
					...withQueries([{ type: commonLanguage.queries.GetTradeResponse, payload: {} }]),
				};
			} catch (err) {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Swap.ShowTradeDialog: {
			const { input } = command.payload;

			const getInput = () => {
				if (!input || !input.swapToken || input === '0') {
					return {
						swapToken: null,
						amount: '',
					};
				}

				const inputTokenBalance = getSwapTokenBalance(input.swapToken);

				// If we don't have any of this token, most likely the person wants to buy it so inverse the swap and prefill ETH amount
				if (inputTokenBalance === '0') {
					return {
						swapToken: SwapToken.ETH,
						amount: '', // We don't want to prefill ETH amount, let user enter it getSwapTokenBalance(SwapToken.ETH)
					};
				}

				return {
					swapToken: input.swapToken,
					amount: inputTokenBalance,
				};
			};
			const inputState = getInput();

			const getOutput = () => {
				if (inputState.swapToken === SwapToken.ETH && input && input.swapToken) {
					return {
						swapToken: input.swapToken,
						amount: '...',
					};
				}

				return {
					swapToken: SwapToken.ETH,
					amount: '...',
				};
			};

			const outputState = getOutput();

			const ecosystem = getSwapTokenEcosystem(
				inputState.swapToken === SwapToken.ETH ? outputState.swapToken : inputState.swapToken
			);

			return {
				...state,
				ecosystem,
				error: null,
				dialog: DialogType.Trade,
				dialogParams: {},
				swapState: {
					input: inputState,
					output: outputState,
				},

				...withQueries([{ type: commonLanguage.queries.Swap.GetOutputQuote }]),
			};
		}
		case commonLanguage.commands.Swap.ResetThottleGetOutputQuote: {
			return {
				...state,
				lastSwapThrottle: null,

				...withQueries([{ type: commonLanguage.queries.Swap.GetOutputQuote }]),
			};
		}
		case commonLanguage.commands.Swap.SetAmount: {
			const { amount } = command.payload;

			/**
			 * Every time the amount is updated we'll queue an update but it'll be throttled
			 * This means every new amount update (ex: key stroke) will reset the update timer
			 * After a while ResetThrottleGetOutputQuote() above will be called and the actual quote executed
			 */
			const withGetOutputQuote = () => {
				return {
					lastSwapThrottle: Date.now(),

					...withQueries([{ type: commonLanguage.queries.Swap.ThrottleGetOutputQuote }]),
				};
			};
			const newAmount = getForecastAmount(amount, state.swapState.input.amount);

			// No update necessary (Ex: invalid chartacters were stripped)
			if (newAmount === state.swapState.input.amount) {
				return state;
			}

			return {
				...state,
				swapState: {
					...state.swapState,
					input: {
						...state.swapState.input,
						amount: newAmount,
					},
				},
				error: null,

				...withGetOutputQuote(),
			};
		}
		case commonLanguage.commands.Swap.SetToken: {
			const { swapOperation, swapToken } = command.payload;

			switch (swapOperation) {
				case SwapOperation.Input: {
					if (swapToken === state.swapState.output.swapToken) {
						return getFlipSwapState();
					}

					const inputToken = swapToken;
					const outputToken = swapToken === SwapToken.ETH ? state.swapState.input.swapToken : SwapToken.ETH;

					const ecosystem = getSwapTokenEcosystem(swapToken);

					return {
						...state,
						ecosystem,
						swapState: {
							...state.swapState,
							input: {
								...state.swapState.input,
								swapToken: inputToken,
							},
							output: {
								...state.swapState.output,
								swapToken: outputToken,
							},
						},
						error: null,

						...withQueries([{ type: commonLanguage.queries.Swap.GetOutputQuote }]),
					};
				}

				case SwapOperation.Output: {
					if (swapToken === state.swapState.input.swapToken) {
						return getFlipSwapState();
					}

					const inputToken = swapToken === SwapToken.ETH ? state.swapState.output.swapToken : SwapToken.ETH;
					const outputToken = swapToken;

					const ecosystem = getSwapTokenEcosystem(swapToken);

					return {
						...state,
						ecosystem,
						swapState: {
							...state.swapState,
							input: {
								...state.swapState.input,
								swapToken: inputToken,
							},
							output: {
								...state.swapState.output,
								swapToken: outputToken,
							},
						},
						error: null,

						...withQueries([{ type: commonLanguage.queries.Swap.GetOutputQuote }]),
					};
				}
			}

			return state;
		}
		case commonLanguage.commands.Swap.FlipSwap: {
			return getFlipSwapState();
		}
		case commonLanguage.commands.SetSearch: {
			const searchQuery = command.payload;

			return {
				...state,
				searchQuery,
				...withQueries([{ type: commonLanguage.queries.PerformSearch, payload: { searchQuery } }]),
			};
		}
		case commonLanguage.commands.ShowHelpArticle: {
			const { helpArticle } = command.payload;

			const { helpArticlesNetworkType } = state;

			return {
				...state,
				searchQuery: '',
				...withQueries([
					{ type: commonLanguage.queries.GetFullHelpArticle, payload: { helpArticle, helpArticlesNetworkType } },
				]),
			};
		}
		case commonLanguage.commands.CloseHelpArticle:
			return {
				...state,
				helpArticle: null,
			};
		case commonLanguage.commands.OpenDrawer:
			return {
				...state,
				isMobileDrawerOpen: true,
			};
		case commonLanguage.commands.CloseDrawer:
			return {
				...state,
				isMobileDrawerOpen: false,
			};
		case commonLanguage.commands.SetHelpArticlesNetworkType: {
			const helpArticlesNetworkType = command.payload as NetworkType;

			localStorage.setItem('helpArticlesNetworkType', helpArticlesNetworkType.toString());

			return {
				...state,
				helpArticlesNetworkType,
				...withQueries([{ type: commonLanguage.queries.ResetHelpArticleBodies }]),
			};
		}
	}
	return state;
};

// Notice things are taken from localStorage here

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
		console.log('defaultCustomMarketAddresses parse error:', err);
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
		console.log('marketGemsCollected parse error:', err);
		return defaultMarketGemsCollected;
	}
};

const initialState: Web3State = {
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
	//currentAddresMintableBalance: null,
	//urrentAddressMarketAddressLock: null,
	marketAddresses: null,

	market: {
		gemAddresses: getCustomMarketAddresses(),
		gemsCollected: getMarketGemsCollected(),
	},

	// By default Datamine Gems will be selected as the game, the UI will change the game on selection and update this variable
	game: Game.DatamineGems,
} as const;

// This reducer manages the core Web3 state and orchestrates interactions with the blockchain.
// It implements a "Commands & Queries" pattern:
// - 'commonLanguage' actions represent user intentions or system events (commands/queries).
// - 'pendingQueries' holds requests that need to be processed asynchronously by Web3Bindings.
// This separation ensures state updates are pure and side effects are handled externally.
const commonLanguage = {
	commands: {
		QueueQueries: 'QUEUE_QUERIES',

		Initialize: 'INITIALIZE',
		ConnectToWallet: 'CONNECT_TO_WALLET',
		RefreshAccountState: 'REFRESH_ACCOUNT_STATE',
		UpdateAddress: 'UPDATE_ADDRESS',
		AuthorizeFluxOperator: 'AUTHORIZE_FLUX_OPERATOR',
		LockInDamTokens: 'LOCK_IN_DAM_TOKENS',
		MintFluxTokens: 'MINT_FLUX_TOKENS',
		ShowDialog: 'SHOW_DIALOG',
		CloseDialog: 'CLOSE_DIALOG',
		DismissError: 'DISMISS_ERROR',
		BurnFluxTokens: 'BURN_FLUX_TOKENS',
		UnlockDamTokens: 'UNLOCK_DAM_TOKENS',
		DismissPendingAction: 'DISMISS_PENDING_ACTION',
		CopyAnalytics: 'COPY_ANALYTICS',
		DisplayAccessLinks: 'DISPLAY_ACCESS_LINKS',

		ToggleForecastMode: 'TOGGLE_FORECAST_MODE',
		ForecastSetAmount: 'TOGGLE_SET_AMOUNT',
		ForecastSetBlocks: 'TOGGLE_SET_BLOCKS',
		ForecastSetStartBlocks: 'TOGGLE_SET_START_BLOCKS',
		ForecastSetBurn: 'TOGGLE_SET_BURN',
		ForecastSetBurnAmount: 'FORECAST_SET_BURN_AMOUNT',
		ForecastSetTime: 'TOGGLE_SET_TIME',
		ForecastSetTimeAmount: 'FORECAST_SET_TIME_AMOUNT',
		ForecastSetFluxPrice: 'FORECAST_SET_FLUX_PRICE',

		SetSearch: 'SET_SEARCH',
		ShowHelpArticle: 'SHOW_HELP_ARTICLE',
		CloseHelpArticle: 'CLOSE_HELP_ARTICLE',
		SetHelpArticlesNetworkType: 'SET_HELP_ARTICLES_NETWORK_TYPE',

		CloseDrawer: 'CLOSE_DRAWER',
		OpenDrawer: 'OPEN_DRAWER',
		InitializeWalletConnect: 'INITIALIZE_WALLET_CONNECT',
		DisconnectFromWalletConnect: 'DISCONNECT_FROM_WALLETCONNECT',
		ShowWalletConnectRpc: 'SHOW_WALLETCONNECT_RPC',

		ClientSettings: {
			SetPriceMultiplier: 'CLIENT_SETTINGS_SET_PRICE_MULTIPLIER',
			SetUseEip1559: 'SET_USE_EIP1559',
			SetCurrency: 'SET_CURRENCY',
		},

		UpdateEcosystem: 'UPDATE_ECOSYSTEM',
		/**
		 * Sometimes we want to re-initialzie web3 specifically when changing networks (Ex: ETH->Arbitrum)
		 * When initializing web3 on different network, we properly update current ecosystem (Ex: Changing DAM L1->LOCK L2)
		 */
		ReinitializeWeb3: 'REINITILIZE_WEB3',

		Swap: {
			Trade: 'SWAP:TRADE',
			SetAmount: 'SWAP:SET_AMOUNT',
			SetToken: 'SWAP:SET_TOKEN',
			ShowTradeDialog: 'SWAP:SHOW_TRADE_DIALOG',
			FlipSwap: 'SWAP:FLIP',
			ResetThottleGetOutputQuote: 'SWAP:RESET_THROTTLE_GET_OUTPUT_QUOTE',
		},

		Market: {
			MarketBurnFluxTokens: 'MARKET_BURN_FLUX_TOKENS',
			DepositTokens: 'MARKET_DEPOSIT_TOKENS',
			WithdrawTokens: 'MARKET_WITHDRAW_TOKENS',
			RefreshMarketAddresses: 'MARKET_REFRESH_MARKET_ADDRESSES',
			AddGemAddress: 'MARKET_ADD_GEM_ADDRESS',
			ShowGameDialog: 'SHOW_GAME_DIALOG',
		},
	},
	queries: {
		FindWeb3Instance: 'FIND_WEB3_INSTANCE',
		FindAccessLinks: 'FIND_ACCESS_LINKS',
		EnableWeb3: 'ENABLE_WEB3',
		EnableWalletConnect: 'ENABLE_WALLET_CONNECT',
		FindAccountState: 'FIND_ACCOUNT_STATE',

		GetAuthorizeFluxOperatorResponse: 'GET_AUTHORIZE_FLUX_OPERATOR_RESPONSE',
		GetLockInDamTokensResponse: 'GET_LOCK_IN_DAM_TOKENS_RESPONSE',
		GetMintFluxResponse: 'GET_MINT_FLUX_RESPONSE',
		GetBurnFluxResponse: 'GET_BURN_FLUX_RESPONSE',
		GetUnlockDamTokensResponse: 'GET_UNLOCK_DAM_TOKENS_RESPONSE',
		GetTradeResponse: 'GET_TRADE_RESPONSE',

		PerformSearch: 'PERFORM_SEARCH',
		GetFullHelpArticle: 'GET_FULL_HELP_ARTICLE',
		DisconnectWalletConnect: 'DISCONNECT_WALLETCONNECT',
		ResetHelpArticleBodies: 'RESET_HELP_ARTICLE_BODIES',

		Swap: {
			GetOutputQuote: 'SWAP:GET_OUTPUT_QUOTE',
			ThrottleGetOutputQuote: 'SWAP:THROTTLE_GET_OUTPUT_QUOTE',
		},
		Market: {
			GetMarketBurnFluxResponse: 'GET_BURN_FLUX_MARKET_RESPONSE',
			GetDepositMarketResponse: 'GET_DEPOSIT_MARKET_RESPONSE',
			GetWithdrawMarketResponse: 'GET_WITHDRAW_MARKET_RESPONSE',
			GetRefreshMarketAddressesResponse: 'GET_REFRESH_MARKET_ADDRESSES_RESPONSE',
		},
	},
	errors: {
		AlreadyInitialized: 'State is already initialized.',
		Web3NotFound: 'Web3 not found.',
		InvalidNumber: 'Please enter a valid number.',
		MustExceedZero: 'Amount must exceed zero.',
		FailedFetchingAccountState: 'Failed fetching account state.',
		FailsafeAmountExceeded: 'You can only lock-in 100 FLUX during Failsafe Period',

		Market: {
			AmountExceedsMaxAddressMintable: 'Amount exceeds maximum that this address can mint',
		},
	},
} as const;

export { commonLanguage, handleCommand, handleQueryResponse, initialState };
