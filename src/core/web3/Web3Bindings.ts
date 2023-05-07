import { commonLanguage, Web3State } from './web3Reducer'
import Web3 from 'web3'
import { FluxAddressDetails, FluxAddressTokenDetails } from '../interfaces';
import Big from 'big.js'

import damTokenAbi from './abis/dam.json'
import fluxTokenAbi from './abis/flux.json'
import uniswapPairAbi from './abis/uniswapPair.json'
import uniswapPairV3Abi from './abis/uniswapPairV3.json'
import multicallAbi from './abis/multicall.json'

import { withWeb3 } from './helpers';

import BN from 'bn.js'
import Fuse from 'fuse.js'

import { QueryHandler } from '../sideEffectReducer';
import { HelpArticle, helpArticles } from '../helpArticles';
import WalletConnectProvider from "@walletconnect/web3-provider";
import detectEthereumProvider from '@metamask/detect-provider';

import axios from 'axios'
import { NetworkType } from '../../config.base';
import { devLog } from '../utils/devLog';
import { decodeMulticall, encodeMulticall } from '../utils/web3multicall';
import { getConfig } from '../../config';

let web3provider: any = null;

/**
 * Remove meta tags that cause WalletConnect issues for coinomi  
 */
const removeMetaTags = () => {
	const removeMetaTag = (metaName: string) => {
		const metas = document.getElementsByTagName('meta');

		for (let i = 0; i < metas.length; i++) {
			if (metas[i].getAttribute('property') === metaName || metas[i].getAttribute('name') === metaName) {
				return metas[i].remove();
			}
		}
	}
	removeMetaTag('description');
	removeMetaTag('og:description');
}

let walletConnectProvider: WalletConnectProvider | null = null;
let preselectedAddress: string | null = null;

const getSelectedAddress = () => {
	if (walletConnectProvider != null) {

		const selectedAddress = walletConnectProvider.accounts.length > 0 ? walletConnectProvider.accounts[0] : null;
		return selectedAddress
	}


	const { selectedAddress } = web3provider;

	if (!selectedAddress) {

		if (preselectedAddress) {
			return preselectedAddress;
		}
	}

	return selectedAddress;
}

const preselectAddress = async () => {

	try {
		const addresses = await web3provider.enable();

		console.log('enable:', addresses)
		if (addresses && addresses.length > 0) {
			preselectedAddress = addresses[0]
			return addresses;
		}
	} catch (err) {
	}

	const selectedAddress = getSelectedAddress()

	if (!selectedAddress && !preselectedAddress) {
		try {
			const accounts = await web3provider.request(
				"eth_requestAccounts"
			);
			if (accounts.length > 0) {
				preselectedAddress = accounts[0];//@todo
				return accounts;
			}
		} catch (err) {
		}

		try {
			const accounts = await web3provider.send(
				"eth_requestAccounts"
			);
			if (accounts.length > 0) {
				preselectedAddress = accounts[0];//@todo
				return accounts
			}
		} catch (err) {
		}
	}

	return []
}

const axiosInstance = axios.create({});

const getContracts = (web3: Web3, isArbitrumMainnet: boolean) => {
	const config = getConfig(isArbitrumMainnet);
	return {
		damToken: new web3.eth.Contract(damTokenAbi as any, config.lockableTokenContractAddress),
		fluxToken: new web3.eth.Contract(fluxTokenAbi as any, config.mintableTokenContractAddress),
		uniswapDamToken: new web3.eth.Contract(uniswapPairAbi as any, config.uniswapEthDamTokenContractAddress),
		uniswapFluxToken: new web3.eth.Contract(uniswapPairAbi as any, config.uniswapFluxEthTokenContractAddress),
		usdcEthToken: new web3.eth.Contract(uniswapPairAbi as any, config.uniswapUsdcEthTokenContractAddress),

		uniswapV3DamToken: new web3.eth.Contract(uniswapPairV3Abi as any, config.uniswapV3EthDamTokenContractAddress),
		uniswapV3FluxToken: new web3.eth.Contract(uniswapPairV3Abi as any, config.uniswapV3EthFluxTokenContractAddress),
		uniswapV3UsdcEthToken: new web3.eth.Contract(uniswapPairV3Abi as any, config.uniswapV3UsdcEthTokenContractAddress),

		multicall: new web3.eth.Contract(multicallAbi as any, config.uniswapMulticallAdress),
	}
}

const localConfig = {
	/**
	 * Always show connection buttons
	 */
	skipInitialConnection: false
}

let subscribedToBlockUpdates = false;

let intervalStarted = false //@todo can be a command/query

/**
 * Every block refresh account state 
 */
const subscribeToBlockUpdates = (web3: Web3, dispatch: React.Dispatch<any>) => {
	if (subscribedToBlockUpdates) {
		return;
	}
	const startInterval = () => {
		if (!intervalStarted) {

			intervalStarted = true;
			setInterval(() => {
				dispatch({ type: commonLanguage.commands.RefreshAccountState });
			}, 15000);
		}
	}

	if (web3) {
		web3.eth
			.subscribe('newBlockHeaders', (error: any) => {
				if (!error) {
					return;
				}
				console.error('newBlockHeaders error:', error);
			})
			.on("data", (e: any) => {
				// Refresh account every new block (this can be optimized later)
				dispatch({ type: commonLanguage.commands.RefreshAccountState });
			})
			.on("error", (e) => {
				devLog('newBlockHeaders error. Starting setInterval:', e)

				startInterval()//@todo can be a command/query
			});

		subscribedToBlockUpdates = true;

	}
}

const getSignature = async (web3: any, selectedAddress: any) => {

	const msgParams = [
		{
			type: 'string',
			name: 'Message',
			value: 'DISPLAY_DATAMINE_PRO_ACCESS_LINKS'
		},
	]

	var from = selectedAddress
	var params = [msgParams, from]

	const method = 'eth_signTypedData';

	const result = await new Promise((resolve, reject) => {
		(web3.currentProvider as any).sendAsync({
			method,
			params,
			from,
		}, function (err: any, result: any) {
			if (err) {
				reject(err);
				return;
			}

			if (!result.result) {
				reject('Invalid return')
				return;
			}

			resolve(result.result);
		})
	});

	return result;
}

const getProvider = async ({ isArbitrumMainnet, useWalletConnect }: { isArbitrumMainnet: boolean, useWalletConnect: boolean }) => {
	if (!!useWalletConnect) {
		removeMetaTags();

		walletConnectProvider = new WalletConnectProvider({
			//infuraId: localConfig.infuraId,
			rpc: {
				1: 'https://rpc.ankr.com/eth',
				42161: 'https://arb1.arbitrum.io/rpc'
			},
			chainId: isArbitrumMainnet ? 42161 : 1
		});

		//  Enable session (triggers QR Code modal)

		await walletConnectProvider.enable();

		return walletConnectProvider;
	}

	if (window.ethereum) {
		devLog('found window.ethereum provider:')
		return window.ethereum
	}

	try {
		const provider = await detectEthereumProvider();
		return provider;
	} catch (err) {

	}

	// Trustwallet provider
	{
		const { trustwallet } = window as any
		if (trustwallet && trustwallet.Provider) {
			return trustwallet.Provider
		}
	}

	// For generic web3 
	{
		const web3 = (window as any).web3
		if (web3 && web3.currentProvider) {
			return web3.currentProvider
		}
	}

	return window.ethereum as any;
}


const queryHandlers = {
	[commonLanguage.queries.FindWeb3Instance]: async ({ query, dispatch }: QueryHandler<Web3State>) => {
		const isArbitrumMainnet = query.payload?.isArbitrumMainnet;

		const useWalletConnect = query.payload?.useWalletConnect

		const provider = await getProvider({ useWalletConnect, isArbitrumMainnet })
		devLog('Found provider:', { provider, isArbitrumMainnet, useWalletConnect })
		web3provider = provider;

		if (provider) {
			const web3 = new Web3(provider);

			if (!useWalletConnect) {
				/**
				 * Listen for any account changes to refresh data
				 */
				const subscribeToAccountUpdates = (dispatch: React.Dispatch<any>) => {
					provider.on('accountsChanged', () => {
						dispatch({
							type: commonLanguage.commands.RefreshAccountState,
							payload: { updateEthBalance: true }
						});
					});
				}
				subscribeToAccountUpdates(dispatch);

				const subscribeToNetworkChanges = (dispatch: React.Dispatch<any>) => {
					provider.on('networkChanged', () => {
						window.location.reload();
					});
				}
				subscribeToNetworkChanges(dispatch);
			} else {
				// WalletConnect address
				if (walletConnectProvider) {
					provider.on('accountsChanged', () => {
						dispatch({
							type: commonLanguage.commands.RefreshAccountState,
							payload: { updateEthBalance: true }
						});
					});
					provider.on('disconnect', () => {
						window.location.reload();
					});
				}
			}



			const getInitialSelectedAddress = () => {
				if (localConfig.skipInitialConnection) {
					return null;
				}

				const selectedAddress = getSelectedAddress()
				if (selectedAddress) {
					subscribeToBlockUpdates(web3, dispatch);
				}
				return selectedAddress;
			}
			const selectedAddress = getInitialSelectedAddress();

			devLog('FindWeb3Instance selectedAddress:', selectedAddress)

			const networkType = 'main';

			const chainId = await web3.eth.getChainId();
			devLog('FindWeb3Instance chainId:', chainId)


			const isArbitrumMainnet = chainId === 42161
			devLog('FindWeb3Instance isArbitrumMainnet:', isArbitrumMainnet)

			// We'll be handling errors from reverts so pass them in. (Arbitrum can't use this)
			if (!isArbitrumMainnet) {
				//	web3.eth.handleRevert = false;
			}

			return {
				web3,
				//contracts,
				selectedAddress,
				networkType,
				chainId,
				useWalletConnect
			};
		}

		throw commonLanguage.errors.Web3NotFound;
	},
	[commonLanguage.queries.EnableWeb3]: async ({ state, dispatch }: QueryHandler<Web3State>) => {
		// Reemove wlaletConnectionProvider to ensure getSelectedAddress() returns proper address
		walletConnectProvider = null;

		if (!web3provider) {
			devLog('EnableWeb3 web3provider is missing?')
			web3provider = await getProvider({ useWalletConnect: false, isArbitrumMainnet: false })
		}

		// Checks to see if user has selectedAddress. If not we'll call eth_requestAccounts and select first one
		const addresses = await preselectAddress()
		devLog('EnableWeb3 addresses:', addresses)

		const selectedAddress = getSelectedAddress();
		devLog('EnableWeb3 selectedAddress:', selectedAddress)

		const { web3 } = state;
		if (web3 && selectedAddress) {
			subscribeToBlockUpdates(web3, dispatch);
		}

		return {
			selectedAddress
		}
	},
	[commonLanguage.queries.EnableWalletConnect]: async ({ state, query, dispatch }: QueryHandler<Web3State>) => {
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

		const subscribeToAccountUpdates = (dispatch: React.Dispatch<any>) => {
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
	[commonLanguage.queries.DisconnectWalletConnect]: async ({ state, dispatch }: QueryHandler<Web3State>) => {
		if (walletConnectProvider) {
			walletConnectProvider.disconnect();
		}
	},

	[commonLanguage.queries.FindAccessLinks]: async ({ state, query }: QueryHandler<Web3State>) => {

		const { web3 } = state;
		const selectedAddress = getSelectedAddress();

		if (web3) {
			try {

				const signature = await getSignature(web3, selectedAddress)
				console.log('signature:', signature)

				/*const response = await axiosInstance({
					method: 'post',
					url: '/accessLinks/generate',
					data: {
						signature
					}
				  });
						
			  console.log('generate:x',signature,response)*/

			} catch (err) {
				console.log('err:', err)
			}


		}

		console.log('FindAccessLinks!')
		const accessLinks: any[] = []

		return {
			accessLinks
		}
	},
	[commonLanguage.queries.FindAccountState]: async ({ state, query }: QueryHandler<Web3State>) => {
		const { web3, address, isArbitrumMainnet } = state;

		devLog('FindAccountState:', { address, isArbitrumMainnet })

		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}

		// When user logs out clean the state (this will trigger a connect to wallte button)
		const selectedAddress = getSelectedAddress();
		devLog('FindAccountState selectedAddress:', selectedAddress)

		if (!selectedAddress) {
			return {
				balances: null,
				selectedAddress: null,
				addressLock: null,
				addressDetails: null
			}
		}

		const getAccountState = async () => {
			const getEthBalance = async () => {

				// Always update balance if it's forced refresh or zero
				return new BN('1')
			}

			devLog('Starting FindAccountState ethBalance...')
			const ethBalance = await getEthBalance();
			devLog('FindAccountState ethBalance:', ethBalance.toString())

			const addressToFetch = address ?? selectedAddress;
			devLog('FindAccountState addressToFetch:', { addressToFetch, isArbitrumMainnet })

			const contracts = getContracts(web3, isArbitrumMainnet)
			const config = getConfig(isArbitrumMainnet);

			devLog('FindAccountState Making batch request:')

			const getFluxSupplyAddress = () => {
				if (isArbitrumMainnet) {
					return config.sushiSwapFluxEthPair as string
				}

				return config.uniswapV3EthFluxTokenContractAddress as string
			}
			const getDamSupplyAddress = () => {
				if (isArbitrumMainnet) {
					return config.sushiSwapDamEthPair as string
				}

				return config.uniswapV3EthDamTokenContractAddress as string
			}

			const getUniswapFluxPriceCall = () => {
				if (isArbitrumMainnet) {
					return [{
						address: config.sushiSwapFluxEthPair as string, //@todo change this
						function: {
							signature: {
								name: 'getReserves',
								type: 'function',
								inputs: []
							},
							parameters: []
						},

						returns: {
							params: ['uint112', 'uint112'],
							callback: (reserve0: string, reserve1: string) => {
								return {
									slot0: {
										sqrtPriceX96: reserve0
									},
									reserve0,
									reserve1
								}
							}
						}
					}]
				}

				return [{
					address: config.uniswapV3EthFluxTokenContractAddress as string, //@todo change this
					function: {
						signature: {
							name: 'slot0',
							type: 'function',
							inputs: []
						},
						parameters: []
					},

					returns: {
						params: ['uint160'],
						callback: (sqrtPriceX96: string) => {
							return {
								slot0: {
									sqrtPriceX96
								}
							}
						}
					}
				}]
			}

			const getUniswapDamPriceCall = () => {
				if (isArbitrumMainnet) {
					return [{
						address: config.sushiSwapDamEthPair as string, //@todo change this
						function: {
							signature: {
								name: 'getReserves',
								type: 'function',
								inputs: []
							},
							parameters: []
						},

						returns: {
							params: ['uint112', 'uint112'],
							callback: (reserve0: string, reserve1: string) => {
								return {
									slot0: {
										sqrtPriceX96: reserve0
									},
									reserve0,
									reserve1
								}
							}
						}
					}]
				}
				return [{
					address: config.uniswapV3EthDamTokenContractAddress as string,
					function: {
						signature: {
							name: 'slot0',
							type: 'function',
							inputs: []
						},
						parameters: []
					},

					returns: {
						params: ['uint160'],
						callback: (sqrtPriceX96: string) => {
							return {
								slot0: {
									sqrtPriceX96
								}
							}
						}
					}
				}]
			}

			const multicallData = [

				// Uniswap: ETH Price
				{
					address: config.uniswapV3UsdcEthTokenContractAddress as string,
					function: {
						signature: {
							name: 'slot0',
							type: 'function',
							inputs: []
						},
						parameters: []
					},

					returns: {
						params: ['uint160'],
						callback: (sqrtPriceX96: string) => {
							const getUsdPriceFromUniswapV3EthPool = (sqrtPriceX96: string, flipPrice: boolean) => {

								const num = new Big(sqrtPriceX96).times(sqrtPriceX96)
								const denom = new Big(2).pow(192)
								const price1 = num.div(denom)
								const price0 = new Big(1).div(price1)

								if (flipPrice) {
									return new Big(10).pow(12).div(price1)
								}

								return new Big(10).pow(12).div(price0)

							}

							const ethUsdPrice = getUsdPriceFromUniswapV3EthPool(sqrtPriceX96, !isArbitrumMainnet) // Arbitrum is USDC/ETH and Mainnet is USDC/ETH

							const usdcPriceLong = ethUsdPrice.mul(new Big(10).pow(6))

							return {
								usdc: new BN(usdcPriceLong.toFixed(0)),
								eth: new BN(10).pow(new BN(18))
							}
						}
					}
				},
				// FLUX: Total Supply
				{
					address: config.mintableTokenContractAddress,
					function: {
						signature: {
							name: 'totalSupply',
							type: 'function',
							inputs: []
						},
						parameters: []
					},

					returns: {
						params: ['uint256'],
						callback: (totalSupply: string) => {
							return new BN(totalSupply)
						}
					}
				},

				// DAM: Total Supply
				{
					address: config.lockableTokenContractAddress,
					function: {
						signature: {
							name: 'totalSupply',
							type: 'function',
							inputs: []
						},
						parameters: []
					},

					returns: {
						params: ['uint256'],
						callback: (totalSupply: string) => {
							return new BN(totalSupply)
						}
					}
				},


				// FLUX: Address token details
				{
					address: config.mintableTokenContractAddress,
					function: {
						signature: {
							name: 'getAddressTokenDetails',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'targetAddress'
								}
							]
						},
						parameters: [addressToFetch]
					},

					returns: {
						params: ['uint256', 'bool', 'uint256', 'uint256', 'uint256'],
						callback: (blockNumber: string, isFluxOperator: boolean, damBalance: string, myRatio: string, globalRatio: string) => {
							return {
								blockNumber: new BN(blockNumber).toNumber(),
								isFluxOperator: isFluxOperator,
								damBalance: new BN(damBalance),
								myRatio: new BN(myRatio),
								globalRatio: new BN(globalRatio)
							}
						}
					}
				},


				// FLUX: Address locks
				{
					address: config.mintableTokenContractAddress,
					function: {
						signature: {
							name: 'addressLocks',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'address'
								}
							]
						},
						parameters: [addressToFetch]
					},

					returns: {
						params: ['uint256', 'uint256', 'uint256', 'uint256', 'address'],
						callback: (amount: string, burnedAmount: string, blockNumber: string, lastMintBlockNumber: string, minterAddress: string) => {
							return {
								amount: new BN(amount),
								blockNumber: new BN(blockNumber).toNumber(),
								burnedAmount: new BN(burnedAmount),
								lastMintBlockNumber: new BN(lastMintBlockNumber).toNumber(),
								minterAddress: minterAddress.toLowerCase()
							}
						}
					}
				},

				// FLUX: Address details
				{
					address: config.mintableTokenContractAddress,
					function: {
						signature: {
							name: 'getAddressDetails',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'targetAddress'
								}
							]
						},
						parameters: [addressToFetch]
					},

					returns: {
						params: ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256'],
						callback: (blockNumber: string, fluxBalance: string, mintAmount: string, addressTimeMultiplier: string, addressBurnMultiplier: string, globalLockedAmount: string, globalBurnedAmount: string) => {
							return {
								blockNumber: new BN(blockNumber).toNumber(),
								fluxBalance: new BN(fluxBalance),
								mintAmount: new BN(mintAmount),
								addressTimeMultiplier: new BN(addressTimeMultiplier).toNumber(),
								addressBurnMultiplier: new BN(addressBurnMultiplier).toNumber(),
								addressTimeMultiplierRaw: new BN(addressTimeMultiplier),
								addressBurnMultiplierRaw: new BN(addressBurnMultiplier),
								globalLockedAmount: new BN(globalLockedAmount),
								globalBurnedAmount: new BN(globalBurnedAmount)
							}
						}
					}
				},

				// Uniswap: DAM Price
				...getUniswapDamPriceCall(),


				// DAM: Total Supply of Uniswap
				{
					address: config.lockableTokenContractAddress,
					function: {
						signature: {
							name: 'balanceOf',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'targetAddress'
								}]
						},
						parameters: [getDamSupplyAddress()]
					},

					returns: {
						params: ['uint256'],
						callback: (positions: string) => {
							return positions
						}
					}
				},


				// Uniswap: FLUX Price
				...getUniswapFluxPriceCall(),

				// FLUX: Total Supply of Uniswap
				{
					address: config.mintableTokenContractAddress, //@change this
					function: {
						signature: {
							name: 'balanceOf',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'targetAddress'
								}]
						},
						parameters: [getFluxSupplyAddress()]
					},

					returns: {
						params: ['uint256'],
						callback: (positions: string) => {
							return positions
						}
					}
				},

				// FLUX: Total Supply of Arbitrum Bridge
				{
					address: config.mintableTokenContractAddress,
					function: {
						signature: {
							name: 'balanceOf',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'targetAddress'
								}]
						},
						parameters: ['0xcEe284F754E854890e311e3280b767F80797180d'] // This doesn't really do anything when on L2 since the balance would be 0 (extra call that can be removed in the future)
					},

					returns: {
						params: ['uint256'],
						callback: (positions: string) => {
							return positions
						}
					}
				},

				// ETH: Total Supply of FLUX / ETH Uniswap Pool
				{
					address: config.wrappedEthAddress, //@change this
					function: {
						signature: {
							name: 'balanceOf',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'targetAddress'
								}]
						},
						parameters: [getFluxSupplyAddress()]
					},

					returns: {
						params: ['uint256'],
						callback: (positions: string) => {
							return positions
						}
					}
				},

				// ETH: Total Supply of DAM / ETH Uniswap Pool
				{
					address: config.wrappedEthAddress, //@change this
					function: {
						signature: {
							name: 'balanceOf',
							type: 'function',
							inputs: [
								{
									type: 'address',
									name: 'targetAddress'
								}]
						},
						parameters: [getDamSupplyAddress()]
					},

					returns: {
						params: ['uint256'],
						callback: (positions: string) => {
							return positions
						}
					}
				},

			]

			const multicallEncodedResults = await contracts.multicall.methods.aggregate(encodeMulticall(web3, multicallData)).call();

			const multicallDecodedResults = decodeMulticall(web3, multicallEncodedResults, multicallData)

			const [
				uniswapUsdcEthTokenReserves,
				fluxTotalSupply,
				damTotalSupply,
				addressTokenDetails,

				addressLock,
				addressDetails,

				uniswapDamTokenReservesV3, liquidityDamV3,
				uniswapFluxTokenReservesV3, uniswapFluxTokensTicksV3,

				arbitrumBridgeBalance, wrappedEthFluxUniswapAddressBalance, wrappedEthDamUniswapAddressBalance
			] = multicallDecodedResults

			devLog('FindAccountState batch request success')

			const getV3ReservesDAM = () => {
				const { slot0, reserve0, reserve1 } = uniswapDamTokenReservesV3 as any

				if (isArbitrumMainnet) {
					const ethAvailable = new Big(reserve1)
					const damAvailable = new Big(reserve0)

					const price1 = damAvailable.div(ethAvailable)
					const price0 = new Big(1).div(price1)

					return {
						eth: new BN(reserve0),
						dam: new BN(reserve1),
						ethPrice: price1,
						damPrice: price0
					}
				}


				const { sqrtPriceX96 } = slot0
				const num = new Big(sqrtPriceX96).times(sqrtPriceX96)
				const denom = new Big(2).pow(192)
				const price1 = num.div(denom)
				const price0 = new Big(1).div(price1)

				const damAvailable = new Big(liquidityDamV3 as string).div(new Big(10).pow(18))
				const ethAvailable = new Big(wrappedEthDamUniswapAddressBalance).div(new Big(10).pow(18))

				return {
					eth: new BN(ethAvailable.mul(100).toFixed(0)).mul(new BN(10).pow(new BN(16))),
					dam: new BN(damAvailable.mul(100).toFixed(0)).mul(new BN(10).pow(new BN(16))),
					ethPrice: price0,
					damPrice: price1
				}
			}
			const fixedUniswapDamTokenReservesV3 = getV3ReservesDAM();

			const getV3ReservesFLUX = () => {
				const { slot0, reserve0, reserve1 } = uniswapFluxTokenReservesV3 as any

				if (isArbitrumMainnet) {
					const ethAvailable = new Big(reserve0)
					const fluxAvailable = new Big(reserve1)

					const price1 = fluxAvailable.div(ethAvailable)
					const price0 = new Big(1).div(price1)

					return {
						eth: new BN(reserve1),
						flux: new BN(reserve0),
						ethPrice: price1,
						fluxPrice: price0
					}
				}


				const { sqrtPriceX96, tick } = slot0
				const num = new Big(sqrtPriceX96).times(sqrtPriceX96)
				const denom = new Big(2).pow(192)
				const price1 = num.div(denom)
				const price0 = new Big(1).div(price1)

				const fluxAvailable = new Big(uniswapFluxTokensTicksV3 as string).div(new Big(10).pow(18))
				const ethAvailable = new Big(wrappedEthFluxUniswapAddressBalance).div(new Big(10).pow(18))

				return {
					eth: new BN(ethAvailable.mul(100).toFixed(0)).mul(new BN(10).pow(new BN(16))),
					flux: new BN(fluxAvailable.mul(100).toFixed(0)).mul(new BN(10).pow(new BN(16))),
					ethPrice: price1,
					fluxPrice: price0
				}
			}
			const fixedUniswapFluxTokenReservesV3 = getV3ReservesFLUX();

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
					arbitrumBridgeBalance: new BN(arbitrumBridgeBalance)
				},
				selectedAddress,
				addressLock,
				addressDetails,
				addressTokenDetails
			};
		}

		// Try 3 times to get account state
		for (let attempt = 0; attempt <= 3; attempt++) {
			try {
				const accountState = await getAccountState()
				return accountState;
			} catch (err) {
				devLog('FindAccountState batch request failure:', { err, message: (err as any).message })
				// Retry
				switch (attempt) {
					case 0:
						await new Promise(resolve => setTimeout(resolve, 1000))
						continue;
					case 1:
						await new Promise(resolve => setTimeout(resolve, 2500))
						continue;
					case 2:
						await new Promise(resolve => setTimeout(resolve, 5000))
						continue;

				}

				const netId = await web3.eth.net.getId();
				devLog('netId:', netId)

				const networkType = await web3.eth.net.getNetworkType();
				devLog('networkType:', networkType)

				// This will pretty print on frontend in a table
				throw {
					err: (<any>err).message ? (<any>err).message : err,
					netId,
					networkType
				}
			}
		}
	},
	[commonLanguage.queries.GetAuthorizeFluxOperatorResponse]: async ({ state }: QueryHandler<Web3State>) => {
		const { web3, isArbitrumMainnet } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const contracts = getContracts(web3, isArbitrumMainnet)
		const config = getConfig(isArbitrumMainnet)

		const damToken = withWeb3(web3, contracts.damToken);

		const response = await damToken.authorizeOperator({
			operator: config.mintableTokenContractAddress,
			from: selectedAddress
		});

		console.log('GetAuthorizeFluxOperatorResponse:', response);

		return response && response.status
	},
	[commonLanguage.queries.GetLockInDamTokensResponse]: async ({ state, query }: QueryHandler<Web3State>) => {
		const { web3, isArbitrumMainnet } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const { amount, minterAddress } = query.payload;

		const contracts = getContracts(web3, isArbitrumMainnet)

		const fluxToken = withWeb3(web3, contracts.fluxToken);

		const response = await fluxToken.lock({
			amount,
			minterAddress,
			from: selectedAddress
		});

		console.log('GetLockInDamTokensResponse:', response);

		return response && response.status
	},
	[commonLanguage.queries.GetMintFluxResponse]: async ({ state, query }: QueryHandler<Web3State>) => {
		const { web3, isArbitrumMainnet } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const { sourceAddress, targetAddress, blockNumber } = query.payload;

		const contracts = getContracts(web3, isArbitrumMainnet)

		const fluxToken = withWeb3(web3, contracts.fluxToken);
		const response = await fluxToken.mintToAddress({
			sourceAddress,
			targetAddress,
			blockNumber,
			from: selectedAddress
		});

		console.log('GetMintFluxResponse:', response);

		return response && response.status
	},
	[commonLanguage.queries.GetBurnFluxResponse]: async ({ state, query }: QueryHandler<Web3State>) => {
		const { web3, isArbitrumMainnet } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const { address, amount } = query.payload;

		const contracts = getContracts(web3, isArbitrumMainnet)

		const fluxToken = withWeb3(web3, contracts.fluxToken);
		const response = await fluxToken.burnToAddress({
			targetAddress: address,
			amount,
			from: selectedAddress
		});

		return response && response.status
	},
	[commonLanguage.queries.GetUnlockDamTokensResponse]: async ({ state, query }: QueryHandler<Web3State>) => {
		const { web3, isArbitrumMainnet } = state;
		if (!web3) {
			throw commonLanguage.errors.Web3NotFound;
		}
		const selectedAddress = getSelectedAddress();

		const contracts = getContracts(web3, isArbitrumMainnet)

		const fluxToken = withWeb3(web3, contracts.fluxToken);
		const response = await fluxToken.unlockDamTokens({
			from: selectedAddress
		});

		console.log('GetUnlockDamTokensResponse:', response);

		return response && response.status
	},
	[commonLanguage.queries.GetTradeResponse]: async ({ state, query }: QueryHandler<Web3State>) => {


	},
	[commonLanguage.queries.ResetHelpArticleBodies]: async ({ }: QueryHandler<Web3State>) => {
		// After switching network betwen L1/L2 clear the body (so proper body loads)
		for (const helpArticle of helpArticles) {
			helpArticle.body = undefined;
		}

	},
	[commonLanguage.queries.GetFullHelpArticle]: async ({ state, query }: QueryHandler<Web3State>) => {
		const helpArticle = query.payload.helpArticle as HelpArticle
		const helpArticlesNetworkType = query.payload.helpArticlesNetworkType as NetworkType;


		if (!helpArticle.body) {

			const getHelpArticleMdPath = () => {
				switch (helpArticlesNetworkType) {
					case NetworkType.Arbitrum:
						if (helpArticle.articleL2Path) {
							return helpArticle.articleL2Path
						}
				}
				return helpArticle.id
			}
			const helpArticleMdPath = getHelpArticleMdPath()

			const helpArticlePath = `helpArticles/${helpArticleMdPath}.md`
			const response = await axiosInstance.get<string>(helpArticlePath)

			helpArticle.body = response.data
		}

		return helpArticle;
	},

	[commonLanguage.queries.PerformSearch]: async ({ state, query }: QueryHandler<Web3State>) => {
		const { searchQuery } = query.payload
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
			keys: [
				"title",
			]
		};

		const fuse = new Fuse(helpArticles, options);
		const results = fuse.search(searchQuery)

		const mappedResults = results.map((result: any) => ({
			...result.item,
			refIndex: result.refIndex
		}))
		return mappedResults;
	},
}

export {
	queryHandlers
}