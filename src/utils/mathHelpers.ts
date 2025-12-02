import Big from 'big.js';

import dayjs from 'dayjs';
import { getEcosystemConfig as getConfig, getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import { FluxAddressDetails, FluxAddressLock, Token } from '@/app/interfaces';
import { Balances } from '@/app/interfaces';
import { formatUnits, parseUnits } from 'viem';

/**
 * Defines the parameters for functions that toggle or format prices.
 */
interface PriceToggle {
	/**
	 * The numeric value as a bigint to be formatted or used in price calculation.
	 */
	value?: bigint;
	/**
	 * The numeric value as a Big.js object to be formatted or used in price calculation.
	 */
	valueBig?: Big.Big;
	/**
	 * The type of the input token (e.g., ETH, Mintable, Lockable).
	 */
	inputToken: Token;
	/**
	 * The type of the output token (e.g., USDC).
	 */
	outputToken: Token;
	/**
	 * The current token balances and Uniswap reserves, used for price lookups.
	 */
	balances: Balances;
	/**
	 * Optional: The number of decimal places to round the final price to.
	 */
	round?: number;
	/**
	 * Optional: If true, commas will not be added as thousands separators.
	 */
	removeCommas?: boolean;
}

/**
 * Formats a numeric value (bigint) into a price string based on input and output tokens and current balances.
 * It calculates the price using Uniswap reserves and applies formatting options.
 * @param {PriceToggle} params - Object containing value, inputToken, outputToken, balances, optional rounding, and comma removal.
 * @returns {string} The formatted price string.
 */
export const getPriceToggle = ({ value, inputToken, outputToken, balances, round, removeCommas }: PriceToggle) => {
	if (value === null || value === undefined) {
		return '*invalid value*';
	}

	const valueBig = new Big(value.toString());

	return getPriceToggleBig({
		valueBig,
		inputToken,
		outputToken,
		balances,
		round,
		removeCommas,
	});
};

/**
 * Formats a Big.js numeric value into a price string based on input and output tokens and current balances.
 * It calculates the price using Uniswap reserves and applies formatting options.
 * @param {PriceToggle} params - Object containing valueBig, inputToken, outputToken, balances, optional rounding, and comma removal.
 * @returns {string} The formatted price string.
 */
export const getPriceToggleBig = ({
	valueBig,
	inputToken,
	outputToken,
	balances,
	round,
	removeCommas,
}: PriceToggle) => {
	if (!valueBig) {
		return '*invalid value*';
	}

	const commaRegex = /(\d)(?=(\d{3})+(?!\d))/g;

	const div18 = new Big(10).pow(18);
	const div6 = new Big(10).pow(6);

	if (
		!balances.uniswapUsdcEthTokenReserves ||
		!balances.uniswapDamTokenReserves ||
		!balances.uniswapFluxTokenReserves
	) {
		return '*loading*';
	}

	const usdcReserve = new Big(balances.uniswapUsdcEthTokenReserves.usdc.toString(10)).div(div6);
	const ethReserve = new Big(balances.uniswapUsdcEthTokenReserves.eth.toString(10)).div(div18);
	const ethPrice = usdcReserve.div(ethReserve);

	const getResult = () => {
		if (inputToken === Token.ETH && outputToken === Token.USDC) {
			const price = ethPrice.mul(valueBig.div(div18)).toFixed(!!round || round === 0 ? round : 2);
			if (removeCommas) {
				return price;
			}
			return price.replace(commaRegex, '$1,');
		}
		if ((inputToken === Token.Lockable || inputToken === Token.Mintable) && outputToken === Token.USDC) {
			const getEthAmount = () => {
				switch (inputToken) {
					case Token.Mintable:
						if (balances.forecastFluxPrice) {
							const price = parseFloat(balances.forecastFluxPrice);
							const newEthCost = new Big(price).div(ethPrice);

							return newEthCost;
						}

						return balances.uniswapFluxTokenReserves!.ethPrice;
					case Token.Lockable:
						return balances.uniswapDamTokenReserves!.ethPrice;
				}
			};

			const ethAmount = getEthAmount();

			const price = ethAmount
				.mul(ethPrice)
				.mul(valueBig.div(div18))
				.toFixed(!!round || round === 0 ? round : 4);

			if (removeCommas) {
				return price;
			}

			const priceLeft = price.split('.')[0];
			const priceRight = price.split('.')[1];

			return `${priceLeft.replace(commaRegex, '$1,')}.${priceRight}`;
		}
		throw `Invalid price pair: ${inputToken} / ${outputToken}`;
	};

	const result = getResult();
	return result;
};

/**
 * A Big.js constant representing 10^18, commonly used for converting raw token amounts
 * (which are typically 18 decimal places) to human-readable decimal values.
 */

/**
 * Calculates the percentage of `bnA` relative to `bnB` or `bnA + bnB`.
 * Useful for displaying proportions or progress.
 * @param {bigint} bnA - The first bigint value.
 * @param {bigint} bnB - The second bigint value.
 * @param {boolean} [shouldAdd=true] - If true, calculates percentage of `bnA / (bnA + bnB)`; otherwise, `bnA / bnB`.
 * @returns {string} The calculated percentage as a string, formatted to two decimal places.
 */
export const formatBigIntPercent = (bnA: bigint, bnB: bigint, shouldAdd = true) => {
	if (bnB === 0n || bnA === 0n) {
		return '0.00';
	}
	const big = new Big(bnA.toString()).div(new Big(shouldAdd ? bnA.toString() : '0').add(bnB.toString())).mul(100);

	return big.toFixed(2);
};

/**
 * Converts a decimal string representation of a number into a BigInt instance,
 * scaling it by 10^18 (common for ERC-20 tokens).
 * @param {string} unformattedInput - The decimal string to convert (e.g., "1.3").
 * @returns {bigint} The converted BigInt.
 */
export const parseBigInt = (unformattedInput?: string | bigint | null) => {
	if (typeof unformattedInput === 'bigint') {
		return unformattedInput;
	}
	if (!unformattedInput) {
		throw new Error('Invalid input');
	}

	// Remove commas if present
	const cleanInput = unformattedInput.replace(/,/g, '');
	return parseUnits(cleanInput, 18);
};

/**
 * Converts a bigint to a human-readable decimal string, with optional formatting.
 * @param {bigint | null} number - The bigint to convert. Can be null.
 * @param {boolean} [addCommas=false] - Whether to add comma separators for thousands.
 * @param {number} [decimals=18] - The number of decimal places to consider for the conversion (e.g., 18 for ETH).
 * @param {number} [round=0] - The number of decimal places to round the final output to.
 * @returns {string | null} The converted decimal string, or null if the input number is null.
 */
export const formatBigInt = (number?: bigint | null, addCommas = false, decimals = 18, round = 0) => {
	if (!number) {
		return null;
	}

	const getFinalAmount = () => {
		const amount = formatUnits(number, decimals);
		if (round > 0) {
			return new Big(amount).toFixed(round);
		}
		return amount;
	};

	const finalAmount = getFinalAmount();
	if (addCommas) {
		const numberWithCommas = (numberToFormat: string) => {
			const parts = numberToFormat.split('.');
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			return parts.join('.');
		};
		return numberWithCommas(finalAmount);
		//return finalAmount.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
	}
	return finalAmount;
};

/**
 * Formats a burn ratio into a human-readable string (e.g., "X FLUX / 1 DAM").
 * @param {bigint} ratio - The bigint representing the burn ratio.
 * @param {Ecosystem} ecosystem - The current ecosystem to retrieve token short names for display.
 * @returns {string} A formatted string showing the burn ratio between mintable and lockable tokens.
 */
export const getBurnRatio = (ratio: bigint, ecosystem: Ecosystem) => {
	const { mintableTokenShortName, lockableTokenShortName } = getEcosystemConfig(ecosystem);

	return `${formatBigInt(ratio, true, 10, 5)} ${mintableTokenShortName} / 1 ${lockableTokenShortName}`;
};

/**
 * Calculates and formats the remaining time or blocks until a specific event.
 * @param {number} startBlockNumber - The Ethereum block number when the event started.
 * @param {number} blockDuration - The total duration of the event in blocks.
 * @param {number} currentBlock - The current Ethereum block number.
 * @param {string} defaultText - The default text to return if `startBlockNumber` is 0 (indicating no active event).
 * @param {boolean} [showBlocks=true] - Whether to include the number of blocks in the returned string.
 * @param {boolean} [showDuration=true] - Whether to include the human-readable duration (hours, days, years) in the returned string.
 * @returns {string} A formatted string indicating the remaining time or blocks (e.g., "~X days (Y blocks)").
 */
export const getBlocksRemaining = (
	startBlockNumber: number,
	blockDuration: number,
	currentBlock: number,
	defaultText: string,
	showBlocks = true,
	showDuration = true
) => {
	if (startBlockNumber === 0) {
		return defaultText;
	}
	const blocksDuration = Math.max(0, startBlockNumber + blockDuration - currentBlock); // This number comes from migration (28 days approx)

	const getDuration = () => {
		const hoursDuration = (blocksDuration * 12) / (60 * 60);
		if (hoursDuration <= 24) {
			return {
				value: hoursDuration,
				label: 'hours',
			};
		}
		const daysDuration = hoursDuration / 24;
		if (daysDuration <= 365) {
			return {
				value: daysDuration,
				label: 'days',
			};
		}

		return {
			value: daysDuration / 365,
			label: 'years',
		};
	};

	const details = getDuration();

	const blocksText = showBlocks ? ` (${blocksDuration} block${blocksDuration > 1 ? 's' : ''})` : '';
	const durationText = showDuration ? `~${details?.value.toFixed(2)} ${details.label}` : '';

	return `${durationText}${blocksText}`;
};

/**
 * Calculates a future date and time based on a given number of blocks from the current time.
 * @param {number} blocksDuration - The number of blocks to add.
 * @returns {dayjs.Dayjs} A Day.js object representing the calculated future date and time.
 */
export const getBlocksDateFromNow = (blocksDuration: number) => {
	return dayjs().add(blocksDuration * 12, 'seconds');
};

/**
 * Formats a raw multiplier value (typically from smart contracts) into a human-readable string
 * with a leading "x" (e.g., "x 1.2345").
 * @param {number} multiplier - The raw multiplier value (e.g., 10000 for 1x, 30000 for 3x).
 * @returns {string} A formatted string representing the multiplier.
 */
export const getFormattedMultiplier = (multiplier: number) => {
	return `x ${(multiplier / 10000).toFixed(4)}`;
};

/**
 * Calculates the required amount of FLUX to burn to reach a specific burn multiplier.
 * This function performs complex arithmetic based on global and personal burn statistics.
 * @param {object} params - The parameters for the calculation.
 * @param {Ecosystem} params.ecosystem - The current blockchain ecosystem.
 * @param {Big} params.globalFluxBurned - The total amount of FLUX burned globally.
 * @param {number} params.targetMultiplier - The desired burn multiplier to achieve.
 * @param {Big} params.globalDamLockedIn - The total amount of DAM locked globally.
 * @param {Big} params.myFluxBurned - The amount of FLUX burned by the current user.
 * @param {Big} params.myDamLockedIn - The amount of DAM locked by the current user.
 * @returns {Big} The calculated amount of FLUX (in decimal form) required to burn.
 */
export const getRequiredFluxToBurnDecimal = ({
	ecosystem,
	globalFluxBurned,
	targetMultiplier,
	globalDamLockedIn,
	myFluxBurned,
	myDamLockedIn,
}: {
	ecosystem: Ecosystem;
	globalFluxBurned: Big;
	targetMultiplier: number;
	globalDamLockedIn: Big;
	myFluxBurned: Big;
	myDamLockedIn: Big;
}) => {
	const { minBurnMultiplier } = getEcosystemConfig(ecosystem);

	const top = new Big(-1)
		.mul(targetMultiplier - minBurnMultiplier)
		.mul(globalFluxBurned)
		.mul(myDamLockedIn)
		.add(new Big(globalDamLockedIn).mul(myFluxBurned));

	const bottom = new Big(-1)
		.mul(globalDamLockedIn)
		.add(new Big(targetMultiplier - minBurnMultiplier).mul(myDamLockedIn));
	if (bottom.eq(new Big(0))) {
		return new Big(0);
	}

	return top.div(bottom).div(new Big(10).pow(18));
};

/**
 * Formats a number string by adding commas as thousands separators.
 * @param {string} numberToFormat - The number string to format.
 * @returns {string} The formatted number string.
 */
export const numberWithCommas = (numberToFormat: string) => {
	const parts = numberToFormat.split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
};

/**
 * Calculates the required amount of FLUX to burn to achieve a target burn multiplier.
 * This function integrates with the application's state (address details, balances) and ecosystem configuration.
 * @param {object} params - The parameters for the calculation.
 * @param {FluxAddressDetails} params.addressDetails - Detailed information about the user's Flux address.
 * @param {FluxAddressLock} params.addressLock - The lock details for the user's Flux address.
 * @param {Balances} params.balances - The current token balances of the user.
 * @param {Ecosystem} params.ecosystem - The current blockchain ecosystem.
 * @param {Big} [params.targetMultiplier=new Big('9')] - The desired target multiplier (defaulting to 9).
 * @returns {object} An object containing the required FLUX to burn (formatted and raw), its USD equivalent, and a boolean indicating if the target is reached.
 */
export const getRequiredFluxToBurn = ({
	addressDetails,
	addressLock,
	balances,
	ecosystem,
	targetMultiplier = new Big('9'),
}: {
	addressDetails: FluxAddressDetails;
	addressLock: FluxAddressLock;
	balances: Balances;
	ecosystem: Ecosystem;
	targetMultiplier?: Big;
}) => {
	const { maxBurnMultiplier, mintableTokenPriceDecimals } = getConfig(ecosystem);

	const globalFluxBurned = new Big(addressDetails.globalBurnedAmount.toString());
	const globalDamLockedIn = new Big(addressDetails.globalLockedAmount.toString());

	const myFluxBurned = new Big(addressLock.burnedAmount.toString());
	const myDamLockedIn = new Big(addressLock.amount.toString());

	const negative = new Big('-1');

	/*
	a = globalFluxBurned
	b = fluxToBurn
	c = globalDamLockedIn
	d = myFluxBurned
	f = myDamLockedIn
	t = targetMultiplier - 1

	(−taf+cd) / (−c+tf)
	*/

	const top = negative
		.mul(targetMultiplier)
		.mul(globalFluxBurned)
		.mul(myDamLockedIn)
		.add(globalDamLockedIn.mul(myFluxBurned));
	const bottom = negative.mul(globalDamLockedIn).add(targetMultiplier.mul(myDamLockedIn));

	const getFluxRequired = () => {
		if (bottom == new Big(0)) {
			return new Big(0);
		}

		return top.div(bottom);
	};
	const fluxRequired = getFluxRequired();

	const isTargetReached =
		fluxRequired == new Big(0) || addressDetails.addressBurnMultiplier === 10000 * maxBurnMultiplier;

	const fluxRequiredBn = fluxRequired.abs().round(0).toFixed();
	const fluxRequiredBigInt = BigInt(fluxRequiredBn);

	const fluxRequiredToBurn = formatBigInt(fluxRequiredBigInt, true, 18, mintableTokenPriceDecimals);

	const fluxRequiredToBurnInUsdc = `$ ${getPriceToggle({ value: fluxRequiredBigInt, inputToken: Token.Mintable, outputToken: Token.USDC, balances })} USD`;

	return {
		fluxRequiredToBurn,
		fluxRequiredToBurnRaw: fluxRequired.abs(),
		fluxRequiredToBurnInUsdc,
		isTargetReached,
	};
};
