import { getBaseConfig } from "./config.base"

/**
 * Your token can override these configs instead of overriding base values
 * These config values are seperate from the original config to avoid conflicts with version updates
 */
export const getConfigOverrides = (baseConfig: ReturnType<typeof getBaseConfig>): Partial<ReturnType<typeof getBaseConfig>> => {
	return {
		// Example of override (your token doesn't have liquidity pools):
		//isLiquidityPoolsEnabled: false

	}
}