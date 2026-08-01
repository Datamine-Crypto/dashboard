import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import { MultiCallParams } from '@/web3/utils/web3multicall';
import { HodlClickerAddressLockDetailsViewModel } from '@/app/interfaces';
import { FindAccountStateContext } from '@/app/state/queries/web3/findAccountState/calls/context';

/**
 * Builders for the individual multicall entries used when fetching account state.
 *
 * These were previously ~320 lines of nested closures inside `findAccountState`. The call
 * definitions are unchanged; each builder now receives its dependencies explicitly through a
 * `FindAccountStateContext` rather than capturing them, which is what makes them testable and
 * keeps the orchestrator readable.
 */

/**
 * Resolves the pool address whose mintable-token balance represents circulating supply.
 * L1 reads the Uniswap V3 pool; L2 reads the SushiSwap pair.
 */
export const getFluxSupplyAddress = (context: FindAccountStateContext) => {
	if (context.isArbitrumMainnet) {
		return context.config.mintableSushiSwapL2EthPair as string;
	}

	return context.config.mintableUniswapV3L1EthTokenContractAddress as string;
};
export const getDamSupplyAddress = (context: FindAccountStateContext) => {
	if (context.isArbitrumMainnet) {
		return context.config.lockableSushiSwapL2EthPair as string;
	}

	return context.config.lockableUniswapV3L1EthTokenContractAddress as string;
};

export const getUniswapFluxPriceCall = (context: FindAccountStateContext): Record<string, MultiCallParams> => {
	// On L2 we'll get the balance of pool from SushiSwap
	if (context.isArbitrumMainnet) {
		return {
			uniswapFluxTokenReservesV3: {
				address: context.config.mintableSushiSwapL2EthPair as string, //@todo change this
				function: {
					signature: {
						name: 'getReserves',
						type: 'function',
						inputs: [],
						outputs: [
							{ type: 'uint112', name: 'reserve0' },
							{ type: 'uint112', name: 'reserve1' },
							{ type: 'uint32', name: 'blockTimestampLast' },
						],
						stateMutability: 'view',
					} as const,
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
			address: context.config.mintableUniswapV3L1EthTokenContractAddress as string, //@todo change this
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

export const getUniswapDamPriceCall = (context: FindAccountStateContext): Record<string, MultiCallParams> => {
	// On L2 we'll get the balance of pool from SushiSwap
	if (context.isArbitrumMainnet) {
		return {
			uniswapDamTokenReservesV3: {
				address: context.config.lockableSushiSwapL2EthPair as string, //@todo change this
				function: {
					signature: {
						name: 'getReserves',
						type: 'function',
						inputs: [],
						outputs: [
							{ type: 'uint112', name: 'reserve0' },
							{ type: 'uint112', name: 'reserve1' },
							{ type: 'uint32', name: 'blockTimestampLast' },
						],
						stateMutability: 'view',
					} as const,
					parameters: [],
				},

				returns: {
					params: ['uint112', 'uint112'],
					callback: (reserve0_bigint: bigint, reserve1_bigint: bigint) => {
						let reserve0 = reserve0_bigint.toString();
						let reserve1 = reserve1_bigint.toString();
						// Swap pairs if you have created ETH / Lockable token instead
						if (context.config.lockableSushiSwapL2EthPairSwapPairs) {
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
			address: context.config.lockableUniswapV3L1EthTokenContractAddress || '',
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

export const getLockedLiquidityBalanceCall = (context: FindAccountStateContext): Record<string, MultiCallParams> => {
	if (!context.config.lockedLiquidityUniswapAddress || !context.config.mintableSushiSwapL2EthPair) {
		return {};
	}

	return {
		lockedLiquidtyUniTotalSupply: {
			address: context.config.mintableSushiSwapL2EthPair, //This points to UNI-V2 Token
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
		lockedLiquidityUniAmount: {
			address: context.config.mintableSushiSwapL2EthPair, //This points to UNI-V2 Token
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
				parameters: [context.config.lockedLiquidityUniswapAddress],
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

export const getOtherEcosystemTokenBalance = (context: FindAccountStateContext): Record<string, MultiCallParams> => {
	const getOtherEcosystem = () => {
		switch (context.ecosystem) {
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
		switch (context.ecosystem) {
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
					outputs: [{ type: 'uint256', name: '' }],
					stateMutability: 'view',
				} as const,
				parameters: [context.addressToFetch],
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

export const getHodlClickerAddressLock = (context: FindAccountStateContext): Record<string, MultiCallParams> => {
	if (!context.config.gameHodlClickerAddress || context.config.gameHodlClickerAddress === '0x0') {
		return {};
	}

	return {
		currentAddressHodlClickerAddressLock: {
			address: context.config.gameHodlClickerAddress,
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
						{ type: 'uint256', name: 'rewardsAmount' },
						{ type: 'uint256', name: 'rewardsPercent' },
						{ type: 'uint256', name: 'minBlockNumber' },
						{ type: 'bool', name: 'isPaused' },
						{ type: 'uint256', name: 'minBurnAmount' },
					],
					stateMutability: 'view',
				} as const,
				parameters: [context.addressToFetch],
			},

			returns: {
				params: ['uint256', 'uint256', 'uint256', 'bool', 'uint256'],
				callback: (
					rewardsAmount: string,
					rewardsPercent: string,
					minBlockNumber: string,
					isPaused: boolean,
					minBurnAmount: string
				) => {
					return {
						rewardsAmount: BigInt(rewardsAmount),
						rewardsPercent: Number(rewardsPercent),
						minBlockNumber: Number(minBlockNumber),
						isPaused: isPaused,
						minBurnAmount: BigInt(minBurnAmount),
					} as HodlClickerAddressLockDetailsViewModel;
				},
			},
		},
	};
};
