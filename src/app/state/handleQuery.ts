import { commonLanguage } from '@/app/state/commonLanguage';
import { findAccountState } from '@/app/state/queries/web3/FindAccountState';
import { findWeb3Instance } from '@/app/state/queries/web3/FindWeb3Instance';
import { enableWeb3 } from '@/app/state/queries/web3/EnableWeb3';
import { getAuthorizeFluxOperatorResponse } from '@/app/state/queries/web3/GetAuthorizeFluxOperatorResponse';
import { getLockInDamTokensResponse } from '@/app/state/queries/web3/GetLockInDamTokensResponse';
import { getMintFluxResponse } from '@/app/state/queries/web3/GetMintFluxResponse';
import { getSetMintSettingsResponse } from '@/app/state/queries/web3/batchMinter/GetSetMintSettingsResponse';
import { getBurnFluxResponse } from '@/app/state/queries/web3/GetBurnFluxResponse';
import { getUnlockDamTokensResponse } from '@/app/state/queries/web3/GetUnlockDamTokensResponse';
import {
	getMarketBurnFluxResponse,
	getDepositMarketResponse,
	getRefreshMarketAddressesResponse,
	getWithdrawMarketResponse,
} from '@/app/state/queries/web3/MarketQueries';
import { throttleGetOutputQuote, getOutputQuote, getTradeResponse } from '@/app/state/queries/web3/swap/SwapQueries';
import { getFullHelpArticle } from '@/app/state/queries/web3/help/GetFullHelpArticle';

// This module executes the asynchronous Web3 operations requested by the sideEffectReducer.
// Each function here corresponds to a specific blockchain interaction (e.g., minting, swapping, reading contract data).
// It's crucial that these functions handle network errors and return results back to the reducer for state updates.
export const queryHandlers = {
	/**
	 * Finds and initializes the Web3 provider (MetaMask).
	 * It sets up listeners for account and network changes to keep the app state synced.
	 */
	[commonLanguage.queries.Web3.FindWeb3Instance]: findWeb3Instance,
	/**
	 * Enables the Web3 provider, requesting account access from the user if necessary.
	 */
	[commonLanguage.queries.Web3.EnableWeb3]: enableWeb3,

	/**
	 * Fetches all relevant on-chain data for the current user account in a single batch request using multicall.
	 * This includes balances, contract details, and Uniswap pool reserves.
	 */
	[commonLanguage.queries.FindAccountState]: findAccountState,
	/**
	 * Authorizes the FLUX contract to spend the user's DAM tokens.
	 */
	[commonLanguage.queries.Flux.GetAuthorizeOperatorResponse]: getAuthorizeFluxOperatorResponse,
	/**
	 * Locks a specified amount of DAM tokens to start minting FLUX.
	 */
	[commonLanguage.queries.Flux.GetLockInDamTokensResponse]: getLockInDamTokensResponse,
	/**
	 * Mints available FLUX tokens.
	 */
	[commonLanguage.queries.Flux.GetMintResponse]: getMintFluxResponse,

	[commonLanguage.queries.Flux.GetSetMintSettingsResponse]: getSetMintSettingsResponse,
	/**
	 * Burns a specified amount of FLUX tokens to increase the minting multiplier.
	 */
	[commonLanguage.queries.Flux.GetBurnResponse]: getBurnFluxResponse,
	/**
	 * Burns tokens through the Datamine Market to collect rewards from other validators.
	 */
	[commonLanguage.queries.Market.GetMarketBurnFluxResponse]: getMarketBurnFluxResponse,
	/**
	 * Deposits tokens into the Datamine Market to be available for public burning.
	 */
	[commonLanguage.queries.Market.GetDepositMarketResponse]: getDepositMarketResponse,
	/**
	 * Refreshes the data for all addresses listed in the Datamine Gems GameFi market.
	 */
	[commonLanguage.queries.Market.GetRefreshMarketAddressesResponse]: getRefreshMarketAddressesResponse,
	/**
	 * Withdraws all accumulated rewards from the Datamine Market.
	 */
	[commonLanguage.queries.Market.GetWithdrawMarketResponse]: getWithdrawMarketResponse,
	/**
	 * Unlocks all previously locked DAM tokens.
	 */
	[commonLanguage.queries.Flux.GetUnlockDamTokensResponse]: getUnlockDamTokensResponse,

	/**
	 * Throttles requests for swap output quotes to prevent excessive calls while the user is typing.
	 */
	[commonLanguage.queries.Swap.ThrottleGetOutputQuote]: throttleGetOutputQuote,
	/**
	 * Fetches the expected output amount for a given token swap.
	 */
	[commonLanguage.queries.Swap.GetOutputQuote]: getOutputQuote,
	/**
	 * Executes a token swap.
	 */
	[commonLanguage.queries.Swap.GetTradeResponse]: getTradeResponse,

	/**
	 * Executes a token swap.
	 */
	[commonLanguage.queries.Help.GetFullArticle]: getFullHelpArticle,
};

export default queryHandlers;
