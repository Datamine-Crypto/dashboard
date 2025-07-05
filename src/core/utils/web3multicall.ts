// This utility leverages the Multicall contract to aggregate multiple read-only contract calls into a single blockchain transaction.
// This significantly reduces network overhead and improves application performance by minimizing RPC requests.
import Web3 from 'web3';

/**
 * @file web3multicall.ts
 * @description This file provides functions to encode and decode multicall requests, a technique to batch multiple
 * smart contract read calls into a single network request. This is highly efficient for fetching disparate data from the blockchain.
 */

/**
 * @interface MultiCallParams
 * @description Defines the structure for a single call within a multicall batch.
 */
export interface MultiCallParams {
	/** The address of the contract to call. */
	address: string;
	/** The function to call, including its signature and parameters. */
	function: {
		signature: any;
		parameters: string[];
	};
	/** The expected return types and a callback to process the results. */
	returns: {
		params: string[];
		callback: (...params: any[]) => any;
	};
}

/**
 * Encodes a set of contract calls into the format expected by the Multicall contract.
 * @param web3 - The Web3 instance.
 * @param multicallParams - A record of named calls, where each value is a `MultiCallParams` object.
 * @returns An array of encoded call data, ready to be sent to the Multicall contract.
 */
export const encodeMulticall = (web3: Web3, multicallParams: Record<string, MultiCallParams>) => {
	const multicallEntries = Object.entries(multicallParams);

	return multicallEntries
		.filter(([key, multicallParam]) => {
			return multicallParam !== undefined;
		})
		.map(([key, multicallParam]) => [
			multicallParam.address,
			web3.eth.abi.encodeFunctionCall(multicallParam.function.signature, multicallParam.function.parameters),
		]);
};

/**
 * @interface EncodedMulticallResults
 * @description Defines the structure of the results returned from a Multicall contract execution.
 */
interface EncodedMulticallResults {
	blockNumber: string;
	returnData: any[];
}

/**
 * Decodes the aggregated results from a Multicall contract call.
 * It maps the raw return data back to the original call definitions and applies the specified callbacks.
 * @param web3 - The Web3 instance.
 * @param encodedMulticallResults - The raw results from the Multicall contract.
 * @param multicallParams - The original record of named calls used for encoding.
 * @returns A record of named results, where each key corresponds to a call in the original `multicallParams`.
 */
export const decodeMulticall = (
	web3: Web3,
	encodedMulticallResults: EncodedMulticallResults,
	multicallParams: Record<string, MultiCallParams>
) => {
	const multicallEntries = Object.entries<MultiCallParams>(multicallParams);

	const decodedResults = multicallEntries
		.filter(([key, multicallParam]) => {
			return multicallParam !== undefined;
		})
		.reduce((results, [key, multicallParam], index) => {
			const encodedReturnData = encodedMulticallResults.returnData[index];

			const decodedParams = (web3.eth.abi as any).decodeParameters(
				multicallParam.returns.params,
				encodedReturnData
			) as any[]; // Will be Results object (non-array)
			const decodedParamsArray = multicallParam.returns.params.map((_, index) => decodedParams[index]);

			const result = multicallParam.returns.callback(...decodedParamsArray);
			return {
				...results,
				[key]: result,
			};
		}, {} as any);

	return decodedResults;
};
