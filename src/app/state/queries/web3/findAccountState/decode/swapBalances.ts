import { Ecosystem, Layer } from '@/app/configs/config.common';
import { SwapToken } from '@/web3/swap/swapOptions';
import { FluxAddressDetails, FluxAddressTokenDetails } from '@/app/interfaces';

/** The per-layer, per-token balance map carried in application state. */
export type SwapTokenBalances = {
	[Layer.Layer1]: Record<string, bigint>;
	[Layer.Layer2]: Record<string, bigint>;
};

/** Everything needed to derive swap balances from a freshly decoded account read. */
export interface SwapTokenBalanceInputs {
	ecosystem: Ecosystem;
	isArbitrumMainnet: boolean;
	previousSwapTokenBalances: SwapTokenBalances | null;
	addressDetails: FluxAddressDetails;
	addressTokenDetails: FluxAddressTokenDetails;
	ethBalance: bigint;
	otherEcosystemTokenBalance: bigint;
}

/**
 * Derives the swap-dialog token balances for both layers.
 *
 * Only the currently selected ecosystem is read on-chain, so balances for the other layer are
 * carried forward from the previous state rather than refetched. Which decoded field maps onto
 * which swap token depends on the ecosystem, since the same contract call means a different
 * token in each.
 */
export const getSwapTokenBalances = ({
	ecosystem,
	isArbitrumMainnet,
	previousSwapTokenBalances,
	addressDetails,
	addressTokenDetails,
	ethBalance,
	otherEcosystemTokenBalance,
}: SwapTokenBalanceInputs) => {
	const getCurrentSwapTokenBalances = () => {
		if (!previousSwapTokenBalances) {
			return {
				[Layer.Layer1]: {
					[SwapToken.DAM]: 0n,
					[SwapToken.FLUX]: 0n,
					[SwapToken.ETH]: 0n,
				},
				[Layer.Layer2]: {
					[SwapToken.ArbiFLUX]: 0n,
					[SwapToken.FLUX]: 0n,
					[SwapToken.LOCK]: 0n,
					[SwapToken.ETH]: 0n,
				},
			};
		}
		return previousSwapTokenBalances;
	};
	const swapTokenBalances = getCurrentSwapTokenBalances();

	const getL2ArbiFluxSwapBalance = () => {
		switch (ecosystem) {
			case Ecosystem.ArbiFlux:
				return addressDetails.fluxBalance;
			case Ecosystem.Lockquidity:
				return addressTokenDetails.damBalance;
		}

		return swapTokenBalances[Layer.Layer2][SwapToken.ArbiFLUX];
	};
	const getL2LockSwapBalance = () => {
		switch (ecosystem) {
			case Ecosystem.ArbiFlux:
				return otherEcosystemTokenBalance;
			case Ecosystem.Lockquidity:
				return addressDetails.fluxBalance;
		}

		return swapTokenBalances[Layer.Layer2][SwapToken.ArbiFLUX];
	};

	const getFluxL2SwapBlance = () => {
		switch (ecosystem) {
			case Ecosystem.ArbiFlux:
				return addressTokenDetails.damBalance;
			//case Ecosystem.Lockquidity: //@todo get from extra prop
		}
		return swapTokenBalances[Layer.Layer2][SwapToken.FLUX];
	};

	return {
		[Layer.Layer1]: {
			[SwapToken.DAM]: !isArbitrumMainnet
				? addressTokenDetails.damBalance
				: swapTokenBalances[Layer.Layer1][SwapToken.DAM],
			[SwapToken.FLUX]: !isArbitrumMainnet
				? addressDetails.fluxBalance
				: swapTokenBalances[Layer.Layer1][SwapToken.FLUX],
			[SwapToken.ETH]: !isArbitrumMainnet ? ethBalance : swapTokenBalances[Layer.Layer1][SwapToken.ETH],
		},
		[Layer.Layer2]: {
			[SwapToken.FLUX]: getFluxL2SwapBlance(),
			[SwapToken.ArbiFLUX]: getL2ArbiFluxSwapBalance(),
			[SwapToken.LOCK]: getL2LockSwapBalance(),
			[SwapToken.ETH]: isArbitrumMainnet ? ethBalance : swapTokenBalances[Layer.Layer2][SwapToken.ETH],
		},
	};
};
