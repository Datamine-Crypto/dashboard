/**
 * This file defines common enums and interfaces used across the application,
 * particularly for configuring different blockchain ecosystems and their properties.
 */
export enum Ecosystem {
	Flux = 'Flux',
	ArbiFlux = 'ArbiFlux',
	Lockquidity = 'Lockquidity',
}

/**
 * Defines the blockchain layer for an ecosystem.
 */
export enum Layer {
	Layer1 = 'Layer1',
	Layer2 = 'Layer2',
}

/**
 * Defines different network types the application can connect to.
 */
export enum NetworkType {
	Localhost = 'LOCALHOST',
	Testnet = 'TESTNET',
	Mainnet = 'MAINNET',
	Arbitrum = 'ARBITRUM',
}

/**
 * Defines the types of liquidity pools supported.
 */
export enum LiquidityPoolType {
	SushiSwap = 'SushiSwap',
	Uniswap = 'Uniswap',
}

/**
 * Interface defining the configuration for a specific blockchain ecosystem.
 */
export interface EcosystemConfig {
	/**
	 * The contract address of the token that needs to be "locked-in" (e.g., DAM).
	 */
	lockableTokenContractAddress: string;

	/**
	 * A longer, display-friendly name for the lockable token (e.g., "Datamine (DAM)").
	 */
	lockableTokenFullName: string;

	/**
	 * A shorter, display-friendly name for the lockable token (e.g., "DAM").
	 */
	lockableTokenShortName: string;

	/**
	 * A shorter, display-friendly name for the mintable token (e.g., "FLUX").
	 */
	mintableTokenShortName: string;

	/**
	 * The contract address of the token that can be "minted" (e.g., FLUX).
	 */
	mintableTokenContractAddress: string;

	/**
	 * The address of the Time-in-Market (TIM) market contract.
	 */
	marketAddress: string | null;

	/**
	 * The address of the Hodl Clicker: Rush game.
	 */
	gameHodlClickerAddress: string | null;

	/**
	 * On Layer 1 (L1), this is the Uniswap V3 pool address for the Lockable / ETH token pair.
	 */
	lockableUniswapV3L1EthTokenContractAddress?: string;

	/**
	 * On Layer 1 (L1), this is the Uniswap V3 pool address for the Mintable / ETH token pair.
	 */
	mintableUniswapV3L1EthTokenContractAddress?: string;

	/**
	 * On Layer 2 (L2), this is the Sushiswap pool address for the Lockable / ETH token pair.
	 */
	lockableSushiSwapL2EthPair?: string;

	/**
	 * Set to `true` if the price is inverted (e.g., Lockable/ETH instead of ETH/Lockable) due to token pair creation.
	 */
	lockableSushiSwapL2EthPairSwapPairs?: boolean;

	/**
	 * On Layer 2 (L2), this is the Sushiswap pool address for the Mintable / ETH token pair.
	 */
	mintableSushiSwapL2EthPair?: string;

	/**
	 * The block number at which the failsafe limit for token lock-up begins.
	 * This is based on the smart contract initialization settings.
	 */
	failsafeStartBlockNumber: number;

	/**
	 * The blockchain layer this ecosystem operates on (e.g., Layer1, Layer2).
	 */
	layer: Layer;

	/**
	 * The file name of the lockable token's logo, located in the `public/logos` folder.
	 */
	lockableTokenLogoFileName: string;

	/**
	 * The file name of the mintable token's logo, located in the `public/logos` folder.
	 */
	mintableTokenLogoFileName: string;

	/**
	 * The timestamp (in seconds) when minting began for this ecosystem.
	 */
	timestampGenesis: number;

	/**
	 * The primary type of liquidity pool where the majority of liquidity is concentrated for this ecosystem.
	 */
	liquidityPoolType: LiquidityPoolType;

	/**
	 * The `_mintPerBlockDivisor` value from the smart contract (e.g., the second number in `10 ** 8`).
	 */
	mintableTokenMintPerBlockDivisor: number;

	/**
	 * The number of decimal places to display when showing prices for the mintable token.
	 */
	mintableTokenPriceDecimals: number;

	/**
	 * The SVG asset for the ecosystem's logo.
	 */
	ecosystemLogoSvg: string;

	/**
	 * If set, the address that holds the locked liquidity in Uniswap.
	 */
	lockedLiquidityUniswapAddress?: string;

	/**
	 * The minimum burn multiplier for this ecosystem.
	 */
	minBurnMultiplier: number;

	/**
	 * A list of top burning addresses for this ecosystem, updated frequently based on activity.
	 * These are used as default gems in the Datamine Gems #GameFi.
	 */
	marketTopBurningaddresses: string[];
}
