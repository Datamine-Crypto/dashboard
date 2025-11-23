// This file is now a barrel file for the reducer logic, which has been split into multiple files for better maintainability.
export { commonLanguage } from '@/core/web3/reducer/common';
export { handleCommand } from '@/core/web3/reducer/commandHandler';
export { initialState } from '@/core/web3/reducer/initialState';
export {
	ConnectionMethod,
	ForecastMultiplierType,
	type Balances,
	type ClientSettings,
	type ForecastSettings,
	type MarketAddresses,
	type MarketDetails,
	type SwapState,
	type SwapTokenBalances,
	type Web3State,
} from '@/core/web3/reducer/interfaces';
export { handleQueryResponse } from '@/core/web3/reducer/queryHandler';
