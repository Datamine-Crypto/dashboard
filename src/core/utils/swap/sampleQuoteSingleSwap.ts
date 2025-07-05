/**
 * @file sampleQuoteSingleSwap.ts
 * @description This file provides a sample implementation for getting a swap quote from Uniswap V3.
 * It is intended for demonstration and is not actively used in the application's main swap functionality.
 */

import BN from 'bn.js';
import Web3 from 'web3';

/**
 * In this sample code we can get a quote for swapping between ETH->DAM for Uniswap v3.
 * This is not used but a good sample to have
 * Example output: "Expected 1 ETH output amount: 321882.440178210659442729 DAM"
 */
/**
 * Demonstrates how to get a quote for a single token swap using Uniswap V3's Quoter contract.
 * This function is for sample purposes and is not actively used in the application's swap logic.
 * It calculates the expected output amount for a given input amount and token pair.
 * @param web3 The Web3 instance to interact with the blockchain.
 */
const sampleQuoteSingleSwap = async (web3: Web3) => {
	//L1
	const token0Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
	const token1Address = '0xF80D589b3Dbe130c270a69F1a69D050f268786Df'; // DAM

	//L2
	//const token0Address = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // WETH
	//const token1Address = '0x454F676D44DF315EEf9B5425178d5a8B524CEa03'; // LOCK

	//const feeTier = "500"; // 0.05% fee tier
	const feeTier = '10000'; // 1% fee tier

	const amountIn = new BN(1).mul(new BN(10).pow(new BN(18))).toString(); // 1 ETH

	// Get the Quoter contract address
	const quoterAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'; // Quoter contract address on L1 and L2

	// Get the Quoter contract ABI (replace with the actual ABI)
	const quoterABI = [
		{
			inputs: [
				{ internalType: 'address', name: '_factory', type: 'address' },
				{ internalType: 'address', name: '_WETH9', type: 'address' },
			],
			stateMutability: 'nonpayable',
			type: 'constructor',
		},
		{
			inputs: [],
			name: 'WETH9',
			outputs: [{ internalType: 'address', name: '', type: 'address' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [],
			name: 'factory',
			outputs: [{ internalType: 'address', name: '', type: 'address' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'bytes', name: 'path', type: 'bytes' },
				{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
			],
			name: 'quoteExactInput',
			outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'address', name: 'tokenIn', type: 'address' },
				{ internalType: 'address', name: 'tokenOut', type: 'address' },
				{ internalType: 'uint24', name: 'fee', type: 'uint24' },
				{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
				{ internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' },
			],
			name: 'quoteExactInputSingle',
			outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'bytes', name: 'path', type: 'bytes' },
				{ internalType: 'uint256', name: 'amountOut', type: 'uint256' },
			],
			name: 'quoteExactOutput',
			outputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'address', name: 'tokenIn', type: 'address' },
				{ internalType: 'address', name: 'tokenOut', type: 'address' },
				{ internalType: 'uint24', name: 'fee', type: 'uint24' },
				{ internalType: 'uint256', name: 'amountOut', type: 'uint256' },
				{ internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' },
			],
			name: 'quoteExactOutputSingle',
			outputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'int256', name: 'amount0Delta', type: 'int256' },
				{ internalType: 'int256', name: 'amount1Delta', type: 'int256' },
				{ internalType: 'bytes', name: 'path', type: 'bytes' },
			],
			name: 'uniswapV3SwapCallback',
			outputs: [],
			stateMutability: 'view',
			type: 'function',
		},
	];

	// Create a contract instance
	const quoterContract = new web3.eth.Contract(quoterABI as any, quoterAddress);

	// Calculate the sqrtPriceLimitX96 (optional)
	// This value restricts the price range for the swap
	// You can adjust this value based on your needs
	//const sqrtPriceLimitX96 = new BN(2 ** 96).mul(new BN(10000)).div(new BN(10000));

	// Call the quoteExactInputSingle function
	const amountOut = await quoterContract.methods
		.quoteExactInputSingle(token0Address, token1Address, feeTier, amountIn.toString(), '0')
		.call();

	console.log(`Expected 1 ETH output amount: ${web3.utils.fromWei(amountOut as any, 'ether')} DAM`);
};
