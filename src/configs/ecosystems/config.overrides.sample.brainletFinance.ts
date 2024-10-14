import { getBaseConfig } from "../config.base"

/**
 * Your token can override these configs instead of overriding base values
 * These config values are seperate from the original config to avoid conflicts with version updates
 * 
 * [Brainlet Finance] Config overrides:
 * This is an EXAMPLE of how Brainlet Finance overrides some of the config values for their ecosystem/tokenomics
 * This file is NOT USED in the source code
 */
export const getConfigOverrides = (baseConfig: ReturnType<typeof getBaseConfig>): Partial<ReturnType<typeof getBaseConfig>> => {
	return {
		ecosystemName: 'Brainlet Finance',
		ecosystemSlogan: 'Layered Deflationary Memebrane',

		lockableTokenFullName: 'ArbiFLUX',
		lockableTokenShortName: 'ArbiFLUX',
		lockableTokenContractAddress: '0x64081252c497FCfeC247a664e9D10Ca8eD71b276',
		lockableSushiSwapL2EthPair: '0xbF719D56c5f19ae0833ADC4080BEfC48A9B415b5',
		lockableSushiSwapL2EthPairSwapPairs: true,

		mintableTokenShortName: 'BRAIN',
		mintableTokenContractAddress: '0x23d9F6524225A0ff17B652b99B6660eba3B8d97a',
		mintableSushiSwapL2EthPair: '0xfFCC3f2f51953f2a2056ecc64d62CA90876BE2E7',

		isArbitrumOnlyToken: true,

		isLiquidityPoolsEnabled: true,
		isHomepageVideoVisible: false,

		isSettingsValidatorDashboardButtonEnabled: false,

		dashboardAbsoluteUrl: 'https://brainlet.finance',

		mitCopyrightYear: 2023,

		isTokenLogoEnabled: false,

		maxBurnMultiplier: 100,

		mintableTokenMintPerBlockDivisor: 1,
		mintableTokenPriceDecimals: 10,

		navigation: {
			...baseConfig.navigation,

			isL1PageEnabled: false,
			isL2PageEnabled: false,
			isCommunityPageEnabled: false,
			isAnalyticsPagesEnabled: false,
			isHelpPageEnabled: false,

			ecosystemButtonlabel: 'Brainlet Ecosystem',

			discordInviteLink: null,
		}
	}
}