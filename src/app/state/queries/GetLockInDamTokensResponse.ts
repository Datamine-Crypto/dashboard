import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { withWeb3 } from '@/web3/utils/web3Helpers';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { devLog } from '@/utils/devLog';
import { getContracts, getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';

/**
 * Locks a specified amount of DAM tokens to start minting FLUX.
 */
export const getLockInDamTokensResponse = async ({ state, query }: QueryHandler<AppState>) => {
	const publicClient = getPublicClient();
	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}
	const selectedAddress = await getSelectedAddress();

	const { amount, minterAddress } = query.payload;

	const contracts = getContracts(publicClient, state.ecosystem);

	const fluxToken = withWeb3(contracts.fluxToken);

	const response = await fluxToken.lock({
		amount,
		minterAddress,
		from: selectedAddress as string,
	});

	devLog('GetLockInDamTokensResponse:', response);

	return { minterAddress };
};
