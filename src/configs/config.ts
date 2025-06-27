
import { getConfigOverrides } from './config.overrides';
import { Ecosystem, Layer, NetworkType } from './config.common';
import { getBaseConfig } from './config.base';
import { getNetworkConfig } from './config.network';

/**
 * This joins a bunch of configurations together to form the final configuration settings variable.
 * If you want to update anything check out config.overrides.ts file!
 */
/**
 * Aggregates various configuration settings (base, network, and overrides) into a single, comprehensive ecosystem configuration object.
 * This function is the primary entry point for retrieving all configuration parameters for a given ecosystem.
 * @param ecosystem The specific blockchain ecosystem for which to retrieve the configuration.
 * @returns A complete configuration object for the specified ecosystem.
 */
export const getEcosystemConfig = (ecosystem: Ecosystem) => {

	const baseConfig = getBaseConfig(ecosystem)

	return {
		...baseConfig,
		...getNetworkConfig(baseConfig.layer),
		...getConfigOverrides(baseConfig)
	}
}
