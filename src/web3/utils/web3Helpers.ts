import { getEcosystemConfig as getConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import { devLog } from '@/utils/devLog';
import { ConnectionMethod } from '@/app/interfaces';
import { getPublicClient, getWalletClient } from '@/web3/utils/web3ProviderUtils';
import { Address, PublicClient } from 'viem';
import { arbitrum } from 'viem/chains';

/**
 * Parameters for authorizing an operator to spend tokens on behalf of an address.
 */
export interface AuthorizeOperatorParams {
	operator: string;
	from: string;
}

/**
 * Parameters for locking tokens (e.g., DAM) to start a validator.
 */
export interface LockParams {
	minterAddress: string;
	from: string;
	amount: bigint;
}

/**
 * Parameters for minting (claiming) tokens to a specified address.
 */
export interface MintToAddressParams {
	sourceAddress: string;
	targetAddress: string;
	blockNumber: string;
	from: string;
}

/**
 * Parameters for burning tokens to a specified address.
 */
export interface BurnToAddressParams {
	targetAddress: string;
	amount: bigint;
	from: string;
}

export interface SetDelegatedMinterParams {
	delegatedMinterAddress: string;
	from: string;
}

/**
 * Parameters for unlocking previously locked tokens.
 */
export interface UnlockParams {
	from: string;
}

/**
 * Parameters for burning tokens within the Datamine Market contract.
 */
export interface MarketBurnTokensParams {
	amountToBurn: bigint;
	burnToAddress: string;
	from: string;
}

/**
 * Parameters for burning tokens from multiple addresses in a batch operation
 * within the Datamine Market contract.
 */
export interface MarketBatchBurnTokensParams {
	amountToBurn: bigint;
	addresses: string[];
	from: string;
}

/**
 * Parameters for depositing tokens into the Datamine Market contract.
 */
export interface MarketDepositParams {
	amountToDeposit: bigint;
	rewardsPercent: number;
	from: string;
	minBlockNumber: bigint;
	minBurnAmount: bigint;
}

/**
 * Parameters for withdrawing all tokens from the Datamine Market contract.
 */
export interface MarketWithdrawAllParams {
	from: string;
}

/**
 * Retrieves a Web3 provider instance.
 * It attempts to detect common providers like MetaMask, Trust Wallet, or a generic Web3 provider.
 */
export const getWeb3Provider = async ({ ecosystem }: { ecosystem: Ecosystem }) => {
	const { ethereum } = window as any;
	if (ethereum) {
		devLog('found window.ethereum provider:');
		return ethereum;
	}

	try {
		// Dynamically import detectEthereumProvider
		const detectEthereumProvider = (await import('@metamask/detect-provider')).default;
		const provider = await detectEthereumProvider();
		return provider;
	} catch (err) {
		// Silently fail if can't detect provider
	}

	// Trustwallet provider
	{
		const { trustwallet } = window as any;
		if (trustwallet && trustwallet.Provider) {
			return trustwallet.Provider;
		}
	}

	// For generic web3
	{
		const web3 = (window as any).web3;
		if (web3 && web3.currentProvider) {
			return web3.currentProvider;
		}
	}

	return ethereum as any;
};

/**
 * Switches the connected network in the user's Web3 provider (e.g., MetaMask).
 */
export const switchNetwork = async (ecosystem: Ecosystem, connectionMethod: ConnectionMethod, chainId: string) => {
	const walletClient = getWalletClient();
	const ethereum = await getWeb3Provider({ ecosystem });

	if (!ethereum && !walletClient) {
		alert('Failed switching network, no Web3 provider found');
		return;
	}

	const chainIdHex = chainId.startsWith('0x') ? chainId : `0x${Number(chainId).toString(16)}`;
	const chainIdNum = Number(chainId);

	try {
		if (walletClient) {
			await walletClient.switchChain({ id: chainIdNum });
		} else {
			await ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: chainIdHex }],
			});
		}
	} catch (err) {
		// This error code indicates that the chain has not been added to MetaMask.
		if ((err as any).code === 4902) {
			try {
				if (walletClient) {
					await walletClient.addChain({ chain: arbitrum }); // Assuming Arbitrum for now as per original code
					await walletClient.switchChain({ id: chainIdNum });
				} else {
					await ethereum.request({
						method: 'wallet_addEthereumChain',
						params: [
							{
								chainId: '0xa4b1', // Arbitrum
								chainName: 'Arbitrum',
								rpcUrls: ['https://arb1.arbitrum.io/rpc'],
								nativeCurrency: { decimals: 18, name: 'ETH', symbol: 'ETH' },
								blockExplorerUrls: ['https://arbiscan.io/'],
							},
						],
					});
					await ethereum.request({
						method: 'wallet_switchEthereumChain',
						params: [{ chainId: chainIdHex }],
					});
				}
			} catch (addError) {
				// handle "add" error
			}
		}
		// handle other "switch" errors
	}
};

/**
 * Adds the project's main tokens (DAM and FLUX) to the user's MetaMask wallet.
 */
export const addToMetamask = async (ecosystem: Ecosystem) => {
	const config = getConfig(ecosystem);
	const {
		mintableTokenShortName,
		lockableTokenShortName,
		dashboardAbsoluteUrl,
		lockableTokenLogoFileName,
		mintableTokenLogoFileName,
	} = config;

	const ethereum = await getWeb3Provider({
		ecosystem,
	});
	if (!ethereum) {
		alert('Failed adding to Metamask, no Web3 provider found');
		return;
	}

	const addDam = () => {
		const tokenAddress = config.lockableTokenContractAddress;
		const tokenSymbol = lockableTokenShortName.replace(' (L2)', '');
		const tokenDecimals = 18;
		const tokenImage = `${dashboardAbsoluteUrl}/logos/${lockableTokenLogoFileName}.png`;

		ethereum
			.request({
				method: 'wallet_watchAsset',
				params: {
					type: 'ERC20',
					options: {
						address: tokenAddress,
						symbol: tokenSymbol,
						decimals: tokenDecimals,
						image: tokenImage,
					},
				},
			})
			.catch(console.error);
	};

	const addFlux = () => {
		const tokenAddress = config.mintableTokenContractAddress;
		const tokenSymbol = `${mintableTokenShortName.replace(' (L2)', '')}`;
		const tokenDecimals = 18;
		const tokenImage = `${dashboardAbsoluteUrl}/logos/${mintableTokenLogoFileName}.png`;

		ethereum
			.request({
				method: 'wallet_watchAsset',
				params: {
					type: 'ERC20',
					options: {
						address: tokenAddress,
						symbol: tokenSymbol,
						decimals: tokenDecimals,
						image: tokenImage,
					},
				},
			})
			.catch(console.error);
	};

	const addTokens = () => {
		addDam();
		addFlux();
	};
	addTokens();
};

/**
 * Defines common error messages used within the Web3 helper functions.
 */
const commonLanguage = {
	errors: {
		UnknownContract: 'Unknown contract.',
		UnknownError: 'Unknown error.',
	},
};

/**
 * Attempts to extract a more human-readable error message from a raw Web3 error object
 */
export const rethrowWeb3Error = (err: any) => {
	devLog(err);
	if (err.message) {
		const extractedError = err.message.match(/"message":[ ]{0,1}"(.+)"/);
		if (!!extractedError && !!extractedError[1]) {
			throw extractedError[1].replace('execution reverted: ', '');
		}

		const tryThrowError = (jsonData: any) => {
			if (jsonData && jsonData.data) {
				for (const [, errorDetails] of Object.entries(jsonData.data) as any) {
					if (errorDetails?.reason) {
						throw errorDetails.reason;
					}
				}
				if (jsonData.data.message) {
					throw jsonData.data.message;
				}
			}
		};

		const splitError = err.message.split(/\n(.+)/);

		if (splitError.length === 3) {
			let jsonData = null;
			try {
				jsonData = JSON.parse(splitError[1]);
			} catch (err) {
				// Silently fail
			}
			tryThrowError(jsonData);
		}

		if (err && err.data) {
			tryThrowError(err);
		}

		console.log('Unhandled exception:', err);
		throw err.message;
	}

	console.log('Unhandled exception:', err);
	throw commonLanguage.errors.UnknownError;
};

/**
 * Retrieves the estimated gas fees.
 */
export const getGasFees = async (publicClient: PublicClient) => {
	if (!publicClient) return {};

	const block = await publicClient.getBlock();
	const baseFeePerGas = block.baseFeePerGas;

	if (!baseFeePerGas) {
		const gasPrice = await publicClient.getGasPrice();
		return { gasPrice };
	}

	const maxPriorityFeePerGas = (baseFeePerGas * 15n) / 100n; // 15%
	const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas;

	const useEip1559 =
		!localStorage.getItem('clientSettingsUseEip1559') || localStorage.getItem('clientSettingsUseEip1559') === 'true';

	if (!useEip1559) {
		// Fallback to gasPrice if EIP-1559 is disabled by user setting
		// But Viem defaults to EIP-1559 if chain supports it.
		// If user explicitly wants legacy, we might need to use gasPrice.
		// For now, let's return maxFeePerGas as gasPrice if needed, or just return EIP-1559 params.
		// Actually, if useEip1559 is false, we should return gasPrice.
		const gasPrice = await publicClient.getGasPrice();
		return { gasPrice };
	}

	return { maxFeePerGas, maxPriorityFeePerGas };
};

/**
 * A higher-order function that wraps a Viem contract instance with helper functions.
 */
export const withWeb3 = (contract: any) => {
	if (!contract) {
		throw commonLanguage.errors.UnknownContract;
	}

	const publicClient = getPublicClient();
	const walletClient = getWalletClient();

	const waitForReceipt = async (hash: `0x${string}`) => {
		if (!publicClient) throw new Error('No public client');
		return await publicClient.waitForTransactionReceipt({ hash });
	};

	const getBalanceOf = (tokenHolderAddress: string) => {
		return contract.read.balanceOf([tokenHolderAddress]);
	};

	const authorizeOperator = async ({ operator, from }: AuthorizeOperatorParams) => {
		if (!publicClient || !walletClient) throw new Error('No client');
		const fees = await getGasFees(publicClient);
		const hash = await contract.write.authorizeOperator([operator], {
			account: from as Address,
			...fees,
		});
		return await waitForReceipt(hash);
	};

	const getAddressLock = (address: string) => {
		return contract.read.addressLocks([address]);
	};

	const getAddressDetails = (address: string) => {
		return contract.read.getAddressDetails([address]);
	};

	const getAddressTokenDetails = (address: string) => {
		return contract.read.getAddressTokenDetails([address]);
	};

	const getMintAmount = (targetAddress: string, targetBlock: number) => {
		return contract.read.getMintAmount([targetAddress, targetBlock]);
	};

	const getTotalSupply = () => {
		return contract.read.totalSupply();
	};

	const getReserves = () => {
		return contract.read.getReserves();
	};

	const isOperatorFor = (operatorAddress: string, tokenHolderAddress: string) => {
		return contract.read.isOperatorFor([operatorAddress, tokenHolderAddress]);
	};

	const slot0 = () => {
		return contract.read.slot0();
	};

	const liquidity = () => {
		return contract.read.liquidity();
	};

	const lock = async ({ minterAddress, amount, from }: LockParams) => {
		try {
			if (!publicClient || !walletClient) throw new Error('No client');
			// Simulate first
			await contract.simulate.lock([minterAddress, amount.toString()], { account: from as Address });

			const fees = await getGasFees(publicClient);
			const hash = await contract.write.lock([minterAddress, amount.toString()], {
				account: from as Address,
				...fees,
			});

			return await waitForReceipt(hash);
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	const unlockDamTokens = async ({ from }: UnlockParams) => {
		try {
			if (!publicClient || !walletClient) throw new Error('No client');
			await contract.simulate.unlock([], { account: from as Address });

			const fees = await getGasFees(publicClient);
			const hash = await contract.write.unlock([], {
				account: from as Address,
				...fees,
			});

			return await waitForReceipt(hash);
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	const mintToAddress = async ({ sourceAddress, targetAddress, blockNumber, from }: MintToAddressParams) => {
		try {
			if (!publicClient || !walletClient) throw new Error('No client');
			await contract.simulate.mintToAddress([sourceAddress, targetAddress, blockNumber], { account: from as Address });

			const fees = await getGasFees(publicClient);
			const hash = await contract.write.mintToAddress([sourceAddress, targetAddress, blockNumber], {
				account: from as Address,
				...fees,
			});

			return await waitForReceipt(hash);
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	const burnToAddress = async ({ targetAddress, amount, from }: BurnToAddressParams) => {
		try {
			if (!publicClient || !walletClient) throw new Error('No client');
			await contract.simulate.burnToAddress([targetAddress, amount.toString()], { account: from as Address });

			const fees = await getGasFees(publicClient);
			const hash = await contract.write.burnToAddress([targetAddress, amount.toString()], {
				account: from as Address,
				...fees,
			});

			return await waitForReceipt(hash);
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	const setDelegatedMinter = async ({ delegatedMinterAddress, from }: SetDelegatedMinterParams) => {
		try {
			if (!publicClient || !walletClient) throw new Error('No client');
			await contract.simulate.setDelegatedMinter([delegatedMinterAddress], { account: from as Address });

			const fees = await getGasFees(publicClient);
			const hash = await contract.write.setDelegatedMinter([delegatedMinterAddress], {
				account: from as Address,
				...fees,
			});

			return await waitForReceipt(hash);
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	const marketBurnTokens = async ({ amountToBurn, burnToAddress, from }: MarketBurnTokensParams) => {
		devLog('burn:', { amountToBurn, burnToAddress, from });
		try {
			if (!publicClient || !walletClient) throw new Error('No client');
			await contract.simulate.burnTokens([amountToBurn.toString(), burnToAddress], { account: from as Address });

			const fees = await getGasFees(publicClient);
			const hash = await contract.write.burnTokens([amountToBurn.toString(), burnToAddress], {
				account: from as Address,
				...fees,
			});

			return await waitForReceipt(hash);
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	const marketBatchBurnTokens = async ({ amountToBurn, addresses, from }: MarketBatchBurnTokensParams) => {
		devLog('batch burn:', { amountToBurn, addresses, from });
		try {
			const burnRequest = addresses.map((address: string) => [amountToBurn.toString(), address]);

			if (!publicClient || !walletClient) throw new Error('No client');
			await contract.simulate.burnTokensFromAddresses([burnRequest], { account: from as Address });

			const fees = await getGasFees(publicClient);
			const hash = await contract.write.burnTokensFromAddresses([burnRequest], {
				account: from as Address,
				...fees,
			});

			return await waitForReceipt(hash);
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	const marketDeposit = async ({
		amountToDeposit,
		rewardsPercent,
		from,
		minBlockNumber,
		minBurnAmount,
	}: MarketDepositParams) => {
		try {
			if (!publicClient || !walletClient) throw new Error('No client');
			await contract.simulate.deposit(
				[amountToDeposit.toString(), rewardsPercent, minBlockNumber.toString(), minBurnAmount.toString()],
				{ account: from as Address }
			);

			const fees = await getGasFees(publicClient);
			const hash = await contract.write.deposit(
				[amountToDeposit.toString(), rewardsPercent, minBlockNumber.toString(), minBurnAmount.toString()],
				{
					account: from as Address,
					...fees,
				}
			);

			return await waitForReceipt(hash);
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	const marketWithdrawAll = async ({ from }: MarketWithdrawAllParams) => {
		try {
			if (!publicClient || !walletClient) throw new Error('No client');
			await contract.simulate.withdrawAll([], { account: from as Address });

			const fees = await getGasFees(publicClient);
			const hash = await contract.write.withdrawAll([], {
				account: from as Address,
				...fees,
			});

			return await waitForReceipt(hash);
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	return {
		getBalanceOf,
		authorizeOperator,
		getAddressLock,
		getAddressDetails,
		getAddressTokenDetails,
		getMintAmount,
		getTotalSupply,
		getReserves,
		isOperatorFor,
		slot0,
		liquidity,
		lock,
		unlockDamTokens,
		mintToAddress,
		burnToAddress,
		setDelegatedMinter,
		marketBurnTokens,
		marketBatchBurnTokens,
		marketDeposit,
		marketWithdrawAll,
		batchNormalMintTo: async ({ sourceAddress, targetAddress, blockNumber, from }: MintToAddressParams) => {
			try {
				if (!publicClient || !walletClient) throw new Error('No client');
				await contract.simulate.normalMintTo([sourceAddress, blockNumber, targetAddress], {
					account: from as Address,
				});

				const fees = await getGasFees(publicClient);
				const hash = await contract.write.normalMintTo([sourceAddress, blockNumber, targetAddress], {
					account: from as Address,
					...fees,
				});

				return await waitForReceipt(hash);
			} catch (err) {
				rethrowWeb3Error(err);
			}
		},
	};
};

export const makeBatchRequest = (web3: any, calls: any) => {
	// This function was used for batching calls.
	// Viem supports multicall natively or we can use Promise.all for parallel calls.
	// Given the usage, we might not need this anymore if we use multicall contract.
	// But if it's used elsewhere, we should adapt it.
	// For now, let's just return Promise.all
	const promises = calls.map(({ call, callback }: any) => {
		return call().then(callback);
	});
	return Promise.all(promises);
};
