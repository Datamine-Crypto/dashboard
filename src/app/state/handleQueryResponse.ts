import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem, Layer } from '@/app/configs/config.common';
import { Gem } from '@/react/elements/Fragments/DatamineGemsGame';
import { ReducerQueryHandler } from '@/utils/reducer/sideEffectReducer';
import { devLog } from '@/utils/devLog';
import { SwapQuote } from '@/web3/swap/swapOptions';
import { formatBigInt } from '@/utils/mathHelpers';
import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { createWithWithQueries } from '@/utils/reducer/reducerHelpers';
import {
	ConnectionMethod,
	DialogType,
	Balances,
	SwapTokenBalances,
	FluxAddressLock,
	FluxAddressDetails,
	FluxAddressTokenDetails,
	HodlClickerAddressLockDetailsViewModel,
} from '@/app/interfaces';
import { HelpArticle } from '@/app/helpArticles';
import { GetRefreshMarketAddressesResponse } from '@/app/state/queries/web3/MarketQueries';

interface FindAccountStateResponse {
	balances: Balances | null;
	swapTokenBalances: SwapTokenBalances | null;
	selectedAddress: string | null;
	addressLock: FluxAddressLock | null;
	addressDetails: FluxAddressDetails | null;
	addressTokenDetails: FluxAddressTokenDetails | null;
	currentAddressHodlClickerAddressLock: HodlClickerAddressLockDetailsViewModel | null;
}

/**
 * Handles responses from asynchronous queries executed by Web3Bindings.
 * It updates the state based on the success or failure of the query.
 * @param state - The current state.
 * @param payload - The query response payload, containing the original query, error (if any), and response data.
 * @returns The new state.
 */
export const handleQueryResponse = ({ state, payload }: ReducerQueryHandler<AppState>) => {
	const { query, err, response } = payload;

	const config = getEcosystemConfig(state.ecosystem);

	const withQueries = createWithWithQueries(state);

	switch (query.type) {
		case commonLanguage.queries.Web3.FindWeb3Instance: {
			if (err) {
				const errorMessage = err instanceof Error ? err.message : String(err);
				devLog('FindWeb3Instance reducer err:', { err, message: errorMessage });
				return {
					...state,
					hasWeb3: false,
				};
			}

			const { selectedAddress, networkType, chainId } = response as {
				selectedAddress: string;
				networkType: string;
				chainId: number;
			};

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
				hasWeb3: true,
				selectedAddress,
				connectionMethod: ConnectionMethod.MetaMask,
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
		case commonLanguage.queries.Web3.EnableWeb3: {
			if (err) {
				return state;
			}

			const { selectedAddress } = response as { selectedAddress: string };

			const connectionMethod = ConnectionMethod.MetaMask;

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
				currentAddressHodlClickerAddressLock,
				//marketAddressLock,
				//currentAddressMarketAddressLock,
				//currentAddressMintableBalance,
			} = response as FindAccountStateResponse;

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
				currentAddressHodlClickerAddressLock,
				//marketAddressLock,
				//currentAddressMarketAddressLock,
				//currentAddressMintableBalance,
			};
		}
		case commonLanguage.queries.Flux.GetLockInDamTokensResponse: {
			if (err) {
				return {
					...state,
					error: err instanceof Error ? err.message : String(err),
				};
			}
			const { minterAddress } = response as { minterAddress: string };

			const dialog =
				minterAddress.toLowerCase() === config.batchMinterAddress?.toLowerCase() ? DialogType.MintSettings : null;

			return {
				...state,
				dialog,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}
		case commonLanguage.queries.Flux.GetMintResponse: {
			if (err) {
				return {
					...state,
					error: err instanceof Error ? err.message : String(err),
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}
		case commonLanguage.queries.Flux.GetBurnResponse:
		case commonLanguage.queries.Flux.GetSetMintSettingsResponse:
		case commonLanguage.queries.Market.GetDepositMarketResponse:
		case commonLanguage.queries.Market.GetWithdrawMarketResponse: {
			if (err) {
				if (err instanceof Error) {
					return {
						...state,
						error: err.message,
					};
				}
				return {
					...state,
					error: String(err),
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
				if (err instanceof Error) {
					return {
						...state,
						error: err.message,
					};
				}
				return {
					...state,
					error: String(err),
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

			const { gems }: { gems: Gem[] } = response as { gems: Gem[] };

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
				if (err instanceof Error) {
					return {
						...state,
						error: err.message,
					};
				}
				return {
					...state,
					error: String(err),
				};
			}

			if (!response) {
				return state;
			}

			const {
				marketAddresses,
				currentAddressMintableBalance,
				game,
				totalContractRewardsAmount,
				totalContractLockedAmount,
			} = response as GetRefreshMarketAddressesResponse;

			return {
				...state,
				currentAddressMintableBalance,

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
		case commonLanguage.queries.Swap.GetTradeResponse: {
			if (err) {
				return {
					...state,
					error: err instanceof Error ? err.message : String(err),
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}
		case commonLanguage.queries.Flux.GetUnlockDamTokensResponse: {
			if (err) {
				return {
					...state,
					error: err instanceof Error ? err.message : String(err),
				};
			}

			return {
				...state,
				dialog: null,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}

		case commonLanguage.queries.Flux.GetAuthorizeOperatorResponse: {
			if (err) {
				return state;
			}

			return {
				...state,
				...withQueries([{ type: commonLanguage.queries.FindAccountState }]),
			};
		}

		case commonLanguage.queries.Help.PerformSearch: {
			return {
				...state,
				helpArticles: response as HelpArticle[],
			};
		}
		case commonLanguage.queries.Help.GetFullArticle: {
			return {
				...state,
				helpArticle: response as HelpArticle,
			};
		}
		case commonLanguage.queries.Swap.GetOutputQuote: {
			if (err) {
				return {
					...state,
					error: err instanceof Error ? err.message : String(err),
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
				swapState: {
					...state.swapState,
					output: {
						...state.swapState.output,
						amount: `${formatBigInt(BigInt(swapQuote.out.minAmount))}`,
					},
				},
			};
		}
	}
	return state;
};
