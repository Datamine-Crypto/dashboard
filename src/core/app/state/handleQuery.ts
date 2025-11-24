import { Game } from '@/core/app/interfaces';
import { commonLanguage } from '@/core/app/state/commonLanguage';
import { ReducerDispatch, AppState } from '@/core/app/state/stateInterfaces';
import { getWeb3Provider, rethrowWeb3Error, withWeb3 } from '@/core/utils/helperFunctions';
import BN from 'bn.js';
import { HelpArticle, helpArticles } from '@/core/app/helpArticles';
import { QueryHandler } from '@/core/utils/reducer/sideEffectReducer';
import { getEcosystemConfig } from '@/core/app/configs/config';
import { NetworkType } from '@/core/app/configs/config.common';
import { Gem } from '@/core/react/elements/Fragments/DatamineGemsGame';
import { devLog } from '@/core/utils/devLog';
import { performSwap } from '@/core/web3/swap/performSwap';
import { SwapOptions, SwapPlatform } from '@/core/web3/swap/swapOptions';
import { decodeMulticall, encodeMulticall } from '@/core/web3/utils/web3multicall';
import {
	getContracts,
	getSelectedAddress,
	getWeb3ProviderInstance,
	localConfig,
	preselectAddress,
	setWeb3Provider,
	subscribeToBlockUpdates,
} from '@/core/web3/utils/web3ProviderUtils';
import { findAccountState } from '@/core/app/state/queries/FindAccountState';

/**
 * @var thottleGetOutputQuoteTimeout - Timeout ID for throttling swap quote requests.
 */
let thottleGetOutputQuoteTimeout: any;

// This module executes the asynchronous Web3 operations requested by the web3Reducer.
// Each function here corresponds to a specific blockchain interaction (e.g., minting, swapping, reading contract data).
// It's crucial that these functions handle network errors and return results back to the reducer for state updates.
const queryHandlers = {
	/**
	 * Finds and initializes the Web3 provider (MetaMask or WalletConnect).
	 * It sets up listeners for account and network changes to keep the app state synced.
	 */
	[commonLanguage.queries.FindWeb3Instance]: async ({ state, query, dispatch }: QueryHandler<AppState>) => {
		const useWalletConnect = query.payload?.useWalletConnect;

		const provider = await getWeb3Provider({ useWalletConnect, ecosystem: state.ecosystem });
		devLog('Found provider:', { provider, useWalletConnect, ecosystem: state.ecosystem });
		setWeb3Provider(provider);

		if (provider) {
			// Dynamically import the Web3 constructor
			const { default: Web3Constructor } = await import('web3');
			const web3 = new Web3Constructor(provider);
			web3.transactionBlockTimeout = 4 * 60 * 60; // (So users don't get timed out while selecting their transaction settings) 1 hour on L2

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
				provider.on('disconnect', () => {
					window.location.reload();
				});
			};
			subscribeToNetworkChanges(dispatch);

			/**
			 * Retrieves the initial selected address and starts block update subscriptions if available.
			 */
			const getInitialSelectedAddress = () => {
				if (localConfig.skipInitialConnection) {
					return null;
				}

				const selectedAddress = getSelectedAddress();
				if (selectedAddress) {
					subscribeToBlockUpdates(web3, dispatch);
				}
				return selectedAddress;
			};
			const selectedAddress = getInitialSelectedAddress();

			devLog('FindWeb3Instance selectedAddress:', selectedAddress);

			const networkType = 'main';

			const chainId = Number(await web3.eth.getChainId());
			devLog('FindWeb3Instance chainId:', chainId);

			const isArbitrumMainnet = chainId === 42161;
			devLog('FindWeb3Instance isArbitrumMainnet:', isArbitrumMainnet);

			// We'll be handling errors from reverts so pass them in. (Arbitrum can't use this)
			if (!isArbitrumMainnet) {
				//	web3.eth.handleRevert = false;
				// This was commented out but we handle exceptions by catching them (see handleError() in helpers.ts)
			}

			return {
				web3,
				//contracts,
				selectedAddress,
				networkType,
				chainId,
				useWalletConnect,
			};
		}

		throw commonLanguage.errors.Web3NotFound;
	},
	/**
	 * Enables the Web3 provider, requesting account access from the user if necessary.
	 */
	[commonLanguage.queries.EnableWeb3]: async ({ state, dispatch }: QueryHandler<AppState>) => {
		// Reemove wlaletConnectionProvider to ensure getSelectedAddress() returns proper address
		//walletConnectProvider = null;

		if (!getWeb3ProviderInstance()) {
			devLog('EnableWeb3 web3provider is missing?');
			setWeb3Provider(await getWeb3Provider({ useWalletConnect: false, ecosystem: state.ecosystem }));
		}

		// Checks to see if user has selectedAddress. If not we'll call eth_requestAccounts and select first one
		const addresses = await preselectAddress();
		devLog('EnableWeb3 addresses:', addresses);

		const selectedAddress = getSelectedAddress();
		devLog('EnableWeb3 selectedAddress:', selectedAddress);

		const { web3 } = state;
		if (web3 && selectedAddress) {
			subscribeToBlockUpdates(web3, dispatch);
		}

		return {
			selectedAddress,
		};
	},
	/*
	[commonLanguage.queries.EnableWalletConnect]: async ({ state, query, dispatch }: QueryHandler<AppState>) => {
		const { isArbitrumMainnet } = query.payload

		removeMetaTags();

		walletConnectProvider = new WalletConnectProvider({
			rpc: {
				1: 'https://rpc.ankr.com/eth',
				42161: 'https://arb1.arbitrum.io/rpc'
			},
			chainId: isArbitrumMainnet ? 42161 : 1
		});

		//  Enable session (triggers QR Code modal)
		await walletConnectProvider.enable();

		const subscribeToAccountUpdates = (dispatch: ReducerDispatch) => {
			if (!walletConnectProvider) {
				return;
			}

			walletConnectProvider.on('accountsChanged', () => {
				dispatch({
					type: commonLanguage.commands.RefreshAccountState,
					payload: { updateEthBalance: true }
				});
			});
			walletConnectProvider.on('disconnect', () => {
				window.location.reload();
			});
		}

		subscribeToAccountUpdates(dispatch);

		const { web3 } = state;
		web3?.setProvider(walletConnectProvider as any);

		const selectedAddress = walletConnectProvider.accounts.length > 0 ? walletConnectProvider.accounts[0] : null;

		if (web3 && selectedAddress) {
			subscribeToBlockUpdates(web3, dispatch);
		}

		return {
			selectedAddress
		}
	},
	*/
	/**
	 * Disconnects the WalletConnect session.
	 */
	[commonLanguage.queries.DisconnectWalletConnect]: async ({ state, dispatch }: QueryHandler<AppState>) => {
		const provider = getWeb3ProviderInstance();
		if (provider) {
			provider.disconnect();
		}
	},

	/**
	 * Fetches access links for pro features by sending a signed message to the backend.
	 */
	[commonLanguage.queries.FindAccessLinks]: async ({ state, query }: QueryHandler<AppState>) => {
		const { web3 } = state;
		const selectedAddress = getSelectedAddress();

		if (web3) {
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
	/**
	 * Fetches all relevant on-chain data for the current user account in a single batch request using multicall.
	 * This includes balances, contract details, and Uniswap pool reserves.
	 */
	[commonLanguage.queries.FindAccountState]: findAccountState,
	/**
	 * Authorizes the FLUX contract to spend the user's DAM tokens.
	 */
	[commonLanguage.queries.GetAuthorizeFluxOperatorResponse]: async ({ state }: QueryHandler<AppState>) => {
		const { web3 } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const contracts = getContracts(web3, state.ecosystem);
		const config = getEcosystemConfig(state.ecosystem);

		const damToken = withWeb3(web3, contracts.damToken);

		const response = await damToken.authorizeOperator({
			operator: config.mintableTokenContractAddress,
			from: selectedAddress,
		});

		devLog('GetAuthorizeFluxOperatorResponse:', response);

		return response && response.status;
	},
	/**
	 * Locks a specified amount of DAM tokens to start minting FLUX.
	 */
	[commonLanguage.queries.GetLockInDamTokensResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const { web3 } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const { amount, minterAddress } = query.payload;

		const contracts = getContracts(web3, state.ecosystem);

		const fluxToken = withWeb3(web3, contracts.fluxToken);

		const response = await fluxToken.lock({
			amount,
			minterAddress,
			from: selectedAddress,
		});

		devLog('GetLockInDamTokensResponse:', response);

		return { minterAddress };
	},
	/**
	 * Mints available FLUX tokens.
	 */
	[commonLanguage.queries.GetMintFluxResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const { web3 } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const { sourceAddress, targetAddress, blockNumber } = query.payload;

		const contracts = getContracts(web3, state.ecosystem);
		const config = getEcosystemConfig(state.ecosystem);
		const getResponse = async () => {
			const minterAddress = state.addressLock?.minterAddress;

			if (config.batchMinterAddress?.toLowerCase() === minterAddress?.toLowerCase()) {
				const batchMinter = withWeb3(web3, contracts.batchMinter);

				return await batchMinter.batchNormalMintTo({
					sourceAddress,
					targetAddress,
					blockNumber,
					from: selectedAddress,
				});
			} else {
				const fluxToken = withWeb3(web3, contracts.fluxToken);

				return await fluxToken.mintToAddress({
					sourceAddress,
					targetAddress,
					blockNumber,
					from: selectedAddress,
				});
			}
		};

		const response = await getResponse();

		devLog('GetMintFluxResponse:', response);

		return response && response.status;
	},

	[commonLanguage.queries.GetSetMintSettingsResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const { web3 } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const { address } = query.payload;

		const contracts = getContracts(web3, state.ecosystem);

		const fluxToken = withWeb3(web3, contracts.batchMinter);
		const response = await fluxToken.setDelegatedMinter({
			delegatedMinterAddress: address,
			from: selectedAddress,
		});

		return response && response.status;
	},
	/**
	 * Burns a specified amount of FLUX tokens to increase the minting multiplier.
	 */
	[commonLanguage.queries.GetBurnFluxResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const { web3 } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const { address, amount } = query.payload;

		const contracts = getContracts(web3, state.ecosystem);

		const fluxToken = withWeb3(web3, contracts.fluxToken);
		const response = await fluxToken.burnToAddress({
			targetAddress: address,
			amount,
			from: selectedAddress,
		});

		return response && response.status;
	},
	/**
	 * Burns tokens through the Datamine Market to collect rewards from other validators.
	 */
	[commonLanguage.queries.Market.GetMarketBurnFluxResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const { web3, ecosystem, game } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const { gems, amountToBurn }: { gems: Gem[]; amountToBurn: BN } = query.payload;

		const contracts = getContracts(web3, state.ecosystem);

		const config = getEcosystemConfig(ecosystem);

		if (!config.marketAddress) {
			return;
		}

		const marketContract = withWeb3(web3, game == Game.DatamineGems ? contracts.market : contracts.gameHodlClicker);

		if (gems.length === 1) {
			const gem = gems[0];
			const burnResponse = await marketContract.marketBurnTokens({
				amountToBurn,
				burnToAddress: gem.ethereumAddress,

				from: selectedAddress,
			});
			devLog(burnResponse);
			return { gems };
		} else {
			const addresses = gems.map((gem) => gem.ethereumAddress);
			const burnBatchResponse = await marketContract.marketBatchBurnTokens({
				amountToBurn,
				addresses,
				from: selectedAddress,
			});
			devLog(burnBatchResponse);
			return { gems };
		}
	},
	/**
	 * Deposits tokens into the Datamine Market to be available for public burning.
	 */
	[commonLanguage.queries.Market.GetDepositMarketResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const { web3, ecosystem, game } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const { address, amount } = query.payload;

		const contracts = getContracts(web3, state.ecosystem);

		const config = getEcosystemConfig(ecosystem);

		const gameAddress = game === Game.DatamineGems ? config.marketAddress : config.gameHodlClickerAddress;

		if (!gameAddress) {
			return;
		}

		const marketContract = withWeb3(web3, game == Game.DatamineGems ? contracts.market : contracts.gameHodlClicker);

		const fluxToken = withWeb3(web3, contracts.fluxToken);

		const rewardsPercent = 500; // 5.00%, @todo customize via UI

		//@todo check if already authorized

		const isOperatorFor = await fluxToken.isOperatorFor(gameAddress, selectedAddress)();
		devLog('isOperatorFor:', isOperatorFor);

		if (!isOperatorFor) {
			const authorizeOperatorResponse = await fluxToken.authorizeOperator({
				operator: gameAddress,
				from: selectedAddress,
			});
			devLog('authorizeOperatorResponse:', authorizeOperatorResponse);
		}

		const depositResponse = await marketContract.marketDeposit({
			amountToDeposit: amount,
			rewardsPercent,
			from: selectedAddress,
			minBlockNumber: new BN(0), //@todo customize via UI
			minBurnAmount: new BN(0), //@todo customize via UI
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

		const { default: Web3Constructor } = await import('web3');
		const web3 = new Web3Constructor(getWeb3ProviderInstance());
		web3.transactionBlockTimeout = 4 * 60 * 60; // (So users don't get timed out while selecting their transaction settings) 1 hour on L2

		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}

		const contracts = getContracts(web3, state.ecosystem);
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
								callback: (amount: string) => {
									return new BN(amount);
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
								callback: (amount: string) => {
									return new BN(amount);
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

			currentAddresMintableBalance: {
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
					callback: (positions: string) => {
						return new BN(positions);
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
					params: ['tuple(address,uint256,uint256,uint256,uint256,uint256,bool,address)[]', 'uint256'],
					callback: (addressData: any, targetBlock: any) => {
						return {
							targetBlock: Number(targetBlock),
							addresses: addressData.map((address: any) => ({
								currentAddress: address[0],
								mintAmount: new BN(address[1]),

								rewardsAmount: new BN(address[2]),
								rewardsPercent: Number(address[3]),
								minBlockNumber: Number(address[4]),
								minBurnAmount: new BN(address[5]),
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
		const calls = encodeMulticall(web3, multicallData);
		const multicallEncodedResults = (await contracts.multicall.methods.aggregate(calls).call({})) as any;

		const { marketAddresses, currentAddresMintableBalance, totalContractRewardsAmount, totalContractLockedAmount } =
			decodeMulticall(web3, multicallEncodedResults, multicallData);
		devLog(
			'GetRefreshMarketAddressesResponse:',
			marketAddresses,
			currentAddresMintableBalance,
			totalContractRewardsAmount,
			totalContractLockedAmount
		);

		return {
			marketAddresses,
			currentAddresMintableBalance,
			game,
			totalContractRewardsAmount,
			totalContractLockedAmount,
		};
	},
	/**
	 * Withdraws all accumulated rewards from the Datamine Market.
	 */
	[commonLanguage.queries.Market.GetWithdrawMarketResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const { web3, ecosystem, game } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const contracts = getContracts(web3, state.ecosystem);

		const config = getEcosystemConfig(ecosystem);

		if (!config.marketAddress) {
			return;
		}

		const marketContract = withWeb3(web3, game == Game.DatamineGems ? contracts.market : contracts.gameHodlClicker);

		const withdrawResponse = await marketContract.marketWithdrawAll({
			from: selectedAddress,
		});

		return withdrawResponse;
	},
	/**
	 * Unlocks all previously locked DAM tokens.
	 */
	[commonLanguage.queries.GetUnlockDamTokensResponse]: async ({ state, query }: QueryHandler<AppState>) => {
		const { web3 } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const contracts = getContracts(web3, state.ecosystem);

		const fluxToken = withWeb3(web3, contracts.fluxToken);
		const response = await fluxToken.unlockDamTokens({
			from: selectedAddress,
		});

		devLog('GetUnlockDamTokensResponse:', response);

		return response && response.status;
	},

	/**
	 * Throttles requests for swap output quotes to prevent excessive calls while the user is typing.
	 */
	[commonLanguage.queries.Swap.ThrottleGetOutputQuote]: async ({ state, query, dispatch }: QueryHandler<AppState>) => {
		if (!state.web3) {
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
		if (!state.web3) {
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

			web3: state.web3,
			web3provider: getWeb3ProviderInstance(),
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
		if (!state.web3) {
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

			web3: state.web3,
			web3provider: getWeb3ProviderInstance(),
		};
		try {
			await performSwap(swapOptions);
		} catch (err) {
			rethrowWeb3Error(err);
		}

		return true;
	},
	/**
	 * Resets the body of all help articles, forcing a refetch when the network changes.
	 */
	[commonLanguage.queries.ResetHelpArticleBodies]: async () => {
		// After switching network betwen L1/L2 clear the body (so proper body loads)
		for (const helpArticle of helpArticles) {
			helpArticle.body = undefined;
		}
	},
	/**
	 * Fetches the full content of a specific help article from its Markdown file.
	 */
	[commonLanguage.queries.GetFullHelpArticle]: async ({ state, query }: QueryHandler<AppState>) => {
		const helpArticle = query.payload.helpArticle as HelpArticle;
		const helpArticlesNetworkType = query.payload.helpArticlesNetworkType as NetworkType;

		if (!helpArticle.body) {
			const getHelpArticleMdPath = () => {
				return helpArticle.id;
			};
			const helpArticleMdPath = getHelpArticleMdPath();

			const helpArticlePath = `helpArticles/${helpArticleMdPath}.md`;
			const response = await fetch(helpArticlePath);

			if (response.ok) {
				const fileContent: string = await response.text();
				helpArticle.body = fileContent;
			}
		}

		return helpArticle;
	},

	/**
	 * Performs a search on help articles using Fuse.js.
	 */
	[commonLanguage.queries.PerformSearch]: async ({ state, query }: QueryHandler<AppState>) => {
		const { searchQuery } = query.payload;
		const options = {
			// isCaseSensitive: false,
			// includeScore: false,
			// shouldSort: true,
			// includeMatches: false,
			// findAllMatches: false,
			// minMatchCharLength: 1,
			// location: 0,
			// threshold: 0.6,
			// distance: 100,
			// useExtendedSearch: false,
			// ignoreLocation: false,
			// ignoreFieldNorm: false,
			keys: ['title'],
		};

		// Dynamically import Fuse
		const { default: Fuse } = await import('fuse.js');

		const fuse = new Fuse(helpArticles, options);
		const results = fuse.search(searchQuery);

		const mappedResults = results.map((result: any) => ({
			...result.item,
			refIndex: result.refIndex,
		}));
		return mappedResults;
	},
};

export { queryHandlers };
