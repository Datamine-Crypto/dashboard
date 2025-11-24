/**
 * This file serves as the main entry point for initiating token swaps.
 * It abstracts the underlying swap platform (e.g., Uniswap, SushiSwap) and routes the request to the appropriate handler.
 */

import fluxAbi from '@/web3/abis/flux.json';
import uniswapV2RouterABI from '@/web3/abis/uniswapv2router.json';
import { performSwapUniswapV2, UniswapV2SwapPlatformOptions } from '@/web3/swap/performSwapUniswapV2';
import { SwapOptions, SwapPlatform, SwapToken, SwapTokenDetails } from '@/web3/swap/swapOptions';

import { Ecosystem, Layer } from '@/app/configs/config.common';
import arbiFluxLogo from '@/react/svgs/arbiFluxLogo.svg';
import EthereumPurpleLogo from '@/react/svgs/ethereumPurple.svg';
import fluxLogo from '@/react/svgs/fluxLogo.svg';
import lockquidityLogo from '@/react/svgs/lockquidity.svg';

/**
 * Extends the base `SwapTokenDetails` with Uniswap V2 specific information.
 */
interface SwapTokenDetailsUniswapV2 extends SwapTokenDetails {
	uniswapv2routerAddress: string;
}

/**
 * An array of objects defining the details of all tokens available for swapping in the application.
 * This includes token addresses, ABIs, logos, and the specific Uniswap V2 router address for each token.
 */
export const availableSwapTokens: SwapTokenDetails[] = [
	{
		swapToken: SwapToken.LOCK,
		shortName: SwapToken.LOCK,
		longName: 'Lockquidity',
		abi: fluxAbi,
		address: '0x454F676D44DF315EEf9B5425178d5a8B524CEa03', // LOCK address on L2
		logo: lockquidityLogo,
		ecosystem: Ecosystem.Lockquidity,
		layer: Layer.Layer2,
		uniswapv2routerAddress: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24', // Uniswap V2 Router address on L2
	} as SwapTokenDetailsUniswapV2,
	{
		swapToken: SwapToken.FLUX,
		shortName: SwapToken.FLUX,
		longName: 'FLUX',
		abi: fluxAbi,
		address: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df', // FLUX address on L2
		logo: fluxLogo,
		ecosystem: Ecosystem.ArbiFlux, // We want to switch to ArbiFLUX on L2 to trade this token
		layer: Layer.Layer2,
		uniswapv2routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', // SushiSwap V2 Router address on L2
	} as SwapTokenDetailsUniswapV2,
	{
		swapToken: SwapToken.ETH,
		shortName: SwapToken.ETH,
		longName: 'Ethereum',
		abi: undefined, //@todo Currently only used for output
		address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // ETH address on L2
		logo: EthereumPurpleLogo,
		ecosystem: null,
		layer: null, // Available on both
	},
	{
		swapToken: SwapToken.ArbiFLUX,
		shortName: SwapToken.ArbiFLUX,
		longName: 'ArbiFLUX',
		abi: fluxAbi,
		address: '0x64081252c497FCfeC247a664e9D10Ca8eD71b276', // ArbiFLUX address on L2
		logo: arbiFluxLogo,
		ecosystem: Ecosystem.ArbiFlux,
		layer: Layer.Layer2,
		uniswapv2routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', // SushiSwap V2 Router address on L2
	},
];

/**
 * Initiates a token swap operation based on the specified swap platform.
 * This function acts as a router, delegating the swap logic to the appropriate platform-specific handler.
 * @param swapOptions - An object containing details about the swap, including input/output tokens, amounts, and the target swap platform.
 * @returns A promise that resolves when the swap is complete, or rejects if an error occurs.
 */
export const performSwap = async (swapOptions: SwapOptions) => {
	const { swapPlatform } = swapOptions;

	switch (swapPlatform) {
		case SwapPlatform.UniswapV2: {
			const getRouterAddress = () => {
				const nonEthToken =
					swapOptions.inputToken.swapToken !== SwapToken.ETH
						? swapOptions.inputToken.swapToken
						: swapOptions.outputToken.swapToken;
				const matchingTokenDetails = availableSwapTokens.find(
					(availableSwapToken) => availableSwapToken.swapToken === nonEthToken
				) as SwapTokenDetailsUniswapV2;

				return matchingTokenDetails.uniswapv2routerAddress;
			};

			const uniswapV2SwapPlatformOptions: UniswapV2SwapPlatformOptions = {
				uniswapV2RouterABI,
				uniswapv2routerAddress: getRouterAddress(),
			};

			return await performSwapUniswapV2(swapOptions, uniswapV2SwapPlatformOptions);
		}
	}
};
