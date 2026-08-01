import Big from 'big.js';

import {
	getPairPriceRatios,
	getUniswapV3PriceRatios,
} from '@/app/state/queries/web3/findAccountState/decode/uniswapV3Price';

/**
 * Decodes Uniswap/SushiSwap pool readings into the reserve and price shape the app consumes.
 *
 * Two pool styles are handled:
 *   - Ethereum L1 uses Uniswap V3, priced from `slot0.sqrtPriceX96`, with the pool's token
 *     balances read separately.
 *   - Arbitrum L2 uses SushiSwap (a Uniswap V2 fork), priced directly from `getReserves`.
 */

/** Raw pool reading as returned by the multicall decoder. */
export interface RawPoolReserves {
	slot0: { sqrtPriceX96: string };
	reserve0: string;
	reserve1: string;
}

/**
 * Prices are consumed downstream with `.mul()`, so an unavailable price must still be a Big.
 * Zero degrades the UI to "$0.00" instead of throwing mid-render.
 */
const priceOrZero = (price: Big | null): Big => price ?? new Big(0);

/** Converts an 18-decimal balance string into the scaled bigint the app stores. */
const toScaledBigInt = (rawBalance: string): bigint => {
	const asBig = new Big(rawBalance).div(new Big(10).pow(18));
	return BigInt(asBig.mul(100).toFixed(0)) * 10n ** 16n;
};

/**
 * Decodes the lockable-token (DAM) pool.
 *
 * ---------------------------------------------------------------------------------------------
 * SUSPECTED PRE-EXISTING BUG — behaviour deliberately preserved, do not "fix" without checking
 * the pool's real token ordering on-chain.
 *
 * In the L2 branch, `reserve0` is treated as the DAM side when computing the price, but is then
 * returned as `eth`, while `reserve1` is treated as ETH for pricing and returned as `dam`. The
 * same reserve therefore means DAM to the price calculation and ETH to the balance figure, which
 * cannot both be right.
 *
 * `getFluxPoolReserves` below contains the mirror-image inconsistency, and the two functions
 * disagree with each other about which reserve is ETH. Uniswap V2 orders `reserve0`/`reserve1`
 * by token address, so the two pools genuinely can differ — but the contradiction *within* each
 * function cannot be explained that way.
 *
 * This refactor preserves the existing arithmetic exactly so behaviour is unchanged. Resolving
 * it requires confirming token0/token1 for each pair against the deployed contracts.
 * ---------------------------------------------------------------------------------------------
 *
 * @param rawReserves The decoded pool reading.
 * @param isLayer2 True when reading the SushiSwap L2 pair rather than Uniswap V3 on L1.
 * @param lockableLiquidity L1 only: the pool's lockable-token balance, 18 decimals.
 * @param wrappedEthLiquidity L1 only: the pool's WETH balance, 18 decimals.
 */
export const getLockableTokenPoolReserves = (
	rawReserves: RawPoolReserves,
	isLayer2: boolean,
	lockableLiquidity: string,
	wrappedEthLiquidity: string
) => {
	const { slot0, reserve0, reserve1 } = rawReserves;

	if (isLayer2) {
		// Preserved as-is: price reads reserve0 as DAM over reserve1 as ETH.
		const { price0, price1 } = getPairPriceRatios(reserve0, reserve1);

		return {
			eth: BigInt(reserve0),
			dam: BigInt(reserve1),
			ethPrice: priceOrZero(price1),
			damPrice: priceOrZero(price0),
		};
	}

	const { price0, price1 } = getUniswapV3PriceRatios(slot0.sqrtPriceX96);

	return {
		eth: toScaledBigInt(wrappedEthLiquidity),
		dam: toScaledBigInt(lockableLiquidity),
		ethPrice: priceOrZero(price0),
		damPrice: priceOrZero(price1),
	};
};

/**
 * Decodes the mintable-token (FLUX) pool.
 *
 * See the note on `getLockableTokenPoolReserves`: this function carries the mirror-image
 * reserve/price inconsistency and is likewise preserved exactly as it was.
 *
 * @param rawReserves The decoded pool reading.
 * @param isLayer2 True when reading the SushiSwap L2 pair rather than Uniswap V3 on L1.
 * @param mintableLiquidity L1 only: the pool's mintable-token balance, 18 decimals.
 * @param wrappedEthLiquidity L1 only: the pool's WETH balance, 18 decimals.
 */
export const getMintableTokenPoolReserves = (
	rawReserves: RawPoolReserves,
	isLayer2: boolean,
	mintableLiquidity: string,
	wrappedEthLiquidity: string
) => {
	const { slot0, reserve0, reserve1 } = rawReserves;

	if (isLayer2) {
		// Preserved as-is: price reads reserve1 as FLUX over reserve0 as ETH.
		const { price0, price1 } = getPairPriceRatios(reserve1, reserve0);

		return {
			flux: BigInt(reserve0),
			eth: BigInt(reserve1),
			ethPrice: priceOrZero(price1),
			fluxPrice: priceOrZero(price0),
		};
	}

	const { price0, price1 } = getUniswapV3PriceRatios(slot0.sqrtPriceX96);

	return {
		eth: toScaledBigInt(wrappedEthLiquidity),
		flux: toScaledBigInt(mintableLiquidity),
		ethPrice: priceOrZero(price1),
		fluxPrice: priceOrZero(price0),
	};
};
