// This utility leverages the Multicall contract to aggregate multiple read-only contract calls into a single blockchain transaction.
// This significantly reduces network overhead and improves application performance by minimizing RPC requests.
import { encodeFunctionData, decodeAbiParameters, parseAbiParameter, Hex, AbiItem } from 'viem';

/**
 * This file provides functions to encode and decode multicall requests, a technique to batch multiple
 * smart contract read calls into a single network request. This is highly efficient for fetching disparate data from the blockchain.
 */

/**
 * Defines the structure for a single call within a multicall batch.
 */
export interface MultiCallParams {
	/** The address of the contract to call. */
	address: string;
	/** The function to call, including its signature and parameters. */
	function: {
		signature: AbiItem;
		parameters: unknown[];
	};
	/** The expected return types and a callback to process the results. */
	returns: {
		params: string[];
		callback: (...params: any[]) => unknown; // eslint-disable-line @typescript-eslint/no-explicit-any
	};
}

/**
 * Encodes a set of contract calls into the format expected by the Multicall contract.
 * @param multicallParams - A record of named calls, where each value is a `MultiCallParams` object.
 * @returns An array of encoded call data, ready to be sent to the Multicall contract.
 */
export const encodeMulticall = (multicallParams: Record<string, MultiCallParams>) => {
	const multicallEntries = Object.entries(multicallParams);

	return multicallEntries
		.filter(([, multicallParam]) => {
			return multicallParam !== undefined;
		})
		.map(([, multicallParam]) => ({
			target: multicallParam.address as `0x${string}`,
			callData: encodeFunctionData({
				abi: [multicallParam.function.signature],
				functionName: (multicallParam.function.signature as { name: string }).name,
				args: multicallParam.function.parameters,
			}),
		}));
};

/**
 * Defines the structure of the results returned from a Multicall contract execution.
 */
export interface EncodedMulticallResults {
	blockNumber: string;
	returnData: Hex[];
}

/**
 * Decodes the aggregated results from a Multicall contract call.
 * It maps the raw return data back to the original call definitions and applies the specified callbacks.
 * @param encodedMulticallResults - The raw results from the Multicall contract.
 * @param multicallParams - The original record of named calls used for encoding.
 * @returns A record of named results, where each key corresponds to a call in the original `multicallParams`.
 */
export const decodeMulticall = (
	encodedMulticallResults: EncodedMulticallResults,
	multicallParams: Record<string, MultiCallParams>
) => {
	const multicallEntries = Object.entries<MultiCallParams>(multicallParams);

	const decodedResults = multicallEntries
		.filter(([, multicallParam]) => {
			return multicallParam !== undefined;
		})
		.reduce(
			(results, [key, multicallParam], index) => {
				const encodedReturnData = encodedMulticallResults.returnData[index];

				// If the return data is empty or 0x, we can't decode it.
				// This might happen if the call failed within the multicall.
				if (!encodedReturnData || encodedReturnData === '0x') {
					return {
						...results,
						[key]: null, // Or handle error appropriately
					};
				}

				const decodedParams = decodeAbiParameters(
					multicallParam.returns.params.map((type) => parseAbiParameter(type)),
					encodedReturnData
				);

				const result = multicallParam.returns.callback(...decodedParams);
				return {
					...results,
					[key]: result,
				};
			},
			{} as Record<string, unknown>
		);

	return decodedResults;
};
