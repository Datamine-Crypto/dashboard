import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { withWeb3 } from '@/web3/utils/web3Helpers';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { getEcosystemConfig } from '@/app/configs/config';
import { devLog } from '@/utils/devLog';
import { getContracts, getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';

/**
 * Authorizes the FLUX contract to spend the user's DAM tokens.
 */
export const getAuthorizeFluxOperatorResponse: QueryHandler<AppState> = async ({ state }) => {
	const publicClient = getPublicClient();
	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}
	const selectedAddress = await getSelectedAddress();

	const contracts = getContracts(publicClient, state.ecosystem);
	const config = getEcosystemConfig(state.ecosystem);

	const damToken = withWeb3(contracts.damToken);

	const response = await damToken.authorizeOperator({
		operator: config.mintableTokenContractAddress,
		from: selectedAddress as string,
	});

	devLog('GetAuthorizeFluxOperatorResponse:', response);

	return response && response.status;
};
