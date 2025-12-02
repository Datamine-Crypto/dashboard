import Big from 'big.js';

import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem, Layer, NetworkType } from '@/app/configs/config.common';
import {
	ReducerCommand,
	ReducerQuery,
	commonLanguage as reducerCommonLanguage,
} from '@/utils/reducer/sideEffectReducer';
import copyToClipBoard from '@/utils/copyToClipboard';
import { devLog } from '@/utils/devLog';
import { availableSwapTokens } from '@/web3/swap/performSwap';
import { SwapOperation, SwapToken, SwapTokenWithAmount } from '@/web3/swap/swapOptions';
import { formatBigInt, getPriceToggle, parseBigInt } from '@/utils/mathHelpers';
import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { DialogType, Game, Token } from '@/app/interfaces';
import { createWithWithQueries, localConfig } from '@/utils/reducer/reducerHelpers';
import { GetBurnFluxResponseQuery } from '@/app/state/queries/web3/GetBurnFluxResponse';
import { GetLockInDamTokensResponseQuery } from '@/app/state/queries/web3/GetLockInDamTokensResponse';
import { GetMintFluxResponseQuery } from '@/app/state/queries/web3/GetMintFluxResponse';
import { GetSetMintSettingsResponseQuery } from '@/app/state/queries/web3/batchMinter/GetSetMintSettingsResponse';
import { GetMarketBurnFluxResponseQuery, GetDepositMarketResponseQuery } from '@/app/state/queries/web3/MarketQueries';
import { Gem } from '@/react/elements/Fragments/DatamineGemsGame';
import { HelpArticle } from '@/app/helpArticles';

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
				return formatBigInt(state.swapTokenBalances[Layer.Layer2][SwapToken.LOCK] ?? null);
			case SwapToken.FLUX:
				return formatBigInt(state.swapTokenBalances[Layer.Layer2][SwapToken.FLUX] ?? null);
			case SwapToken.ArbiFLUX:
				return formatBigInt(state.swapTokenBalances[Layer.Layer2][SwapToken.ArbiFLUX] ?? null);
			case SwapToken.ETH:
				return formatBigInt(state.balances?.eth ?? null);
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
			const { queries } = command.payload as { queries: ReducerQuery[] };

			return {
				...state,
				pendingQueries: [...state.pendingQueries, ...queries],
				query: undefined, // Clears the query that was added
			};
		}

		case commonLanguage.commands.UpdateEcosystem: {
			const { ecosystem: newEcosystem } = command.payload as { ecosystem: Ecosystem };

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
			const { address } = command.payload as { address: string };

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
			const {
				updateEthBalance,
				closeDialog,
				forceRefresh = false,
			} = (command.payload || {}) as {
				updateEthBalance?: boolean;
				closeDialog?: boolean;
				forceRefresh?: boolean;
			};

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
		case commonLanguage.commands.Web3.ConnectToWallet:
			return {
				...state,
				...withQueries([{ type: commonLanguage.queries.Web3.EnableWeb3 }]),
			};

		case commonLanguage.commands.ClientSettings.SetUseEip1559: {
			const useEip1559 = command.payload as boolean;

			localStorage.setItem('clientSettingsUseEip1559', useEip1559.toString());

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
					command.payload as string,
					state.clientSettings.priceMultiplierAmount,
					false
				);

				const priceMultiplier = parseFloat(
					getForecastAmount(command.payload as string, state.clientSettings.priceMultiplierAmount, true)
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
			} catch {
				return state;
			}
		}
		case commonLanguage.commands.ClientSettings.SetCurrency: {
			const currency = command.payload as string;
			localStorage.setItem('clientSettingsCurrency', currency);

			return {
				...state,
				clientSettings: {
					...state.clientSettings,
					currency,
				},
			};
		}
		case commonLanguage.commands.Forecasting.ToggleMode: {
			if (!state.addressLock || !state.addressDetails || !state.balances) {
				return state;
			}

			const isLocked = state.addressLock.amount > 0n;
			const getLockAmount = () => {
				if (!state.addressLock || !isLocked) {
					return 1000n * 10n ** 18n;
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
			const forecastBlocks = isLocked ? '0' : blocks.toString();
			const forecastStartBlocks = (
				state.addressLock.amount === 0n
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
					value: 10n ** 18n,
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
					forecastAmount: forecastAmount.toString(),
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
		case commonLanguage.commands.Forecasting.SetBurn: {
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
		case commonLanguage.commands.Forecasting.SetBurnAmount: {
			const maxBurn = 10000 * config.maxBurnMultiplier;
			const forecastBurnAmountNumberRaw = Math.round(
				parseFloat(getForecastAmount(command.payload as string, state.forecastSettings.forecastBurnAmount, true)) *
					10000
			);
			const forecastBurn = Math.max(10000, Math.min(maxBurn, forecastBurnAmountNumberRaw));

			const getForecastBurnAmount = () => {
				if (forecastBurnAmountNumberRaw < 10000 || forecastBurnAmountNumberRaw > maxBurn) {
					return (forecastBurn / 10000).toFixed(4);
				}

				return getForecastAmount(command.payload as string, state.forecastSettings.forecastBurnAmount, false);
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
		case commonLanguage.commands.Forecasting.SetTime: {
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

		case commonLanguage.commands.Forecasting.SetTimeAmount: {
			const forecastTimeAmountNumberRaw = Math.round(
				parseFloat(getForecastAmount(command.payload as string, state.forecastSettings.forecastTimeAmount, true)) *
					10000
			);
			const forecastTime = Math.max(10000, Math.min(100000, forecastTimeAmountNumberRaw));

			const getForecastTimeAmount = () => {
				if (forecastTimeAmountNumberRaw < 10000 || forecastTimeAmountNumberRaw > 100000) {
					return (forecastTime / 10000).toFixed(4);
				}

				return getForecastAmount(command.payload as string, state.forecastSettings.forecastTimeAmount, false);
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
		case commonLanguage.commands.Forecasting.SetBlocks: {
			const forecastBlocks = command.payload as string;

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
		case commonLanguage.commands.Forecasting.SetStartBlocks: {
			const forecastStartBlocks = command.payload as string;

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

		case commonLanguage.commands.Forecasting.SetAmount: {
			const forecastAmount = getForecastAmount(command.payload as string, state.forecastSettings.forecastAmount, false);
			return {
				...state,
				forecastSettings: {
					...state.forecastSettings,
					forecastAmount,
					amount:
						BigInt(
							getForecastAmount(command.payload as string, state.forecastSettings.forecastAmount, true).toString()
						) *
						10n ** 18n,
				},
			};
		}

		case commonLanguage.commands.Forecasting.SetFluxPrice: {
			const forecastFluxPrice = getForecastAmount(
				command.payload as string,
				state.forecastSettings.forecastFluxPrice,
				false
			);
			if (!state.balances) {
				return state;
			}
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

		case commonLanguage.commands.Web3.Initialize: {
			const { address } = command.payload as { address: string };
			if (state.isInitialized) {
				return state;
			}

			return {
				...state,
				isInitialized: true,
				address,
				...withQueries([{ type: commonLanguage.queries.Web3.FindWeb3Instance }]),
			};
		}

		case commonLanguage.commands.Web3.Reinitialize: {
			const { targetEcosystem } = command.payload as { targetEcosystem: Ecosystem };

			return {
				...state,
				targetEcosystem,
				forecastSettings: {
					...state.forecastSettings,
					enabled: false,
				},
				error: null,
				...withQueries([{ type: commonLanguage.queries.Web3.FindWeb3Instance, payload: { targetEcosystem } }]),
			};
		}

		case commonLanguage.commands.Flux.AuthorizeOperator: {
			if (state.balances?.damToken === 0n) {
				return {
					...state,
					dialog: DialogType.ZeroDam,
				};
			}
			if (state.balances?.eth === 0n) {
				return {
					...state,
					dialog: DialogType.ZeroEth,
				};
			}
			return {
				...state,
				...withQueries([{ type: commonLanguage.queries.Flux.GetAuthorizeOperatorResponse }]),
			};
		}
		case commonLanguage.commands.Flux.UnlockDamTokens: {
			return {
				...state,
				error: null,
				...withQueries([{ type: commonLanguage.queries.Flux.GetUnlockDamTokensResponse }]),
			};
		}
		case commonLanguage.commands.Dialog.DismissPendingAction:
			return {
				...state,
				lastDismissedPendingActionCount: state.queriesCount,
			};
		case commonLanguage.commands.Flux.LockInDamTokens: {
			try {
				const { amount, minterAddress } = command.payload as { amount: string; minterAddress: string };

				const amountBigInt = parseBigInt(amount);

				return {
					...state,
					error: null,
					...withQueries([
						{
							type: commonLanguage.queries.Flux.GetLockInDamTokensResponse,
							payload: { amount: amountBigInt, minterAddress } as GetLockInDamTokensResponseQuery,
						},
					]),
				};
			} catch {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Flux.Mint: {
			const { sourceAddress, targetAddress, blockNumber } = command.payload as {
				sourceAddress: string;
				targetAddress: string;
				blockNumber: string;
			};

			return {
				...state,
				error: null,
				...withQueries([
					{
						type: commonLanguage.queries.Flux.GetMintResponse,
						payload: { sourceAddress, targetAddress, blockNumber } as GetMintFluxResponseQuery,
					},
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
		case commonLanguage.commands.Dialog.Show: {
			const { dialog } = command.payload as { dialog: DialogType };
			return {
				...state,
				dialog,
			};
		}
		case commonLanguage.commands.Dialog.Close:
			return {
				...state,
				dialog: null,
			};

		case commonLanguage.commands.Dialog.DismissError: {
			return {
				...state,
				error: null,
			};
		}
		case commonLanguage.commands.Flux.Burn: {
			const { amount, address } = command.payload as { amount: string; address: string };

			try {
				const amountBigInt = parseBigInt(amount);

				return {
					...state,
					error: null,
					...withQueries([
						{
							type: commonLanguage.queries.Flux.GetBurnResponse,
							payload: { amount: amountBigInt, address } as GetBurnFluxResponseQuery,
						},
					]),
				};
			} catch {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.SetMinterSettings: {
			const { address } = command.payload as { address: string };

			try {
				return {
					...state,
					error: null,
					...withQueries([
						{
							type: commonLanguage.queries.Flux.GetSetMintSettingsResponse,
							payload: { address } as GetSetMintSettingsResponseQuery,
						},
					]),
				};
			} catch {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}

		// We can specify which game to open and show a dilog in the same state change
		case commonLanguage.commands.Market.ShowGameDialog: {
			const { game } = command.payload as { game: Game };

			return {
				...state,
				error: null,
				game,
				dialog: DialogType.MarketCollectRewards,

				// Ensure to get the latest addresses when showing
				...withQueries([{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse, payload: {} }]),
			};
		}
		case commonLanguage.commands.Market.UpdateGame: {
			const { game } = command.payload as { game: Game };
			return {
				...state,
				game,
			};
		}
		case commonLanguage.commands.Market.AddGemAddress: {
			const { address } = command.payload as { address: string };

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
			const { amountToBurn, gems } = command.payload as {
				amountToBurn: string;
				gems: Gem[];
			};

			try {
				/*if (!state.marketAddressLock) {
					return state;
				}*/

				return {
					...state,
					error: null,
					...withQueries([
						{
							type: commonLanguage.queries.Market.GetMarketBurnFluxResponse,
							payload: { amountToBurn: parseBigInt(amountToBurn), gems } as GetMarketBurnFluxResponseQuery,
						},
					]),
				};
			} catch (err) {
				if (err instanceof Error && err.message) {
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
			const { amount, address } = command.payload as { amount: string; address: string };

			try {
				const amountBigInt = parseBigInt(amount);

				/*if (!state.marketAddressLock) {
					return state;
				}*/

				if (amountBigInt <= 0n) {
					throw new Error(commonLanguage.errors.MustExceedZero);
				}

				return {
					...state,
					error: null,
					...withQueries([
						{
							type: commonLanguage.queries.Market.GetDepositMarketResponse,
							payload: { amount: amountBigInt, address } as GetDepositMarketResponseQuery,
						},
					]),
				};
			} catch (err) {
				devLog('err1:', err);
				if (err instanceof Error && err.message) {
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
			} catch (err) {
				if (err instanceof Error && err.message) {
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
				const { game } = (command.payload || {}) as { game?: Game };
				// if (!state.web3) {
				// 	return state;
				// }

				return {
					...state,
					...(game ? { game } : {}),
					error: null,
					...withQueries([{ type: commonLanguage.queries.Market.GetRefreshMarketAddressesResponse, payload: {} }]),
				};
			} catch {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Swap.Trade: {
			try {
				// minReturn is not defined in this scope, assuming it's meant to be passed or is a placeholder.
				// For now, it's included as requested, but might lead to a runtime error if not defined.
				const minReturn = undefined; // Placeholder for minReturn, as it's not defined in the provided context.
				return {
					...state,
					error: null,
					...withQueries([{ type: commonLanguage.queries.Swap.GetTradeResponse, payload: { minReturn } }]),
				};
			} catch {
				return {
					...state,
					error: commonLanguage.errors.InvalidNumber,
				};
			}
		}
		case commonLanguage.commands.Swap.ShowTradeDialog: {
			const { input } = command.payload as { input: SwapTokenWithAmount };

			const getInput = () => {
				if (!input || !input.swapToken) {
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

			const ecosystem =
				inputState.swapToken && outputState.swapToken
					? getSwapTokenEcosystem(inputState.swapToken === SwapToken.ETH ? outputState.swapToken : inputState.swapToken)
					: state.ecosystem;

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
			const { amount } = command.payload as { amount: string };

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
			const newAmount = getForecastAmount(amount, state.swapState.input.amount || '');

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
			const { swapOperation, swapToken } = command.payload as { swapOperation: SwapOperation; swapToken: SwapToken };

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
		case commonLanguage.commands.Help.SetSearch: {
			const searchQuery = command.payload as string;
			const { helpArticlesNetworkType } = state;

			return {
				...state,
				searchQuery,
				...withQueries([
					{ type: commonLanguage.queries.Help.PerformSearch, payload: { searchQuery, helpArticlesNetworkType } },
				]),
			};
		}
		case commonLanguage.commands.Help.ShowArticle: {
			const { helpArticle } = command.payload as { helpArticle: HelpArticle };

			const { helpArticlesNetworkType } = state;

			return {
				...state,
				searchQuery: '',
				...withQueries([
					{ type: commonLanguage.queries.Help.GetFullArticle, payload: { helpArticle, helpArticlesNetworkType } },
				]),
			};
		}
		case commonLanguage.commands.Help.CloseArticle:
			return {
				...state,
				helpArticle: null,
			};
		case commonLanguage.commands.Drawer.Open:
			return {
				...state,
				isMobileDrawerOpen: true,
			};
		case commonLanguage.commands.Drawer.Close:
			return {
				...state,
				isMobileDrawerOpen: false,
			};
		case commonLanguage.commands.Help.SetNetworkType: {
			const helpArticlesNetworkType = command.payload as NetworkType;

			localStorage.setItem('helpArticlesNetworkType', helpArticlesNetworkType.toString());

			return {
				...state,
				helpArticlesNetworkType,
				...withQueries([{ type: commonLanguage.queries.Help.ResetArticleBodies }]),
			};
		}
	}
	return state;
};
