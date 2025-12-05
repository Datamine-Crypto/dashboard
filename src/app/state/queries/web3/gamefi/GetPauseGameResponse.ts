import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { withWeb3 } from '@/web3/utils/web3Helpers';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { devLog } from '@/utils/devLog';
import { getContracts, getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';

/**
 * Unlocks all previously locked DAM tokens.
 */
export const getPauseGameResponse: QueryHandler<AppState> = async ({ state }) => {
	const publicClient = getPublicClient();
	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}
	const contracts = getContracts(publicClient, state.ecosystem);

	const gameHodlClicker = withWeb3(contracts.gameHodlClicker);
	const selectedAddress = await getSelectedAddress();

	const response = await gameHodlClicker.setPaused({
		from: selectedAddress as string,
		isPaused: true,
	});

	devLog('GetPauseGameResponse:', response);

	return response && response.status;
};
