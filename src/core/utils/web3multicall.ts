import Web3 from "web3";

/**
 * This file contains a very useful function to utilize multicall smart contract.
 * We've combined this together with some typescript magic to easily utilize this in a single call while retaining types
 */

export interface MultiCallParams {
	address: string;
	function: {
		signature: any;
		parameters: string[];
	}
	returns: {
		params: string[];
		callback: (...params: any[]) => any;
	}
}

/**
 * Compress multiple smart calls into one using a key/value object
 * The value can be undefined (which would be excluded from the call)
 */
export const encodeMulticall = (web3: Web3, multicallParams: Record<string, MultiCallParams>) => {
	const multicallEntries = Object.entries(multicallParams);

	return multicallEntries
		.filter(([key, multicallParam]) => {
			return multicallParam !== undefined
		})
		.map(([key, multicallParam]) => ([
			multicallParam.address,
			web3.eth.abi.encodeFunctionCall(multicallParam.function.signature, multicallParam.function.parameters)
		]))
}

interface EncodedMulticallResults {
	blockNumber: string;
	returnData: any[];
}

/**
 * Decode the result of a multicall contract call. These should be mapped directly against the called params (to exclude any calls that we didn't want to call )
 */
export const decodeMulticall = (web3: Web3, encodedMulticallResults: EncodedMulticallResults, multicallParams: Record<string, MultiCallParams>) => {

	const multicallEntries = Object.entries<MultiCallParams>(multicallParams);

	const decodedResults = multicallEntries
		.filter(([key, multicallParam]) => {
			return multicallParam !== undefined
		})
		.reduce((results, [key, multicallParam], index) => {

			const encodedReturnData = encodedMulticallResults.returnData[index]

			const decodedParams = (web3.eth.abi as any).decodeParameters(multicallParam.returns.params, encodedReturnData) as any[] // Will be Results object (non-array)
			const decodedParamsArray = multicallParam.returns.params.map((_, index) => decodedParams[index])

			const result = multicallParam.returns.callback(...decodedParamsArray)
			return {
				...results,
				[key]: result
			}
		}, {} as any)

	return decodedResults;
}