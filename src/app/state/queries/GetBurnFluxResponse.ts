import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { withWeb3 } from '@/web3/utils/web3Helpers';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { getContracts, getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';

/**
 * Burns a specified amount of FLUX tokens to increase the minting multiplier.
 */
export const getBurnFluxResponse = async ({ state, query }: QueryHandler<AppState>) => {
	const publicClient = getPublicClient();
	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}
	const selectedAddress = await getSelectedAddress();

	const { address, amount } = query.payload;

	const contracts = getContracts(publicClient, state.ecosystem);

	const fluxToken = withWeb3(contracts.fluxToken);
	const response = await fluxToken.burnToAddress({
		targetAddress: address,
		amount,
		from: selectedAddress as string,
	});

	return response && response.status;
};
