
import { getConfigOverrides } from './config.overrides';
import { getBaseConfig } from './config.base';

export const getConfig = (isArbitrumMainnet: boolean = false) => {
	const baseConfig = getBaseConfig(isArbitrumMainnet)
	return {
		...baseConfig,
		...getConfigOverrides(baseConfig)
	}
}