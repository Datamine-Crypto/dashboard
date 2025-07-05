/**
 * @file swapOptions.ts
 * @description This file defines the core interfaces and enums used throughout the swap feature.
 * It provides a standardized structure for handling swap operations, tokens, and platform-specific details.
 */

import Web3 from 'web3';
import { Ecosystem, Layer } from '../../../configs/config.common';

/**
 * @interface SwapPlatformOptions
 * @description A base interface for platform-specific swap options. It can be extended for different DEXs.
 */
export interface SwapPlatformOptions {}

/**
 * @enum SwapToken
 * @description An enumeration of all tokens that can be used in a swap.
 */
export enum SwapToken {
	ETH = 'ETH',
	LOCK = 'LOCK',
	FLUX = 'FLUX',
	DAM = 'DAM',
	ArbiFLUX = 'ArbiFLUX',
}

/**
 * @enum SwapOperation
 * @description Specifies whether a token is being used as the input or output of a swap.
 * This is used to determine which field is being updated in the UI.
 */
export enum SwapOperation {
	Input = 'Input',
	Output = 'Output',
}

/**
 * @enum SwapPlatform
 * @description An enumeration of the supported decentralized exchange platforms.
 */
export enum SwapPlatform {
	UniswapV2 = 'UniswapV2',
}

/**
 * @interface SwapTokenDetails
 * @description Defines the detailed information for a swappable token, including its metadata and on-chain details.
 */
export interface SwapTokenDetails {
	swapToken: SwapToken;
	shortName: string;
	longName: string;
	address: string;
	abi?: any;
	logo: any;
	ecosystem: Ecosystem | null;

	/**
	 * If specified, what layer is this token on
	 * If null then it's available on both layers
	 */
	layer: Layer | null;
}

/**
 * @interface SwapOptions
 * @description Defines the complete set of options for executing a token swap.
 * This includes the platform, Web3 instances, and details about the input and output tokens.
 */
export interface SwapOptions {
	swapPlatform: SwapPlatform;

	web3: Web3;
	web3provider: any;

	/**
	 * If set to true swap will only ensure it won't fail
	 **/
	onlyCheckTradeValidity?: boolean;

	/**
	 * If set to true then we will only get a quote back
	 * This is useful to get an estimate on a trade
	 */
	onlyGetQuote?: boolean;

	inputToken: SwapTokenWithAmount;
	outputToken: SwapTokenWithAmount;
}

/**
 * @interface SwapTokenWithAmount
 * @description Represents a token involved in a swap, including the amount to be swapped.
 */
export interface SwapTokenWithAmount {
	amount: string;
	swapToken: SwapToken | null;
}

/**
 * @interface SwapQuote
 * @description Defines the structure for a swap quote, including the minimum and maximum expected output amounts.
 */
export interface SwapQuote {
	out: {
		minAmount: string;
		maxAmount: string;
	};
}
