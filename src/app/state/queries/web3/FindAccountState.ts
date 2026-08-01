import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { getEcosystemConfig } from '@/app/configs/config';
import { Layer } from '@/app/configs/config.common';
import { devLog } from '@/utils/devLog';
import { decodeMulticall, encodeMulticall, EncodedMulticallResults } from '@/web3/utils/web3multicall';
import { getContracts, getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';
import { FindAccountStateContext } from '@/app/state/queries/web3/findAccountState/calls/context';
import { buildAccountMulticall } from '@/app/state/queries/web3/findAccountState/calls/accountCalls';
import { getSwapTokenBalances } from '@/app/state/queries/web3/findAccountState/decode/swapBalances';

import {
	getLockableTokenPoolReserves,
	getMintableTokenPoolReserves,
} from '@/app/state/queries/web3/findAccountState/decode/reserves';
import {
	FluxAddressDetails,
	FluxAddressLock,
	FluxAddressTokenDetails,
	HodlClickerAddressLockDetailsViewModel,
} from '@/app/interfaces';

/**
 * Fetches all relevant on-chain data for the current user account in a single batch request using multicall.
 * This includes balances, contract details, and Uniswap pool reserves.
 */
export const findAccountState: QueryHandler<AppState> = async ({ state }) => {
	const { address, ecosystem } = state;
	const publicClient = getPublicClient();

	devLog('FindAccountState:', { address, ecosystem });

	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}

	// When user logs out clean the state (this will trigger a connect to wallte button)
	const selectedAddress = await getSelectedAddress();
	devLog('FindAccountState selectedAddress:', selectedAddress);

	if (!selectedAddress) {
		return {
			balances: null,
			selectedAddress: null,
			addressLock: null,
			addressDetails: null,
		};
	}

	const getAccountState = async () => {
		const addressToFetch = address ?? selectedAddress;
		devLog('FindAccountState addressToFetch:', { addressToFetch, ecosystem });

		const contracts = getContracts(publicClient, state.ecosystem);
		const config = getEcosystemConfig(state.ecosystem);
		const isArbitrumMainnet = config.layer === Layer.Layer2;

		devLog('FindAccountState Making batch request:');

		// Everything the multicall builders need, passed explicitly rather than captured.
		const context: FindAccountStateContext = { config, ecosystem: state.ecosystem, isArbitrumMainnet, addressToFetch };

		const multicallData = buildAccountMulticall(context);

		const calls = encodeMulticall(multicallData);
		if (!contracts.multicall) {
			throw new Error('Multicall contract not initialized');
		}
		const [blockNumber, returnData] = (await contracts.multicall.read.aggregate([calls])) as [bigint, `0x${string}`[]];
		const multicallEncodedResults: EncodedMulticallResults = {
			blockNumber: blockNumber.toString(),
			returnData,
		};

		const multicallDecodedResults = decodeMulticall(multicallEncodedResults, multicallData);

		const {
			ethBalance,
			uniswapUsdcEthTokenReserves,
			fluxTotalSupply,
			damTotalSupply,
			addressTokenDetails,

			addressLock,
			addressDetails,

			uniswapDamTokenReservesV3,
			liquidityDamV3,
			uniswapFluxTokenReservesV3,
			uniswapFluxBalance,

			arbitrumBridgeBalance,
			wrappedEthFluxUniswapAddressBalance,
			wrappedEthDamUniswapAddressBalance,

			lockedLiquidtyUniTotalSupply,
			lockedLiquidityUniAmount,

			otherEcosystemTokenBalance,
			//marketAddressLock,
			currentAddressHodlClickerAddressLock,
			//currentAddressMintableBalance,
		} = multicallDecodedResults as {
			ethBalance: bigint;
			uniswapUsdcEthTokenReserves: { usdc: bigint; eth: bigint };
			fluxTotalSupply: bigint;
			damTotalSupply: bigint;
			addressTokenDetails: FluxAddressTokenDetails;
			addressLock: FluxAddressLock;
			addressDetails: FluxAddressDetails;
			uniswapDamTokenReservesV3: { slot0: { sqrtPriceX96: string }; reserve0: string; reserve1: string };
			liquidityDamV3: string;
			uniswapFluxTokenReservesV3: { slot0: { sqrtPriceX96: string }; reserve0: string; reserve1: string };
			uniswapFluxBalance: string;
			arbitrumBridgeBalance: string;
			wrappedEthFluxUniswapAddressBalance: string;
			wrappedEthDamUniswapAddressBalance: string;
			lockedLiquidtyUniTotalSupply: bigint;
			lockedLiquidityUniAmount: bigint;
			otherEcosystemTokenBalance: bigint;
			currentAddressHodlClickerAddressLock: HodlClickerAddressLockDetailsViewModel;
		};

		devLog('FindAccountState batch request success', multicallDecodedResults);

		const fixedUniswapDamTokenReservesV3 = getLockableTokenPoolReserves(
			uniswapDamTokenReservesV3,
			isArbitrumMainnet,
			liquidityDamV3,
			wrappedEthDamUniswapAddressBalance
		);

		const fixedUniswapFluxTokenReservesV3 = getMintableTokenPoolReserves(
			uniswapFluxTokenReservesV3,
			isArbitrumMainnet,
			uniswapFluxBalance,
			wrappedEthFluxUniswapAddressBalance
		);

		const swapTokenBalances = getSwapTokenBalances({
			ecosystem: state.ecosystem,
			isArbitrumMainnet,
			previousSwapTokenBalances: state.swapTokenBalances,
			addressDetails,
			addressTokenDetails,
			ethBalance,
			otherEcosystemTokenBalance,
		});

		return {
			balances: {
				damToken: addressTokenDetails.damBalance,
				fluxToken: addressDetails.fluxBalance,
				eth: ethBalance,

				fluxTotalSupply,
				damTotalSupply,

				uniswapDamTokenReserves: fixedUniswapDamTokenReservesV3,
				uniswapFluxTokenReserves: fixedUniswapFluxTokenReservesV3,
				uniswapUsdcEthTokenReserves,

				arbitrumBridgeBalance: arbitrumBridgeBalance,

				lockedLiquidtyUniTotalSupply,
				lockedLiquidityUniAmount,
			},
			swapTokenBalances,
			selectedAddress,
			addressLock,
			addressDetails,
			addressTokenDetails,
			currentAddressHodlClickerAddressLock,
		};
	};

	return await getAccountState();
};
