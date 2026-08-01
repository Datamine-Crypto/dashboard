import Big from 'big.js';

import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem, Layer } from '@/app/configs/config.common';
import { devLog } from '@/utils/devLog';
import { decodeMulticall, encodeMulticall, EncodedMulticallResults } from '@/web3/utils/web3multicall';
import { getContracts, getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';
import { SwapToken } from '@/web3/swap/swapOptions';
import { FindAccountStateContext } from '@/app/state/queries/web3/findAccountState/calls/context';
import {
	getDamSupplyAddress,
	getFluxSupplyAddress,
	getHodlClickerAddressLock,
	getLockedLiquidityBalanceCall,
	getOtherEcosystemTokenBalance,
	getUniswapDamPriceCall,
	getUniswapFluxPriceCall,
} from '@/app/state/queries/web3/findAccountState/calls/poolCalls';
import {
	getLockableTokenPoolReserves,
	getMintableTokenPoolReserves,
} from '@/app/state/queries/web3/findAccountState/decode/reserves';
import { getUsdPriceFromUniswapV3EthPool } from '@/app/state/queries/web3/findAccountState/decode/uniswapV3Price';
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
						outputs: [{ type: 'uint256', name: 'balance' }],
						stateMutability: 'view',
					} as const,
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
						outputs: [
							{ type: 'uint160', name: 'sqrtPriceX96' },
							{ type: 'int24', name: 'tick' },
							{ type: 'uint16', name: 'observationIndex' },
							{ type: 'uint16', name: 'observationCardinality' },
							{ type: 'uint16', name: 'observationCardinalityNext' },
							{ type: 'uint8', name: 'feeProtocol' },
							{ type: 'bool', name: 'unlocked' },
						],
						stateMutability: 'view',
					} as const,
					parameters: [],
				},

				returns: {
					params: ['uint160'],
					callback: (sqrtPriceX96: bigint) => {
						// Arbitrum and mainnet order this pool's tokens differently, hence the flip flag.
						const ethUsdPrice = getUsdPriceFromUniswapV3EthPool(sqrtPriceX96.toString(), !isArbitrumMainnet);

						// A pool reporting no price yields zero rather than throwing. Consumers already
						// treat a zero USDC reserve as "price unavailable" and render a loading state.
						const usdcPriceLong = (ethUsdPrice ?? new Big(0)).mul(new Big(10).pow(6));

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
						outputs: [{ type: 'uint256', name: '' }],
						stateMutability: 'view',
					} as const,
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
						outputs: [{ type: 'uint256', name: '' }],
						stateMutability: 'view',
					} as const,
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
						outputs: [
							{ type: 'uint256', name: '' },
							{ type: 'bool', name: '' },
							{ type: 'uint256', name: '' },
							{ type: 'uint256', name: '' },
							{ type: 'uint256', name: '' },
						],
						stateMutability: 'view',
					} as const,
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
						outputs: [
							{ type: 'uint256', name: 'amount' },
							{ type: 'uint256', name: 'burnedAmount' },
							{ type: 'uint256', name: 'blockNumber' },
							{ type: 'uint256', name: 'lastMintBlockNumber' },
							{ type: 'address', name: 'minterAddress' },
						],
						stateMutability: 'view',
					} as const,
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
			...getHodlClickerAddressLock(context),

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
						outputs: [
							{ type: 'uint256', name: '' },
							{ type: 'uint256', name: '' },
							{ type: 'uint256', name: '' },
							{ type: 'uint256', name: '' },
							{ type: 'uint256', name: '' },
							{ type: 'uint256', name: '' },
							{ type: 'uint256', name: '' },
						],
						stateMutability: 'view',
					} as const,
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
			...getUniswapDamPriceCall(context),

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
						outputs: [{ type: 'uint256', name: '' }],
						stateMutability: 'view',
					} as const,
					parameters: [getDamSupplyAddress(context)],
				},

				returns: {
					params: ['uint256'],
					callback: (positions: bigint) => {
						return positions.toString();
					},
				},
			},

			// Uniswap: FLUX Price
			...getUniswapFluxPriceCall(context),

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
						outputs: [{ type: 'uint256', name: '' }],
						stateMutability: 'view',
					} as const,
					parameters: [getFluxSupplyAddress(context)],
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
						outputs: [{ type: 'uint256', name: '' }],
						stateMutability: 'view',
					} as const,
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
						outputs: [{ type: 'uint256', name: '' }],
						stateMutability: 'view',
					} as const,
					parameters: [getFluxSupplyAddress(context)],
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
						outputs: [{ type: 'uint256', name: '' }],
						stateMutability: 'view',
					} as const,
					parameters: [getDamSupplyAddress(context)],
				},

				returns: {
					params: ['uint256'],
					callback: (positions: bigint) => {
						return positions.toString();
					},
				},
			},

			...getLockedLiquidityBalanceCall(context),
			...getOtherEcosystemTokenBalance(context),
		};

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
			currentAddressHodlClickerAddressLock,
		};
	};

	return await getAccountState();
};
