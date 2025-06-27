import { getBaseConfig } from "./config.base"

/**
 * Your token can override these configs instead of overriding base values
 * These config values are seperate from the original config to avoid conflicts with version updates
 */
/**
 * Provides a mechanism to override base configuration values without directly modifying the base config.
 * This is useful for custom token deployments or specific project requirements.
 * @param baseConfig The base configuration object to be overridden.
 * @returns A partial configuration object containing the overrides.
 */
export const getConfigOverrides = (baseConfig: ReturnType<typeof getBaseConfig>): Partial<ReturnType<typeof getBaseConfig>> => {
	return {
		// Example of override (your token doesn't have liquidity pools):
		//isLiquidityPoolsEnabled: false

	}
}