import Big from 'big.js';

import { MultiCallParams } from '@/web3/utils/web3multicall';
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
import { getUsdPriceFromUniswapV3EthPool } from '@/app/state/queries/web3/findAccountState/decode/uniswapV3Price';

/**
 * Builds the complete set of multicall entries fetched for an account.
 *
 * Every balance, supply, pool reading and contract detail the dashboard needs is requested in a
 * single batched call. Each entry pairs the call definition with a `returns.callback` that
 * decodes that specific result, so encoding and decoding stay side by side.
 *
 * @param context Configuration, ecosystem and target address for this read.
 * @returns A map of result-name to multicall definition, consumed by `encodeMulticall`.
 */
export const buildAccountMulticall = (context: FindAccountStateContext): Record<string, MultiCallParams> => {
	return {
		// ETH Balance
		ethBalance: {
			address: context.config.uniswapMulticallAdress,
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
				parameters: [context.addressToFetch],
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
			address: context.config.uniswapV3UsdcEthTokenContractAddress as string,
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
					const ethUsdPrice = getUsdPriceFromUniswapV3EthPool(sqrtPriceX96.toString(), !context.isArbitrumMainnet);

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
			address: context.config.mintableTokenContractAddress,
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
			address: context.config.lockableTokenContractAddress,
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
			address: context.config.mintableTokenContractAddress,
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
				parameters: [context.addressToFetch],
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
			address: context.config.mintableTokenContractAddress,
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
				parameters: [context.addressToFetch],
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
			address: context.config.mintableTokenContractAddress,
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
				parameters: [context.addressToFetch],
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
			address: context.config.lockableTokenContractAddress,
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
			address: context.config.mintableTokenContractAddress, //@change this
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
			address: context.config.mintableTokenContractAddress,
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
			address: context.config.wrappedEthAddress, //@change this
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
			address: context.config.wrappedEthAddress, //@change this
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
};
