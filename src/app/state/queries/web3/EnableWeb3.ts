import { AppState } from '@/app/state/initialState';
import { getWeb3Provider } from '@/web3/utils/web3Helpers';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { devLog } from '@/utils/devLog';
import {
	getSelectedAddress,
	getPublicClient,
	preselectAddress,
	setWeb3Provider,
	subscribeToBlockUpdates,
} from '@/web3/utils/web3ProviderUtils';

/**
 * Enables the Web3 provider, requesting account access from the user if necessary.
 */
export const enableWeb3: QueryHandler<AppState> = async ({ state, dispatch }) => {
	const publicClient = getPublicClient();
	if (!publicClient) {
		devLog('EnableWeb3 web3provider is missing?');
		setWeb3Provider(await getWeb3Provider({ ecosystem: state.ecosystem }), state.ecosystem);
	}

	// Checks to see if user has selectedAddress. If not we'll call eth_requestAccounts and select first one
	const addresses = await preselectAddress();
	devLog('EnableWeb3 addresses:', addresses);

	const selectedAddress = await getSelectedAddress();
	devLog('EnableWeb3 selectedAddress:', selectedAddress);

	if (publicClient && selectedAddress) {
		subscribeToBlockUpdates(publicClient, dispatch);
	}

	return {
		selectedAddress,
	};
};
