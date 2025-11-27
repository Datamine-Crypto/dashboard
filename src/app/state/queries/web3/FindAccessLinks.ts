import { AppState } from '@/app/state/initialState';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { devLog } from '@/utils/devLog';
import { getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';

/**
 * Fetches access links for pro features by sending a signed message to the backend.
 */
export const findAccessLinks = async ({ state, query }: QueryHandler<AppState>) => {
	const publicClient = getPublicClient();
	const selectedAddress = await getSelectedAddress();

	if (publicClient) {
		try {
			/*
                            const signature = await getSignature(web3, selectedAddress)
                            console.log('signature:', signature)
            
                            const response = await axiosInstance({
                                method: 'post',
                                url: '/accessLinks/generate',
                                data: {
                                    signature
                                }
                              });
                                    
                          console.log('generate:x',signature,response)*/
		} catch (err) {
			devLog('err:', err);
		}
	}

	devLog('FindAccessLinks!');
	const accessLinks: any[] = [];

	return {
		accessLinks,
	};
};
