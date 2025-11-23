import BN from 'bn.js';
import { getEcosystemConfig } from '@/configs/config';
import { Ecosystem, Layer } from '@/configs/config.common';
import { Gem } from '@/core/react/elements/Fragments/DatamineGemsGame';
import { ReducerQueryHandler } from '@/core/sideEffectReducer';
import { devLog } from '@/core/utils/devLog';
import { SwapQuote } from '@/core/utils/swap/swapOptions';
import { BNToDecimal } from '@/core/web3/helpers';
import { commonLanguage } from '@/core/web3/reducer/common';
import { createWithWithQueries } from '@/core/web3/reducer/helpers';
import { ConnectionMethod, DialogType, Web3State } from '@/core/web3/reducer/interfaces';

/**
 * Handles responses from asynchronous queries executed by Web3Bindings.
 * It updates the state based on the success or failure of the query.
 * @param state - The current state.
 * @param payload - The query response payload, containing the original query, error (if any), and response data.
 * @returns The new state.
 */
export const handleQueryResponse = ({ state, payload }: ReducerQueryHandler<Web3State>) => {
	const { query, err, response } = payload;

	const config = getEcosystemConfig(state.ecosystem);

	const withQueries = createWithWithQueries(state);

	switch (query.type) {
		case commonLanguage.queries.FindWeb3Instance: {
			if (err) {
				devLog('FindWeb3Instance reducer err:', { err, message: (err as any).message });
				return {
					...state,
					hasWeb3: false,
				};
			}

			const { web3, selectedAddress, networkType, chainId, useWalletConnect } = response;

			const isArbitrumMainnet = chainId === 42161;
			devLog('FindWeb3Instance reducer isArbitrumMainnet:', {
				networkType,
				chainId,
				isArbitrumMainnet,
				ecosystem: state.ecosystem,
				targetEcosystem: state.targetEcosystem,
			});

			/**
			 * Possibly override the current ecosystem once we figure out what network we're on
			 * For example if we're on L1 and last known ecosystem selected was L2 then change it to L1 and user doesn't have to refresh anything
			 * @todo the ecosystems are hard-coded here just change it to have some setting for which ecosystem is "default" for that layer (or pick first one from the layers)
			 */
			const getUpdatedEcosystem = (ecosystem: Ecosystem) => {
				const ecosystemConfig = getEcosystemConfig(ecosystem);
				// Default to Flux (L1) if not on Arbitrum
				if (ecosystemConfig.layer == Layer.Layer2 && !isArbitrumMainnet) {
					return Ecosystem.Flux;
				}
				// Default to Lockquidity (L2) if  on Arbitrum
				if (ecosystemConfig.layer == Layer.Layer1 && isArbitrumMainnet) {
					return Ecosystem.Lockquidity;
				}

				// Return whatever user selected last
				return ecosystem;
			};
			const updatedEcosystem = !state.targetEcosystem
				? getUpdatedEcosystem(state.ecosystem)
				: getUpdatedEcosystem(state.targetEcosystem);

			const isUnsupportedNetwork = config.isArbitrumOnlyToken && !isArbitrumMainnet;

			if ((networkType !== 'main' && chainId !== 1) || isUnsupportedNetwork) {
				// private is for cloudflare RPC. chainId 1 is Ehtereum Mainnet (others is BSC for example)

				if (!isArbitrumMainnet || isUnsupportedNetwork) {
					return {
						...state,
						isIncorrectNetwork: true,
					};
				}
			}

			return {
				...state,
				web3,
				hasWeb3: true,
				selectedAddress,
				connectionMethod: useWalletConnect ? ConnectionMethod.WalletConnect : ConnectionMethod.MetaMask,
				isArbitrumMainnet,
				ecosystem: updatedEcosystem,
				...withQueries(
					selectedAddress
						? [
								{ type: commonLanguage.queries.FindAccountState, payload: { updateEthBalance: true } },
								{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse },
							]
						: [{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse }]
				),
			};
		}
		case commonLanguage.queries.EnableWeb3:
		case commonLanguage.queries.EnableWalletConnect: {
			if (err) {
				return state;
			}

			const { selectedAddress } = response;

			const connectionMethod =
				query.type === commonLanguage.queries.EnableWeb3 ? ConnectionMethod.MetaMask : ConnectionMethod.WalletConnect;

			return {
				...state,
				selectedAddress,
				connectionMethod,
				...withQueries(
					selectedAddress
						? [{ type: commonLanguage.queries.FindAccountState, payload: { updateEthBalance: true } }]
						: []
				),
			};
		}
		case commonLanguage.queries.FindAccountState: {
			if (err) {
				devLog('FindAccountState Error:', err);

				return {
					...state,
					isLate: true,
				};
			}

			const {
				balances,
				swapTokenBalances,
				selectedAddress,
				addressLock,
				addressDetails,
				addressTokenDetails,
				//marketAddressLock,
				//currentAddressMarketAddressLock,
				//currentAddresMintableBalance,
			} = response;

			const getBlancesWithForecasting = () => {
				if (!balances) {
					return balances;
				}
				return {
					...balances,
					forecastFluxPrice: state.forecastSettings.forecastFluxPrice,
				};
			};

			return {
				...state,
				isLate: false,
				balances: getBlancesWithForecasting(),
				selectedAddress,
				addressLock,
				addressDetails,
				addressTokenDetails,
				swapTokenBalances,
				//marketAddressLock,
				//currentAddressMarketAddressLock,
				//currentAddresMintableBalance,
			};
		}
		case commonLanguage.queries.GetLockInDamTokensResponse: {
			if (err) {
				return {
					...state,
					error: err,
				};
			}
			const { minterAddress } = response;

			const dialog =
				minterAddress.toLowerCase() === config.batchMinterAddress?.toLowerCase() ? DialogType.MintSettings : null;

			return {
				...state,
				dialog,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}
		case commonLanguage.queries.GetMintFluxResponse: {
			if (err) {
				return {
					...state,
					error: err,
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}
		case commonLanguage.queries.GetBurnFluxResponse:
		case commonLanguage.queries.GetSetMintSettingsResponse:
		case commonLanguage.queries.Market.GetDepositMarketResponse:
		case commonLanguage.queries.Market.GetWithdrawMarketResponse: {
			if (err) {
				if ((err as any).message) {
					return {
						...state,
						error: (err as any).message,
					};
				}
				return {
					...state,
					error: err,
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}
		case commonLanguage.queries.Market.GetMarketBurnFluxResponse: {
			if (err) {
				if ((err as any).message) {
					return {
						...state,
						error: (err as any).message,
					};
				}
				return {
					...state,
					error: err,
				};
			}

			if (!response) {
				return {
					...state,
					// Don't close dialog
					...withQueries([
						{ type: commonLanguage.queries.FindAccountState },
						{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse },
					]),
				};
			}

			const { gems }: { gems: Gem[] } = response;

			const totalDollarAmountOfGems = gems.reduce((total, gem) => total + gem.dollarAmount, 0);

			const gemsCollected = {
				count: state.market.gemsCollected.count + gems.length,
				sumDollarAmount: state.market.gemsCollected.sumDollarAmount + totalDollarAmountOfGems,
			};

			localStorage.setItem('marketGemsCollected', JSON.stringify(gemsCollected));

			return {
				...state,
				// Don't close dialog
				...withQueries([
					{ type: commonLanguage.queries.FindAccountState },
					{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse },
				]),
				market: {
					...state.market,
					gemsCollected,
				},
			};
		}
		case commonLanguage.queries.Market.GetRefreshMarketAddressesResponse: {
			if (err) {
				if ((err as any).message) {
					return {
						...state,
						error: (err as any).message,
					};
				}
				return {
					...state,
					error: err,
				};
			}

			if (!response) {
				return state;
			}

			const {
				marketAddresses,
				currentAddresMintableBalance,
				game,
				totalContractRewardsAmount,
				totalContractLockedAmount,
			} = response;

			return {
				...state,
				currentAddresMintableBalance,

				games: {
					...state.games,
					[game]: {
						marketAddresses,
						totalContractRewardsAmount,
						totalContractLockedAmount,
					},
				},
			};
		}
		case commonLanguage.queries.GetTradeResponse: {
			if (err) {
				return {
					...state,
					error: err,
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}
		case commonLanguage.queries.GetUnlockDamTokensResponse: {
			if (err) {
				return {
					...state,
					error: err,
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}

		case commonLanguage.queries.GetAuthorizeFluxOperatorResponse: {
			if (err) {
				return state;
			}

			return {
				...state,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}

		case commonLanguage.queries.PerformSearch: {
			return {
				...state,
				helpArticles: response,
			};
		}
		case commonLanguage.queries.GetFullHelpArticle: {
			return {
				...state,
				helpArticle: response,
			};
		}
		case commonLanguage.queries.Swap.GetOutputQuote: {
			if (err) {
				return {
					...state,
					error: err,
				};
			}

			// If we get an empty response, don't update the output. This is useful for throttling
			if (!response) {
				return state;
			}

			const swapQuote = response as SwapQuote;

			devLog('swapQuote:', swapQuote);
			return {
				...state,
				//BNToDecimal(
				swapState: {
					...state.swapState,
					output: {
						...state.swapState.output,
						amount: `${BNToDecimal(new BN(swapQuote.out.minAmount))}`,
					},
				},
			};
		}
	}
	return state;
};
