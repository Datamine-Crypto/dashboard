export enum Ecosystem {
	Flux = 'Flux',
	ArbiFlux = 'ArbiFlux',
	Lockquidity = 'Lockquidity'
}
export enum Layer {
	Layer1 = 'Layer1',
	Layer2 = 'Layer2'
}
export enum NetworkType {
	Localhost = 'LOCALHOST',
	Testnet = 'TESTNET',
	Mainnet = 'MAINNET',
	Arbitrum = 'ARBITRUM',
}

export enum LiquidityPoolType {
	SushiSwap = 'SushiSwap',
	Uniswap = 'Uniswap'
}

export interface EcosystemConfig {

	/**
	 * What is the address of token that you have to "lock-in" (ex: DAM)
	 */
	lockableTokenContractAddress: string;

	/**
	 * A longer name ex: "Datamine (DAM)" for lockable token that can be displayed on text
	 */
	lockableTokenFullName: string;

	/**
	 * Shortest name to display ex: "DAM" for lockable token 
	 */
	lockableTokenShortName: string;

	/**
	 * A longer name ex: "FLUX" for lockable token that can be displayed on text
	 */
	mintableTokenShortName: string;

	/**
	 * What is the address of token that you have to "mint" (ex: FLUX)
	 */
	mintableTokenContractAddress: string;

	/**
	 * On L1 this is the Uniswap V3 pool address for Lockable / ETH token
	 */
	lockableUniswapV3L1EthTokenContractAddress?: string;

	/**
	 * On L1 this is the Uniswap V3 pool address for Mintable / ETH token
	 */
	mintableUniswapV3L1EthTokenContractAddress?: string;

	/**
	 * On L2 this is the Sushiswap pool address for Lockable / ETH token
	 */
	lockableSushiSwapL2EthPair?: string;

	/**
	 * You can set this to true if your price is a very large/small number (because you've created Lockable/ETH pair instead of ETH/Lockable)
	 */
	lockableSushiSwapL2EthPairSwapPairs?: boolean;

	/**
	 * On L2 this is the Sushiswap pool address for Mintable / ETH token
	 */
	mintableSushiSwapL2EthPair?: string;

	/**
	 * If your token has a failsafe limit enabled, at what block does it start?
	 * Failsafe allows only a certain amount of tokens to be locked-up in beginning. 
	 * (These are the settings you've set when initializing smart contract)
	 */
	failsafeStartBlockNumber: number;

	layer: Layer;

	/**
	 * What is the path to the logo in the public/logos folder?
	 */
	lockableTokenLogoFileName: string;

	/**
	 * What is the path to the logo in the public/logos folder?
	 */
	mintableTokenLogoFileName: string;

	/**
	 * When did the minting start? (Timestamp in seconds)
	 */
	timestampGenesis: number;

	/**
	 * Where is the majority of the liquidity concentrated in this ecosystem?
	 * For example FLUX (L2) liquidity is currently mostly in SushiSwap while Lockquidity (LOCK) are automatically added to Uniswap
	 */
	liquidityPoolType: LiquidityPoolType;
}