import { Token, FluxAddressDetails, FluxAddressLock } from '../interfaces';

import { getPriceToggle, BNToDecimal } from './helpers';

import Big from 'big.js'
import BN from 'bn.js'
import { Balances } from './web3Reducer';
import { getEcosystemConfig as getConfig, getEcosystemConfig } from '../../configs/config';
import { Ecosystem } from '../../configs/config.common';

export const getRequiredFluxToBurnDecimal = ({ ecosystem, globalFluxBurned, targetMultiplier, globalDamLockedIn, myFluxBurned, myDamLockedIn }: { ecosystem: Ecosystem, globalFluxBurned: Big, targetMultiplier: number, globalDamLockedIn: Big, myFluxBurned: Big, myDamLockedIn: Big }) => {
	const { minBurnMultiplier } = getEcosystemConfig(ecosystem);

	const top = new Big(-1).mul(targetMultiplier - minBurnMultiplier).mul(globalFluxBurned).mul(myDamLockedIn).add(new Big(globalDamLockedIn).mul(myFluxBurned));

	const bottom = new Big(-1).mul(globalDamLockedIn).add(new Big(targetMultiplier - minBurnMultiplier).mul(myDamLockedIn))
	if (bottom.eq(new Big(0))) {
		return new Big(0)
	}

	return top.div(bottom).div(new Big(10).pow(18))

	/*
	Here is another way to get to the same output:

	// Here is the math behind target multiplier calculation from smart contract
	//((((myFluxBurned+fluxToBurn)/myDamLocked) * percentMultiplier) / ((globalFluxBurned+fluxToBurn)/globalDamLocked)) + percentMultiplier = targetMultiplier

	// Let's simplify this into math variables
	const a = myFluxBurned
	const c = new Big(10000) //percentMultiplier
	const d = globalFluxBurned
	const f = new Big(targetMultiplier).mul(c)
	const g = myDamLockedIn
	const h = globalDamLockedIn
	//((((a+b)/g)*c)/((d+b)/h))+c=f (f is targetMultiplier)


	// Now we can solve for b:

	// For top
	const negativeACH = new Big(-1).mul(a).mul(c).mul(h)
	const negativeCDG = new Big(-1).mul(c).mul(d).mul(g)
	const positiveDFG = d.mul(f).mul(g)

	const top = negativeACH.add(negativeCDG).add(positiveDFG)

	//For bottom
	const positiveCG = c.mul(g)
	const positiveCH = c.mul(h)
	const negativeFG = new Big(-1).mul(f).mul(g)

	const bottom = positiveCG.add(positiveCH).add(negativeFG)


	const pow18 = new Big(10).pow(18)
	return top.div(bottom).div(pow18)
	*/
}
export const numberWithCommas = (numberToFormat: string) => {
	var parts = numberToFormat.split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}


export const getRequiredFluxToBurn = ({ addressDetails, addressLock, balances, ecosystem, targetMultiplier = new Big("9") }: { addressDetails: FluxAddressDetails, addressLock: FluxAddressLock, balances: Balances, ecosystem: Ecosystem, targetMultiplier?: Big }) => {
	const { maxBurnMultiplier, mintableTokenPriceDecimals } = getConfig(ecosystem)

	const globalFluxBurned = new Big(addressDetails.globalBurnedAmount.toString());
	const globalDamLockedIn = new Big(addressDetails.globalLockedAmount.toString());

	const myFluxBurned = new Big(addressLock.burnedAmount.toString());
	const myDamLockedIn = new Big(addressLock.amount.toString());

	const negative = new Big("-1");

	/*
	a = globalFluxBurned
	b = fluxToBurn
	c = globalDamLockedIn
	d = myFluxBurned
	f = myDamLockedIn
	t = targetMultiplier - 1

	(−taf+cd) / (−c+tf)
	*/

	const top = negative.mul(targetMultiplier).mul(globalFluxBurned).mul(myDamLockedIn).add(globalDamLockedIn.mul(myFluxBurned))
	const bottom = negative.mul(globalDamLockedIn).add(targetMultiplier.mul(myDamLockedIn))

	const getFluxRequired = () => {
		if (bottom == new Big(0)) {
			return new Big(0);
		}

		return top.div(bottom);
	}
	const fluxRequired = getFluxRequired();

	const isTargetReached = fluxRequired == new Big(0) || addressDetails.addressBurnMultiplier === 10000 * maxBurnMultiplier;

	const fluxRequiredBn=new BN(fluxRequired.abs().round(0).toFixed())

	const fluxRequiredToBurn = BNToDecimal(fluxRequiredBn, true, 18, mintableTokenPriceDecimals)

	const fluxRequiredToBurnInUsdc = `$ ${getPriceToggle({ value: fluxRequiredBn, inputToken: Token.Mintable, outputToken: Token.USDC, balances })} USD`;

	return {
		fluxRequiredToBurn,
		fluxRequiredToBurnRaw: fluxRequired.abs(),
		fluxRequiredToBurnInUsdc,
		isTargetReached
	}
}