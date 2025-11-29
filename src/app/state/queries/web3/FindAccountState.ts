import Big from 'big.js';

import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem, Layer } from '@/app/configs/config.common';
import { devLog } from '@/utils/devLog';
import { decodeMulticall, encodeMulticall, MultiCallParams, EncodedMulticallResults } from '@/web3/utils/web3multicall';
import { getContracts, getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';
import { SwapToken } from '@/web3/swap/swapOptions';

/**
 * Fetches all relevant on-chain data for the current user account in a single batch request using multicall.
 * This includes balances, contract details, and Uniswap pool reserves.
 */
export const findAccountState = async ({ state, query }: QueryHandler<AppState>) => {
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
							callback: (reserve0: bigint, reserve1: bigint) => {
								return {
									slot0: {
										sqrtPriceX96: reserve0.toString(),
									},
									reserve0: reserve0.toString(),
									reserve1: reserve1.toString(),
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
						callback: (sqrtPriceX96: bigint) => {
							return {
								slot0: {
									sqrtPriceX96: sqrtPriceX96.toString(),
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
							callback: (reserve0_bigint: bigint, reserve1_bigint: bigint) => {
								let reserve0 = reserve0_bigint.toString();
								let reserve1 = reserve1_bigint.toString();
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
						callback: (sqrtPriceX96: bigint) => {
							return {
								slot0: {
									sqrtPriceX96: sqrtPriceX96.toString(),
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
						callback: (totalSupply: bigint) => {
							return totalSupply;
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
						callback: (addressBalance: bigint) => {
							return addressBalance;
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
						callback: (addressBalance: bigint) => {
							return addressBalance;
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
				currentAddressMintableBalance: {
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
							return BigInt(positions);
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
								rewardsAmount: BigInt(rewardsAmount),
								rewardsPercent: Number(rewardsPercent),
								minBlockNumber: Number(minBlockNumber),
								isPaused: isPaused,
								minBurnAmount: BigInt(minBurnAmount),
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
					callback: (ethBalance: bigint) => {
						return ethBalance;
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
					callback: (sqrtPriceX96: bigint) => {
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

						const ethUsdPrice = getUsdPriceFromUniswapV3EthPool(sqrtPriceX96.toString(), !isArbitrumMainnet); // Arbitrum is USDC/ETH and Mainnet is USDC/ETH

						const usdcPriceLong = ethUsdPrice.mul(new Big(10).pow(6));

						return {
							usdc: BigInt(usdcPriceLong.toFixed(0)),
							eth: 10n ** 18n,
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
					callback: (totalSupply: bigint) => {
						return totalSupply;
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
					callback: (totalSupply: bigint) => {
						return totalSupply;
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
						blockNumber: bigint,
						isFluxOperator: boolean,
						damBalance: bigint,
						myRatio: bigint,
						globalRatio: bigint
					) => {
						return {
							blockNumber: Number(blockNumber),
							isFluxOperator: isFluxOperator,
							damBalance: damBalance,
							myRatio: myRatio,
							globalRatio: globalRatio,
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
						amount: bigint,
						burnedAmount: bigint,
						blockNumber: bigint,
						lastMintBlockNumber: bigint,
						minterAddress: string
					) => {
						return {
							amount: amount,
							blockNumber: Number(blockNumber),
							burnedAmount: burnedAmount,
							lastMintBlockNumber: Number(lastMintBlockNumber),
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
						blockNumber: bigint,
						fluxBalance: bigint,
						mintAmount: bigint,
						addressTimeMultiplier: bigint,
						addressBurnMultiplier: bigint,
						globalLockedAmount: bigint,
						globalBurnedAmount: bigint
					) => {
						return {
							blockNumber: Number(blockNumber),
							fluxBalance: fluxBalance,
							mintAmount: mintAmount,
							addressTimeMultiplier: Number(addressTimeMultiplier),
							addressBurnMultiplier: Number(addressBurnMultiplier),
							addressTimeMultiplierRaw: addressTimeMultiplier,
							addressBurnMultiplierRaw: addressBurnMultiplier,
							globalLockedAmount: globalLockedAmount,
							globalBurnedAmount: globalBurnedAmount,
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
					callback: (positions: bigint) => {
						return positions.toString();
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
					callback: (positions: bigint) => {
						return positions.toString();
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
					callback: (positions: bigint) => {
						return positions.toString();
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
					callback: (positions: bigint) => {
						return positions.toString();
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
					callback: (positions: bigint) => {
						return positions.toString();
					},
				},
			},

			...getLockedLiquidityBalanceCall(),
			...getOtherEcosystemTokenBalance(),
		};

		const calls = encodeMulticall(multicallData);
		if (!contracts.multicall) {
			throw new Error('Multicall contract not initialized');
		}
		const [blockNumber, returnData] = (await contracts.multicall.read.aggregate([calls])) as [bigint, any[]];
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
			//currentAddressMarketAddressLock,
			//currentAddressMintableBalance,
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
					eth: BigInt(reserve0),
					dam: BigInt(reserve1),
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
				eth: BigInt(ethAvailable.mul(100).toFixed(0)) * 10n ** 16n,
				dam: BigInt(damAvailable.mul(100).toFixed(0)) * 10n ** 16n,
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
					flux: BigInt(reserve0),
					eth: BigInt(reserve1),
					ethPrice: price1,
					fluxPrice: price0,
				};
			}

			const { sqrtPriceX96 } = slot0;
			const num = new Big(sqrtPriceX96).times(sqrtPriceX96);
			const denom = new Big(2).pow(192);
			const price1 = num.div(denom);
			const price0 = new Big(1).div(price1);

			const fluxAvailable = new Big(uniswapFluxBalance as string).div(new Big(10).pow(18));
			const ethAvailable = new Big(wrappedEthFluxUniswapAddressBalance).div(new Big(10).pow(18));

			return {
				eth: BigInt(ethAvailable.mul(100).toFixed(0)) * 10n ** 16n,
				flux: BigInt(fluxAvailable.mul(100).toFixed(0)) * 10n ** 16n,
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
				return state.swapTokenBalances;
			};
			const swapTokenBalances = getCurrentSwapTokenBalances();

			const getL2ArbiFluxSwapBalance = () => {
				switch (state.ecosystem) {
					case Ecosystem.ArbiFlux:
						return addressDetails.fluxBalance;
					case Ecosystem.Lockquidity:
						return addressTokenDetails.damBalance;
				}

				return swapTokenBalances[Layer.Layer2][SwapToken.ArbiFLUX];
			};
			const getL2LockSwapBalance = () => {
				switch (state.ecosystem) {
					case Ecosystem.ArbiFlux:
						return otherEcosystemTokenBalance;
					case Ecosystem.Lockquidity:
						return addressDetails.fluxBalance;
				}

				return swapTokenBalances[Layer.Layer2][SwapToken.ArbiFLUX];
			};

			const getFluxL2SwapBlance = () => {
				switch (state.ecosystem) {
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
		const swapTokenBalances = getSwapTokenBalances();

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
		};
	};

	return await getAccountState();
};
