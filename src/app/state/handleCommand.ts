import Big from 'big.js';
import BN from 'bn.js';
import { getEcosystemConfig } from '@/app/configs/config';
import { Layer, NetworkType } from '@/app/configs/config.common';
import { ReducerCommand, commonLanguage as reducerCommonLanguage } from '@/utils/reducer/sideEffectReducer';
import copyToClipBoard from '@/utils/copyToClipboard';
import { devLog } from '@/utils/devLog';
import { availableSwapTokens } from '@/web3/swap/performSwap';
import { SwapOperation, SwapToken } from '@/web3/swap/swapOptions';
import { BNToDecimal, getPriceToggle, parseBN } from '@/utils/mathHelpers';
import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { DialogType, Token } from '@/app/interfaces';
import { createWithWithQueries, localConfig } from '@/utils/reducer/reducerHelpers';

/**
 * Handles synchronous commands dispatched by the UI or other parts of the application.
 * It updates the state and can queue new queries to be executed by Web3Bindings.
 * @param state - The current state.
 * @param command - The command to be executed.
 * @returns The new state.
 */
export const handleCommand = (state: AppState, command: ReducerCommand) => {
	const withQueries = createWithWithQueries(state);

	const config = getEcosystemConfig(state.ecosystem);

	const getForecastAmount = (payload: string, defaultAmount: string, removePeriod = false) => {
		const getAmount = () => {
			const getTrimmedZerosAmount = () => {
				const amount = payload as string;
				if (amount.indexOf('.') === -1) {
					return amount.replace(/^0+/, '');
				}
				return amount;
			};

			const amount = getTrimmedZerosAmount();
			if (amount === '..') {
				return '0';
			}
			if (amount.endsWith('.') && removePeriod) {
				return amount.slice(0, -1);
			}

			return amount;
		};
		const amount = getAmount().replace('/[^0-9.]+/g', '');

		if (!amount) {
			return '0';
		}
		if (amount === '.') {
			return '0.';
		}

		if (!`${amount}0`.match(/^\d*(\.\d+)?$/) || amount.length > 27) {
			// 27 = max supply + 18 digits + period
			return defaultAmount;
		}

		return amount;
	};

	const getSwapTokenBalance = (swapToken: SwapToken | null) => {
		if (!state.swapTokenBalances) {
			return null;
		}

		switch (swapToken) {
			case SwapToken.LOCK:
				return BNToDecimal(state.swapTokenBalances[Layer.Layer2][SwapToken.LOCK] ?? null);
			case SwapToken.FLUX:
				return BNToDecimal(state.swapTokenBalances[Layer.Layer2][SwapToken.FLUX] ?? null);
			case SwapToken.ArbiFLUX:
				return BNToDecimal(state.swapTokenBalances[Layer.Layer2][SwapToken.ArbiFLUX] ?? null);
			case SwapToken.ETH:
				return BNToDecimal(state.balances?.eth ?? null);
		}
	};
	const getFlipSwapState = () => {
		return {
			...state,
			swapState: {
				input: {
					...state.swapState.input,
					swapToken: state.swapState.output.swapToken,
				},
				output: {
					...state.swapState.output,
					amount: '...',
					swapToken: state.swapState.input.swapToken,
				},
			},
			error: null,

			...withQueries([{ type: commonLanguage.queries.Swap.GetOutputQuote }]),
		};
	};

	/**
	 * When showing the trade window (or chaning a token in the trade window) we want to change the ecosysetem
	 * The change is required because we pull in balances & liquidity for that specific ecosystem
	 */
	const getSwapTokenEcosystem = (swapToken: SwapToken) => {
		const availableSwapToken = availableSwapTokens.find(
			(availableSwapToken) => availableSwapToken.swapToken === swapToken
		);

		// If we are switching to ETH then we don't need to change ecosystem
		if (!availableSwapToken || !availableSwapToken.ecosystem) {
			return state.ecosystem;
		}

		const stateEcosystemConfig = getEcosystemConfig(state.ecosystem);
		const newEcosystemConfig = getEcosystemConfig(availableSwapToken.ecosystem);

		// We don't want to change the ecosystem right away (this will be handled on page reload after user selects to swap network)
		if (stateEcosystemConfig.layer != newEcosystemConfig.layer) {
			return state.ecosystem;
		}

		return newEcosystemConfig.ecosystem;
	};

	switch (command.type) {
		// Core functionality of sideEffectReducer
		// Note we're using reducerCommonLanguage instead of commonLanguage
		case reducerCommonLanguage.commands.QueueQueries: {
			const { queries } = command.payload;

			return {
				...state,
				pendingQueries: [...state.pendingQueries, ...queries],
				query: undefined, // Clears the query that was added
			};
		}

		case commonLanguage.commands.UpdateEcosystem: {
			const { ecosystem: newEcosystem } = command.payload;

			const stateEcosystemConfig = getEcosystemConfig(state.ecosystem);
			const newEcosystemConfig = getEcosystemConfig(newEcosystem);
			devLog('stateEcosystemConfig:', stateEcosystemConfig, 'newEcosystemConfig:', newEcosystemConfig);

			// We don't want to change the ecosystem right away (this will be handled on page reload after user selects to swap network)
			if (stateEcosystemConfig.layer != newEcosystemConfig.layer) {
				return state;
			}

			return {
				...state,
				ecosystem: newEcosystem,
				forecastSettings: {
					...state.forecastSettings,
					enabled: false,
				},
			};
		}
		case commonLanguage.commands.UpdateAddress: {
			const { address } = command.payload;

			if (address === state.address) {
				return state;
			}

			return {
				...state,
				isLate: false,
				dialog: null,
				forecastSettings: {
					...state.forecastSettings,
					enabled: false, // Disable forecasting calculator when address changes
				},
				address, // Update current selected address
				...withQueries([{ type: commonLanguage.queries.FindAccountState, payload: { updateEthBalance: false } }]),
			};
		}

		case commonLanguage.commands.RefreshAccountState: {
			const { updateEthBalance, closeDialog, forceRefresh = false } = command.payload ?? ({} as any);

			// Apply throttling (only if we're not refreshing ETH balance. ETH balance updates usually happen at important times so think of it like "forced refresh")
			const currentTimestampMs = Date.now();
			if (
				!updateEthBalance &&
				currentTimestampMs < state.lastAccountRefreshTimestampMs + localConfig.throttleAccountRefreshMs &&
				!forceRefresh
			) {
				return state;
			}

			// const { web3 } = state;
			// if (!web3) {
			// 	return state;
			// }

			// Make sure we can't queue double blocks find
			if (
				state.pendingQueries.findIndex(
					(pendingQuery) => pendingQuery.type === commonLanguage.queries.FindAccountState
				) >= 0
			) {
				return state;
			}

			return {
				...state,
				isLate: false,
				dialog: closeDialog ? null : state.dialog,
				lastAccountRefreshTimestampMs: currentTimestampMs,
				...withQueries([
					{ type: commonLanguage.queries.FindAccountState, payload: { updateEthBalance } },
					{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse, payload: {} },
				]),
			};
		}
		case commonLanguage.commands.ConnectToWallet:
			return {
				...state,
				...withQueries([{ type: commonLanguage.queries.EnableWeb3 }]),
			};

		case commonLanguage.commands.ClientSettings.SetUseEip1559: {
			const useEip1559 = command.payload;

			localStorage.setItem('clientSettingsUseEip1559', command.payload.toString());

			return {
				...state,
				clientSettings: {
					...state.clientSettings,
					useEip1559,
				},
			};
		}

		case commonLanguage.commands.ClientSettings.SetPriceMultiplier: {
			try {
				const priceMultiplierAmount = getForecastAmount(
					command.payload,
					state.clientSettings.priceMultiplierAmount,
					false
				);

				const priceMultiplier = parseFloat(
					getForecastAmount(command.payload, state.clientSettings.priceMultiplierAmount, true)
				);
				if (priceMultiplier > 100000) {
					return state;
				}

				localStorage.setItem('clientSettingsPriceMultiplierAmount', priceMultiplierAmount);

				return {
					...state,
					clientSettings: {
						...state.clientSettings,
						priceMultiplier,
						priceMultiplierAmount,
					},
				};
			} catch (err) {
				return state;
			}
		}
		case commonLanguage.commands.ClientSettings.SetCurrency: {
			const currency = command.payload;
			localStorage.setItem('clientSettingsCurrency', currency);

			return {
				...state,
				clientSettings: {
					...state.clientSettings,
					currency,
				},
			};
		}
		case commonLanguage.commands.ToggleForecastMode: {
			if (!state.addressLock || !state.addressDetails) {
				return state;
			}

			const isLocked = !state.addressLock.amount.isZero();

			const getLockAmount = () => {
				if (!state.addressLock || !isLocked) {
					return new BN('1000').mul(new BN(10).pow(new BN(18)));
				}
				return state.addressLock.amount;
			};
			const lockAmount = getLockAmount();

			const getUnmintedBlocks = () => {
				if (!state.addressDetails || !state.addressLock || !isLocked) {
					return 31 * 24 * 60 * (60 / 12); // 1 Month default
				}
				return state.addressDetails.blockNumber - state.addressLock.lastMintBlockNumber;
			};
			const unmintedBlocks = getUnmintedBlocks();

			const forecastAmount = new Big(lockAmount.toString(10)).div(new Big(10).pow(18));
			const blocks = unmintedBlocks;
			const forecastBlocks = isLocked ? 0 : blocks.toString();
			const forecastStartBlocks = (
				state.addressLock.amount.isZero()
					? 0
					: (state.addressDetails.blockNumber - state.addressLock.lastMintBlockNumber) * -1
			).toString();
			const forecastBurn = isLocked ? state.addressDetails.addressBurnMultiplier : 10000;
			const forecastTime = isLocked ? state.addressDetails.addressTimeMultiplier : 30000;

			const forecastBurnAmount = (forecastBurn / 10000).toFixed(4);
			const forecastTimeAmount = (forecastTime / 10000).toFixed(4);

			const alreadyMintedBlocks = state.addressLock.lastMintBlockNumber - state.addressDetails.blockNumber;

			const enabled = !state.forecastSettings.enabled;

			const getForecastFluxPrice = () => {
				if (!state.balances || !enabled) {
					return '';
				}
				return getPriceToggle({
					value: new BN(10).pow(new BN(18)),
					inputToken: Token.Mintable,
					outputToken: Token.USDC,
					balances: state.balances,
					round: config.mintableTokenPriceDecimals,
				});
			};

			const forecastFluxPrice = getForecastFluxPrice();

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					enabled,
					amount: lockAmount,
					forecastAmount,
					forecastBlocks,
					forecastStartBlocks,
					blocks,
					forecastBurn,
					forecastBurnAmount,
					forecastTime,
					forecastTimeAmount,
					forecastFluxPrice,
					alreadyMintedBlocks,
				},
				balances: {
					...state.balances,
					forecastFluxPrice: '',
				},
			};
		}
		case commonLanguage.commands.ForecastSetBurn: {
			const forecastBurn = command.payload as number;
			const forecastBurnAmount = (forecastBurn / 10000).toFixed(4);
			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastBurn,
					forecastBurnAmount,
				},
			};
		}
		case commonLanguage.commands.ForecastSetBurnAmount: {
			const maxBurn = 10000 * config.maxBurnMultiplier;
			const forecastBurnAmountNumberRaw = Math.round(
				parseFloat(getForecastAmount(command.payload, state.forecastSettings.forecastBurnAmount, true)) * 10000
			);
			const forecastBurn = Math.max(10000, Math.min(maxBurn, forecastBurnAmountNumberRaw));

			const getForecastBurnAmount = () => {
				if (forecastBurnAmountNumberRaw < 10000 || forecastBurnAmountNumberRaw > maxBurn) {
					return (forecastBurn / 10000).toFixed(4);
				}

				return getForecastAmount(command.payload, state.forecastSettings.forecastBurnAmount, false);
			};
			const forecastBurnAmount = getForecastBurnAmount();

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastBurn,
					forecastBurnAmount,
				},
			};
		}
		case commonLanguage.commands.ForecastSetTime: {
			const forecastTime = command.payload as number;
			const forecastTimeAmount = (forecastTime / 10000).toFixed(4);

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastTime,
					forecastTimeAmount,
				},
			};
		}

		case commonLanguage.commands.ForecastSetTimeAmount: {
			const forecastTimeAmountNumberRaw = Math.round(
				parseFloat(getForecastAmount(command.payload, state.forecastSettings.forecastTimeAmount, true)) * 10000
			);
			const forecastTime = Math.max(10000, Math.min(100000, forecastTimeAmountNumberRaw));

			const getForecastTimeAmount = () => {
				if (forecastTimeAmountNumberRaw < 10000 || forecastTimeAmountNumberRaw > 100000) {
					return (forecastTime / 10000).toFixed(4);
				}

				return getForecastAmount(command.payload, state.forecastSettings.forecastTimeAmount, false);
			};
			const forecastTimeAmount = getForecastTimeAmount();

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastTime,
					forecastTimeAmount,
				},
			};
		}
		case commonLanguage.commands.ForecastSetBlocks: {
			const forecastBlocks = command.payload;

			const blocks = Math.max(0, parseInt(forecastBlocks) - parseInt(state.forecastSettings.forecastStartBlocks));

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastBlocks,
					blocks,
				},
			};
		}
		case commonLanguage.commands.ForecastSetStartBlocks: {
			const forecastStartBlocks = command.payload;

			const blocks = Math.max(0, parseInt(state.forecastSettings.forecastBlocks) - parseInt(forecastStartBlocks));

			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastStartBlocks,
					blocks,
				},
			};
		}

		case commonLanguage.commands.ForecastSetAmount: {
			const forecastAmount = getForecastAmount(command.payload, state.forecastSettings.forecastAmount, false);
			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastAmount,
					amount: new Big(
						getForecastAmount(command.payload, state.forecastSettings.forecastAmount, true).toString()
					).mul(new Big(10).pow(18)),
				},
			};
		}

		case commonLanguage.commands.ForecastSetFluxPrice: {
			const forecastFluxPrice = getForecastAmount(command.payload, state.forecastSettings.forecastFluxPrice, false);
			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastFluxPrice,
				},
				balances: {
					...state.balances,
					forecastFluxPrice,
				},
			};
		}

		case commonLanguage.commands.Initialize: {
			const { address } = command.payload;
			if (state.isInitialized) {
				return state;
			}

			return {
				...state,
				isInitialized: true,
				address,
				...withQueries([{ type: commonLanguage.queries.FindWeb3Instance }]),
			};
		}
		//This is how we can do RPC selection
		/*case commonLanguage.commands.ShowWalletConnectRpc:
			return {
				...state,
				dialog: DialogType.WalletConnectRpc
			}*/
		/*case commonLanguage.commands.ShowWalletConnectRpc:
		case commonLanguage.commands.InitializeWalletConnect: {
			const { isArbitrumMainnet } = command.payload;

			/*const rpcAddress = (command.payload.rpcAddress as string).trim();

			if (!rpcAddress || rpcAddress.indexOf('wss://') === -1 && rpcAddress.indexOf('http://') === -1 && rpcAddress.indexOf('https://') === -1) {
				return {
					...state,
					error: 'Must be a valid Mainnet Ethereum RPC Endpoint'
				}
			}

			if (localStorage) {
				localStorage.setItem('walletConnectRpc', rpcAddress)
			}*/

		//@todo figure out if we still need this hasWeb3 logic

		/*
		if (state.hasWeb3) {

			return {
				...state,
				isArbitrumMainnet,
				dialog: null,
				error: null,
				...withQueries([{ type: commonLanguage.queries.EnableWalletConnect, payload: { isArbitrumMainnet } }])
			}
		}*/

		//web3provider = await getProvider({ useWalletConnect: false, isArbitrumMainnet: false, ecosystem: state.ecosystem })
		/*return {
			...state,
			isArbitrumMainnet,
			dialog: null,
			error: null,
			...withQueries([{ type: commonLanguage.queries.FindWeb3Instance, payload: { useWalletConnect: true } }]),
		};
	}*/
		case commonLanguage.commands.ReinitializeWeb3: {
			const { targetEcosystem } = command.payload;

			return {
				...state,
				targetEcosystem,
				forecastSettings: {
					...state.forecastSettings,
					enabled: false,
				},
				error: null,
				...withQueries([
					{
						type: commonLanguage.queries.FindWeb3Instance,
						payload: { targetEcosystem },
					},
				]),
			};
		}
		/*case commonLanguage.commands.DisconnectFromWalletConnect:
			return {
				...state,
				...withQueries([{ type: commonLanguage.queries.DisconnectWalletConnect }]),
			};*/
		case commonLanguage.commands.DisplayAccessLinks:
			if (state.isDisplayingLinks) {
				//return state;
			}

			return {
				...state,
				isDisplayingLinks: true,
				...withQueries([{ type: commonLanguage.queries.FindAccessLinks }]),
			};

		case commonLanguage.commands.AuthorizeFluxOperator:
			if (state.balances?.damToken?.isZero()) {
				return {
					...state,
					dialog: DialogType.ZeroDam,
				};
			}
			if (state.balances?.eth?.isZero()) {
				return {
					...state,
					dialog: DialogType.ZeroEth,
				};
			}
			return {
				...state,
				...withQueries([{ type: commonLanguage.queries.GetAuthorizeFluxOperatorResponse }]),
			};
		case commonLanguage.commands.UnlockDamTokens:
			return {
				...state,
				error: null,
				...withQueries([{ type: commonLanguage.queries.GetUnlockDamTokensResponse }]),
			};
		case commonLanguage.commands.DismissPendingAction:
			return {
				...state,
				lastDismissedPendingActionCount: state.queriesCount,
			};
		case commonLanguage.commands.LockInDamTokens: {
			try {
				const { amount, minterAddress } = command.payload;

				const amountBN = parseBN(amount);

				return {
					...state,
					error: null,
					...withQueries([
						{ type: commonLanguage.queries.GetLockInDamTokensResponse, payload: { amount: amountBN, minterAddress } },
					]),
				};
			} catch (err) {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.MintFluxTokens: {
			const { sourceAddress, targetAddress, blockNumber } = command.payload;

			return {
				...state,
				error: null,
				...withQueries([
					{ type: commonLanguage.queries.GetMintFluxResponse, payload: { sourceAddress, targetAddress, blockNumber } },
				]),
			};
		}

		case commonLanguage.commands.CopyAnalytics: {
			const { balances, addressLock, addressDetails, addressTokenDetails } = state;
			if (!balances || !addressLock || !addressDetails || !addressTokenDetails) {
				return state;
			}
			try {
				const clipboardState = {
					address: state.selectedAddress,
					balances: {
						dam: balances.damToken.toString(10),
						flux: balances.fluxToken.toString(10),
					},
					addressLock: {
						amount: addressLock.amount.toString(10),
						blockNumber: addressLock.blockNumber,
						burnedAmount: addressLock.burnedAmount.toString(10),
						lastMintBlockNumber: addressLock.lastMintBlockNumber,
						minterAddress: addressLock.minterAddress,
					},
					addressDetails: {
						blockNumber: addressDetails.blockNumber,
						fluxBalance: addressDetails.fluxBalance.toString(),
						mintAmount: addressDetails.mintAmount.toString(),
						addressTimeMultiplier: addressDetails.addressTimeMultiplier,
						addressBurnMultiplier: addressDetails.addressBurnMultiplier,
						addressTimeMultiplierRaw: addressDetails.addressTimeMultiplierRaw,
						addressBurnMultiplierRaw: addressDetails.addressBurnMultiplierRaw,
						globalLockedAmount: addressDetails.globalLockedAmount.toString(),
						globalBurnedAmount: addressDetails.globalBurnedAmount.toString(),
					},
					addressTokenDetails: {
						blockNumber: addressTokenDetails.blockNumber,
						isFluxOperator: addressTokenDetails.isFluxOperator,
						damBalance: addressTokenDetails.damBalance.toString(),
						myRatio: addressTokenDetails.myRatio.toString(),
						globalRatio: addressTokenDetails.globalRatio.toString(),
					},
				};
				copyToClipBoard(JSON.stringify(clipboardState));
			} catch (error) {
				devLog('Clipboard Error:', error);
				alert('Failed copying to clipboard. (Check console error log)');
			}
			return state;
		}
		case commonLanguage.commands.ShowDialog: {
			const { dialog, dialogParams } = command.payload;

			return {
				...state,
				error: null,
				dialog,
				dialogParams,
			};
		}
		case commonLanguage.commands.CloseDialog: {
			return {
				...state,
				error: null,
				dialog: null,
			};
		}
		case commonLanguage.commands.DismissError: {
			return {
				...state,
				error: null,
			};
		}
		case commonLanguage.commands.BurnFluxTokens: {
			const { amount, address } = command.payload;

			try {
				const amountBN = parseBN(amount);

				return {
					...state,
					error: null,
					...withQueries([
						{ type: commonLanguage.queries.GetBurnFluxResponse, payload: { amount: amountBN, address } },
					]),
				};
			} catch (err) {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.SetMinterSettings: {
			const { address } = command.payload;

			try {
				return {
					...state,
					error: null,
					...withQueries([{ type: commonLanguage.queries.GetSetMintSettingsResponse, payload: { address } }]),
				};
			} catch (err) {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}

		// We can specify which game to open and show a dilog in the same state change
		case commonLanguage.commands.Market.ShowGameDialog: {
			const { game } = command.payload;

			return {
				...state,
				error: null,
				game,
				dialog: DialogType.MarketCollectRewards,

				// Ensure to get the latest addresses when showing
				...withQueries([{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse, payload: {} }]),
			};
		}
		case commonLanguage.commands.Market.AddGemAddress: {
			const { address } = command.payload;

			const ecosystemAddresses = state.market.gemAddresses[state.ecosystem];

			// Don't add duplicate addresses
			if (ecosystemAddresses.some((ecosystemAddress) => ecosystemAddress === address)) {
				return state;
			}

			const newecosystemAddresses = [...ecosystemAddresses, address];

			const gemAddresses = {
				...state.market.gemAddresses,
				[state.ecosystem]: newecosystemAddresses,
			};

			localStorage.setItem('marketGemAddresses', JSON.stringify(gemAddresses));

			return {
				...state,
				market: {
					...state.market,
					gemAddresses,
				},
			};
		}
		case commonLanguage.commands.Market.MarketBurnFluxTokens: {
			const { amountToBurn, gems } = command.payload;

			try {
				/*if (!state.marketAddressLock) {
					return state;
				}*/

				return {
					...state,
					error: null,
					...withQueries([
						{ type: commonLanguage.queries.Market.GetMarketBurnFluxResponse, payload: { amountToBurn, gems } },
					]),
				};
			} catch (err: any) {
				if (err && err.message) {
					switch (err.message) {
						case commonLanguage.errors.Market.AmountExceedsMaxAddressMintable:
							return {
								...state,
								error: err.toString(),
							};
					}
				}
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Market.DepositTokens: {
			const { amount, address } = command.payload;

			try {
				const amountBN = parseBN(amount);

				/*if (!state.marketAddressLock) {
					return state;
				}*/

				if (amountBN.lte(new BN(0))) {
					throw new Error(commonLanguage.errors.MustExceedZero);
				}

				return {
					...state,
					error: null,
					...withQueries([
						{ type: commonLanguage.queries.Market.GetDepositMarketResponse, payload: { amount: amountBN, address } },
					]),
				};
			} catch (err: any) {
				devLog('err1:', err);
				if (err && err.message) {
					switch (err.message) {
						case commonLanguage.errors.Market.AmountExceedsMaxAddressMintable:
							devLog('err2:', err);
							return {
								...state,
								error: err.toString(),
							};
					}
				}
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Market.WithdrawTokens: {
			try {
				return {
					...state,
					error: null,
					...withQueries([{ type: commonLanguage.queries.Market.GetWithdrawMarketResponse, payload: {} }]),
				};
			} catch (err: any) {
				if (err && err.message) {
					switch (err.message) {
						case commonLanguage.errors.Market.AmountExceedsMaxAddressMintable:
							return {
								...state,
								error: err.toString(),
							};
					}
				}
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Market.RefreshMarketAddresses: {
			try {
				// if (!state.web3) {
				// 	return state;
				// }

				return {
					...state,
					error: null,
					...withQueries([{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse, payload: {} }]),
				};
			} catch (err: any) {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Swap.Trade: {
			try {
				return {
					...state,
					error: null,
					...withQueries([{ type: commonLanguage.queries.GetTradeResponse, payload: {} }]),
				};
			} catch (err) {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Swap.ShowTradeDialog: {
			const { input } = command.payload;

			const getInput = () => {
				if (!input || !input.swapToken || input === '0') {
					return {
						swapToken: null,
						amount: '',
					};
				}

				const inputTokenBalance = getSwapTokenBalance(input.swapToken);

				// If we don't have any of this token, most likely the person wants to buy it so inverse the swap and prefill ETH amount
				if (inputTokenBalance === '0') {
					return {
						swapToken: SwapToken.ETH,
						amount: '', // We don't want to prefill ETH amount, let user enter it getSwapTokenBalance(SwapToken.ETH)
					};
				}

				return {
					swapToken: input.swapToken,
					amount: inputTokenBalance,
				};
			};
			const inputState = getInput();

			const getOutput = () => {
				if (inputState.swapToken === SwapToken.ETH && input && input.swapToken) {
					return {
						swapToken: input.swapToken,
						amount: '...',
					};
				}

				return {
					swapToken: SwapToken.ETH,
					amount: '...',
				};
			};

			const outputState = getOutput();

			const ecosystem = getSwapTokenEcosystem(
				inputState.swapToken === SwapToken.ETH ? outputState.swapToken : inputState.swapToken
			);

			return {
				...state,
				ecosystem,
				error: null,
				dialog: DialogType.Trade,
				dialogParams: {},
				swapState: {
					input: inputState,
					output: outputState,
				},

				...withQueries([{ type: commonLanguage.queries.Swap.GetOutputQuote }]),
			};
		}
		case commonLanguage.commands.Swap.ResetThottleGetOutputQuote: {
			return {
				...state,
				lastSwapThrottle: null,

				...withQueries([{ type: commonLanguage.queries.Swap.GetOutputQuote }]),
			};
		}
		case commonLanguage.commands.Swap.SetAmount: {
			const { amount } = command.payload;

			/**
			 * Every time the amount is updated we'll queue an update but it'll be throttled
			 * This means every new amount update (ex: key stroke) will reset the update timer
			 * After a while ResetThrottleGetOutputQuote() above will be called and the actual quote executed
			 */
			const withGetOutputQuote = () => {
				return {
					lastSwapThrottle: Date.now(),

					...withQueries([{ type: commonLanguage.queries.Swap.ThrottleGetOutputQuote }]),
				};
			};
			const newAmount = getForecastAmount(amount, state.swapState.input.amount);

			// No update necessary (Ex: invalid chartacters were stripped)
			if (newAmount === state.swapState.input.amount) {
				return state;
			}

			return {
				...state,
				swapState: {
					...state.swapState,
					input: {
						...state.swapState.input,
						amount: newAmount,
					},
				},
				error: null,

				...withGetOutputQuote(),
			};
		}
		case commonLanguage.commands.Swap.SetToken: {
			const { swapOperation, swapToken } = command.payload;

			switch (swapOperation) {
				case SwapOperation.Input: {
					if (swapToken === state.swapState.output.swapToken) {
						return getFlipSwapState();
					}

					const inputToken = swapToken;
					const outputToken = swapToken === SwapToken.ETH ? state.swapState.input.swapToken : SwapToken.ETH;

					const ecosystem = getSwapTokenEcosystem(swapToken);

					return {
						...state,
						ecosystem,
						swapState: {
							...state.swapState,
							input: {
								...state.swapState.input,
								swapToken: inputToken,
							},
							output: {
								...state.swapState.output,
								swapToken: outputToken,
							},
						},
						error: null,

						...withQueries([{ type: commonLanguage.queries.Swap.GetOutputQuote }]),
					};
				}

				case SwapOperation.Output: {
					if (swapToken === state.swapState.input.swapToken) {
						return getFlipSwapState();
					}

					const inputToken = swapToken === SwapToken.ETH ? state.swapState.output.swapToken : SwapToken.ETH;
					const outputToken = swapToken;

					const ecosystem = getSwapTokenEcosystem(swapToken);

					return {
						...state,
						ecosystem,
						swapState: {
							...state.swapState,
							input: {
								...state.swapState.input,
								swapToken: inputToken,
							},
							output: {
								...state.swapState.output,
								swapToken: outputToken,
							},
						},
						error: null,

						...withQueries([{ type: commonLanguage.queries.Swap.GetOutputQuote }]),
					};
				}
			}

			return state;
		}
		case commonLanguage.commands.Swap.FlipSwap: {
			return getFlipSwapState();
		}
		case commonLanguage.commands.SetSearch: {
			const searchQuery = command.payload;

			return {
				...state,
				searchQuery,
				...withQueries([{ type: commonLanguage.queries.PerformSearch, payload: { searchQuery } }]),
			};
		}
		case commonLanguage.commands.ShowHelpArticle: {
			const { helpArticle } = command.payload;

			const { helpArticlesNetworkType } = state;

			return {
				...state,
				searchQuery: '',
				...withQueries([
					{ type: commonLanguage.queries.GetFullHelpArticle, payload: { helpArticle, helpArticlesNetworkType } },
				]),
			};
		}
		case commonLanguage.commands.CloseHelpArticle:
			return {
				...state,
				helpArticle: null,
			};
		case commonLanguage.commands.OpenDrawer:
			return {
				...state,
				isMobileDrawerOpen: true,
			};
		case commonLanguage.commands.CloseDrawer:
			return {
				...state,
				isMobileDrawerOpen: false,
			};
		case commonLanguage.commands.SetHelpArticlesNetworkType: {
			const helpArticlesNetworkType = command.payload as NetworkType;

			localStorage.setItem('helpArticlesNetworkType', helpArticlesNetworkType.toString());

			return {
				...state,
				helpArticlesNetworkType,
				...withQueries([{ type: commonLanguage.queries.ResetHelpArticleBodies }]),
			};
		}
	}
	return state;
};
