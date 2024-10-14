
import { getConfigOverrides } from './config.overrides';
import { Ecosystem, Layer, NetworkType } from './config.common';
import { getBaseConfig } from './config.base';
import { getNetworkConfig } from './config.network';

/**
 * This joins a bunch of configurations together to form the final configuration settings variable.
 * If you want to update anything check out config.overrides.ts file!
 */
export const getEcosystemConfig = (ecosystem: Ecosystem) => {

	const baseConfig = getBaseConfig(ecosystem)

	return {
		...baseConfig,
		...getNetworkConfig(baseConfig.layer),
		...getConfigOverrides(baseConfig)
	}
}
