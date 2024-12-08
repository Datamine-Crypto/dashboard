import Web3 from "web3";

/**
 * This file contains a very useful function to utilize multicall smart contract.
 * We've combined this together with some typescript magic to easily utilize this in a single call while retaining types
 */

interface MultiCallParams {
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

export const encodeMulticall = (web3: Web3, multicallParams: MultiCallParams[]) => {
	return multicallParams.map(multicallParam => ([
		multicallParam.address,
		web3.eth.abi.encodeFunctionCall(multicallParam.function.signature, multicallParam.function.parameters)
	]))
}

interface EncodedMulticallResults {
	blockNumber: string;
	returnData: any[];
}

export const decodeMulticall = (web3: Web3, encodedMulticallResults: EncodedMulticallResults, multicallParams: MultiCallParams[]) => {
	const decodedResults = multicallParams.reduce((results, multicallParam, index) => {
		const encodedReturnData = encodedMulticallResults.returnData[index]

		const decodedParams = web3.eth.abi.decodeParameters(multicallParam.returns.params, encodedReturnData) as any[] // Will be Results object (non-array)
		const decodedParamsArray = multicallParam.returns.params.map((_, index) => decodedParams[index])

		const result = multicallParam.returns.callback(...decodedParamsArray)
		return [
			...results,
			result
		]
	}, [] as any[])

	return decodedResults;
}