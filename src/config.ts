
import { getConfigOverrides } from './config.overrides';
import { getBaseConfig } from './config.base';

export const getConfig = (isArbitrumMainnet: boolean = false) => {
	return {
		...getBaseConfig(isArbitrumMainnet),
		...getConfigOverrides()
	}
}