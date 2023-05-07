
import Big from 'big.js';

export enum TokenPair {
	USDC_ETH = 'USDC_ETH',
	FLUX_ETH = 'FLUX_ETH',
	DAM_ETH = 'DAM_ETH'
}
export const getApy = (pools: Map<TokenPair, any>) => {
	const damPool = pools.get(TokenPair.DAM_ETH);
	const fluxPool = pools.get(TokenPair.FLUX_ETH);
	const ethPool = pools.get(TokenPair.USDC_ETH);

	if (!damPool || !fluxPool || !ethPool) {
		return null;
	}

	const div18 = new Big(10).pow(18)
	const div6 = new Big(10).pow(6)

	const zero = new Big(0)
	if (new Big(fluxPool.Reserve0).eq(zero) || new Big(damPool.Reserve1).eq(zero) || new Big(ethPool.Reserve1).eq(zero)) {
		return null
	}

	const fluxEthPrice = (new Big(fluxPool.Reserve1).div(div18)).div(new Big(fluxPool.Reserve0).div(div18))
	const damEthPrice = (new Big(damPool.Reserve0).div(div18)).div(new Big(damPool.Reserve1).div(div18))
	const ethPrice = (new Big(ethPool.Reserve0).div(div6)).div(new Big(ethPool.Reserve1).div(div18))

	const damPriceUsd = damEthPrice.mul(ethPrice).toNumber()
	const fluxPriceUsd = fluxEthPrice.mul(ethPrice).toNumber()
	const ethPriceUsd = ethPrice.toNumber()

	//const avgBlockTime = 12
	const blocksPerDay = 7200
	const fluxPerBlock = 0.00000001

	const boughtDam = 10000
	const costOf10kDam = boughtDam * damPriceUsd

	const generatedFlux365daysNoMultiplier = boughtDam * blocksPerDay * fluxPerBlock * 365 * 3 * fluxPriceUsd

	const apyNoBurn = (generatedFlux365daysNoMultiplier / costOf10kDam) * 100

	return {
		apyPercent: {
			noBurn: apyNoBurn,
			maxBurn: apyNoBurn * 10,
			breakdown: {
				costOf10kDamUSD: costOf10kDam,
				generatedFlux365daysNoMultiplierUSD: generatedFlux365daysNoMultiplier,
				generatedFluxUSDBreakdown: {
					boughtDam,
					blocksPerDay, // based on 13 seconds average
					fluxPerBlock,
					daysInYear: 365,
					timeMultiplier: 3,
					fluxPriceUsd
				}
			}
		},
		prices: {
			dam: damPriceUsd,
			flux: fluxPriceUsd,
			eth: ethPriceUsd
		},

	}
}