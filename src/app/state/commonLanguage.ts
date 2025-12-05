// This reducer manages the core Web3 state and orchestrates interactions with the blockchain.
// It implements a "Commands & Queries" pattern, which is a variation of CQRS (Command Query Responsibility Segregation) adapted for Redux-like state management.
//
// 1. **Commands**: These are synchronous actions that directly modify the application state.
//    - Examples: 'INITIALIZE', 'UPDATE_ADDRESS', 'SHOW_DIALOG'.
//    - They represent a user's intent or a system event that *must* happen immediately.
//
// 2. **Queries**: These are asynchronous operations (side effects) that fetch data or interact with external systems (like the blockchain).
//    - Examples: 'FIND_WEB3_INSTANCE', 'GET_MINT_FLUX_RESPONSE'.
//    - Instead of executing immediately, queries are queued in the `pendingQueries` state array.
//    - The `sideEffectReducer` (in `src/react/utils/appStore.ts`) detects these pending queries and executes them asynchronously.
//    - Once a query completes, it dispatches a new Command (often a "Response" command) to update the state with the result.
//
// This separation ensures that the reducer remains pure (no side effects inside the reducer) and that all async logic is centralized and testable.
export const commonLanguage = {
	commands: {
		RefreshAccountState: 'REFRESH_ACCOUNT_STATE',
		UpdateAddress: 'UPDATE_ADDRESS',
		UpdateEcosystem: 'UPDATE_ECOSYSTEM',
		CopyAnalytics: 'COPY_ANALYTICS',
		SetMinterSettings: 'SET_MINTER_SETTINGS',
		DisplayAccessLinks: 'DISPLAY_ACCESS_LINKS',

		Dialog: {
			Show: 'SHOW_DIALOG',
			Close: 'CLOSE_DIALOG',
			DismissError: 'DISMISS_ERROR',
			DismissPendingAction: 'DISMISS_PENDING_ACTION',
		},
		Flux: {
			AuthorizeOperator: 'AUTHORIZE_FLUX_OPERATOR',
			LockInDamTokens: 'LOCK_IN_DAM_TOKENS',
			Mint: 'MINT_FLUX_TOKENS',
			Burn: 'BURN_FLUX_TOKENS',
			UnlockDamTokens: 'UNLOCK_DAM_TOKENS',
		},

		Forecasting: {
			ToggleMode: 'TOGGLE_FORECAST_MODE',
			SetAmount: 'TOGGLE_SET_AMOUNT',
			SetBlocks: 'TOGGLE_SET_BLOCKS',
			SetStartBlocks: 'TOGGLE_SET_START_BLOCKS',
			SetBurn: 'TOGGLE_SET_BURN',
			SetBurnAmount: 'FORECAST_SET_BURN_AMOUNT',
			SetTime: 'TOGGLE_SET_TIME',
			SetTimeAmount: 'FORECAST_SET_TIME_AMOUNT',
			SetFluxPrice: 'FORECAST_SET_FLUX_PRICE',
		},

		Help: {
			SetSearch: 'SET_SEARCH',
			ShowArticle: 'SHOW_HELP_ARTICLE',
			CloseArticle: 'CLOSE_HELP_ARTICLE',
			SetNetworkType: 'SET_HELP_ARTICLES_NETWORK_TYPE',
		},

		Drawer: {
			Close: 'CLOSE_DRAWER',
			Open: 'OPEN_DRAWER',
		},

		ClientSettings: {
			SetPriceMultiplier: 'CLIENT_SETTINGS_SET_PRICE_MULTIPLIER',
			SetUseEip1559: 'SET_USE_EIP1559',
			SetCurrency: 'SET_CURRENCY',
		},

		Web3: {
			Initialize: 'INITIALIZE',
			ConnectToWallet: 'CONNECT_TO_WALLET',
			/**
			 * Sometimes we want to re-initialzie web3 specifically when changing networks (Ex: ETH->Arbitrum)
			 * When initializing web3 on different network, we properly update current ecosystem (Ex: Changing DAM L1->LOCK L2)
			 */
			Reinitialize: 'REINITILIZE_WEB3',
		},

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
			UpdateGame: 'UPDATE_GAME',
		},
		GameFi: {
			PauseGame: 'GAMEFI_PAUSE_GAME',
			ResumeGame: 'GAMEFI_RESUME_GAME',
		},
	},
	queries: {
		FindAccountState: 'FIND_ACCOUNT_STATE',
		Web3: {
			FindWeb3Instance: 'FIND_WEB3_INSTANCE',
			EnableWeb3: 'ENABLE_WEB3',
		},

		Flux: {
			GetAuthorizeOperatorResponse: 'GET_AUTHORIZE_FLUX_OPERATOR_RESPONSE',
			GetLockInDamTokensResponse: 'GET_LOCK_IN_DAM_TOKENS_RESPONSE',
			GetMintResponse: 'GET_MINT_FLUX_RESPONSE',
			GetBurnResponse: 'GET_BURN_FLUX_RESPONSE',
			GetSetMintSettingsResponse: 'GET_SET_MINT_SETTINGS_RESPONSE',
			GetUnlockDamTokensResponse: 'GET_UNLOCK_DAM_TOKENS_RESPONSE',
		},

		Help: {
			PerformSearch: 'PERFORM_SEARCH',
			GetFullArticle: 'GET_FULL_HELP_ARTICLE',
			ResetArticleBodies: 'RESET_HELP_ARTICLE_BODIES',
		},

		Swap: {
			GetTradeResponse: 'GET_TRADE_RESPONSE',
			GetOutputQuote: 'SWAP:GET_OUTPUT_QUOTE',
			ThrottleGetOutputQuote: 'SWAP:THROTTLE_GET_OUTPUT_QUOTE',
		},
		Market: {
			GetMarketBurnFluxResponse: 'GET_BURN_FLUX_MARKET_RESPONSE',
			GetDepositMarketResponse: 'GET_DEPOSIT_MARKET_RESPONSE',
			GetWithdrawMarketResponse: 'GET_WITHDRAW_MARKET_RESPONSE',
			GetRefreshMarketAddressesResponse: 'GET_REFRESH_MARKET_ADDRESSES_RESPONSE',
		},
		GameFi: {
			GetPauseGameResponse: 'GET_GAMEFI_PAUSE_GAME_RESPONSE',
			GetResumeGameResponse: 'GET_GAMEFI_RESUME_GAME_RESPONSE',
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
