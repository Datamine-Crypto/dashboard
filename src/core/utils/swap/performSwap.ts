import fluxAbi from '../../web3/abis/flux.json';
import uniswapV2RouterABI from '../../web3/abis/uniswapv2router.json';
import { performSwapUniswapV2, UniswapV2SwapPlatformOptions } from "./performSwapUniswapV2";
import { SwapOptions, SwapPlatform, SwapToken, SwapTokenDetails } from "./swapOptions";

import { Ecosystem, Layer } from '../../../configs/config.common';
import EthereumPurpleLogo from '../../../svgs/ethereumPurple.svg';
import lockquidityLogo from '../../../svgs/lockquidity.svg';

export const availableSwapTokens: SwapTokenDetails[] = [
	{
		swapToken: SwapToken.LOCK,
		shortName: SwapToken.LOCK,
		longName: 'Lockquidity',
		abi: fluxAbi,
		address: '0x454F676D44DF315EEf9B5425178d5a8B524CEa03', // LOCK address on L2
		logo: lockquidityLogo,
		ecosystem: Ecosystem.Lockquidity,
		layer: Layer.Layer2
	},
	{
		swapToken: SwapToken.ETH,
		shortName: SwapToken.ETH,
		longName: 'Ethereum',
		abi: undefined, //@todo Currently only used for output
		address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // ETH address on L2
		logo: EthereumPurpleLogo,
		ecosystem: null,
		layer: null // Available on both
	},
];

//@todo move this out
const localConfig = {
	uniswapv2routerAddres: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24' // Uniswap V2 Router address on L2
}

export const performSwap = async (
	swapOptions: SwapOptions
) => {
	const {
		swapPlatform
	} = swapOptions



	switch (swapPlatform) {
		case SwapPlatform.UniswapV2:
			const uniswapV2SwapPlatformOptions: UniswapV2SwapPlatformOptions = {
				uniswapV2RouterABI,
				uniswapv2routerAddress: localConfig.uniswapv2routerAddres
			}

			await performSwapUniswapV2(
				swapOptions,
				uniswapV2SwapPlatformOptions
			)
			break;
	}

}