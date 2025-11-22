// This file is now a barrel file for the reducer logic, which has been split into multiple files for better maintainability.
export { commonLanguage } from './reducer/common';
export { handleCommand } from './reducer/commandHandler';
export { initialState } from './reducer/initialState';
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
} from './reducer/interfaces';
export { handleQueryResponse } from './reducer/queryHandler';
