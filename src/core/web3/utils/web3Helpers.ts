import Web3 from 'web3';
import BN from 'bn.js';
import { getEcosystemConfig as getConfig, getEcosystemConfig } from '@/core/app/configs/config';
import { Ecosystem } from '@/core/app/configs/config.common';
import { devLog } from '@/core/utils/devLog';
import { ConnectionMethod } from '@/core/app/state/stateInterfaces';

/**
 * @interface AuthorizeOperatorParams
 * @description Parameters for authorizing an operator to spend tokens on behalf of an address.
 */
export interface AuthorizeOperatorParams {
	/**
	 * @property {string} operator
	 * @description The address of the operator to be authorized.
	 */
	operator: string;
	/**
	 * @property {string} from
	 * @description The address initiating the authorization.
	 */
	from: string;
}

/**
 * @interface LockParams
 * @description Parameters for locking tokens (e.g., DAM) to start a validator.
 */
export interface LockParams {
	/**
	 * @property {string} minterAddress
	 * @description The address designated to mint FLUX on behalf of the validator.
	 */
	minterAddress: string;
	/**
	 * @property {string} from
	 * @description The address initiating the lock transaction.
	 */
	from: string;
	/**
	 * @property {BN} amount
	 * @description The amount of tokens to lock.
	 */
	amount: BN;
}

/**
 * @interface MintToAddressParams
 * @description Parameters for minting (claiming) tokens to a specified address.
 */
export interface MintToAddressParams {
	/**
	 * @property {string} sourceAddress
	 * @description The address from which tokens are being minted (the validator address).
	 */
	sourceAddress: string;
	/**
	 * @property {string} targetAddress
	 * @description The address to which the minted tokens will be sent.
	 */
	targetAddress: string;
	/**
	 * @property {string} blockNumber
	 * @description The target block number up to which tokens should be minted.
	 */
	blockNumber: string;
	/**
	 * @property {string} from
	 * @description The address initiating the mint transaction.
	 */
	from: string;
}

/**
 * @interface BurnToAddressParams
 * @description Parameters for burning tokens to a specified address.
 */
export interface BurnToAddressParams {
	/**
	 * @property {string} targetAddress
	 * @description The address to which the tokens are being burned (for burn multiplier).
	 */
	targetAddress: string;
	/**
	 * @property {BN} amount
	 * @description The amount of tokens to burn.
	 */
	amount: BN;
	/**
	 * @property {string} from
	 * @description The address initiating the burn transaction.
	 */
	from: string;
}

export interface SetDelegatedMinterParams {
	delegatedMinterAddress: string;
	/**
	 * @property {string} from
	 * @description The address initiating the unlock transaction.
	 */
	from: string;
}

/**
 * @interface UnlockParams
 * @description Parameters for unlocking previously locked tokens.
 */
export interface UnlockParams {
	/**
	 * @property {string} from
	 * @description The address initiating the unlock transaction.
	 */
	from: string;
}

/**
 * @interface MarketBurnTokensParams
 * @description Parameters for burning tokens within the Datamine Market contract.
 */
export interface MarketBurnTokensParams {
	/**
	 * @property {BN} amountToBurn
	 * @description The amount of tokens to burn.
	 */
	amountToBurn: BN;
	/**
	 * @property {string} burnToAddress
	 * @description The address to which the tokens are being burned (validator's address).
	 */
	burnToAddress: string;
	/**
	 * @property {string} from
	 * @description The address initiating the market burn transaction.
	 */
	from: string;
}

/**
 * @interface MarketBatchBurnTokensParams
 * @description Parameters for burning tokens from multiple addresses in a batch operation
 * within the Datamine Market contract.
 */
export interface MarketBatchBurnTokensParams {
	/**
	 * @property {BN} amountToBurn
	 * @description The amount of tokens to burn for each address in the batch.
	 */
	amountToBurn: BN;
	/**
	 * @property {string[]} addresses
	 * @description An array of validator addresses to which tokens will be burned.
	 */
	addresses: string[];
	/**
	 * @property {string} from
	 * @description The address initiating the batch burn transaction.
	 */
	from: string;
}

/**
 * @interface MarketDepositParams
 * @description Parameters for depositing tokens into the Datamine Market contract.
 */
export interface MarketDepositParams {
	/**
	 * @property {BN} amountToDeposit
	 * @description The amount of tokens to deposit into the market.
	 */
	amountToDeposit: BN;
	/**
	 * @property {number} rewardsPercent
	 * @description The percentage of rewards offered by the depositor to burners.
	 */
	rewardsPercent: number;
	/**
	 * @property {string} from
	 * @description The address initiating the deposit transaction.
	 */
	from: string;
	/**
	 * @property {BN} minBlockNumber
	 * @description The minimum block number for the market entry.
	 */
	minBlockNumber: BN;
	/**
	 * @property {BN} minBurnAmount
	 * @description The minimum amount of tokens that can be burned to this market entry.
	 */
	minBurnAmount: BN;
}

/**
 * @interface MarketWithdrawAllParams
 * @description Parameters for withdrawing all tokens from the Datamine Market contract.
 */
export interface MarketWithdrawAllParams {
	/**
	 * @property {string} from
	 * @description The address initiating the withdrawal transaction.
	 */
	from: string;
}

/**
 * @function getWeb3Provider
 * @description Retrieves a Web3 provider instance, prioritizing WalletConnect if specified.
 * It attempts to detect common providers like MetaMask, Trust Wallet, or a generic Web3 provider.
 * @param {object} params - Object containing `useWalletConnect` flag and `ecosystem`.
 * @param {boolean} params.useWalletConnect - If true, attempts to use WalletConnect as the provider.
 * @param {Ecosystem} params.ecosystem - The current blockchain ecosystem, used for WalletConnect configuration.
 * @returns {Promise<any>} A Promise that resolves with a Web3 provider instance.
 */
export const getWeb3Provider = async ({
	useWalletConnect,
	ecosystem,
}: {
	useWalletConnect: boolean;
	ecosystem: Ecosystem;
}) => {
	/**
	 * @function removeMetaTags
	 * @description Helper function to remove specific meta tags that might cause issues with WalletConnect
	 * in certain environments (e.g., Coinomi wallet).
	 */
	const removeMetaTags = () => {
		const removeMetaTag = (metaName: string) => {
			const metas = document.getElementsByTagName('meta');

			for (let i = 0; i < metas.length; i++) {
				if (metas[i].getAttribute('property') === metaName || metas[i].getAttribute('name') === metaName) {
					return metas[i].remove();
				}
			}
		};
		removeMetaTag('description');
		removeMetaTag('og:description');
	};

	if (useWalletConnect) {
		removeMetaTags();

		const config = getEcosystemConfig(ecosystem);

		const { EthereumProvider } = await import('@walletconnect/ethereum-provider');

		const walletConnectProvider = await EthereumProvider.init({
			projectId: config.walletConnect.projectId, // REQUIRED your projectId
			optionalChains: config.walletConnect.optionalChains as any, // REQUIRED chain ids
			rpcMap: config.walletConnect.rpcMap, // REQUIRED chain ids
			showQrModal: true,
			metadata: config.walletConnect.metadata,

			qrModalOptions: {
				'--wcm-z-index': '10000', // Position the WalletConnect above the loading dialog
			} as any,

			/*
            qrModalOptions, // OPTIONAL - `undefined` by default
            */
		});

		//  Enable session (triggers QR Code modal)
		await walletConnectProvider.enable();

		return walletConnectProvider;
	}

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
 * @function switchNetwork
 * @description Switches the connected network in the user's Web3 provider (e.g., MetaMask).
 * If the target chain is not already added to the wallet, it attempts to add it first.
 * @param {Ecosystem} ecosystem - The target ecosystem for the network switch.
 * @param {ConnectionMethod} connectionMethod - The current connection method (e.g., MetaMask, WalletConnect).
 * @param {string} chainId - The hexadecimal chain ID of the network to switch to.
 */
export const switchNetwork = async (ecosystem: Ecosystem, connectionMethod: ConnectionMethod, chainId: string) => {
	//const { ethereum } = window as any;
	const ethereum = await getWeb3Provider({
		ecosystem,
		useWalletConnect: connectionMethod === ConnectionMethod.WalletConnect,
	});

	if (!ethereum) {
		alert('Failed switching network, no Web3 provider found');
		return;
	}

	try {
		await ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId }],
		});
	} catch (err) {
		// This error code indicates that the chain has not been added to MetaMask.
		if ((err as any).code === 4902) {
			try {
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
					params: [{ chainId }],
				});
			} catch (addError) {
				// handle "add" error
			}
		}
		// handle other "switch" errors
	}
};

/**
 * @function addToMetamask
 * @description Adds the project's main tokens (DAM and FLUX) to the user's MetaMask wallet.
 * This function dynamically retrieves token details from the ecosystem configuration.
 * @param {Ecosystem} ecosystem - The current ecosystem to determine which token addresses and details to add.
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
		useWalletConnect: false, //@todo
	});
	if (!ethereum) {
		alert('Failed adding to Metamask, no Web3 provider found');
		return;
	}

	// You will notice " (L2)" replacement here to be an empty string. Currently token symbol MUST MATCH CONTRACT token name
	// (L2) was added for extra readability so this is just a workaround

	const addDam = () => {
		const tokenAddress = config.lockableTokenContractAddress;
		const tokenSymbol = lockableTokenShortName.replace(' (L2)', '');
		const tokenDecimals = 18;
		const tokenImage = `${dashboardAbsoluteUrl}/logos/${lockableTokenLogoFileName}.png`;

		/**
		 * Adds the DAM token to MetaMask.
		 */
		ethereum.sendAsync(
			{
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
				id: Math.round(Math.random() * 100000),
			},
			(err: any, added: any) => {}
		);
	};

	///////////////////////////////////////////////////
	const addFlux = () => {
		const tokenAddress = config.mintableTokenContractAddress;
		const tokenSymbol = `${mintableTokenShortName.replace(' (L2)', '')}`;
		const tokenDecimals = 18;
		const tokenImage = `${dashboardAbsoluteUrl}/logos/${mintableTokenLogoFileName}.png`;

		/**
         * Adds the FLUX token to MetaMask.

         */
		ethereum.sendAsync(
			{
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
				id: Math.round(Math.random() * 100000),
			},
			(err: any, added: any) => {}
		);
	};

	const addTokens = () => {
		addDam();
		addFlux();
	};
	addTokens();
};

/**
 * @function makeBatchRequest
 * @description Creates a batch request for multiple Web3 calls and executes them simultaneously.
 * This is useful for optimizing performance by reducing the number of network requests.
 * @param {Web3} web3 - The Web3 instance.
 * @param {any[]} calls - An array of call objects, each with a `call` method (from `contract.methods.someMethod.call`) and a `callback` function to process the result.
 * @returns {Promise<any[]>} A Promise that resolves with an array of results from the batch calls, in the order they were added.
 */
export const makeBatchRequest = (web3: Web3, calls: any) => {
	const batch = new web3.BatchRequest();

	const promises = calls.map(({ call, callback }: any) => {
		return new Promise((res, rej) => {
			const req = call.request({}, (err: any, data: any) => {
				if (err) rej(err);
				else {
					data = callback(data);
					res(data);
				}
			});

			batch.add(req);
		});
	});
	batch.execute();

	return Promise.all(promises);
};

/**
 * @constant commonLanguage
 * @description Defines common error messages used within the Web3 helper functions.
 */
const commonLanguage = {
	errors: {
		/** Error message for when a contract instance is not provided. */
		UnknownContract: 'Unknown contract.',
		/** Generic unknown error message. */ UnknownError: 'Unknown error.',
	},
};

/**
 * @function rethrowWeb3Error
 * @description Attempts to extract a more human-readable error message from a raw Web3 error object
 * and then rethrows it. This function is crucial for providing user-friendly error feedback.
 * It parses various error formats from MetaMask or other Web3 providers.
 * @param {any} err - The error object caught from a Web3 interaction.
 * @throws {string} A new error with a more descriptive message if one can be extracted, otherwise the original error message.
 */
export const rethrowWeb3Error = (err: any) => {
	devLog(err);
	if (err.message) {
		// This works on mainnet and arbitrum
		const extractedError = err.message.match(/"message":[ ]{0,1}"(.+)"/);
		if (!!extractedError && !!extractedError[1]) {
			throw extractedError[1].replace('execution reverted: ', '');
		}

		// Convert web3 error into human-readable exception (ex: not enough to lock-in)
		/**
		 * @function tryThrowError
		 * @description Attempts to extract a human-readable error reason from a JSON error object.
		 * @param {any} jsonData - The JSON data from the error message.
		 * @throws {string} The extracted error reason or message if found.
		 */
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
				// Silently fail if can't parse the error (sometimes it's not a json)
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
 * @function getGasFees
 * @description Retrieves the estimated gas fees (maxFeePerGas, maxPriorityFeePerGas, or gasPrice) for a transaction.
 * It considers EIP-1559 if enabled in client settings, providing a more accurate gas estimation for modern Ethereum transactions.
 * @param {Web3} web3 - The Web3 instance.
 * @returns {Promise<object>} An object containing gas fee estimates (`maxFeePerGas`, `maxPriorityFeePerGas`, or `gasPrice`).
 */
export const getGasFees = async (web3: Web3) => {
	// Read Eth.send_transaction on https://web3py.readthedocs.io/en/stable/web3.eth.html
	// https://hackmd.io/@q8X_WM2nTfu6nuvAzqXiTQ/1559-wallets
	// Useful to see what number should be: https://www.blocknative.com/gas-estimator

	const latestBlock = await web3.eth.getBlock('latest');

	const { baseFeePerGas } = latestBlock as any;

	const maxPriorityFeePerGas = Math.round(Number(baseFeePerGas) * 0.15);

	const maxFeePerGas = Number(baseFeePerGas) + maxPriorityFeePerGas;

	//maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas

	const useEip1559 =
		!localStorage.getItem('clientSettingsUseEip1559') || localStorage.getItem('clientSettingsUseEip1559') === 'true';
	if (!useEip1559 || !maxFeePerGas) {
		return { gasPrice: maxFeePerGas?.toString() };
	}

	return { maxFeePerGas: maxFeePerGas?.toString(), maxPriorityFeePerGas: maxPriorityFeePerGas?.toString() };
};

/**
 * @function withWeb3
 * @description A higher-order function that wraps a Web3 contract instance with helper functions
 * for common contract interactions. This provides a more convenient and centralized way to call
 * contract methods, handle gas fees, and manage transaction errors.
 * @param {Web3} web3 - The Web3 instance.
 * @param {any} contract - The Web3 contract instance to wrap.
 * @returns {object} An object containing wrapped contract methods, each enhanced with error handling and gas estimation.
 */
export const withWeb3 = (web3: Web3, contract: any) => {
	if (!contract) {
		throw commonLanguage.errors.UnknownContract;
	}

	/*const formatSmallNumber= (number: BN)=>{
        return (number.toNumber()/(10**18)).toFixed(18).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.)?0+$)/,'$1');
    }*/

	/**
	 * Try to parse out the actual exception from MetaMask.
	 *
	 * The error comes in form of "MESSAGE + \n + JSON"
	 */

	/**
	 * @function getBalanceOf
	 * @description Calls the `balanceOf` method on the contract to get the token balance of an address.
	 * @param {string} tokenHolderAddress - The address of the token holder.
	 * @returns {any} The call object for the `balanceOf` method.
	 */
	const getBalanceOf = (tokenHolderAddress: string) => {
		return contract.methods.balanceOf(tokenHolderAddress).call;
	};

	/**
	 * @function authorizeOperator
	 * @description Authorizes an operator to spend tokens on behalf of the caller.
	 * This is typically used for ERC-777 token approvals.
	 * @param {AuthorizeOperatorParams} params - Object containing the operator address and the sender's address.
	 * @returns {Promise<any>} A Promise that resolves with the transaction receipt.
	 */
	const authorizeOperator = async ({ operator, from }: AuthorizeOperatorParams) => {
		const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3);

		return await contract.methods.authorizeOperator(operator).send({
			from,
			maxFeePerGas,
			maxPriorityFeePerGas,
			gasPrice,
		});
	};

	/**
	 * @function getAddressLock
	 * @description Calls the `addressLocks` method on the contract to get the lock details for a specific address.
	 * This provides information about locked DAM, burned FLUX, and minter address.
	 * @param {string} address - The address to query.
	 * @returns {any} The call object for the `addressLocks` method.
	 */
	const getAddressLock = (address: string) => {
		return contract.methods.addressLocks(address).call;
	};

	/**
	 * @function getAddressDetails
	 * @description Calls the `getAddressDetails` method on the contract to get comprehensive details
	 * about an address, including FLUX balance, mintable amount, and multipliers.
	 * @param {string} address - The address to query.
	 * @returns {any} The call object for the `getAddressDetails` method.
	 */
	const getAddressDetails = (address: string) => {
		return contract.methods.getAddressDetails(address).call;
	};

	/**
	 * @function getAddressTokenDetails
	 * @description Calls the `getAddressTokenDetails` method on the contract to get token-specific details
	 * for an address, such as DAM balance and burn ratios.
	 * @param {string} address - The address to query.
	 * @returns {any} The call object for the `getAddressTokenDetails` method.
	 */
	const getAddressTokenDetails = (address: string) => {
		return contract.methods.getAddressTokenDetails(address).call;
	};

	/**
     * @function getMintAmount
     * @description Calls the `getMintAmount` method on the contract to get the calculated mintable amount
     * for a target address up to a specific block number.
     * @param {string} targetAddress - The target address for which to calculate the mintable amount.
     * @param {number} targetBlock - The target block number up to which to calculate the mint.
     * @returns {any} The call object for the `getMintAmount` method.

     */
	const getMintAmount = (targetAddress: string, targetBlock: number) => {
		return contract.methods.getMintAmount(targetAddress, targetBlock).call;
	};

	/**
	 * @function getTotalSupply
	 * @description Calls the `totalSupply` method on the contract to get the total supply of the token.
	 * @returns {any} The call object for the `totalSupply` method.
	 */
	const getTotalSupply = () => {
		return contract.methods.totalSupply().call;
	};

	/**
	 * @function getReserves
	 * @description Calls the `getReserves` method on a Uniswap V2 pair contract to get the reserves of both tokens.
	 * @returns {any} The call object for the `getReserves` method.
	 */
	const getReserves = () => {
		return contract.methods.getReserves().call;
	};

	/**
	 * @function isOperatorFor
	 * @description Calls the `isOperatorFor` method on the contract to check if an address is an operator
	 * for another address (e.g., if the Flux contract is an operator for a user's DAM tokens).
	 * @param {string} operatorAddress - The address of the potential operator.
	 * @param {string} tokenHolderAddress - The address of the token holder.
	 * @returns {any} The call object for the `isOperatorFor` method.
	 */
	const isOperatorFor = (operatorAddress: string, tokenHolderAddress: string) => {
		return contract.methods.isOperatorFor(operatorAddress, tokenHolderAddress).call;
	};

	/**
	 * @function slot0
	 * @description Calls the `slot0` method on a Uniswap V3 pool contract to get the current state of the pool,
	 * including the square root of the price ratio and tick information.
	 * @returns {any} The call object for the `slot0` method.
	 */
	const slot0 = () => {
		return contract.methods.slot0().call;
	};

	/**
	 * @function liquidity
	 * @description Calls the `liquidity` method on a Uniswap V3 pool contract to get the current liquidity.
	 * @returns {any} The call object for the `liquidity` method.
	 */
	const liquidity = () => {
		return contract.methods.liquidity().call;
	};

	/**
	 * @function lock
	 * @description Locks DAM tokens to start a validator and begin minting FLUX.
	 * This function handles the transaction submission and error rethrowing.
	 * @param {LockParams} params - Object containing the minter address, amount to lock, and sender's address.
	 * @returns {Promise<any>} A Promise that resolves with the transaction receipt.
	 */
	const lock = async ({ minterAddress, amount, from }: LockParams) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.lock(minterAddress, amount.toString()).call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3);

			const lockTx = await contract.methods.lock(minterAddress, amount.toString()).send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice,
			});

			return lockTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	/**
	 * @function unlockDamTokens
	 * @description Unlocks previously locked DAM tokens, returning them to the sender's wallet.
	 * This function handles the transaction submission and error rethrowing.
	 * @param {UnlockParams} params - Object containing the sender's address.
	 * @returns {Promise<any>} A Promise that resolves with the transaction receipt.
	 */
	const unlockDamTokens = async ({ from }: UnlockParams) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.unlock().call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3);

			const unlockTx = await contract.methods.unlock().send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice,
			});

			return unlockTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	/**
	 * @function mintToAddress
	 * @description Mints (claims) generated FLUX tokens to a specified target address.
	 * This function handles the transaction submission and error rethrowing.
	 * @param {MintToAddressParams} params - Object containing source address, target address, block number, and sender's address.
	 * @returns {Promise<any>} A Promise that resolves with the transaction receipt.
	 */
	const mintToAddress = async ({ sourceAddress, targetAddress, blockNumber, from }: MintToAddressParams) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.mintToAddress(sourceAddress, targetAddress, blockNumber).call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3);

			const mintTx = await contract.methods.mintToAddress(sourceAddress, targetAddress, blockNumber).send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice,
			});

			return mintTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	/**
	 * @function burnToAddress
	 * @description Burns FLUX tokens from a specified address to increase the burn multiplier.
	 * This function handles the transaction submission and error rethrowing.
	 * @param {BurnToAddressParams} params - Object containing target address, amount to burn, and sender's address.
	 * @returns {Promise<any>} A Promise that resolves with the transaction receipt.
	 */
	const burnToAddress = async ({ targetAddress, amount, from }: BurnToAddressParams) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.burnToAddress(targetAddress, amount.toString()).call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3);

			const mintTx = await contract.methods.burnToAddress(targetAddress, amount.toString()).send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice,
			});

			return mintTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	/**
	 * BatchMinter.sol -> setDelegatedMinter
	 * Allows batch minter to specify delegated minter for a specific address
	 */
	const setDelegatedMinter = async ({ delegatedMinterAddress, from }: SetDelegatedMinterParams) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.setDelegatedMinter(delegatedMinterAddress).call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3);

			const transaction = await contract.methods.setDelegatedMinter(delegatedMinterAddress).send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice,
			});

			return transaction;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	/**
	 * @function marketBurnTokens
	 * @description Burns tokens within the Datamine Market contract, typically for GameFi interactions.
	 * This function handles the transaction submission and error rethrowing.
	 * @param {MarketBurnTokensParams} params - Object containing amount to burn, address to burn to, and sender's address.
	 * @returns {Promise<any>} A Promise that resolves with the transaction receipt.
	 */
	const marketBurnTokens = async ({ amountToBurn, burnToAddress, from }: MarketBurnTokensParams) => {
		devLog('burn:', { amountToBurn, burnToAddress, from });
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.burnTokens(amountToBurn.toString(), burnToAddress).call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3);

			const mintTx = await contract.methods.burnTokens(amountToBurn.toString(), burnToAddress).send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice,
			});

			return mintTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	/**
	 * @function marketBatchBurnTokens
	 * @description Burns tokens from multiple addresses in a batch operation within the Datamine Market contract.
	 * This is used for the "Collect all gems" feature in Datamine Gems #GameFi.
	 * @param {MarketBatchBurnTokensParams} params - Object containing amount to burn, an array of addresses, and sender's address.
	 * @returns {Promise<any>} A Promise that resolves with the transaction receipt.
	 */
	const marketBatchBurnTokens = async ({ amountToBurn, addresses, from }: MarketBatchBurnTokensParams) => {
		devLog('batch burn:', { amountToBurn, addresses, from });
		try {
			const burnRequest = addresses.map((address: string) => [amountToBurn.toString(), address]);

			// Attempt to call the method first to check if there are any errors
			await contract.methods.burnTokensFromAddresses(burnRequest).call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3);

			const mintTx = await contract.methods.burnTokensFromAddresses(burnRequest).send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice,
			});

			return mintTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	/**
	 * @function marketDeposit
	 * @description Deposits tokens into the Datamine Market contract, allowing a validator to offer rewards
	 * for others to burn to their account.
	 * This function handles the transaction submission and error rethrowing.
	 * @param {MarketDepositParams} params - Object containing amount to deposit, rewards percentage, minimum block number, minimum burn amount, and sender's address.
	 * @returns {Promise<any>} A Promise that resolves with the transaction receipt.
	 */
	const marketDeposit = async ({
		amountToDeposit,
		rewardsPercent,
		minBlockNumber,
		minBurnAmount,
		from,
	}: MarketDepositParams) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods
				.deposit(amountToDeposit.toString(), rewardsPercent, minBlockNumber.toString(), minBurnAmount.toString())
				.call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3);

			const mintTx = await contract.methods
				.deposit(amountToDeposit.toString(), rewardsPercent, minBlockNumber.toString(), minBurnAmount.toString())
				.send({
					from,
					maxFeePerGas,
					maxPriorityFeePerGas,
					gasPrice,
				});

			return mintTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	/**
	 * @function marketWithdrawAll
	 * @description Withdraws all tokens (deposited and accumulated rewards) from the Datamine Market contract.
	 * This function handles the transaction submission and error rethrowing.
	 * @param {MarketWithdrawAllParams} params - Object containing the sender's address.
	 * @returns {Promise<any>} A Promise that resolves with the transaction receipt.
	 */
	const marketWithdrawAll = async ({ from }: MarketWithdrawAllParams) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.withdrawAll().call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3);

			const mintTx = await contract.methods.withdrawAll().send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice,
			});

			return mintTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};

	const batchNormalMintTo = async ({ sourceAddress, targetAddress, blockNumber, from }: any) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.normalMintTo(sourceAddress, blockNumber, targetAddress).call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3);

			const mintTx = await contract.methods.normalMintTo(sourceAddress, blockNumber, targetAddress).send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice,
			});

			return mintTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	};
	return {
		getTotalSupply,
		getBalanceOf,
		//isOperatorFor,
		authorizeOperator,

		// Flux-sepecific
		lock,
		getAddressLock,
		getMintAmount,
		getReserves,
		getAddressDetails,
		mintToAddress,
		burnToAddress,
		setDelegatedMinter,
		unlockDamTokens,
		getAddressTokenDetails,
		slot0,
		liquidity,
		isOperatorFor,

		// Time-in-market
		marketBurnTokens,
		marketDeposit,
		marketWithdrawAll,
		marketBatchBurnTokens,

		// Batch minter
		batchNormalMintTo,
	};
};
