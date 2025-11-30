import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { withWeb3 } from '@/web3/utils/web3Helpers';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { getContracts, getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';

export interface GetSetMintSettingsResponseQuery {
	address: string;
}

export const getSetMintSettingsResponse: QueryHandler<AppState> = async ({ state, query }) => {
	const publicClient = getPublicClient();
	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}
	const selectedAddress = await getSelectedAddress();

	const { address } = query.payload as GetSetMintSettingsResponseQuery;

	const contracts = getContracts(publicClient, state.ecosystem);

	const fluxToken = withWeb3(contracts.batchMinter);
	const response = await fluxToken.setDelegatedMinter({
		delegatedMinterAddress: address,
		from: selectedAddress as string,
	});

	return response && response.status;
};
