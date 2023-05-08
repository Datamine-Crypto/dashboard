
import { getConfigOverrides } from './config.overrides';
import { getBaseConfig, NetworkType } from './config.base';

/**
 * This joins a bunch of configurations together to form the final configuration settings variable.
 * If you want to update anything check out config.overrides.ts file!
 */
export const getConfig = (isArbitrumMainnet: boolean = false) => {
	/**
	 * These are values you shouldn't update as they're hardcoded to some well-known settings
	 */
	const getNetworkStaticConfig = (): StaticConfig => {
		const networkType = isArbitrumMainnet ? NetworkType.Arbitrum : NetworkType.Mainnet;
		switch (networkType) {

			case NetworkType.Arbitrum: // L2 Configuration
				return {
					uniswapV3UsdcEthTokenContractAddress: '0xc31e54c7a869b9fcbecc14363cf510d1c41fa443',
					uniswapMulticallAdress: '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F',
					wrappedEthAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
				}
			case NetworkType.Mainnet: // L1 Configuration
				return {
					uniswapV3UsdcEthTokenContractAddress: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
					uniswapMulticallAdress: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
					wrappedEthAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
				}
		}
	}

	const baseConfig = getBaseConfig(isArbitrumMainnet)
	return {
		...baseConfig,
		...getNetworkStaticConfig(),
		...getConfigOverrides(baseConfig)
	}
}

interface StaticConfig {
	/**
	 * Address of Uniswap (USDC/ETH). We will use this for USDC pricing
	 */
	uniswapV3UsdcEthTokenContractAddress: string;

	/**
	 * Multicall smart contract (used to aggregate multiple smart contract calls into one)
	 */
	uniswapMulticallAdress: string;

	/**
	 * Address of Wrapped ETH token (We'll use this for USDC pricing)
	 */
	wrappedEthAddress: string;
}