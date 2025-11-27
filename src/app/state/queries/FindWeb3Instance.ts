import { commonLanguage } from '@/app/state/commonLanguage';
import { ReducerDispatch } from '@/app/interfaces';
import { AppState } from '@/app/state/initialState';
import { getWeb3Provider } from '@/web3/utils/web3Helpers';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { devLog } from '@/utils/devLog';
import {
	getSelectedAddress,
	getPublicClient,
	localConfig,
	setWeb3Provider,
	subscribeToBlockUpdates,
} from '@/web3/utils/web3ProviderUtils';

/**
 * Finds and initializes the Web3 provider (MetaMask).
 * It sets up listeners for account and network changes to keep the app state synced.
 */
export const findWeb3Instance = async ({ state, query, dispatch }: QueryHandler<AppState>) => {
	const provider = await getWeb3Provider({ ecosystem: state.ecosystem });
	devLog('Found provider:', { provider, ecosystem: state.ecosystem });
	setWeb3Provider(provider, state.ecosystem);

	if (provider) {
		const publicClient = getPublicClient();
		if (!publicClient) throw new Error('Public client not initialized');

		/**
		 * Listen for any account changes to refresh data
		 */
		const subscribeToAccountUpdates = (dispatch: ReducerDispatch) => {
			provider.on('accountsChanged', () => {
				dispatch({
					type: commonLanguage.commands.RefreshAccountState,
					payload: { updateEthBalance: true },
				});
			});
		};
		subscribeToAccountUpdates(dispatch);

		/**
		 * Subscribes to network changes and reinitializes Web3 if the network is switched.
		 */
		const subscribeToNetworkChanges = (dispatch: ReducerDispatch) => {
			const reinitializeWeb3 = () => {
				dispatch({
					type: commonLanguage.commands.ReinitializeWeb3,
					payload: { targetEcosystem: state.targetEcosystem },
				});
			};
			provider.on('networkChanged', reinitializeWeb3); // [DEPRECATED] networkChanged is deprecated for chainChanged
			provider.on('chainChanged', reinitializeWeb3);
		};
		subscribeToNetworkChanges(dispatch);

		/**
		 * Retrieves the initial selected address and starts block update subscriptions if available.
		 */
		const getInitialSelectedAddress = async () => {
			if (localConfig.skipInitialConnection) {
				return null;
			}

			const selectedAddress = await getSelectedAddress();
			if (selectedAddress) {
				subscribeToBlockUpdates(publicClient, dispatch);
			}
			return selectedAddress;
		};
		const selectedAddress = await getInitialSelectedAddress();

		devLog('FindWeb3Instance selectedAddress:', selectedAddress);

		const networkType = 'main';

		const chainId = await publicClient.getChainId();
		devLog('FindWeb3Instance chainId:', chainId);

		const isArbitrumMainnet = chainId === 42161;
		devLog('FindWeb3Instance isArbitrumMainnet:', isArbitrumMainnet);

		return {
			selectedAddress,
			networkType,
			chainId,
		};
	}

	throw commonLanguage.errors.Web3NotFound;
};
