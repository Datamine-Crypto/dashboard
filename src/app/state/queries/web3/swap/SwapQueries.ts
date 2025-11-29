import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { rethrowWeb3Error } from '@/web3/utils/web3Helpers';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { performSwap } from '@/web3/swap/performSwap';
import { SwapOptions, SwapPlatform } from '@/web3/swap/swapOptions';
import { getPublicClient, getWalletClient, localConfig } from '@/web3/utils/web3ProviderUtils';

/**
 * @var thottleGetOutputQuoteTimeout - Timeout ID for throttling swap quote requests.
 */
let thottleGetOutputQuoteTimeout: ReturnType<typeof setTimeout> | undefined;

/**
 * Throttles requests for swap output quotes to prevent excessive calls while the user is typing.
 */
export const throttleGetOutputQuote: QueryHandler<AppState> = async ({ state, query, dispatch }) => {
	const publicClient = getPublicClient();
	if (!publicClient) {
		return;
	}

	clearTimeout(thottleGetOutputQuoteTimeout);

	thottleGetOutputQuoteTimeout = setTimeout(() => {
		dispatch({ type: commonLanguage.commands.Swap.ResetThottleGetOutputQuote });
	}, localConfig.thottleGetOutputQuoteMs);
};

/**
 * Fetches the expected output amount for a given token swap.
 */
export const getOutputQuote: QueryHandler<AppState> = async ({ state, query }) => {
	const publicClient = getPublicClient();
	if (!publicClient) {
		return;
	}

	const { swapState } = state;

	const inputToken = swapState.input;
	const outputToken = swapState.output;

	if (!inputToken || !outputToken) {
		console.log('invalid token:', { inputToken, outputToken });
		return;
	}

	if (inputToken.amount === '' || inputToken.amount === '0') {
		return;
	}

	const swapOptions: SwapOptions = {
		inputToken,
		outputToken,
		swapPlatform: SwapPlatform.UniswapV2,

		publicClient,
		web3provider: null,
		onlyGetQuote: true,
	};
	try {
		const quote = await performSwap(swapOptions);

		return quote;
	} catch (err) {
		rethrowWeb3Error(err);
	}
};

/**
 * Executes a token swap.
 */
export const getTradeResponse: QueryHandler<AppState> = async ({ state, query }) => {
	const publicClient = getPublicClient();
	const walletClient = getWalletClient();
	if (!publicClient || !walletClient) {
		return;
	}

	const { swapState } = state;

	const inputToken = swapState.input;
	const outputToken = swapState.output;

	if (!inputToken || !outputToken) {
		console.log('invalid token:', { inputToken, outputToken });
		return;
	}

	const swapOptions: SwapOptions = {
		inputToken,
		outputToken,
		swapPlatform: SwapPlatform.UniswapV2,

		publicClient,
		walletClient,
		web3provider: null,
	};
	try {
		const quote = await performSwap(swapOptions);

		return quote;
	} catch (err) {
		rethrowWeb3Error(err);
	}
};
