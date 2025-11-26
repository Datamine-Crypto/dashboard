import { createPublicClient, createWalletClient, custom, getContract, PublicClient, WalletClient, Address } from 'viem';
import damTokenAbi from '@/web3/abis/dam.json';
import fluxTokenAbi from '@/web3/abis/flux.json';
import batchMinterAbi from '@/web3/abis/batchMinter.json';
import marketAbi from '@/web3/abis/market.json';
import gameHodlClickerAbi from '@/web3/abis/games/gameHodlClicker.json';
import multicallAbi from '@/web3/abis/multicall.json';
import uniswapPairV3Abi from '@/web3/abis/uniswapPairV3.json';

import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import { arbitrum } from 'viem/chains';
import { devLog } from '@/utils/devLog';
import { ReducerDispatch } from '@/app/interfaces';
import { commonLanguage } from '@/app/state/commonLanguage';

/**
 * @var walletClient - Holds the current Viem Wallet Client instance.
 */
let walletClient: WalletClient | null = null;

/**
 * @var publicClient - Holds the current Viem Public Client instance.
 */
let publicClient: PublicClient | null = null;

/**
 * @var preselectedAddress - Stores the user's address before full initialization, useful for early UI updates.
 */
let preselectedAddress: Address | null = null;

export const setWeb3Provider = (provider: any) => {
	if (provider) {
		walletClient = createWalletClient({
			chain: arbitrum, // Default to arbitrum
			transport: custom(provider),
		});
		publicClient = createPublicClient({
			chain: arbitrum,
			transport: custom(provider),
		});
	} else {
		walletClient = null;
		publicClient = null;
	}
};

export const getWalletClient = () => {
	return walletClient;
};

export const getPublicClient = () => {
	return publicClient;
};

export const setPreselectedAddress = (address: string | null) => {
	preselectedAddress = address as Address;
};

export const getPreselectedAddress = () => {
	return preselectedAddress;
};

/**
 * Retrieves the currently selected Ethereum address from the wallet client.
 * @returns The selected Ethereum address or null if not available.
 */
export const getSelectedAddress = async () => {
	if (!walletClient) {
		return null;
	}

	try {
		const addresses = await walletClient.getAddresses();
		if (addresses.length > 0) {
			return addresses[0];
		}
	} catch (err) {
		// Silently fail
	}

	if (preselectedAddress) {
		return preselectedAddress;
	}

	return null;
};

/**
 * Prompts the user to connect their wallet and pre-selects the first available address.
 * @returns An array of available addresses.
 */
export const preselectAddress = async () => {
	if (!walletClient) {
		return [];
	}

	try {
		const addresses = await walletClient.requestAddresses();

		devLog('enable:', addresses);
		if (addresses && addresses.length > 0) {
			preselectedAddress = addresses[0];
			return addresses;
		}
	} catch (err) {
		// Silently fail if can't find any addresses or enable() fails
	}

	const selectedAddress = await getSelectedAddress();
	if (selectedAddress) {
		return [selectedAddress];
	}

	return [];
};

/**
 * Initializes and returns contract instances based on the selected ecosystem.
 * @param publicClient - The Viem Public Client instance.
 * @param ecosystem - The currently selected ecosystem (e.g., DAM->FLUX L1).
 * @returns An object containing all necessary contract instances.
 */
export const getContracts = (publicClient: PublicClient, ecosystem: Ecosystem) => {
	const config = getEcosystemConfig(ecosystem) as any;

	// Helper to create contract
	const createContract = (address: string, abi: any) => {
		if (!address || address === '0x0') return null;
		return getContract({
			address: address as Address,
			abi,
			client: publicClient,
		});
	};

	return {
		damToken: createContract(config.lockableTokenContractAddress, damTokenAbi),
		fluxToken: createContract(config.mintableTokenContractAddress, fluxTokenAbi),
		batchMinter: createContract(config.batchMinterAddress, batchMinterAbi),

		// Datamine Gems
		market: createContract(config.marketAddress, marketAbi),

		// HODL Clicker
		gameHodlClicker: createContract(config.gameHodlClickerAddress, gameHodlClickerAbi),

		uniswapV3DamToken: createContract(config.lockableUniswapV3L1EthTokenContractAddress, uniswapPairV3Abi),
		uniswapV3FluxToken: createContract(config.mintableUniswapV3L1EthTokenContractAddress, uniswapPairV3Abi),
		uniswapV3UsdcEthToken: createContract(config.uniswapV3UsdcEthTokenContractAddress, uniswapPairV3Abi),

		multicall: createContract(config.uniswapMulticallAdress, multicallAbi),
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
 * @param publicClient - The Viem Public Client instance.
 * @param dispatch - The reducer's dispatch function.
 */
export const subscribeToBlockUpdates = (publicClient: PublicClient, dispatch: ReducerDispatch) => {
	// Viem's watchBlocks could be used, but for now we'll keep the interval approach to match existing behavior
	// or we can switch to watchBlocks if preferred.
	// publicClient.watchBlocks({ onBlock: () => dispatch({ type: commonLanguage.commands.RefreshAccountState }) });

	setInterval(() => {
		dispatch({ type: commonLanguage.commands.RefreshAccountState });
	}, localConfig.blockUpdatesIntervalMs);
};
