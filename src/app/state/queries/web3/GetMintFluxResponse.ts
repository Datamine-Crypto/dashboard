import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { withWeb3 } from '@/web3/utils/web3Helpers';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { getEcosystemConfig } from '@/app/configs/config';
import { devLog } from '@/utils/devLog';
import { getContracts, getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';

/**
 * Mints available FLUX tokens.
 */
export interface GetMintFluxResponseQuery {
	sourceAddress: string;
	targetAddress: string;
	blockNumber: string;
}

/**
 * Mints available FLUX tokens.
 */
export const getMintFluxResponse: QueryHandler<AppState> = async ({ state, query }) => {
	const publicClient = getPublicClient();
	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}
	const selectedAddress = await getSelectedAddress();

	const { sourceAddress, targetAddress, blockNumber } = query.payload as GetMintFluxResponseQuery;

	const contracts = getContracts(publicClient, state.ecosystem);
	const config = getEcosystemConfig(state.ecosystem);
	const getResponse = async () => {
		const minterAddress = state.addressLock?.minterAddress;

		if (config.batchMinterAddress?.toLowerCase() === minterAddress?.toLowerCase()) {
			const batchMinter = withWeb3(contracts.batchMinter);

			return await batchMinter.batchNormalMintTo({
				sourceAddress,
				targetAddress,
				blockNumber,
				from: selectedAddress as string,
			});
		} else {
			const fluxToken = withWeb3(contracts.fluxToken);

			return await fluxToken.mintToAddress({
				sourceAddress,
				targetAddress,
				blockNumber,
				from: selectedAddress as string,
			});
		}
	};

	const response = await getResponse();

	devLog('GetMintFluxResponse:', response);

	return response && response.status;
};
