import { getBaseConfig } from '@/configs/config.base';

/**
 * Provides a mechanism to override base configuration values without directly modifying the base config.
 * This is useful for custom token deployments or specific project requirements.
 * Overrides are kept separate to prevent conflicts during version updates.
 * @param baseConfig The base configuration object to be overridden.
 * @returns A partial configuration object containing the overrides.
 */
export const getConfigOverrides = (
	baseConfig: ReturnType<typeof getBaseConfig>
): Partial<ReturnType<typeof getBaseConfig>> => {
	return {
		// Example of override (your token doesn't have liquidity pools):
		//isLiquidityPoolsEnabled: false
	};
};
