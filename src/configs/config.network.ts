import { Layer, NetworkType } from './config.common';

/**
 * Retrieves the network configuration specific to a given blockchain layer (L1 or L2).
 * This includes addresses for Uniswap V3 USDC/ETH pair, Multicall contract, and Wrapped ETH.
 * @param layer The blockchain layer (Layer.Layer1 or Layer.Layer2) for which to get the configuration.
 * @returns The static configuration object for the specified layer.
 */
export const getNetworkConfig = (layer: Layer): StaticConfig => {
	switch (layer) {
		case Layer.Layer2: // L2 Configuration (Arbitrum)
			return {
				uniswapV3UsdcEthTokenContractAddress: '0xc31e54c7a869b9fcbecc14363cf510d1c41fa443',
				uniswapMulticallAdress: '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F',
				wrappedEthAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
			};
		case Layer.Layer1: // L1 Configuration (Ethereum Mainnet)
			return {
				uniswapV3UsdcEthTokenContractAddress: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
				uniswapMulticallAdress: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
				wrappedEthAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
			};
	}
};

/**
 * Interface defining the static configuration for a blockchain network.
 */
interface StaticConfig {
	/**
	 * Address of Uniswap V3 USDC/ETH pool. Used for USDC pricing.
	 */
	uniswapV3UsdcEthTokenContractAddress: string;

	/**
	 * Address of the Multicall smart contract (used to aggregate multiple smart contract calls into one).
	 */
	uniswapMulticallAdress: string;

	/**
	 * Address of the Wrapped ETH token (used for USDC pricing).
	 */
	wrappedEthAddress: string;
}
