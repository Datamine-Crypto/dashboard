import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { withWeb3 } from '@/web3/utils/web3Helpers';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { devLog } from '@/utils/devLog';
import { getContracts, getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';

/**
 * Unlocks all previously locked DAM tokens.
 */
export const getUnlockDamTokensResponse: QueryHandler<AppState> = async ({ state }) => {
	const publicClient = getPublicClient();
	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}
	const selectedAddress = await getSelectedAddress();

	const contracts = getContracts(publicClient, state.ecosystem);

	const fluxToken = withWeb3(contracts.fluxToken);
	const response = await fluxToken.unlockDamTokens({
		from: selectedAddress as string,
	});

	devLog('GetUnlockDamTokensResponse:', response);

	return response && response.status;
};
