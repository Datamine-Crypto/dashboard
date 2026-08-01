import Big from 'big.js';

/**
 * Shared Uniswap V3 price math.
 *
 * This calculation previously appeared verbatim in three places inside FindAccountState (the
 * USDC/ETH decode callback, the DAM reserves decoder, and the FLUX reserves decoder). Each copy
 * divided by a value derived from `sqrtPriceX96` without checking it first, and big.js throws
 * on division by zero rather than returning Infinity — so a pool read that came back as 0
 * (decode failure, misconfigured pool address, wrong network, or a genuinely empty pool) took
 * down the entire account-state fetch.
 *
 * Centralised here so the guard exists once and the three call sites cannot drift apart.
 */

/** Uniswap V3 encodes prices as a Q64.96 fixed-point square root; 2^192 undoes the squaring. */
const Q192 = new Big(2).pow(192);

/** USDC has 6 decimals against ETH's 18, so USD conversions scale by 10^12. */
const USDC_ETH_DECIMAL_SCALE = new Big(10).pow(12);

/**
 * A token pair's two directional prices.
 *
 * `price1` is token1 per token0; `price0` is its reciprocal. Both are null when the pool
 * reported no liquidity, which callers must treat as "price unavailable" rather than zero.
 */
export interface UniswapV3PriceRatios {
	price0: Big | null;
	price1: Big | null;
}

/**
 * Converts a raw `sqrtPriceX96` reading into both directional prices.
 *
 * @param sqrtPriceX96 The raw slot0 value, as a decimal string.
 * @returns Both directions, or nulls when the pool reported zero.
 */
export const getUniswapV3PriceRatios = (sqrtPriceX96: string): UniswapV3PriceRatios => {
	// A zero (or unparseable) reading means the pool has no price to report. Returning nulls
	// keeps the division below unreachable.
	let sqrtPrice: Big;
	try {
		sqrtPrice = new Big(sqrtPriceX96);
	} catch {
		return { price0: null, price1: null };
	}

	if (sqrtPrice.lte(0)) {
		return { price0: null, price1: null };
	}

	const price1 = sqrtPrice.times(sqrtPrice).div(Q192);
	if (price1.lte(0)) {
		return { price0: null, price1: null };
	}

	return { price0: new Big(1).div(price1), price1 };
};

/**
 * Derives the USD price of ETH from a USDC/ETH Uniswap V3 pool.
 *
 * @param sqrtPriceX96 The raw slot0 value, as a decimal string.
 * @param shouldFlipPrice True when the pool orders its tokens such that the price must be read
 *   in the opposite direction. This differs between Ethereum mainnet and Arbitrum.
 * @returns The ETH price scaled for USDC's 6 decimals, or null when the pool reported no price.
 */
export const getUsdPriceFromUniswapV3EthPool = (sqrtPriceX96: string, shouldFlipPrice: boolean): Big | null => {
	const { price0, price1 } = getUniswapV3PriceRatios(sqrtPriceX96);

	const denominator = shouldFlipPrice ? price1 : price0;
	if (!denominator || denominator.lte(0)) {
		return null;
	}

	return USDC_ETH_DECIMAL_SCALE.div(denominator);
};

/**
 * Prices a Uniswap V2 style pair (used by SushiSwap on L2) from its two reserves.
 *
 * @param numeratorReserve The reserve whose amount forms the top of `price1`.
 * @param denominatorReserve The reserve whose amount forms the bottom of `price1`.
 * @returns Both directions, or nulls when either side of the pool is empty.
 */
export const getPairPriceRatios = (numeratorReserve: string, denominatorReserve: string): UniswapV3PriceRatios => {
	let numerator: Big;
	let denominator: Big;
	try {
		numerator = new Big(numeratorReserve);
		denominator = new Big(denominatorReserve);
	} catch {
		return { price0: null, price1: null };
	}

	// An empty side means there is no exchange rate to quote.
	if (numerator.lte(0) || denominator.lte(0)) {
		return { price0: null, price1: null };
	}

	const price1 = numerator.div(denominator);

	// The ratio itself must be re-checked, not just its inputs. big.js divides to a fixed
	// number of decimal places (20 by default), so a sufficiently lopsided pool produces a
	// ratio that rounds to exactly zero even though both reserves are non-zero — and the
	// reciprocal below would then throw.
	if (price1.lte(0)) {
		return { price0: null, price1: null };
	}

	return { price0: new Big(1).div(price1), price1 };
};
