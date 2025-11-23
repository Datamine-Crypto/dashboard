import Big from 'big.js';
import type { Web3 } from 'web3'; // Changed to type-only import
import { FluxAddressDetails, FluxAddressTokenDetails, Game } from '@/core/interfaces';
import { commonLanguage } from '@/core/web3/reducer/common';
import { AppState } from '@/core/web3/reducer/interfaces';

import damTokenAbi from '@/core/web3/abis/dam.json';
import fluxTokenAbi from '@/core/web3/abis/flux.json';
import batchMinterAbi from '@/core/web3/abis/batchMinter.json';
import marketAbi from '@/core/web3/abis/market.json';
import gameHodlClickerAbi from '@/core/web3/abis/games/gameHodlClicker.json';
import multicallAbi from '@/core/web3/abis/multicall.json';
import uniswapPairV3Abi from '@/core/web3/abis/uniswapPairV3.json';

import { getWeb3Provider, rethrowWeb3Error, withWeb3 } from '@/core/web3/helpers';

import BN from 'bn.js';

import { HelpArticle, helpArticles } from '@/core/helpArticles';
import { QueryHandler } from '@/core/sideEffectReducer';

import { getEcosystemConfig } from '@/configs/config';
import { Ecosystem, Layer, NetworkType } from '@/configs/config.common';
import { Gem } from '@/core/react/elements/Fragments/DatamineGemsGame';
import { devLog } from '@/core/utils/devLog';
import { performSwap } from '@/core/utils/swap/performSwap';
import { SwapOptions, SwapPlatform, SwapToken } from '@/core/utils/swap/swapOptions';
import { decodeMulticall, encodeMulticall, MultiCallParams } from '@/core/utils/web3multicall';

/**
 * @var web3provider - Holds the current Web3 provider instance (e.g., MetaMask, WalletConnect).
 */
let web3provider: any = null;

/**
 * @var preselectedAddress - Stores the user's address before full initialization, useful for early UI updates.
 */
let preselectedAddress: string | null = null;

/**
 * Retrieves the currently selected Ethereum address from the provider.
 * It checks multiple sources within the provider to ensure compatibility.
 * @returns The selected Ethereum address or null if not available.
 */
const getSelectedAddress = () => {
	if (!web3provider) {
		return null;
	}

	if (web3provider.accounts != null && web3provider.accounts.length > 0) {
		const selectedAddress = web3provider.accounts.length > 0 ? web3provider.accounts[0] : null;
		return selectedAddress;
	}

	const { selectedAddress } = web3provider;

	if (!selectedAddress) {
		if (preselectedAddress) {
			return preselectedAddress;
		}
	}

	return selectedAddress;
};

/**
 * Prompts the user to connect their wallet and pre-selects the first available address.
 * This function tries multiple methods to ensure wallet connection.
 * @returns An array of available addresses.
 */
const preselectAddress = async () => {
	try {
		const addresses = await web3provider.enable();

		devLog('enable:', addresses);
		if (addresses && addresses.length > 0) {
			preselectedAddress = addresses[0];
			return addresses;
		}
	} catch (err) {
		// Silently fail if can't find any addresses or enable() fails
	}

	const selectedAddress = getSelectedAddress();

	if (!selectedAddress && !preselectedAddress) {
		try {
			const accounts = await web3provider.request('eth_requestAccounts');
			if (accounts.length > 0) {
				preselectedAddress = accounts[0]; //@todo
				return accounts;
			}
		} catch (err) {
			// Silently fail if can't find any accounts
		}

		try {
			const accounts = await web3provider.send('eth_requestAccounts');
			if (accounts.length > 0) {
				preselectedAddress = accounts[0]; //@todo
				return accounts;
			}
		} catch (err) {
			// Silently fail if can't find any accounts
		}
	}

	return [];
};

/**
 * Initializes and returns contract instances based on the selected ecosystem.
 * @param web3 - The Web3 instance.
 * @param ecosystem - The currently selected ecosystem (e.g., DAM->FLUX L1).
 * @returns An object containing all necessary contract instances.
 */
const getContracts = (web3: Web3, ecosystem: Ecosystem) => {
	const config = getEcosystemConfig(ecosystem) as any;
	return {
		damToken: new web3.eth.Contract(damTokenAbi as any, config.lockableTokenContractAddress),
		fluxToken: new web3.eth.Contract(fluxTokenAbi as any, config.mintableTokenContractAddress),
		batchMinter: new web3.eth.Contract(batchMinterAbi as any, config.batchMinterAddress),

		// Datamine Gems
		market: config.marketAddress ? new web3.eth.Contract(marketAbi as any, config.marketAddress) : null,

		// HODL Clicker
		gameHodlClicker: config.gameHodlClickerAddress
			? new web3.eth.Contract(gameHodlClickerAbi as any, config.gameHodlClickerAddress)
			: null,

		//uniswapDamToken: new web3.eth.Contract(uniswapPairAbi as any, config.uniswapEthDamTokenContractAddress), // For Legacy Uniswap V2 contract(we use V3 now)
		//uniswapFluxToken: new web3.eth.Contract(uniswapPairAbi as any, config.uniswapFluxEthTokenContractAddress), // For Legacy Uniswap V2 contract(we use V3 now)
		//usdcEthToken: new web3.eth.Contract(uniswapPairAbi as any, config.uniswapUsdcEthTokenContractAddress), // For Legacy Uniswap V2 contract(we use V3 now)

		uniswapV3DamToken: new web3.eth.Contract(
			uniswapPairV3Abi as any,
			config.lockableUniswapV3L1EthTokenContractAddress
		),
		uniswapV3FluxToken: new web3.eth.Contract(
			uniswapPairV3Abi as any,
			config.mintableUniswapV3L1EthTokenContractAddress
		),
		uniswapV3UsdcEthToken: new web3.eth.Contract(uniswapPairV3Abi as any, config.uniswapV3UsdcEthTokenContractAddress),

		multicall: new web3.eth.Contract(multicallAbi as any, config.uniswapMulticallAdress),
	};
};

/**
 * Local configuration for Web3 bindings.
 */
const localConfig = {
	/**
	 * Always show connection buttons
	 */
	skipInitialConnection: false,

	/**
	 * How often to fetch new blocks? Ethereum block time is average of 12 seconds.
	 * We'll add 200ms latency to capture the majority of blocks (they're ~12.06-12.09 on average so 200ms should be plenty)
	 */
	blockUpdatesIntervalMs: 12000 + 200,

	/**
	 * How often to reset the throttle for quote ouputs
	 * This way when you're typing the amount you aren't fetching every keystroke (wait up to X miliseconds between each amount adjustmnet)
	 */
	thottleGetOutputQuoteMs: 1000,
};

/**
 * Subscribes to new block updates and dispatches a refresh command periodically.
 * @param web3 - The Web3 instance.
 * @param dispatch - The reducer's dispatch function.
 */
const subscribeToBlockUpdates = (web3: Web3, dispatch: ReducerDispatch) => {
	setInterval(() => {
		dispatch({ type: commonLanguage.commands.RefreshAccountState });
	}, localConfig.blockUpdatesIntervalMs);
};

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
		web3provider = provider;

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

		if (!web3provider) {
			devLog('EnableWeb3 web3provider is missing?');
			web3provider = await getWeb3Provider({ useWalletConnect: false, ecosystem: state.ecosystem });
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
		if (web3provider) {
			web3provider.disconnect();
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
	[commonLanguage.queries.FindAccountState]: async ({ state, query }: QueryHandler<AppState>) => {
		const { web3, address, ecosystem } = state;

		devLog('FindAccountState:', { address, ecosystem });

		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}

		// When user logs out clean the state (this will trigger a connect to wallte button)
		const selectedAddress = getSelectedAddress();
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

			const contracts = getContracts(web3, state.ecosystem);
			const config = getEcosystemConfig(state.ecosystem) as any;
			const isArbitrumMainnet = config.layer === Layer.Layer2;

			devLog('FindAccountState Making batch request:');

			const getFluxSupplyAddress = () => {
				if (isArbitrumMainnet) {
					return config.mintableSushiSwapL2EthPair as string;
				}

				return config.mintableUniswapV3L1EthTokenContractAddress as string;
			};
			const getDamSupplyAddress = () => {
				if (isArbitrumMainnet) {
					return config.lockableSushiSwapL2EthPair as string;
				}

				return config.lockableUniswapV3L1EthTokenContractAddress as string;
			};

			const getUniswapFluxPriceCall = (): Record<string, MultiCallParams> => {
				// On L2 we'll get the balance of pool from SushiSwap
				if (isArbitrumMainnet) {
					return {
						uniswapFluxTokenReservesV3: {
							address: config.mintableSushiSwapL2EthPair as string, //@todo change this
							function: {
								signature: {
									name: 'getReserves',
									type: 'function',
									inputs: [],
								},
								parameters: [],
							},

							returns: {
								params: ['uint112', 'uint112'],
								callback: (reserve0: string, reserve1: string) => {
									return {
										slot0: {
											sqrtPriceX96: reserve0,
										},
										reserve0,
										reserve1,
									};
								},
							},
						},
					};
				}

				// On L1 we'll get the balance of pool from Uniswap v3
				return {
					uniswapFluxTokenReservesV3: {
						address: config.mintableUniswapV3L1EthTokenContractAddress as string, //@todo change this
						function: {
							signature: {
								name: 'slot0',
								type: 'function',
								inputs: [],
							},
							parameters: [],
						},

						returns: {
							params: ['uint160'],
							callback: (sqrtPriceX96: string) => {
								return {
									slot0: {
										sqrtPriceX96,
									},
								};
							},
						},
					},
				};
			};

			const getUniswapDamPriceCall = (): Record<string, MultiCallParams> => {
				// On L2 we'll get the balance of pool from SushiSwap
				if (isArbitrumMainnet) {
					return {
						uniswapDamTokenReservesV3: {
							address: config.lockableSushiSwapL2EthPair as string, //@todo change this
							function: {
								signature: {
									name: 'getReserves',
									type: 'function',
									inputs: [],
								},
								parameters: [],
							},

							returns: {
								params: ['uint112', 'uint112'],
								callback: (reserve0: string, reserve1: string) => {
									// Swap pairs if you have created ETH / Lockable token instead
									if (config.lockableSushiSwapL2EthPairSwapPairs) {
										[reserve0, reserve1] = [reserve1, reserve0];
									}

									return {
										slot0: {
											sqrtPriceX96: reserve0,
										},
										reserve0,
										reserve1,
									};
								},
							},
						},
					};
				}

				// On L1 we'll get the balance of pool from Uniswap v3
				return {
					uniswapDamTokenReservesV3: {
						address: config.lockableUniswapV3L1EthTokenContractAddress || '',
						function: {
							signature: {
								name: 'slot0',
								type: 'function',
								inputs: [],
							},
							parameters: [],
						},

						returns: {
							params: ['uint160'],
							callback: (sqrtPriceX96: string) => {
								return {
									slot0: {
										sqrtPriceX96,
									},
								};
							},
						},
					},
				};
			};

			const getLockedLiquidityBalanceCall = (): Record<string, MultiCallParams> => {
				if (!config.lockedLiquidityUniswapAddress || !config.mintableSushiSwapL2EthPair) {
					return {};
				}

				return {
					lockedLiquidtyUniTotalSupply: {
						address: config.mintableSushiSwapL2EthPair, //This points to UNI-V2 Token
						function: {
							signature: {
								name: 'totalSupply',
								type: 'function',
								inputs: [],
							},
							parameters: [],
						},

						returns: {
							params: ['uint256'],
							callback: (totalSupply: string) => {
								return new BN(totalSupply);
							},
						},
					},
					lockedLiquidityUniAmount: {
						address: config.mintableSushiSwapL2EthPair, //This points to UNI-V2 Token
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
							parameters: [config.lockedLiquidityUniswapAddress],
						},

						returns: {
							params: ['uint256'],
							callback: (addressBalance: string) => {
								return new BN(addressBalance);
							},
						},
					},
				};
			};

			/**
			 * On ArbiFLUX ecostem this would return Lockquidity balance
			 * Since we only know DAM + FLUX (or ArbiFLUX + LOCK) we need to get the "other" token balance too.
			 * This is only needed in ArbiFLUX ecosystem (since in Lockquidity we can get ArbiFLUX balance from "lockable" balance)
			 */
			const getOtherEcosystemTokenBalance = (): Record<string, MultiCallParams> => {
				const getOtherEcosystem = () => {
					switch (state.ecosystem) {
						case Ecosystem.ArbiFlux:
							return Ecosystem.Lockquidity;
						default:
							return null;
					}
				};
				const otherEcosystem = getOtherEcosystem();
				if (!otherEcosystem) {
					return {};
				}

				const otherEcosystemConfig = getEcosystemConfig(otherEcosystem);

				const getAddress = () => {
					switch (state.ecosystem) {
						case Ecosystem.ArbiFlux:
							return otherEcosystemConfig.mintableTokenContractAddress; // Get Lockquidity balance
						default:
							return null;
					}
				};
				const address = getAddress();
				if (!address) {
					return {};
				}

				return {
					otherEcosystemTokenBalance: {
						address,
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
							parameters: [addressToFetch],
						},

						returns: {
							params: ['uint256'],
							callback: (addressBalance: string) => {
								return new BN(addressBalance);
							},
						},
					},
				};
			};

			const getMarketCall = (): Record<string, MultiCallParams> => {
				if (!config.marketAddress || config.marketAddress === '0x0') {
					return {};
				}

				return {
					/*
					currentAddresMintableBalance: {
						address: config.mintableTokenContractAddress, //@change this
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
					currentAddressMarketAddressLock: {
						address: config.marketAddress,
						function: {
							signature: {
								name: 'addressLocks',
								type: 'function',
								inputs: [
									{
										type: 'address',
										name: 'address',
									},
								],
							},
							parameters: [selectedAddress],
						},

						returns: {
							params: ['uint256', 'uint256', 'uint256', 'bool', 'uint256'],
							callback: (
								rewardsAmount: string,
								rewardsPercent: string,
								minBlockNumber: string,
								isPaused: string,
								minBurnAmount: string
							) => {
								return {
									rewardsAmount: new BN(rewardsAmount),
									rewardsPercent: new BN(rewardsPercent).toNumber(),
									minBlockNumber: new BN(minBlockNumber).toNumber(),
									isPaused: isPaused,
									minBurnAmount: new BN(minBurnAmount),
								};
							},
						},
					},*/
				};
			};

			const multicallData = {
				// ETH Balance
				ethBalance: {
					address: config.uniswapMulticallAdress,
					function: {
						signature: {
							name: 'getEthBalance',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'addr',
								},
							],
						},
						parameters: [addressToFetch],
					},

					returns: {
						params: ['uint256'],
						callback: (ethBalance: string) => {
							return new BN(ethBalance);
						},
					},
				},

				// Uniswap: ETH Price
				uniswapUsdcEthTokenReserves: {
					address: config.uniswapV3UsdcEthTokenContractAddress as string,
					function: {
						signature: {
							name: 'slot0',
							type: 'function',
							inputs: [],
						},
						parameters: [],
					},

					returns: {
						params: ['uint160'],
						callback: (sqrtPriceX96: string) => {
							const getUsdPriceFromUniswapV3EthPool = (sqrtPriceX96: string, flipPrice: boolean) => {
								const num = new Big(sqrtPriceX96).times(sqrtPriceX96);
								const denom = new Big(2).pow(192);
								const price1 = num.div(denom);
								const price0 = new Big(1).div(price1);

								if (flipPrice) {
									return new Big(10).pow(12).div(price1);
								}

								return new Big(10).pow(12).div(price0);
							};

							const ethUsdPrice = getUsdPriceFromUniswapV3EthPool(sqrtPriceX96, !isArbitrumMainnet); // Arbitrum is USDC/ETH and Mainnet is USDC/ETH

							const usdcPriceLong = ethUsdPrice.mul(new Big(10).pow(6));

							return {
								usdc: new BN(usdcPriceLong.toFixed(0)),
								eth: new BN(10).pow(new BN(18)),
							};
						},
					},
				},
				// FLUX: Total Supply
				fluxTotalSupply: {
					address: config.mintableTokenContractAddress,
					function: {
						signature: {
							name: 'totalSupply',
							type: 'function',
							inputs: [],
						},
						parameters: [],
					},

					returns: {
						params: ['uint256'],
						callback: (totalSupply: string) => {
							return new BN(totalSupply);
						},
					},
				},

				// DAM: Total Supply
				damTotalSupply: {
					address: config.lockableTokenContractAddress,
					function: {
						signature: {
							name: 'totalSupply',
							type: 'function',
							inputs: [],
						},
						parameters: [],
					},

					returns: {
						params: ['uint256'],
						callback: (totalSupply: string) => {
							return new BN(totalSupply);
						},
					},
				},

				// FLUX: Address token details
				addressTokenDetails: {
					address: config.mintableTokenContractAddress,
					function: {
						signature: {
							name: 'getAddressTokenDetails',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'targetAddress',
								},
							],
						},
						parameters: [addressToFetch],
					},

					returns: {
						params: ['uint256', 'bool', 'uint256', 'uint256', 'uint256'],
						callback: (
							blockNumber: string,
							isFluxOperator: boolean,
							damBalance: string,
							myRatio: string,
							globalRatio: string
						) => {
							return {
								blockNumber: new BN(blockNumber).toNumber(),
								isFluxOperator: isFluxOperator,
								damBalance: new BN(damBalance),
								myRatio: new BN(myRatio),
								globalRatio: new BN(globalRatio),
							};
						},
					},
				},

				// FLUX: Address locks
				addressLock: {
					address: config.mintableTokenContractAddress,
					function: {
						signature: {
							name: 'addressLocks',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'address',
								},
							],
						},
						parameters: [addressToFetch],
					},

					returns: {
						params: ['uint256', 'uint256', 'uint256', 'uint256', 'address'],
						callback: (
							amount: string,
							burnedAmount: string,
							blockNumber: string,
							lastMintBlockNumber: string,
							minterAddress: string
						) => {
							return {
								amount: new BN(amount),
								blockNumber: new BN(blockNumber).toNumber(),
								burnedAmount: new BN(burnedAmount),
								lastMintBlockNumber: new BN(lastMintBlockNumber).toNumber(),
								minterAddress: minterAddress.toLowerCase(),
							};
						},
					},
				},
				...getMarketCall(),

				// FLUX: Address details
				addressDetails: {
					address: config.mintableTokenContractAddress,
					function: {
						signature: {
							name: 'getAddressDetails',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'targetAddress',
								},
							],
						},
						parameters: [addressToFetch],
					},

					returns: {
						params: ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256'],
						callback: (
							blockNumber: string,
							fluxBalance: string,
							mintAmount: string,
							addressTimeMultiplier: string,
							addressBurnMultiplier: string,
							globalLockedAmount: string,
							globalBurnedAmount: string
						) => {
							return {
								blockNumber: new BN(blockNumber).toNumber(),
								fluxBalance: new BN(fluxBalance),
								mintAmount: new BN(mintAmount),
								addressTimeMultiplier: new BN(addressTimeMultiplier).toNumber(),
								addressBurnMultiplier: new BN(addressBurnMultiplier).toNumber(),
								addressTimeMultiplierRaw: new BN(addressTimeMultiplier),
								addressBurnMultiplierRaw: new BN(addressBurnMultiplier),
								globalLockedAmount: new BN(globalLockedAmount),
								globalBurnedAmount: new BN(globalBurnedAmount),
							};
						},
					},
				},

				// Uniswap: DAM Price
				...getUniswapDamPriceCall(),

				// DAM: Total Supply of Uniswap
				liquidityDamV3: {
					address: config.lockableTokenContractAddress,
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
						parameters: [getDamSupplyAddress()],
					},

					returns: {
						params: ['uint256'],
						callback: (positions: string) => {
							return positions;
						},
					},
				},

				// Uniswap: FLUX Price
				...getUniswapFluxPriceCall(),

				// FLUX: Total Supply of Uniswap
				uniswapFluxBalance: {
					address: config.mintableTokenContractAddress, //@change this
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
						parameters: [getFluxSupplyAddress()],
					},

					returns: {
						params: ['uint256'],
						callback: (positions: string) => {
							return positions;
						},
					},
				},

				// FLUX: Total Supply of Arbitrum Bridge
				arbitrumBridgeBalance: {
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
						parameters: ['0xcEe284F754E854890e311e3280b767F80797180d'], // This doesn't really do anything when on L2 since the balance would be 0 (extra call that can be removed in the future)
					},

					returns: {
						params: ['uint256'],
						callback: (positions: string) => {
							return positions;
						},
					},
				},

				// ETH: Total Supply of FLUX / ETH Uniswap Pool
				wrappedEthFluxUniswapAddressBalance: {
					address: config.wrappedEthAddress, //@change this
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
						parameters: [getFluxSupplyAddress()],
					},

					returns: {
						params: ['uint256'],
						callback: (positions: string) => {
							return positions;
						},
					},
				},

				// ETH: Total Supply of DAM / ETH Uniswap Pool
				wrappedEthDamUniswapAddressBalance: {
					address: config.wrappedEthAddress, //@change this
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
						parameters: [getDamSupplyAddress()],
					},

					returns: {
						params: ['uint256'],
						callback: (positions: string) => {
							return positions;
						},
					},
				},

				...getLockedLiquidityBalanceCall(),
				...getOtherEcosystemTokenBalance(),
			};

			const calls = encodeMulticall(web3, multicallData);
			const multicallEncodedResults = (await contracts.multicall.methods.aggregate(calls).call()) as any;

			const multicallDecodedResults = decodeMulticall(web3, multicallEncodedResults, multicallData);

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
				//currentAddressMarketAddressLock,
				//currentAddresMintableBalance,
			} = multicallDecodedResults;

			devLog('FindAccountState batch request success', multicallDecodedResults);

			const getV3ReservesDAM = () => {
				const { slot0, reserve0, reserve1 } = uniswapDamTokenReservesV3 as any;

				if (isArbitrumMainnet) {
					const ethAvailable = new Big(reserve1);
					const damAvailable = new Big(reserve0);

					const price1 = damAvailable.div(ethAvailable);
					const price0 = new Big(1).div(price1);

					return {
						eth: new BN(reserve0),
						dam: new BN(reserve1),
						ethPrice: price1,
						damPrice: price0,
					};
				}

				const { sqrtPriceX96 } = slot0;
				const num = new Big(sqrtPriceX96).times(sqrtPriceX96);
				const denom = new Big(2).pow(192);
				const price1 = num.div(denom);
				const price0 = new Big(1).div(price1);

				const damAvailable = new Big(liquidityDamV3 as string).div(new Big(10).pow(18));
				const ethAvailable = new Big(wrappedEthDamUniswapAddressBalance).div(new Big(10).pow(18));

				return {
					eth: new BN(ethAvailable.mul(100).toFixed(0)).mul(new BN(10).pow(new BN(16))),
					dam: new BN(damAvailable.mul(100).toFixed(0)).mul(new BN(10).pow(new BN(16))),
					ethPrice: price0,
					damPrice: price1,
				};
			};
			const fixedUniswapDamTokenReservesV3 = getV3ReservesDAM();

			const getV3ReservesFLUX = () => {
				const { slot0, reserve0, reserve1 } = uniswapFluxTokenReservesV3 as any;

				if (isArbitrumMainnet) {
					const ethAvailable = new Big(reserve0);
					const fluxAvailable = new Big(reserve1);

					const price1 = fluxAvailable.div(ethAvailable);
					const price0 = new Big(1).div(price1);

					return {
						eth: new BN(reserve1),
						flux: new BN(reserve0),
						ethPrice: price1,
						fluxPrice: price0,
					};
				}

				const { sqrtPriceX96, tick } = slot0;
				const num = new Big(sqrtPriceX96).times(sqrtPriceX96);
				const denom = new Big(2).pow(192);
				const price1 = num.div(denom);
				const price0 = new Big(1).div(price1);

				const fluxAvailable = new Big(uniswapFluxBalance as string).div(new Big(10).pow(18));
				const ethAvailable = new Big(wrappedEthFluxUniswapAddressBalance).div(new Big(10).pow(18));

				return {
					eth: new BN(ethAvailable.mul(100).toFixed(0)).mul(new BN(10).pow(new BN(16))),
					flux: new BN(fluxAvailable.mul(100).toFixed(0)).mul(new BN(10).pow(new BN(16))),
					ethPrice: price1,
					fluxPrice: price0,
				};
			};
			const fixedUniswapFluxTokenReservesV3 = getV3ReservesFLUX();

			const getSwapTokenBalances = () => {
				const getCurrentSwapTokenBalances = () => {
					if (!state.swapTokenBalances) {
						return {
							[Layer.Layer1]: {
								[SwapToken.DAM]: new BN(0),
								[SwapToken.FLUX]: new BN(0),
								[SwapToken.ETH]: new BN(0),
							},
							[Layer.Layer2]: {
								[SwapToken.ArbiFLUX]: new BN(0),
								[SwapToken.FLUX]: new BN(0),
								[SwapToken.LOCK]: new BN(0),
								[SwapToken.ETH]: new BN(0),
							},
						};
					}
					return state.swapTokenBalances;
				};
				const swapTokenBalances = getCurrentSwapTokenBalances();

				const getL2ArbiFluxSwapBalance = () => {
					switch (state.ecosystem) {
						case Ecosystem.ArbiFlux:
							return (addressDetails as FluxAddressDetails).fluxBalance;
						case Ecosystem.Lockquidity:
							return (addressTokenDetails as FluxAddressTokenDetails).damBalance;
					}

					return swapTokenBalances[Layer.Layer2][SwapToken.ArbiFLUX];
				};
				const getL2LockSwapBalance = () => {
					switch (state.ecosystem) {
						case Ecosystem.ArbiFlux:
							return otherEcosystemTokenBalance;
						case Ecosystem.Lockquidity:
							return (addressDetails as FluxAddressDetails).fluxBalance;
					}

					return swapTokenBalances[Layer.Layer2][SwapToken.ArbiFLUX];
				};

				const getFluxL2SwapBlance = () => {
					switch (state.ecosystem) {
						case Ecosystem.ArbiFlux:
							return (addressTokenDetails as FluxAddressTokenDetails).damBalance;
						//case Ecosystem.Lockquidity: //@todo get from extra prop
					}
					return swapTokenBalances[Layer.Layer2][SwapToken.FLUX];
				};

				return {
					[Layer.Layer1]: {
						[SwapToken.DAM]: !isArbitrumMainnet
							? (addressTokenDetails as FluxAddressTokenDetails).damBalance
							: swapTokenBalances[Layer.Layer1][SwapToken.DAM],
						[SwapToken.FLUX]: !isArbitrumMainnet
							? (addressDetails as FluxAddressDetails).fluxBalance
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
			const swapTokenBalances = getSwapTokenBalances();

			return {
				balances: {
					damToken: (addressTokenDetails as FluxAddressTokenDetails).damBalance,
					fluxToken: (addressDetails as FluxAddressDetails).fluxBalance,
					eth: ethBalance,

					fluxTotalSupply,
					damTotalSupply,

					uniswapDamTokenReserves: fixedUniswapDamTokenReservesV3,
					uniswapFluxTokenReserves: fixedUniswapFluxTokenReservesV3,
					uniswapUsdcEthTokenReserves,

					arbitrumBridgeBalance: new BN(arbitrumBridgeBalance),

					lockedLiquidtyUniTotalSupply,
					lockedLiquidityUniAmount,
				},
				swapTokenBalances,
				selectedAddress,
				addressLock,
				//marketAddressLock,
				//currentAddressMarketAddressLock,
				//currentAddresMintableBalance,
				addressDetails,
				addressTokenDetails,
			};
		};

		// Try 3 times to get account state
		for (let attempt = 0; attempt <= 3; attempt++) {
			try {
				const accountState = await getAccountState();
				return accountState;
			} catch (err) {
				devLog('FindAccountState batch request failure:', { err, message: (err as any).message });
				// Retry
				switch (attempt) {
					case 0:
						await new Promise((resolve) => setTimeout(resolve, 1000));
						continue;
					case 1:
						await new Promise((resolve) => setTimeout(resolve, 2500));
						continue;
					case 2:
						await new Promise((resolve) => setTimeout(resolve, 5000));
						continue;
				}

				const netId = await web3.eth.net.getId();
				devLog('netId:', netId);

				//const networkType = await web3.eth.net.networkType();
				const networkType = 'main';
				//devLog('networkType:', networkType)

				// This will pretty print on frontend in a table
				throw {
					err: (err as any).message ? (err as any).message : err,
					netId,
					networkType,
				};
			}
		}
	},
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
		const web3 = new Web3Constructor(web3provider);
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
			web3provider,
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
			web3provider,
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
				switch (helpArticlesNetworkType) {
					case NetworkType.Arbitrum:
						if (helpArticle.articleL2Path) {
							return helpArticle.articleL2Path;
						}
				}
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
