import Web3 from "web3";
import { Ecosystem, Layer } from "../../../configs/config.common";

export interface SwapPlatformOptions {
}

export enum SwapToken {
	ETH = 'ETH',
	LOCK = 'LOCK',
	FLUX = 'FLUX',
	DAM = 'DAM',
	ArbiFLUX = 'ArbiFLUX',
}

/**
 * When updating a token selection or amount we need to know what field is being operated on
 */
export enum SwapOperation {
	Input = 'Input',
	Output = 'Output'
}

export enum SwapPlatform {
	UniswapV2 = 'UniswapV2'
}

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

export interface SwapTokenWithAmount {
	amount: string;
	swapToken: SwapToken | null;
}

export interface SwapQuote {
	out: {
		minAmount: string;
		maxAmount: string;
	}
}