import Big from "big.js";
import { getGasFees, parseBN } from "../../web3/helpers";
import { availableSwapTokens } from "./performSwap";
import { SwapOptions, SwapPlatformOptions, SwapToken, SwapTokenDetails } from "./swapOptions";




export interface UniswapV2SwapPlatformOptions extends SwapPlatformOptions {
	uniswapV2RouterABI: any;

	uniswapv2routerAddress: string;
}

const localConfig = {
	slippage: 0.01, // 1% slippage tolerance

	/**
	 * How many minutes to wait for a swap to happen (within X minutes)
	 */
	deadlineMinutes: 20
}
export const performSwapUniswapV2 = async (swapOptions: SwapOptions, swapPlatformOptions: UniswapV2SwapPlatformOptions) => {
	const {
		web3,
		web3provider,
		inputToken,
		outputToken,
		onlyCheckTradeValidity = false
	} = swapOptions

	const {
		uniswapV2RouterABI,
		uniswapv2routerAddress
	} = swapPlatformOptions

	// Uniswap V2 Router ABI
	const uniswapV2RouterContract = new web3.eth.Contract(uniswapV2RouterABI, uniswapv2routerAddress);

	const inputTokenDetails = availableSwapTokens.find(token => token.shortName === swapOptions.inputToken.swapToken) as SwapTokenDetails
	const outputTokenDetails = availableSwapTokens.find(token => token.shortName === swapOptions.outputToken.swapToken) as SwapTokenDetails

	const inputAddress = inputTokenDetails.address
	const outputAddress = outputTokenDetails.address

	// Create contract instance
	// ETH doesn't have abi so we won't need it for ETH -> X swap
	const inputTokenContract = !!inputTokenDetails.abi ? new web3.eth.Contract(inputTokenDetails.abi, inputAddress) : undefined

	const amountIn = parseBN(inputToken.amount).toString()

	const slippageTolerance = localConfig.slippage; // 1% slippage tolerance

	// Get the quote for swapping DAI to ETH
	var path = [inputAddress, outputAddress];

	const amountsOut = (await uniswapV2RouterContract.methods.getAmountsOut(amountIn, path).call()) as any[];
	console.log('amountsOut:', amountsOut)

	// The quote is the second element in the amountsOut array
	const ethQuote = new Big(amountsOut[1]);

	// Calculate the minimum amount of ETH to receive considering slippage
	const amountOutMin = ethQuote.mul(1 - slippageTolerance).round(0);

	console.log('ETH Quote:', web3.utils.fromWei(ethQuote.toString(), 'ether'), amountOutMin.toString());
	console.log('Minimum ETH to receive:', web3.utils.fromWei(amountOutMin.toString(), 'ether'));
	console.log('Test:', amountOutMin.toString(), amountsOut[1]);
	console.log('Test2:', amountOutMin.toString(), amountsOut[1]);

	// Execute the trade

	const deadlineMinutes = localConfig.deadlineMinutes;
	const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadlineMinutes * 60;

	const accounts = await web3provider.request({ method: 'eth_requestAccounts' });
	const account = accounts[0];


	const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3)

	// ETH would not have a contract and no allowance is necessary
	if (inputTokenContract) {
		// Check existing allowance
		const allowance = (await inputTokenContract.methods.allowance(
			account,  // Your account address (the owner of the tokens)
			uniswapv2routerAddress // Address of the spender (Uniswap V2 Router)
		).call()) as string;

		console.log('Current allowance:', allowance);

		// Approve only if necessary
		if (new Big(allowance).lt(new Big(amountIn))) {

			// Attempt to call the method first to check if there are any errors
			await inputTokenContract.methods.approve(
				uniswapv2routerAddress, // Address of the spender (Uniswap V2 Router)
				amountIn // Amount of DAI to allow the router to spend
			).call({ from: account });

			const approveTx = await inputTokenContract.methods.approve(
				uniswapv2routerAddress, // Address of the spender (Uniswap V2 Router)
				amountIn // Amount of DAI to allow the router to spend
			).send({
				from: account,

				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice
			});
		}
	}

	/**
	 * Attempt to call the method first to check if there are any errors
	 */
	const checkVailidty = async () => {
		switch (inputToken.swapToken) {
			case SwapToken.ETH:
				return await uniswapV2RouterContract.methods.swapExactETHForTokens(
					amountOutMin.toString(), // Pass amountOutMin as a string
					path,
					account,
					deadlineTimestamp
				).call({
					from: account,
					value: amountIn // Only for ETH -> X swap
				});
			default:
				return await uniswapV2RouterContract.methods.swapExactTokensForETH(
					amountIn, // Only for X -> ETH swap
					amountOutMin.toString(), // Pass amountOutMin as a string
					path,
					account,
					deadlineTimestamp
				).call({
					from: account,
				});
		}
	}


	await checkVailidty()

	if (onlyCheckTradeValidity) {
		return true;
	}

	const sendSwapTx = async () => {
		switch (inputToken.swapToken) {
			case SwapToken.ETH:
				return await uniswapV2RouterContract.methods.swapExactETHForTokens(
					amountOutMin.toString(), // Pass amountOutMin as a string
					path,
					account,
					deadlineTimestamp
				).send({
					from: account,
					value: amountIn,  // Only for ETH -> X swap

					maxFeePerGas,
					maxPriorityFeePerGas,
					gasPrice
				});

			default:

				return await uniswapV2RouterContract.methods.swapExactTokensForETH(
					amountIn, // Only for X -> ETH swap
					amountOutMin.toString(), // Pass amountOutMin as a string
					path,
					account,
					deadlineTimestamp
				).send({
					from: account,

					maxFeePerGas,
					maxPriorityFeePerGas,
					gasPrice
				});

		}
	}

	const tx = await sendSwapTx()

	return tx;

}