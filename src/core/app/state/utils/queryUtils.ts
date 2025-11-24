import type { Web3 } from 'web3';
import damTokenAbi from '@/core/web3/abis/dam.json';
import fluxTokenAbi from '@/core/web3/abis/flux.json';
import batchMinterAbi from '@/core/web3/abis/batchMinter.json';
import marketAbi from '@/core/web3/abis/market.json';
import gameHodlClickerAbi from '@/core/web3/abis/games/gameHodlClicker.json';
import multicallAbi from '@/core/web3/abis/multicall.json';
import uniswapPairV3Abi from '@/core/web3/abis/uniswapPairV3.json';

import { getEcosystemConfig } from '@/core/app/configs/config';
import { Ecosystem } from '@/core/app/configs/config.common';
import { devLog } from '@/core/utils/devLog';
import { ReducerDispatch } from '@/core/app/state/stateInterfaces';
import { commonLanguage } from '@/core/app/state/commonLanguage';

/**
 * @var web3provider - Holds the current Web3 provider instance (e.g., MetaMask, WalletConnect).
 */
let web3provider: any = null;

/**
 * @var preselectedAddress - Stores the user's address before full initialization, useful for early UI updates.
 */
let preselectedAddress: string | null = null;

export const setWeb3Provider = (provider: any) => {
	web3provider = provider;
};

export const getWeb3ProviderInstance = () => {
	return web3provider;
};

export const setPreselectedAddress = (address: string | null) => {
	preselectedAddress = address;
};

export const getPreselectedAddress = () => {
	return preselectedAddress;
};

/**
 * Retrieves the currently selected Ethereum address from the provider.
 * It checks multiple sources within the provider to ensure compatibility.
 * @returns The selected Ethereum address or null if not available.
 */
export const getSelectedAddress = () => {
	if (!web3provider) {
		return null;
	}

	if (web3provider.accounts != null && web3provider.accounts.length > 0) {
		const selectedAddress = web3provider.accounts.length > 0 ? web3provider.accounts[0] : null;
		return selectedAddress;
	}

	const { selectedAddress } = web3provider;

	if (!selectedAddress) {
		if (preselectedAddress) {
			return preselectedAddress;
		}
	}

	return selectedAddress;
};

/**
 * Prompts the user to connect their wallet and pre-selects the first available address.
 * This function tries multiple methods to ensure wallet connection.
 * @returns An array of available addresses.
 */
export const preselectAddress = async () => {
	try {
		const addresses = await web3provider.enable();

		devLog('enable:', addresses);
		if (addresses && addresses.length > 0) {
			preselectedAddress = addresses[0];
			return addresses;
		}
	} catch (err) {
		// Silently fail if can't find any addresses or enable() fails
	}

	const selectedAddress = getSelectedAddress();

	if (!selectedAddress && !preselectedAddress) {
		try {
			const accounts = await web3provider.request('eth_requestAccounts');
			if (accounts.length > 0) {
				preselectedAddress = accounts[0]; //@todo
				return accounts;
			}
		} catch (err) {
			// Silently fail if can't find any accounts
		}

		try {
			const accounts = await web3provider.send('eth_requestAccounts');
			if (accounts.length > 0) {
				preselectedAddress = accounts[0]; //@todo
				return accounts;
			}
		} catch (err) {
			// Silently fail if can't find any accounts
		}
	}

	return [];
};

/**
 * Initializes and returns contract instances based on the selected ecosystem.
 * @param web3 - The Web3 instance.
 * @param ecosystem - The currently selected ecosystem (e.g., DAM->FLUX L1).
 * @returns An object containing all necessary contract instances.
 */
export const getContracts = (web3: Web3, ecosystem: Ecosystem) => {
	const config = getEcosystemConfig(ecosystem) as any;
	return {
		damToken: new web3.eth.Contract(damTokenAbi as any, config.lockableTokenContractAddress),
		fluxToken: new web3.eth.Contract(fluxTokenAbi as any, config.mintableTokenContractAddress),
		batchMinter: new web3.eth.Contract(batchMinterAbi as any, config.batchMinterAddress),

		// Datamine Gems
		market: config.marketAddress ? new web3.eth.Contract(marketAbi as any, config.marketAddress) : null,

		// HODL Clicker
		gameHodlClicker: config.gameHodlClickerAddress
			? new web3.eth.Contract(gameHodlClickerAbi as any, config.gameHodlClickerAddress)
			: null,

		//uniswapDamToken: new web3.eth.Contract(uniswapPairAbi as any, config.uniswapEthDamTokenContractAddress), // For Legacy Uniswap V2 contract(we use V3 now)
		//uniswapFluxToken: new web3.eth.Contract(uniswapPairAbi as any, config.uniswapFluxEthTokenContractAddress), // For Legacy Uniswap V2 contract(we use V3 now)
		//usdcEthToken: new web3.eth.Contract(uniswapPairAbi as any, config.uniswapUsdcEthTokenContractAddress), // For Legacy Uniswap V2 contract(we use V3 now)

		uniswapV3DamToken: new web3.eth.Contract(
			uniswapPairV3Abi as any,
			config.lockableUniswapV3L1EthTokenContractAddress
		),
		uniswapV3FluxToken: new web3.eth.Contract(
			uniswapPairV3Abi as any,
			config.mintableUniswapV3L1EthTokenContractAddress
		),
		uniswapV3UsdcEthToken: new web3.eth.Contract(uniswapPairV3Abi as any, config.uniswapV3UsdcEthTokenContractAddress),

		multicall: new web3.eth.Contract(multicallAbi as any, config.uniswapMulticallAdress),
	};
};

/**
 * Local configuration for Web3 bindings.
 */
export const localConfig = {
	/**
	 * Always show connection buttons
	 */
	skipInitialConnection: false,

	/**
	 * How often to fetch new blocks? Ethereum block time is average of 12 seconds.
	 * We'll add 200ms latency to capture the majority of blocks (they're ~12.06-12.09 on average so 200ms should be plenty)
	 */
	blockUpdatesIntervalMs: 12000 + 200,

	/**
	 * How often to reset the throttle for quote ouputs
	 * This way when you're typing the amount you aren't fetching every keystroke (wait up to X miliseconds between each amount adjustmnet)
	 */
	thottleGetOutputQuoteMs: 1000,
};

/**
 * Subscribes to new block updates and dispatches a refresh command periodically.
 * @param web3 - The Web3 instance.
 * @param dispatch - The reducer's dispatch function.
 */
export const subscribeToBlockUpdates = (web3: Web3, dispatch: ReducerDispatch) => {
	setInterval(() => {
		dispatch({ type: commonLanguage.commands.RefreshAccountState });
	}, localConfig.blockUpdatesIntervalMs);
};
