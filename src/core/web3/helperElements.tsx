import { Token, FluxAddressDetails, FluxAddressLock } from '../interfaces';

import { getPriceToggle, BNToDecimal } from './helpers';

import Big from 'big.js'
import BN from 'bn.js'
import { Balances } from './web3Reducer';
import { getConfig } from '../../config';

export const getRequiredFluxToBurnDecimal = ({ globalFluxBurned, targetMultiplier, globalDamLockedIn, myFluxBurned, myDamLockedIn }: { globalFluxBurned: Big, targetMultiplier: number, globalDamLockedIn: Big, myFluxBurned: Big, myDamLockedIn: Big }) => {
	const top = new Big(-1).mul(targetMultiplier - 1).mul(globalFluxBurned).mul(myDamLockedIn).add(new Big(globalDamLockedIn).mul(myFluxBurned));

	const bottom = new Big(-1).mul(globalDamLockedIn).add(new Big(targetMultiplier - 1).mul(myDamLockedIn))
	if (bottom.eq(new Big(0))) {
		return new Big(0)
	}

	return top.div(bottom).div(new Big(10).pow(18))
}
export const numberWithCommas = (numberToFormat: string) => {
	var parts = numberToFormat.split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}


export const getRequiredFluxToBurn = ({ addressDetails, addressLock, balances, targetMultiplier = new BN("9") }: { addressDetails: FluxAddressDetails, addressLock: FluxAddressLock, balances: Balances, targetMultiplier?: BN }) => {
	const { maxBurnMultiplier } = getConfig()

	const globalFluxBurned = addressDetails.globalBurnedAmount;
	const globalDamLockedIn = addressDetails.globalLockedAmount

	const myFluxBurned = addressLock.burnedAmount;
	const myDamLockedIn = addressLock.amount;

	const negative = new BN("-1");

	/*
	a = globalFluxBurned
	b = fluxToBurn
	c = globalDamLockedIn
	d = myFluxBurned
	f = myDamLockedIn

	(−9af+cd) / (−c+9f)
	*/

	const top = negative.mul(targetMultiplier).mul(globalFluxBurned).mul(myDamLockedIn).add(globalDamLockedIn.mul(myFluxBurned))
	const bottom = negative.mul(globalDamLockedIn).add(targetMultiplier.mul(myDamLockedIn))

	const getFluxRequired = () => {
		if (bottom.isZero()) {
			return new BN(0);
		}

		return top.div(bottom);
	}
	const fluxRequired = getFluxRequired();

	const isTargetReached = fluxRequired.isZero() || addressDetails.addressBurnMultiplier === 10000 * maxBurnMultiplier;

	const fluxRequiredToBurn = BNToDecimal(fluxRequired.abs(), true, 18, 2)

	const fluxRequiredToBurnInUsdc = `$ ${getPriceToggle({ value: fluxRequired.abs(), inputToken: Token.Mintable, outputToken: Token.USDC, balances })} USD`;

	return {
		fluxRequiredToBurn,
		fluxRequiredToBurnRaw: fluxRequired.abs(),
		fluxRequiredToBurnInUsdc,
		isTargetReached
	}
}