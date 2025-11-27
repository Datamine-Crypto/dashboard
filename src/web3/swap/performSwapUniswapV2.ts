/**
 * This file contains the core logic for executing token swaps on Uniswap V2-compatible routers.
 * It handles everything from fetching quotes and checking allowances to sending the final transaction.
 */

import Big from 'big.js';
import { parseBN } from '@/utils/mathHelpers';
import { getGasFees } from '@/web3/utils/web3Helpers';
import { availableSwapTokens } from '@/web3/swap/performSwap';
import { SwapOptions, SwapPlatformOptions, SwapQuote, SwapToken, SwapTokenDetails } from '@/web3/swap/swapOptions';
import { getContract, Address, GetContractReturnType, PublicClient, WalletClient } from 'viem';
import { uniswapv2routerAbi } from '@/web3/abis/uniswapv2router';
import { fluxAbi } from '@/web3/abis/flux';

/**
 * Defines the platform-specific options required for a Uniswap V2 swap.
 */
export interface UniswapV2SwapPlatformOptions extends SwapPlatformOptions {
	uniswapV2RouterABI: typeof uniswapv2routerAbi;
	uniswapv2routerAddress: string;
}

const localConfig = {
	slippage: 0.01, // 1% slippage tolerance

	/**
	 * How many minutes to wait for a swap to happen (within X minutes)
	 */
	deadlineMinutes: 20,
};
/**
 * Performs a token swap operation using the Uniswap V2 (or compatible) router.
 * It handles quoting, allowance checks, and sending the swap transaction.
 * @param swapOptions - Options for the swap, including input/output tokens, amounts, and Web3 instances.
 * @param swapPlatformOptions - Platform-specific options for Uniswap V2, including ABI and router address.
 * @returns A SwapQuote if `onlyGetQuote` is true, otherwise the transaction receipt.
 */
export const performSwapUniswapV2 = async (
	swapOptions: SwapOptions,
	swapPlatformOptions: UniswapV2SwapPlatformOptions
) => {
	const {
		publicClient,
		walletClient,
		inputToken,
		outputToken,
		onlyGetQuote = false,
		onlyCheckTradeValidity = false,
	} = swapOptions;

	const { uniswapV2RouterABI, uniswapv2routerAddress } = swapPlatformOptions;

	// Uniswap V2 Router Contract
	const uniswapV2RouterContract = getContract({
		address: uniswapv2routerAddress as Address,
		abi: uniswapV2RouterABI,
		client: { public: publicClient, wallet: walletClient },
	});

	const inputTokenDetails = availableSwapTokens.find(
		(token) => token.shortName === swapOptions.inputToken.swapToken
	) as SwapTokenDetails;
	const outputTokenDetails = availableSwapTokens.find(
		(token) => token.shortName === swapOptions.outputToken.swapToken
	) as SwapTokenDetails;

	const inputAddress = inputTokenDetails.address;
	const outputAddress = outputTokenDetails.address;

	// Create contract instance
	// ETH doesn't have abi so we won't need it for ETH -> X swap
	const inputTokenContract = inputTokenDetails.abi
		? getContract({
				address: inputAddress as Address,
				abi: inputTokenDetails.abi,
				client: { public: publicClient, wallet: walletClient },
			})
		: undefined;

	const amountIn = parseBN(inputToken.amount).toString();

	const slippageTolerance = localConfig.slippage; // 1% slippage tolerance

	// Get the quote for swapping DAI to ETH
	const path = [inputAddress, outputAddress] as Address[];

	const amountsOut = (await uniswapV2RouterContract.read.getAmountsOut([BigInt(amountIn), path])) as bigint[];

	// The quote is the second element in the amountsOut array
	const ethQuote = new Big(amountsOut[1].toString());

	// Calculate the minimum amount of ETH to receive considering slippage
	const amountOutMin = ethQuote
		.mul(1 - slippageTolerance)
		.round(0)
		.toFixed(0);

	if (onlyGetQuote) {
		return {
			out: {
				minAmount: amountOutMin,
				maxAmount: amountsOut[1].toString(),
			},
		} as SwapQuote;
	}

	// Execute the trade

	const deadlineMinutes = localConfig.deadlineMinutes;
	const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadlineMinutes * 60;

	if (!walletClient) throw new Error('No wallet client');
	const accounts = await walletClient.getAddresses();
	const account = accounts[0];

	// ETH would not have a contract and no allowance is necessary
	if (inputTokenContract) {
		// Check existing allowance
		const allowance = (await inputTokenContract.read.allowance([
			account, // Your account address (the owner of the tokens)
			uniswapv2routerAddress, // Address of the spender (Uniswap V2 Router)
		])) as bigint;

		console.log('Current allowance:', allowance);

		// Approve only if necessary
		if (new Big(allowance.toString()).lt(new Big(amountIn))) {
			const fees = await getGasFees(publicClient);

			// Attempt to call the method first to check if there are any errors
			await inputTokenContract.simulate.approve(
				[
					uniswapv2routerAddress, // Address of the spender (Uniswap V2 Router)
					BigInt(amountIn), // Amount of DAI to allow the router to spend
				],
				{ account }
			);

			const hash = await (
				inputTokenContract as unknown as GetContractReturnType<
					typeof fluxAbi,
					{ public: PublicClient; wallet: WalletClient }
				>
			).write.approve(
				[
					uniswapv2routerAddress as Address, // Address of the spender (Uniswap V2 Router)
					BigInt(amountIn), // Amount of DAI to allow the router to spend
				],
				{
					account,
					chain: walletClient.chain,
					...fees,
				}
			);

			await publicClient.waitForTransactionReceipt({ hash });
		}
	}

	/**
	 * Attempt to call the method first to check if there are any errors
	 */
	const checkVailidty = async () => {
		switch (inputToken.swapToken) {
			case SwapToken.ETH:
				return await uniswapV2RouterContract.simulate.swapExactETHForTokens(
					[
						BigInt(amountOutMin), // Pass amountOutMin as a string
						path,
						account,
						BigInt(deadlineTimestamp),
					],
					{
						account,
						value: BigInt(amountIn), // Only for ETH -> X swap
					}
				);
			default:
				return await uniswapV2RouterContract.simulate.swapExactTokensForETH(
					[
						BigInt(amountIn), // Only for X -> ETH swap
						BigInt(amountOutMin), // Pass amountOutMin as a string
						path,
						account,
						BigInt(deadlineTimestamp),
					],
					{
						account,
					}
				);
		}
	};

	await checkVailidty();

	if (onlyCheckTradeValidity) {
		return true;
	}

	const sendSwapTx = async () => {
		const fees = await getGasFees(publicClient);
		switch (inputToken.swapToken) {
			case SwapToken.ETH:
				return await (
					uniswapV2RouterContract as unknown as GetContractReturnType<
						typeof uniswapv2routerAbi,
						{ public: PublicClient; wallet: WalletClient }
					>
				).write.swapExactETHForTokens(
					[
						BigInt(amountOutMin), // Pass amountOutMin as a string
						path,
						account,
						BigInt(deadlineTimestamp),
					],
					{
						account,
						chain: walletClient.chain,
						value: BigInt(amountIn), // Only for ETH -> X swap
						...fees,
					}
				);

			default:
				return await (
					uniswapV2RouterContract as unknown as GetContractReturnType<
						typeof uniswapv2routerAbi,
						{ public: PublicClient; wallet: WalletClient }
					>
				).write.swapExactTokensForETH(
					[
						BigInt(amountIn), // Only for X -> ETH swap
						BigInt(amountOutMin), // Pass amountOutMin as a string
						path,
						account,
						BigInt(deadlineTimestamp),
					],
					{
						account,
						chain: walletClient.chain,
						...fees,
					}
				);
		}
	};

	const hash = await sendSwapTx();
	const receipt = await publicClient.waitForTransactionReceipt({ hash });

	return receipt;
};
