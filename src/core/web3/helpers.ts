import BN from 'bn.js';
import Web3 from "web3";
import { Token } from "../interfaces";

import detectEthereumProvider from '@metamask/detect-provider';
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import Big from 'big.js';
import moment from 'moment';
import { getEcosystemConfig as getConfig, getEcosystemConfig } from '../../configs/config';
import { Ecosystem } from "../../configs/config.common";
import { devLog } from '../utils/devLog';
import { Balances, ConnectionMethod } from "./web3Reducer";

interface PriceToggle {
	value: BN;
	inputToken: Token;
	outputToken: Token;
	balances: Balances;
	round?: number;
	removeCommas?: boolean;
}

export const getPriceToggle = ({ value, inputToken, outputToken, balances, round, removeCommas }: PriceToggle) => {
	const commaRegex = /(\d)(?=(\d{3})+(?!\d))/g;

	const valueBig = new Big(value.toString(10));

	const div18 = new Big(10).pow(18);
	const div6 = new Big(10).pow(6);

	const usdcReserve = new Big(balances.uniswapUsdcEthTokenReserves.usdc.toString(10)).div(div6);
	const ethReserve = new Big(balances.uniswapUsdcEthTokenReserves.eth.toString(10)).div(div18);
	const ethPrice = usdcReserve.div(ethReserve);

	const damReserve = new Big(balances.uniswapDamTokenReserves.dam.toString(10)).div(div18);
	const damEthReserve = new Big(balances.uniswapDamTokenReserves.eth.toString(10)).div(div18);

	const fluxReserve = new Big(balances.uniswapFluxTokenReserves.flux.toString(10)).div(div18);
	const fluxEthReserve = new Big(balances.uniswapFluxTokenReserves.eth.toString(10)).div(div18);

	const getResult = () => {
		if (inputToken === Token.ETH && outputToken === Token.USDC) {
			const price = ethPrice.mul(valueBig.div(div18)).toFixed(!!round || round === 0 ? round : 2)
			if (removeCommas) {
				return price;
			}
			return price.replace(commaRegex, '$1,');
		}
		if ((inputToken === Token.Lockable || inputToken === Token.Mintable) && outputToken === Token.USDC) {
			const getEthAmount = () => {
				switch (inputToken) {
					case Token.Mintable:
						if (balances.forecastFluxPrice) {
							const price = parseFloat(balances.forecastFluxPrice);
							const newEthCost = new Big(price).div(ethPrice)

							return newEthCost;
						}

						return balances.uniswapFluxTokenReserves.ethPrice
					case Token.Lockable:
						return balances.uniswapDamTokenReserves.ethPrice
				}
			}

			const ethAmount = getEthAmount()

			const price = ethAmount.mul(ethPrice).mul(valueBig.div(div18)).toFixed(!!round || round === 0 ? round : 4);


			if (removeCommas) {
				return price
			}

			const priceLeft = price.split('.')[0];
			const priceRight = price.split('.')[1];

			return `${priceLeft.replace(commaRegex, '$1,')}.${priceRight}`
		}
		throw `Invalid price pair: ${inputToken} / ${outputToken}`;
	}

	const result = getResult();
	return result;
}

const bigDecimalDividor = new Big(10).pow(18);

interface AuthorizeOperatorParams {
	operator: string;
	from: string;
}

interface LockParams {
	minterAddress: string;
	from: string;
	amount: BN;
}

interface MintToAddressParams {
	sourceAddress: string;
	targetAddress: string;
	blockNumber: string;
	from: string;
}

interface BurnToAddressParams {
	targetAddress: string;
	amount: BN;
	from: string;
}

interface UnlockParams {
	from: string;
}



export const getWeb3Provider = async ({ useWalletConnect, ecosystem }: { useWalletConnect: boolean, ecosystem: Ecosystem }) => {

	/**
	 * Remove meta tags that cause WalletConnect issues for coinomi  
	 */
	const removeMetaTags = () => {
		const removeMetaTag = (metaName: string) => {
			const metas = document.getElementsByTagName('meta');

			for (let i = 0; i < metas.length; i++) {
				if (metas[i].getAttribute('property') === metaName || metas[i].getAttribute('name') === metaName) {
					return metas[i].remove();
				}
			}
		}
		removeMetaTag('description');
		removeMetaTag('og:description');
	}

	if (!!useWalletConnect) {
		removeMetaTags();

		const config = getEcosystemConfig(ecosystem);

		const walletConnectProvider = await EthereumProvider.init({
			projectId: config.walletConnect.projectId, // REQUIRED your projectId
			optionalChains: config.walletConnect.optionalChains as any, // REQUIRED chain ids
			rpcMap: config.walletConnect.rpcMap, // REQUIRED chain ids
			showQrModal: true,
			metadata: config.walletConnect.metadata,

			qrModalOptions: {
				themeVariables: {
					"--wcm-z-index": "10000" // Position the WalletConnect above the loading dialog
				}
			}

			/*
			qrModalOptions, // OPTIONAL - `undefined` by default
			*/
		});

		//  Enable session (triggers QR Code modal)
		await walletConnectProvider.enable();

		return walletConnectProvider;
	}

	const { ethereum } = (window as any)
	if (ethereum) {
		devLog('found window.ethereum provider:')
		return ethereum
	}

	try {
		const provider = await detectEthereumProvider();
		return provider;
	} catch (err) {

	}

	// Trustwallet provider
	{
		const { trustwallet } = window as any
		if (trustwallet && trustwallet.Provider) {
			return trustwallet.Provider
		}
	}

	// For generic web3 
	{
		const web3 = (window as any).web3
		if (web3 && web3.currentProvider) {
			return web3.currentProvider
		}
	}

	return ethereum as any;
}


export const switchNetwork = async (ecosystem: Ecosystem, connectionMethod: ConnectionMethod, chainId: string) => {

	//const { ethereum } = window as any;
	const ethereum = await getWeb3Provider({
		ecosystem,
		useWalletConnect: connectionMethod === ConnectionMethod.WalletConnect
	})

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
		if ((<any>err).code === 4902) {
			try {
				await ethereum.request({
					method: 'wallet_addEthereumChain',
					params: [{
						chainId: "0xa4b1",  // Arbitrum
						chainName: "Arbitrum",
						rpcUrls: ["https://arb1.arbitrum.io/rpc"],
						nativeCurrency: { decimals: 18, name: 'ETH', symbol: 'ETH' },
						blockExplorerUrls: ["https://arbiscan.io/"]
					}],
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

}

export const addToMetamask = async (ecosystem: Ecosystem) => {
	const config = getConfig(ecosystem);
	const { mintableTokenShortName, lockableTokenShortName, dashboardAbsoluteUrl, lockableTokenLogoFileName, mintableTokenLogoFileName } = config

	const ethereum = await getWeb3Provider({
		ecosystem,
		useWalletConnect: true //@todo
	})
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
			(err: any, added: any) => {
			}
		);
	}

	///////////////////////////////////////////////////
	const addFlux = () => {
		const tokenAddress = config.mintableTokenContractAddress;
		const tokenSymbol = `${mintableTokenShortName.replace(' (L2)', '')}`;
		const tokenDecimals = 18;
		const tokenImage = `${dashboardAbsoluteUrl}/logos/${mintableTokenLogoFileName}.png`;

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
			(err: any, added: any) => {
			}
		);
	}

	const addTokens = () => {
		addDam();
		addFlux();
	}
	addTokens();
}

export const makeBatchRequest = (web3: Web3, calls: any) => {
	let batch = new web3.BatchRequest();

	let promises = calls.map(({ call, callback }: any) => {
		return new Promise((res, rej) => {
			let req = call.request({}, (err: any, data: any) => {
				if (err) rej(err);
				else {
					data = callback(data);
					res(data)

				}
			});

			batch.add(req)
		})
	})
	batch.execute()

	return Promise.all(promises)
}

export const getBNPercent = (bnA: BN, bnB: BN, shouldAdd: boolean = true) => {
	if (bnB.isZero() || bnA.isZero()) {
		return "0.00";
	}
	const big = new Big(bnA.toString(10)).div(new Big(shouldAdd ? bnA.toString(10) : new BN(0).toString(10)).add(bnB.toString(10))).mul(100);

	return big.toFixed(2);
}
/**
 * Converts decimal string to a BN (ex: 1.3 to 1.3^18)
 */
export const parseBN = (unformattedInput: string) => {

	const big = new Big(unformattedInput);

	const parsedNumber = big.mul(bigDecimalDividor).toFixed();
	return new BN(parsedNumber);
}
export const BNToDecimal = (number: BN | null, addCommas: boolean = false, decimals: number = 18, round: number = 0) => {
	if (!number) {
		return null;
	}


	const getFinalAmount = () => {
		const amount = new Big(number.toString(10)).div(new Big(10).pow(decimals))
		if (round > 0) {
			return amount.toFixed(round)
		}
		return amount.toFixed()
	}

	const finalAmount = getFinalAmount();
	if (addCommas) {
		const numberWithCommas = (numberToFormat: string) => {
			var parts = numberToFormat.split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
		}
		return numberWithCommas(finalAmount);
		//return finalAmount.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
	}
	return finalAmount;
}

export const getBurnRatio = (ratio: BN, ecosystem: Ecosystem) => {
	const { mintableTokenShortName, lockableTokenShortName } = getEcosystemConfig(ecosystem)

	return `${BNToDecimal(ratio, true, 10, 5)} ${mintableTokenShortName} / 1 ${lockableTokenShortName}`
}

export const getBlocksRemaining = (startBlockNumber: number, blockDuration: number, currentBlock: number, defaultText: string, showBlocks: boolean = true, showDuration: boolean = true) => {
	if (startBlockNumber === 0) {
		return defaultText
	}
	const blocksDuration = Math.max(0, startBlockNumber + blockDuration - currentBlock); // This number comes from migration (28 days approx)

	const getDuration = () => {
		const hoursDuration = (blocksDuration * 12) / (60 * 60);
		if (hoursDuration <= 24) {
			return {
				value: hoursDuration,
				label: 'hours'
			}
		}
		const daysDuration = hoursDuration / 24;
		if (daysDuration <= 365) {
			return {
				value: daysDuration,
				label: 'days'
			}
		}

		return {
			value: daysDuration / 365,
			label: 'years'
		}
	}


	const details = getDuration();


	const blocksText = showBlocks ? ` (${blocksDuration} block${blocksDuration > 1 ? 's' : ''})` : '';
	const durationText = showDuration ? `~${details?.value.toFixed(2)} ${details.label}` : ''

	return `${durationText}${blocksText}`;
}

export const getBlocksDateFromNow = (blocksDuration: number) => {
	return moment().add(blocksDuration * 12, 'seconds')
}

export const getFormattedMultiplier = (multiplier: number) => {
	return `x ${(multiplier / 10000).toFixed(4)}`
}
export const rethrowWeb3Error = (err: any) => {
	if (err.message) {
		// This works on mainnet and arbitrum
		const extractedError = err.message.match(/"message"\:[ ]{0,1}\"(.+)\"/);
		if (!!extractedError && !!extractedError[1]) {
			throw extractedError[1].replace('execution reverted: ', '')
		}

		// Convert web3 error into human-readable exception (ex: not enough to lock-in)
		const tryThrowError = (jsonData: any) => {
			if (jsonData && jsonData.data) {
				for (const [, errorDetails] of (Object.entries(jsonData.data) as any)) {
					if (errorDetails?.reason) {
						throw errorDetails.reason;
					}
				}
				if (jsonData.data.message) {
					throw jsonData.data.message;
				}
			}
		}

		const splitError = err.message.split(/\n(.+)/);

		if (splitError.length === 3) {
			let jsonData = null;
			try {
				jsonData = JSON.parse(splitError[1])
			} catch (err) {
			}
			tryThrowError(jsonData)
		}

		if (err && err.data) {
			tryThrowError(err)
		}

		console.log('Unhandled exception:', err);
		throw err.message;
	}

	console.log('Unhandled exception:', err);
	throw commonLanguage.errors.UnknownError
}
export const getGasFees = async (web3: Web3) => {

	// Read Eth.send_transaction on https://web3py.readthedocs.io/en/stable/web3.eth.html
	// https://hackmd.io/@q8X_WM2nTfu6nuvAzqXiTQ/1559-wallets
	// Useful to see what number should be: https://www.blocknative.com/gas-estimator

	const latestBlock = await web3.eth.getBlock('latest')

	const { baseFeePerGas } = latestBlock as any


	const maxPriorityFeePerGas = Math.round(Number(baseFeePerGas) * 0.15)

	const maxFeePerGas = Number(baseFeePerGas) + maxPriorityFeePerGas

	//maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas

	const useEip1559 = !localStorage.getItem('clientSettingsUseEip1559') || localStorage.getItem('clientSettingsUseEip1559') === 'true'
	if (!useEip1559 || !maxFeePerGas) {
		return { gasPrice: maxFeePerGas?.toString() }
	}


	return { maxFeePerGas: maxFeePerGas?.toString(), maxPriorityFeePerGas: maxPriorityFeePerGas?.toString() }
}
const withWeb3 = (web3: Web3, contract: any) => {
	if (!contract) {
		throw commonLanguage.errors.UnknownContract;
	}

	/*const formatSmallNumber= (number: BN)=>{
		return (number.toNumber()/(10**18)).toFixed(18).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/,'$1');
	}*/

	/**
	 * Try to parse out the actual exception from MetaMask.
	 * 
	 * The error comes in form of "MESSAGE + \n + JSON"
	 */


	const getBalanceOf = (tokenHolderAddress: string) => {
		return contract.methods.balanceOf(tokenHolderAddress).call;
	}

	const authorizeOperator = async ({ operator, from }: AuthorizeOperatorParams) => {
		const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3)

		return await contract.methods.authorizeOperator(operator).send({
			from,
			maxFeePerGas,
			maxPriorityFeePerGas,
			gasPrice
		});
	}
	const getAddressLock = (address: string) => {
		return contract.methods.addressLocks(address).call;
	}
	const getAddressDetails = (address: string) => {
		return contract.methods.getAddressDetails(address).call;
	}
	const getAddressTokenDetails = (address: string) => {
		return contract.methods.getAddressTokenDetails(address).call;
	}
	const getTotalSupply = () => {
		return contract.methods.totalSupply().call;
	}
	const getReserves = () => {
		return contract.methods.getReserves().call;
	}
	const slot0 = () => {
		return contract.methods.slot0().call;
	}
	const liquidity = () => {
		return contract.methods.liquidity().call;
	}


	const lock = async ({ minterAddress, amount, from }: LockParams) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.lock(minterAddress, amount.toString()).call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3)

			const lockTx = await contract.methods.lock(minterAddress, amount.toString()).send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice
			})

			return lockTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	}
	const unlockDamTokens = async ({ from }: UnlockParams) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.unlock().call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3)

			const unlockTx = await contract.methods.unlock().send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice
			});

			return unlockTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	}

	const mintToAddress = async ({ sourceAddress, targetAddress, blockNumber, from }: MintToAddressParams) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.mintToAddress(sourceAddress, targetAddress, blockNumber).call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3)

			const mintTx = await contract.methods.mintToAddress(sourceAddress, targetAddress, blockNumber).send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice
			})

			return mintTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	}
	const burnToAddress = async ({ targetAddress, amount, from }: BurnToAddressParams) => {
		try {
			// Attempt to call the method first to check if there are any errors
			await contract.methods.burnToAddress(targetAddress, amount.toString()).call({ from });

			const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasFees(web3)

			const mintTx = await contract.methods.burnToAddress(targetAddress, amount.toString()).send({
				from,
				maxFeePerGas,
				maxPriorityFeePerGas,
				gasPrice
			})

			return mintTx;
		} catch (err) {
			rethrowWeb3Error(err);
		}
	}

	return {
		getTotalSupply,
		getBalanceOf,
		//isOperatorFor,
		authorizeOperator,

		// Flux-sepecific
		lock,
		getAddressLock,
		//getMintAmount,
		getReserves,
		getAddressDetails,
		mintToAddress,
		burnToAddress,
		unlockDamTokens,
		getAddressTokenDetails,
		slot0,
		liquidity
	}
}

const commonLanguage = {
	errors: {
		UnknownContract: 'Unknown contract.',
		UnknownError: 'Unknown error.',
	}
}

export {
	withWeb3
};

