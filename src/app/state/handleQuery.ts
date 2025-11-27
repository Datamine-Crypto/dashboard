import { Game } from '@/app/interfaces';
import { commonLanguage } from '@/app/state/commonLanguage';
import { ReducerDispatch } from '@/app/interfaces';
import { AppState } from '@/app/state/initialState';
import { getWeb3Provider, rethrowWeb3Error, withWeb3 } from '@/web3/utils/web3Helpers';
// import BN from 'bn.js';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { getEcosystemConfig } from '@/app/configs/config';
import { Gem } from '@/react/elements/Fragments/DatamineGemsGame';
import { devLog } from '@/utils/devLog';
import { performSwap } from '@/web3/swap/performSwap';
import { SwapOptions, SwapPlatform } from '@/web3/swap/swapOptions';
import { decodeMulticall, encodeMulticall, EncodedMulticallResults } from '@/web3/utils/web3multicall';
import {
	getContracts,
	getSelectedAddress,
	getPublicClient,
	getWalletClient,
	localConfig,
	preselectAddress,
	setWeb3Provider,
	subscribeToBlockUpdates,
} from '@/web3/utils/web3ProviderUtils';
import { findAccountState } from '@/app/state/queries/FindAccountState';

/**
 * @var thottleGetOutputQuoteTimeout - Timeout ID for throttling swap quote requests.
 */
let thottleGetOutputQuoteTimeout: any;

// This module executes the asynchronous Web3 operations requested by the web3Reducer.
// Each function here corresponds to a specific blockchain interaction (e.g., minting, swapping, reading contract data).
// It's crucial that these functions handle network errors and return results back to the reducer for state updates.
export const queryHandlers = {
	/**
	 * Finds and initializes the Web3 provider (MetaMask).
	 * It sets up listeners for account and network changes to keep the app state synced.
	 */
	[commonLanguage.queries.FindWeb3Instance]: async ({ state, query, dispatch }: QueryHandler<AppState>) => {
		//const useWalletConnect = query.payload?.useWalletConnect;

		const provider = await getWeb3Provider({ ecosystem: state.ecosystem });
		devLog('Found provider:', { provider, ecosystem: state.ecosystem });
		setWeb3Provider(provider, state.ecosystem);

		if (provider) {
			const publicClient = getPublicClient();
			if (!publicClient) throw new Error('Public client not initialized');

			/**
			 * Listen for any account changes to refresh data
			 */
			const subscribeToAccountUpdates = (dispatch: ReducerDispatch) => {
				provider.on('accountsChanged', () => {
					dispatch({
						type: commonLanguage.commands.RefreshAccountState,
						payload: { updateEthBalance: true },
					});
				});
			};
			subscribeToAccountUpdates(dispatch);

			/**
			 * Subscribes to network changes and reinitializes Web3 if the network is switched.
			 */
			const subscribeToNetworkChanges = (dispatch: ReducerDispatch) => {
				const reinitializeWeb3 = () => {
					dispatch({
						type: commonLanguage.commands.ReinitializeWeb3,
						payload: { targetEcosystem: state.targetEcosystem },
					});
				};
				provider.on('networkChanged', reinitializeWeb3); // [DEPRECATED] networkChanged is deprecated for chainChanged
				provider.on('chainChanged', reinitializeWeb3);

				// For WalletConnect
				/*provider.on('disconnect', () => {
					window.location.reload();
				});*/
			};
			subscribeToNetworkChanges(dispatch);

			/**
			 * Retrieves the initial selected address and starts block update subscriptions if available.
			 */
			const getInitialSelectedAddress = async () => {
				if (localConfig.skipInitialConnection) {
					return null;
				}

				const selectedAddress = await getSelectedAddress();
				if (selectedAddress) {
					subscribeToBlockUpdates(publicClient, dispatch);
				}
				return selectedAddress;
			};
			const selectedAddress = await getInitialSelectedAddress();

			devLog('FindWeb3Instance selectedAddress:', selectedAddress);

			const networkType = 'main';

			const chainId = await publicClient.getChainId();
			devLog('FindWeb3Instance chainId:', chainId);

			const isArbitrumMainnet = chainId === 42161;
			devLog('FindWeb3Instance isArbitrumMainnet:', isArbitrumMainnet);

			return {
				selectedAddress,
				networkType,
				chainId,
			};
		}

		throw commonLanguage.errors.Web3NotFound;
	},
	/**
	 * Enables the Web3 provider, requesting account access from the user if necessary.
	 */
	[commonLanguage.queries.EnableWeb3]: async ({ state, dispatch }: QueryHandler<AppState>) => {
		const publicClient = getPublicClient();
		if (!publicClient) {
			devLog('EnableWeb3 web3provider is missing?');
			setWeb3Provider(await getWeb3Provider({ ecosystem: state.ecosystem }), state.ecosystem);
		}

		// Checks to see if user has selectedAddress. If not we'll call eth_requestAccounts and select first one
		const addresses = await preselectAddress();
		devLog('EnableWeb3 addresses:', addresses);

		const selectedAddress = await getSelectedAddress();
		devLog('EnableWeb3 selectedAddress:', selectedAddress);

		if (publicClient && selectedAddress) {
			subscribeToBlockUpdates(publicClient, dispatch);
		}

		return {
			selectedAddress,
		};
	},

	/**
	 * Fetches access links for pro features by sending a signed message to the backend.
	 */
	[commonLanguage.queries.FindAccessLinks]: async ({ state, query }: QueryHandler<AppState>) => {
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
	},
	/**
	 * Fetches all relevant on-chain data for the current user account in a single batch request using multicall.
	 * This includes balances, contract details, and Uniswap pool reserves.
	 */
	[commonLanguage.queries.FindAccountState]: findAccountState,
	/**
	 * Authorizes the FLUX contract to spend the user's DAM tokens.
	 */
	[commonLanguage.queries.GetAuthorizeFluxOperatorResponse]: async ({ state }: QueryHandler<AppState>) => {
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
	},
	/**
	 * Locks a specified amount of DAM tokens to start minting FLUX.
	 */
	[commonLanguage.queries.GetLockInDamTokensResponse]: async ({ state, query }: QueryHandler<AppState>) => {
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
	},
	/**
	 * Mints available FLUX tokens.
	 */
	[commonLanguage.queries.GetMintFluxResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const publicClient = getPublicClient();
		if (!publicClient) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = await getSelectedAddress();

		const { sourceAddress, targetAddress, blockNumber } = query.payload;

		const contracts = getContracts(publicClient, state.ecosystem);
		const config = getEcosystemConfig(state.ecosystem);
		const getResponse = async () => {
			const minterAddress = state.addressLock?.minterAddress;

			if (config.batchMinterAddress?.toLowerCase() === minterAddress?.toLowerCase()) {
				const batchMinter = withWeb3(contracts.batchMinter);

				// Note: batchNormalMintTo was not defined in web3Helpers.ts withWeb3.
				// Assuming it exists or I need to add it.
				// The previous code called batchMinter.batchNormalMintTo.
				// I should check if I missed it in web3Helpers.ts.
				// I only added standard methods.
				// If it's missing, I should add it to web3Helpers.ts or use generic method call.
				// For now, let's assume I need to add it or it will fail.
				// Wait, I replaced web3Helpers.ts completely. I didn't see batchNormalMintTo there.
				// I should add it.
				// But for now, let's use the generic contract write if possible or just comment it out/fix it later.
				// Actually, I should fix web3Helpers.ts to include batchNormalMintTo.
				// But I can't do it in this file write.
				// I'll leave it as is and fix web3Helpers.ts in next step.
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
	},

	[commonLanguage.queries.GetSetMintSettingsResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const publicClient = getPublicClient();
		if (!publicClient) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = await getSelectedAddress();

		const { address } = query.payload;

		const contracts = getContracts(publicClient, state.ecosystem);

		const fluxToken = withWeb3(contracts.batchMinter);
		const response = await fluxToken.setDelegatedMinter({
			delegatedMinterAddress: address,
			from: selectedAddress as string,
		});

		return response && response.status;
	},
	/**
	 * Burns a specified amount of FLUX tokens to increase the minting multiplier.
	 */
	[commonLanguage.queries.GetBurnFluxResponse]: async ({ state, query }: QueryHandler<AppState>) => {
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
	},
	/**
	 * Burns tokens through the Datamine Market to collect rewards from other validators.
	 */
	[commonLanguage.queries.Market.GetMarketBurnFluxResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const { ecosystem, game } = state;
		const publicClient = getPublicClient();
		if (!publicClient) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = await getSelectedAddress();

		const { gems, amountToBurn }: { gems: Gem[]; amountToBurn: bigint } = query.payload;

		const contracts = getContracts(publicClient, state.ecosystem);

		const config = getEcosystemConfig(ecosystem);

		if (!config.marketAddress) {
			return;
		}

		const marketContract = withWeb3(game == Game.DatamineGems ? contracts.market : contracts.gameHodlClicker) as any;

		if (gems.length === 1) {
			const gem = gems[0];
			const burnResponse = await marketContract.marketBurnTokens({
				amountToBurn,
				burnToAddress: gem.ethereumAddress,

				from: selectedAddress as string,
			});
			devLog(burnResponse);
			return { gems };
		} else {
			const addresses = gems.map((gem) => gem.ethereumAddress);
			const burnBatchResponse = await marketContract.marketBatchBurnTokens({
				amountToBurn,
				addresses,
				from: selectedAddress as string,
			});
			devLog(burnBatchResponse);
			return { gems };
		}
	},
	/**
	 * Deposits tokens into the Datamine Market to be available for public burning.
	 */
	[commonLanguage.queries.Market.GetDepositMarketResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const { ecosystem, game } = state;
		const publicClient = getPublicClient();
		if (!publicClient) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = await getSelectedAddress();

		const { address, amount } = query.payload;

		const contracts = getContracts(publicClient, state.ecosystem);

		const config = getEcosystemConfig(ecosystem);

		const gameAddress = game === Game.DatamineGems ? config.marketAddress : config.gameHodlClickerAddress;

		if (!gameAddress) {
			return;
		}

		const marketContract = withWeb3(game == Game.DatamineGems ? contracts.market : contracts.gameHodlClicker);

		const fluxToken = withWeb3(contracts.fluxToken);

		const rewardsPercent = 500; // 5.00%, @todo customize via UI

		//@todo check if already authorized

		const isOperatorFor = await fluxToken.isOperatorFor(gameAddress, selectedAddress as string);
		devLog('isOperatorFor:', isOperatorFor);

		if (!isOperatorFor) {
			const authorizeOperatorResponse = await fluxToken.authorizeOperator({
				operator: gameAddress,
				from: selectedAddress as string,
			});
			devLog('authorizeOperatorResponse:', authorizeOperatorResponse);
		}

		const depositResponse = await marketContract.marketDeposit({
			amountToDeposit: amount,
			rewardsPercent,
			from: selectedAddress as string,
			minBlockNumber: 0n, //@todo customize via UI
			minBurnAmount: 0n, //@todo customize via UI
		});

		return depositResponse;
	},
	/**
	 * Refreshes the data for all addresses listed in the Datamine Gems GameFi market.
	 */
	[commonLanguage.queries.Market.GetRefreshMarketAddressesResponse]: async ({
		state,
		query,
	}: QueryHandler<AppState>) => {
		const { ecosystem, game, selectedAddress } = state;
		const publicClient = getPublicClient();

		if (!publicClient) {
			throw commonLanguage.errors.Web3NotFound;
		}

		const contracts = getContracts(publicClient, state.ecosystem);
		const config = getEcosystemConfig(state.ecosystem);

		const gameAddress = game === Game.DatamineGems ? config.marketAddress : config.gameHodlClickerAddress;

		if (!gameAddress) {
			return;
		}

		devLog('selectedAddress:', selectedAddress);
		if (!selectedAddress) {
			return;
		}

		const marketAddressesToFetch = config.marketTopBurningaddresses[game];

		const customGemAddresses = state.market.gemAddresses[ecosystem];

		// Always fetch selectedAddress so we can get details for it in UI (ex: total game balance)
		const allAddressesToFetch = [selectedAddress, ...marketAddressesToFetch, ...customGemAddresses]
			.filter((address) => address !== null)
			.map((address) => address.toLowerCase());

		// We'll add selectedAddress to fetch the current address too (so we don't have to do an extra call)
		const uniqueAddressesToFetch = [...new Set(allAddressesToFetch)];

		/**
		 * Some games might return more data that is required
		 */
		const getExtraData = () => {
			switch (game) {
				case Game.HodlClicker:
					return {
						totalContractRewardsAmount: {
							address: gameAddress,
							function: {
								signature: {
									name: 'totalContractRewardsAmount',
									type: 'function',
									inputs: [],
								},
								parameters: [],
							},

							returns: {
								params: ['uint256'],
								callback: (amount: bigint) => {
									return BigInt(amount.toString());
								},
							},
						},
						totalContractLockedAmount: {
							address: gameAddress,
							function: {
								signature: {
									name: 'totalContractLockedAmount',
									type: 'function',
									inputs: [],
								},
								parameters: [],
							},

							returns: {
								params: ['uint256'],
								callback: (amount: bigint) => {
									return BigInt(amount.toString());
								},
							},
						},
					};
				default:
					return {};
			}
		};

		const multicallData = {
			//@todoX current address details

			currentAddressMintableBalance: {
				address: config.mintableTokenContractAddress,
				function: {
					signature: {
						name: 'balanceOf',
						type: 'function',
						inputs: [
							{
								type: 'address',
								name: 'targetAddress',
							},
						],
					},
					parameters: [selectedAddress],
				},

				returns: {
					params: ['uint256'],
					callback: (positions: bigint) => {
						return BigInt(positions.toString());
					},
				},
			},

			// ETH Balance
			marketAddresses: {
				address: gameAddress,
				function: {
					signature: {
						name: 'getAddressLockDetailsBatch',
						type: 'function',
						inputs: [
							{
								type: 'address[]',
								name: 'addressesToQuery',
							},
						],
					},
					parameters: [uniqueAddressesToFetch],
				},

				returns: {
					params: ['(address, uint256, uint256, uint256, uint256, uint256, bool, address)[]', 'uint256'],
					callback: (addressData: any, targetBlock: any) => {
						return {
							targetBlock: Number(targetBlock),
							addresses: addressData.map((address: any) => ({
								currentAddress: address[0],
								mintAmount: BigInt(address[1].toString()),
								rewardsAmount: BigInt(address[2].toString()),
								rewardsPercent: Number(address[3]),
								minBlockNumber: Number(address[4]),
								minBurnAmount: BigInt(address[5].toString()),
								isPaused: address[6],

								minterAddress: address[7],
							})),
						};
					},
				},
			},
			...getExtraData(),
		} as any;

		// Call multicall aggregate and parse the results
		const calls = encodeMulticall(multicallData);
		if (!contracts.multicall) throw new Error('Multicall contract not initialized');
		const [blockNumber, returnData] = (await contracts.multicall.read.aggregate([calls])) as [bigint, any[]];

		const multicallEncodedResults: EncodedMulticallResults = {
			blockNumber: blockNumber.toString(),
			returnData,
		};

		const { marketAddresses, currentAddressMintableBalance, totalContractRewardsAmount, totalContractLockedAmount } =
			decodeMulticall(multicallEncodedResults, multicallData);

		devLog(
			'GetRefreshMarketAddressesResponse:',
			marketAddresses,
			currentAddressMintableBalance,
			totalContractRewardsAmount,
			totalContractLockedAmount
		);

		return {
			marketAddresses,
			currentAddressMintableBalance,
			game,
			totalContractRewardsAmount,
			totalContractLockedAmount,
		};
	},
	/**
	 * Withdraws all accumulated rewards from the Datamine Market.
	 */
	[commonLanguage.queries.Market.GetWithdrawMarketResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const { ecosystem, game } = state;
		const publicClient = getPublicClient();
		if (!publicClient) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = await getSelectedAddress();

		const contracts = getContracts(publicClient, state.ecosystem);

		const config = getEcosystemConfig(ecosystem);

		if (!config.marketAddress) {
			return;
		}

		const marketContract = withWeb3(game == Game.DatamineGems ? contracts.market : contracts.gameHodlClicker);

		const withdrawResponse = await marketContract.marketWithdrawAll({
			from: selectedAddress as string,
		});

		return withdrawResponse;
	},
	/**
	 * Unlocks all previously locked DAM tokens.
	 */
	[commonLanguage.queries.GetUnlockDamTokensResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const publicClient = getPublicClient();
		if (!publicClient) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = await getSelectedAddress();

		const contracts = getContracts(publicClient, state.ecosystem);

		const fluxToken = withWeb3(contracts.fluxToken);
		const response = await fluxToken.unlockDamTokens({
			from: selectedAddress as string,
		});

		devLog('GetUnlockDamTokensResponse:', response);

		return response && response.status;
	},

	/**
	 * Throttles requests for swap output quotes to prevent excessive calls while the user is typing.
	 */
	[commonLanguage.queries.Swap.ThrottleGetOutputQuote]: async ({ state, query, dispatch }: QueryHandler<AppState>) => {
		const publicClient = getPublicClient();
		if (!publicClient) {
			return;
		}

		clearTimeout(thottleGetOutputQuoteTimeout);

		thottleGetOutputQuoteTimeout = setTimeout(() => {
			dispatch({ type: commonLanguage.commands.Swap.ResetThottleGetOutputQuote });
		}, localConfig.thottleGetOutputQuoteMs);
	},
	/**
	 * Fetches the expected output amount for a given token swap.
	 */
	[commonLanguage.queries.Swap.GetOutputQuote]: async ({ state, query }: QueryHandler<AppState>) => {
		const publicClient = getPublicClient();
		if (!publicClient) {
			return;
		}

		const { swapState } = state;

		const inputToken = swapState.input;
		const outputToken = swapState.output;

		if (!inputToken || !outputToken) {
			console.log('invalid token:', { inputToken, outputToken });
			return;
		}

		if (inputToken.amount === '' || inputToken.amount === '0') {
			return;
		}

		const swapOptions: SwapOptions = {
			inputToken,
			outputToken,
			swapPlatform: SwapPlatform.UniswapV2,

			publicClient,
			web3provider: null,
			onlyGetQuote: true,
		};
		try {
			const quote = await performSwap(swapOptions);

			return quote;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	},
	/**
	 * Executes a token swap.
	 */
	[commonLanguage.queries.GetTradeResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const publicClient = getPublicClient();
		const walletClient = getWalletClient();
		if (!publicClient || !walletClient) {
			return;
		}

		const { swapState } = state;

		const inputToken = swapState.input;
		const outputToken = swapState.output;

		if (!inputToken || !outputToken) {
			console.log('invalid token:', { inputToken, outputToken });
			return;
		}

		const swapOptions: SwapOptions = {
			inputToken,
			outputToken,
			swapPlatform: SwapPlatform.UniswapV2,

			publicClient,
			walletClient,
			web3provider: null,
		};
		try {
			const quote = await performSwap(swapOptions);

			return quote;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	},
};

export default queryHandlers;
