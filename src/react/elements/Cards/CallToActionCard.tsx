import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Divider,
	FormControlLabel,
	Grid,
	LinearProgress,
	Link,
	Slider,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Big from 'big.js';

import { useAppStore } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';
import {
	Alarm as AlarmIcon,
	Apps as AppsIcon,
	AttachMoney as AttachMoneyIcon,
	AvTimer as AddIcon,
	DateRange as DateRangeIcon,
	PlayArrow as LockIcon,
	PowerSettingsNew as PowerSettingsNewIcon,
	Redeem as RedeemIcon,
	Whatshot as WhatshotIcon,
	InsertInvitation,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { Ecosystem, Layer } from '@/app/configs/config.common';
import arbiFluxLogo from '@/react/svgs/arbiFluxLogo.svg';
import ArbitrumLogo from '@/react/svgs/arbitrum.svg';
import EthereumPurpleLogo from '@/react/svgs/ethereumPurple.svg';
import fluxLogo from '@/react/svgs/fluxLogo.svg';
import lockquidityLogo from '@/react/svgs/lockquidity.svg';
import damLogo from '@/react/svgs/logo.svg';
import { DialogType, Game, Token } from '@/app/interfaces';
import { formatMoney } from '@/utils/formatMoney';
import { getApy, TokenPair } from '@/utils/getApy';
import { getRequiredFluxToBurn, getRequiredFluxToBurnDecimal, numberWithCommas } from '@/utils/mathHelpers';
import {
	formatBigInt,
	getBlocksRemaining,
	getFormattedMultiplier,
	getPriceToggle,
	getPriceToggleBig,
} from '@/utils/mathHelpers';
import LightTooltip from '@/react/elements/LightTooltip';
import { tss } from 'tss-react/mui';
import { getEcosystemConfig as getConfig, getEcosystemConfig } from '@/app/configs/config';
import { getNetworkDropdown } from '@/react/elements/Fragments/EcosystemDropdown';
import { useShallow } from 'zustand/react/shallow';
import { dispatch as appDispatch } from '@/react/utils/appStore';
import { LocalizationProviderProps } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePickerProps } from '@mui/x-date-pickers/MobileDatePicker';
import { AdapterDayjs as AdapterDayjsType } from '@mui/x-date-pickers/AdapterDayjs';

interface PoolReserves {
	Reserve0: string;
	Reserve1: string;
}

const useStyles = tss.create(({ theme }) => ({
	progressBarLeft: {
		height: '15px',
		borderTopLeftRadius: '5px',
		borderBottomLeftRadius: '5px',
	},
	progressBarRight: {
		height: '15px',
		borderTopRightRadius: '5px',
		borderBottomRightRadius: '5px',
	},
	formCell: {
		paddingTop: 0,
		paddingBottom: 0,
	},
	largeSlider: {
		'& .MuiSlider-rail': {
			height: 15,
			borderRadius: 5,
		},
		'& .MuiSlider-track': {
			height: 15,
			borderRadius: 5,
		},
		'& .MuiSlider-thumb': {
			width: 26,
			height: 26,
			border: '2px solid #187a82',
		},
	},
	datePicker: {
		'& .MuiPickersDay-current': {
			color: '#0FF',
		},
		'& .MuiPickersYear-yearSelected': {
			color: '#0FF',
		},
		'& .MuiPickersDay-daySelected': {
			backgroundColor: '#303030',
		},
	},
	tableContainer: {
		'& .MuiTableCell-root': {
			padding: 11,
			borderBottomColor: '#32333d',
		},
	},
	topLeftPrices: {
		color: '#FFF',
	},
	topLeftPricesContainer: {
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
		},
	},
	topRightContainer: {
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
		},
	},
	topContainer: {
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column',
		},
	},
}));

/**
 * Dependencies for the date picker, dynamically loaded.
 */
interface DatePickerDependencies {
	LocalizationProvider: React.ElementType<LocalizationProviderProps<any>> | null;
	MobileDatePicker: React.ElementType<MobileDatePickerProps<any>> | null;
	AdapterDayjs: typeof AdapterDayjsType | null;
}

const CallToActionCard: React.FC = () => {
	const {
		addressLock,
		address,
		selectedAddress,
		addressDetails,
		addressTokenDetails,
		balances,
		forecastSettings,
		clientSettings,
		ecosystem,
		connectionMethod,
	} = useAppStore(
		useShallow((state) => ({
			addressLock: state.addressLock,
			address: state.address,
			selectedAddress: state.selectedAddress,
			addressDetails: state.addressDetails,
			addressTokenDetails: state.addressTokenDetails,
			balances: state.balances,
			forecastSettings: state.forecastSettings,
			clientSettings: state.clientSettings,
			ecosystem: state.ecosystem,
			connectionMethod: state.connectionMethod,
		}))
	);
	const { classes } = useStyles();
	const dispatch = appDispatch;

	const {
		navigation,
		isArbitrumOnlyToken,
		lockableTokenShortName,
		mintableTokenShortName,
		isTokenLogoEnabled,
		maxBurnMultiplier,
		minBurnMultiplier,
		mintableTokenMintPerBlockDivisor,
		mintableTokenPriceDecimals,
		mintableTokenContractAddress,
		batchMinterAddress,
	} = getConfig(ecosystem);
	const { isHelpPageEnabled } = navigation;
	const ecosystemConfig = getEcosystemConfig(ecosystem);
	const isArbitrumMainnet = ecosystemConfig.layer === Layer.Layer2;
	const isPlayingGameDatamineGems =
		ecosystemConfig.marketAddress && ecosystemConfig.marketAddress.toLowerCase() === addressLock?.minterAddress;
	const isPlayingGameHoldClicker =
		ecosystemConfig.gameHodlClickerAddress &&
		ecosystemConfig.gameHodlClickerAddress.toLowerCase() === addressLock?.minterAddress;
	const isPlayingGame = addressLock && (isPlayingGameDatamineGems || isPlayingGameHoldClicker);
	const [datePickerDeps, setDatePickerDeps] = useState<DatePickerDependencies>({
		LocalizationProvider: null,
		MobileDatePicker: null,
		AdapterDayjs: null,
	});

	/**
	 * Effect hook to dynamically load date picker dependencies when the forecasting mode is enabled.
	 * This optimizes bundle size by only loading these components when needed.
	 */
	useEffect(() => {
		let isMounted = true;
		if (forecastSettings.enabled && !datePickerDeps.AdapterDayjs) {
			// Check for one, assume all load together
			const loadDependencies = async () => {
				try {
					const [lpModule, mdpModule, amModule] = await Promise.all([
						import('@mui/x-date-pickers/LocalizationProvider'),
						import('@mui/x-date-pickers/MobileDatePicker'),
						import('@mui/x-date-pickers/AdapterDayjs'),
					]);
					if (isMounted) {
						setDatePickerDeps({
							LocalizationProvider: lpModule.LocalizationProvider,
							MobileDatePicker: mdpModule.MobileDatePicker,
							AdapterDayjs: amModule.AdapterDayjs,
						});
					}
				} catch (err) {
					console.error('Failed to load date picker dependencies', err);
				}
			};
			loadDependencies();
		}
		return () => {
			isMounted = false;
		};
	}, [forecastSettings.enabled, datePickerDeps.AdapterDayjs]);

	// Prevent inputs from autofills
	const removeAutocompleteProps = {
		'data-lpignore': 'true',
		'data-form-type': 'other',
		autoComplete: 'off',
	};

	if (!addressLock || !selectedAddress || !addressDetails || !addressTokenDetails || !balances || !connectionMethod) {
		return null;
	}
	const displayedAddress = address ?? selectedAddress;

	const getMintHeaderLabel = () => {
		if (!isArbitrumMainnet || isArbitrumOnlyToken) {
			return null;
		}
		return (
			<>
				<Typography component="div" color="textSecondary" display="inline">
					&nbsp;(Arbitrum L2)
				</Typography>
			</>
		);
	};
	const getCtaDetails = () => {
		const isForecastingModeEnabled = forecastSettings.enabled;
		if (addressTokenDetails.isFluxOperator || isForecastingModeEnabled) {
			if (addressLock && addressDetails) {
				const lockedInDamAmount = addressLock.amount;
				const isLocked = lockedInDamAmount !== 0n;
				if (isLocked || isForecastingModeEnabled) {
					const { minterAddress } = addressLock;
					const isDelegatedMinter = selectedAddress?.toLowerCase() === minterAddress?.toLowerCase();
					const isBatchMinter = batchMinterAddress && minterAddress?.toLowerCase() === batchMinterAddress.toLowerCase();
					const getLockedInAmountArea = () => {
						const getAmount = () => {
							return addressLock.amount;
						};
						const amount = getAmount();
						if (forecastSettings.enabled) {
							return (
								<>
									<TextField
										label={`${lockableTokenShortName} Amount`}
										variant="outlined"
										size="small"
										autoFocus
										onFocus={(e) => e.target.select()}
										value={forecastSettings.forecastAmount}
										onChange={(e) =>
											dispatch({ type: commonLanguage.commands.Forecasting.SetAmount, payload: e.target.value })
										}
									/>
								</>
							);
						}
						return `${formatBigInt(amount, true)}`;
					};
					const getUnmintedBlocks = () => {
						if (forecastSettings.enabled) {
							return forecastSettings.blocks;
						}
						return addressDetails.blockNumber - addressLock.lastMintBlockNumber;
					};
					const isCurrentAddress = selectedAddress?.toLowerCase() === displayedAddress?.toLowerCase();
					const getBurnButton = () => {
						if (isPlayingGame) {
							return;
						}
						const showBurnDialog = () => {
							dispatch({ type: commonLanguage.commands.Dialog.Show, payload: { dialog: DialogType.Burn } });
						};
						const getButton = () => {
							const isDisabled = !isCurrentAddress || addressDetails.fluxBalance === 0n;
							const button = (
								<Button
									disabled={isDisabled}
									size="small"
									variant="outlined"
									onClick={() => showBurnDialog()}
									startIcon={<WhatshotIcon style={{ color: '#ff9b00' }} />}
								>
									Burn {mintableTokenShortName}
								</Button>
							);
							if (addressDetails.fluxBalance === 0n) {
								return (
									<LightTooltip title={`This address must have ${mintableTokenShortName} tokens to burn.`}>
										<Box display="inline-block">{button}</Box>
									</LightTooltip>
								);
							}
							if (!isCurrentAddress) {
								return (
									<LightTooltip
										title={`You must select this account in your wallet to Burn ${mintableTokenShortName} for this address.`}
									>
										<Box display="inline-block">{button}</Box>
									</LightTooltip>
								);
							}
							return button;
						};
						return (
							<Box mx={1} display="inline-block">
								{getButton()}
							</Box>
						);
					};
					const unmintedBlocks = getUnmintedBlocks();
					const getLockedInAmount = () => {
						if (forecastSettings.enabled) {
							return forecastSettings.amount;
						}
						return addressLock.amount;
					};
					const rawAmount =
						(getLockedInAmount() / 10n ** BigInt(mintableTokenMintPerBlockDivisor)) * BigInt(unmintedBlocks);
					const rawAmountBig = new Big(rawAmount.toString(10));
					const blanceWithoutBonusesInUsdc = getPriceToggleBig({
						valueBig: rawAmountBig.mul(minBurnMultiplier),
						inputToken: Token.Mintable,
						outputToken: Token.USDC,
						balances,
						round: 6,
					});
					const blanceWitMaxBonusesInUsdc = getPriceToggle({
						value: rawAmount * BigInt(3 * maxBurnMultiplier),
						inputToken: Token.Mintable,
						outputToken: Token.USDC,
						balances,
						round: 6,
					});
					const getMintAmount = () => {
						if (forecastSettings.enabled) {
							const percentMultiplier = 10000n;
							return (
								(((rawAmount * BigInt(forecastSettings.forecastBurn)) / percentMultiplier) *
									BigInt(forecastSettings.forecastTime)) /
								percentMultiplier
							);
						}
						return addressDetails.mintAmount;
					};
					const getUsdcMint = () => {
						const mintAmount = getMintAmount();
						const balanceInUsdc = getPriceToggle({
							value: mintAmount,
							inputToken: Token.Mintable,
							outputToken: Token.USDC,
							balances,
							round: 6,
							removeCommas: true,
						});
						const getMintTooltip = () => {
							const getMaxMultipliers = () => {
								if (blanceWitMaxBonusesInUsdc === blanceWithoutBonusesInUsdc) {
									return null;
								}
								return (
									<TableRow>
										<TableCell>With x{3 * maxBurnMultiplier} Multiplier</TableCell>
										<TableCell align="right">$ {blanceWitMaxBonusesInUsdc} USD</TableCell>
									</TableRow>
								);
							};
							return (
								<>
									<Table size="small">
										<TableBody>
											<TableRow>
												<TableCell width={20}>Without Multipliers</TableCell>
												<TableCell align="right">$ {blanceWithoutBonusesInUsdc} USD</TableCell>
											</TableRow>
											{getMaxMultipliers()}
										</TableBody>
									</Table>
								</>
							);
						};
						const amount = parseFloat(balanceInUsdc) * clientSettings.priceMultiplier;
						const moneyAmount = formatMoney({ amount, currency: clientSettings.currency });
						return (
							<>
								<LightTooltip title={getMintTooltip()}>
									<Box>
										{moneyAmount}{' '}
										<Typography component="div" color="textSecondary" display="inline">
											{clientSettings.currency}
										</Typography>
									</Box>
								</LightTooltip>
							</>
						);
					};
					const { isTargetReached, fluxRequiredToBurn, fluxRequiredToBurnInUsdc } = getRequiredFluxToBurn({
						addressDetails,
						addressLock,
						balances,
						ecosystem,
						targetMultiplier: new Big(maxBurnMultiplier - minBurnMultiplier),
					});
					const getFluxBurnTooltip = () => {
						const getBurnTooltip = () => {
							return (
								<>
									<Box fontWeight="bold">
										{fluxRequiredToBurn} {mintableTokenShortName}
									</Box>
									<Box fontWeight="bold">{fluxRequiredToBurnInUsdc}</Box>
								</>
							);
						};
						const getDescription = () => {
							if (isTargetReached) {
								return (
									<>
										You&apos;ve burned enough {mintableTokenShortName} for x10 burn bonus.{' '}
										<Typography component="div" color="secondary" display="inline">
											OVERBURNED
										</Typography>{' '}
										{mintableTokenShortName} remaining:{' '}
									</>
								);
							}
							return (
								<>
									The amount of {mintableTokenShortName} you burn is permanent and will be used in the burn ratio
									equation. To get the full {maxBurnMultiplier}x burn bonus you will need to burn
								</>
							);
						};
						return (
							<>
								{getDescription()}
								<Box py={2}>
									<Divider />
								</Box>
								<Box fontWeight="bold">{getBurnTooltip()}</Box>
							</>
						);
					};
					const getStartDateArea = () => {
						if (!forecastSettings.enabled) {
							return null;
						}
						const getStartArea = () => {
							const value = dayjs()
								.set('hour', 0)
								.set('minute', 0)
								.set('second', 0)
								.set('millisecond', 0)
								.add(parseFloat(forecastSettings.forecastStartBlocks) / (60 / 12), 'minutes');
							const getBlocksDropdown = () => {
								if (
									!datePickerDeps.LocalizationProvider ||
									!datePickerDeps.MobileDatePicker ||
									!datePickerDeps.AdapterDayjs
								) {
									return (
										<Typography variant="caption" component="div">
											Loading date picker...
										</Typography>
									);
								}
								const { LocalizationProvider, MobileDatePicker, AdapterDayjs } = datePickerDeps;
								return (
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<MobileDatePicker
											enableAccessibleFieldDOMStructure={false}
											closeOnSelect={true}
											value={value}
											label="From"
											onChange={(date) => {
												if (date) {
													date = date.set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
													const currentDate = dayjs()
														.set('hour', 0)
														.set('minute', 0)
														.set('second', 0)
														.set('millisecond', 0);
													const blocksDiff = date.diff(currentDate, 'minutes') * (60 / 12);
													dispatch({
														type: commonLanguage.commands.Forecasting.SetStartBlocks,
														payload: blocksDiff.toString(),
													});
												}
											}}
											slots={{
												textField: (props) => (
													<TextField
														{...props}
														type="text"
														name="startBlocks"
														size="small"
														inputProps={{
															...props.inputProps,
															...removeAutocompleteProps,
														}}
													/>
												),
											}}
											slotProps={{
												mobilePaper: { className: classes.datePicker },
											}}
										/>
									</LocalizationProvider>
								);
							};
							return (
								<>
									<Box display="flex" alignItems="center">
										{getBlocksDropdown()}
									</Box>
								</>
							);
						};
						return (
							<TableRow>
								<TableCell align="left">
									<Typography component="div" color="textSecondary" variant="body1">
										Mint Start Date / Last Mint Date
									</Typography>
								</TableCell>
								<TableCell align="left">
									<InsertInvitation style={{ color: '#00ffff', verticalAlign: 'middle' }} />
								</TableCell>
								<TableCell component="th" scope="row" align="left">
									{getStartArea()}
								</TableCell>
							</TableRow>
						);
					};
					const getUnmintedBlocksArea = () => {
						const blocksDiff = addressDetails.blockNumber - addressLock.lastMintBlockNumber;
						if (forecastSettings.enabled) {
							//const additionalBlocks = forecastSettings.forecastStartBlocks
							const value = dayjs()
								.set('hour', 0)
								.set('minute', 0)
								.set('second', 0)
								.set('millisecond', 0)
								.add(parseFloat(forecastSettings.forecastBlocks) / (60 / 12), 'minutes');
							const getBlocksDropdown = () => {
								if (
									!datePickerDeps.LocalizationProvider ||
									!datePickerDeps.MobileDatePicker ||
									!datePickerDeps.AdapterDayjs
								) {
									return (
										<Typography variant="caption" component="div">
											Loading date picker...
										</Typography>
									);
								}
								const { LocalizationProvider, MobileDatePicker, AdapterDayjs } = datePickerDeps;
								return (
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<MobileDatePicker
											enableAccessibleFieldDOMStructure={false}
											closeOnSelect={true}
											label="To"
											value={value}
											onChange={(date: Dayjs | null) => {
												if (date) {
													date = date.set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
													const currentDate = dayjs()
														.set('hour', 0)
														.set('minute', 0)
														.set('second', 0)
														.set('millisecond', 0);
													const blocksDiff = date.diff(currentDate, 'minutes') * (60 / 12);
													dispatch({
														type: commonLanguage.commands.Forecasting.SetBlocks,
														payload: blocksDiff.toString(),
													});
												}
											}}
											slots={{
												textField: (props) => (
													<TextField
														{...props}
														type="text"
														name="endBlocks"
														size="small"
														inputProps={{ ...props.inputProps, ...removeAutocompleteProps }}
													/>
												),
											}}
											slotProps={{ mobilePaper: { className: classes.datePicker } }}
										/>
									</LocalizationProvider>
								);
							};
							return (
								<>
									<Box display="flex" alignItems="center">
										{getBlocksDropdown()}
									</Box>
								</>
							);
						}
						return <>x {blocksDiff}</>;
					};
					const getUnmintedBlocksDuration = () => {
						if (forecastSettings.enabled) {
							const blocksRemaining = getBlocksRemaining(forecastSettings.blocks, 0, 0, 'None', false);
							const getForecastedDate = () => {
								const blocksDuration = Math.max(
									0,
									forecastSettings.blocks + (addressLock.lastMintBlockNumber - addressDetails.blockNumber)
								); // This number comes from migration (28 days approx)
								return null;
							};
							return (
								<>
									{blocksRemaining}
									{getForecastedDate()}
								</>
							);
						}
						return getBlocksRemaining(addressDetails.blockNumber, 0, addressLock.lastMintBlockNumber, 'None', false);
					};
					const getBurnSlider = () => {
						if (forecastSettings.enabled) {
							return (
								<Slider
									color="secondary"
									valueLabelDisplay="off"
									value={forecastSettings.forecastBurn}
									className={classes.largeSlider}
									min={10000 * minBurnMultiplier}
									max={10000 * maxBurnMultiplier}
									onChange={(event: Event, newValue: number | number[]) => {
										dispatch({ type: commonLanguage.commands.Forecasting.SetBurn, payload: newValue as number });
									}}
								/>
							);
						}
						const maxBurnBarWidth = 10000 * maxBurnMultiplier;
						return (
							<Box mt={0.5}>
								<Grid container>
									<Grid
										style={{
											width: `${Math.floor((addressDetails.addressBurnMultiplier / maxBurnBarWidth) * 100)}%`,
										}}
									>
										<LightTooltip title={getFluxBurnTooltip()}>
											<LinearProgress
												variant="determinate"
												value={100}
												color="secondary"
												className={classes.progressBarLeft}
											/>
										</LightTooltip>
									</Grid>
									<Grid
										style={{
											width: `${Math.ceil(((maxBurnBarWidth - addressDetails.addressBurnMultiplier) / maxBurnBarWidth) * 100)}%`,
										}}
									>
										<LightTooltip title={getFluxBurnTooltip()}>
											<LinearProgress
												variant="determinate"
												value={0}
												color="secondary"
												className={classes.progressBarRight}
											/>
										</LightTooltip>
									</Grid>
								</Grid>
							</Box>
						);
					};
					const getTimeSlider = () => {
						if (forecastSettings.enabled) {
							return (
								<Slider
									color="secondary"
									valueLabelDisplay="off"
									value={forecastSettings.forecastTime}
									className={classes.largeSlider}
									min={10000}
									max={30000}
									onChange={(event: Event, newValue: number | number[]) => {
										dispatch({ type: commonLanguage.commands.Forecasting.SetTime, payload: newValue as number });
									}}
								/>
							);
						}
						return (
							<Box mt={0.5}>
								<Grid container>
									<Grid style={{ width: `${Math.floor((addressDetails.addressTimeMultiplier / 30000) * 100)}%` }}>
										<LightTooltip title="Your current bonus is permanent for duration of your started mint. If you stop your validator this bonus is reset.">
											<LinearProgress
												variant="determinate"
												value={100}
												color="secondary"
												className={classes.progressBarLeft}
											/>
										</LightTooltip>
									</Grid>
									<Grid
										style={{ width: `${Math.ceil(((30000 - addressDetails.addressTimeMultiplier) / 30000) * 100)}%` }}
									>
										<LightTooltip
											title={`You will receive the full x3 Time Bonus multiplier after leaving your ${lockableTokenShortName} locked-in for another ${getBlocksRemaining(addressLock.blockNumber, 161280 + 5760, addressDetails.blockNumber, 'Awaiting Mint Start')}`}
										>
											<LinearProgress
												variant="determinate"
												value={0}
												color="secondary"
												className={classes.progressBarRight}
											/>
										</LightTooltip>
									</Grid>
								</Grid>
							</Box>
						);
					};
					const getBurnMultiplierText = () => {
						if (forecastSettings.enabled) {
							return (
								<>
									<TextField
										label="Burn Multiplier"
										variant="outlined"
										size="small"
										inputProps={{
											maxLength: 7,
										}}
										onFocus={(e) => e.target.select()}
										value={forecastSettings.forecastBurnAmount}
										onChange={(e) =>
											dispatch({ type: commonLanguage.commands.Forecasting.SetBurnAmount, payload: e.target.value })
										}
									/>
								</>
							);
						}
						return getFormattedMultiplier(addressDetails.addressBurnMultiplier);
					};
					const getTimeMultiplierText = () => {
						if (forecastSettings.enabled) {
							return (
								<>
									<TextField
										label="Mint Age Multiplier"
										variant="outlined"
										size="small"
										inputProps={{
											maxLength: 7,
										}}
										onFocus={(e) => e.target.select()}
										value={forecastSettings.forecastTimeAmount}
										onChange={(e) =>
											dispatch({ type: commonLanguage.commands.Forecasting.SetTimeAmount, payload: e.target.value })
										}
									/>
								</>
							);
						}
						return getFormattedMultiplier(addressDetails.addressTimeMultiplier);
					};
					const getBurnBonusDescription = () => {
						const getTargetBurnMultiplier = () => {
							if (forecastSettings.enabled) {
								return Math.floor(forecastSettings.forecastBurn / 10000);
							}
							return 1;
						};
						const getTargetBurnMultiplierDecimal = () => {
							if (forecastSettings.enabled) {
								return forecastSettings.forecastBurn / 10000;
							}
							return 1;
						};
						if (forecastSettings.enabled) {
							const fluxRequiredToBurn = getRequiredFluxToBurnDecimal({
								ecosystem,
								globalFluxBurned: new Big(addressDetails.globalBurnedAmount.toString()),
								targetMultiplier: getTargetBurnMultiplierDecimal(),
								globalDamLockedIn: new Big(addressDetails.globalLockedAmount.toString()),
								myFluxBurned: new Big(addressLock.burnedAmount.toString()),
								myDamLockedIn: new Big(forecastSettings.amount.toString()),
							});
							if (fluxRequiredToBurn.gt(new Big(0))) {
								const actualFluxRequiredToBurn = fluxRequiredToBurn.mul(new Big(10).pow(18)).round(0).toFixed();
								const amountToBurnUsd = getPriceToggle({
									value: BigInt(actualFluxRequiredToBurn),
									inputToken: Token.Mintable,
									outputToken: Token.USDC,
									balances,
									round: 2,
								});
								return (
									<>
										{' (~'}
										<strong style={{ color: '#0FF' }}>
											{numberWithCommas(fluxRequiredToBurn.toFixed(4))} {mintableTokenShortName}
										</strong>{' '}
										/ <strong style={{ color: '#0FF' }}>${amountToBurnUsd}</strong> left to burn for x{' '}
										{getTargetBurnMultiplierDecimal().toFixed(4)} burn multiplier{')'}
									</>
								);
							}
						}
						return <>{`(Applied at time of mint, x${maxBurnMultiplier} max)`}</>;
					};
					const getDisabledText = () => {
						if (!isLocked) {
							return <>This option will be available once you start your validator in this address.</>;
						}
						if (!isDelegatedMinter && !isBatchMinter) {
							return (
								<>
									Select the{' '}
									<Box fontWeight="bold" display="inline">
										Delegated Minter Address
									</Box>{' '}
									account in your wallet to mint for this address.
								</>
							);
						}
						if (isForecastingModeEnabled) {
							return <>You must disable forecasting mode to mint.</>;
						}
						return null;
					};
					const getFluxPriceRow = () => {
						if (!isForecastingModeEnabled) {
							return null;
						}
						//return null //@todo
						const getPriceArea = () => {
							const blocksDiff = addressDetails.blockNumber - addressLock.lastMintBlockNumber;
							if (forecastSettings.enabled) {
								return (
									<>
										<Box display="flex">
											<TextField
												label="Price"
												variant="outlined"
												size="small"
												value={forecastSettings.forecastFluxPrice}
												onChange={(e) =>
													dispatch({ type: commonLanguage.commands.Forecasting.SetFluxPrice, payload: e.target.value })
												}
											/>
										</Box>
									</>
								);
							}
							return <>x {blocksDiff}</>;
						};
						return (
							<TableRow>
								<TableCell align="left">
									<Typography component="div" color="textSecondary" variant="body1">
										Forecasted {mintableTokenShortName} Price (in USD)
									</Typography>
								</TableCell>
								<TableCell align="left">
									<AttachMoneyIcon style={{ color: '#00ffff' }} />
								</TableCell>
								<TableCell component="th" scope="row" align="left">
									{getPriceArea()}
								</TableCell>
							</TableRow>
						);
					};
					const getUnmintedBlocksText = () => {
						if (forecastSettings.enabled) {
							return (
								<>
									Forecasted {forecastSettings.blocks.toFixed(0)} Unminted Blocks{' '}
									<LightTooltip title="This estimated time is based on assumption that 1 Ethereum Block is genereated every 12 seconds">
										<Box display="inline">({getUnmintedBlocksDuration()})</Box>
									</LightTooltip>
								</>
							);
						}
						return (
							<>
								Unminted Blocks{' '}
								<LightTooltip title="This estimated time is based on assumption that 1 Ethereum Block is genereated every 12 seconds">
									<Box display="inline">({getUnmintedBlocksDuration()})</Box>
								</LightTooltip>
							</>
						);
					};
					const getDamLockedUsdc = () => {
						const lockedAmount = forecastSettings.enabled
							? new Big(forecastSettings.forecastAmount).mul(new Big(10).pow(18))
							: new Big(addressLock?.amount.toString());
						if (lockedAmount.toString() === '0') {
							return null;
						}
						const usdcAmount = getPriceToggle({
							value: BigInt(lockedAmount.toFixed(0)),
							inputToken: Token.Lockable,
							outputToken: Token.USDC,
							balances,
							round: 2,
						});
						return `($ ${usdcAmount} USD)`;
					};
					const getApyHeader = () => {
						if (
							!balances ||
							!balances.uniswapDamTokenReserves ||
							!balances.uniswapFluxTokenReserves ||
							!balances.uniswapUsdcEthTokenReserves
						) {
							return null;
						}
						const apyPools = new Map<TokenPair, PoolReserves>();
						apyPools.set(TokenPair.DAM_ETH, {
							Reserve0: balances.uniswapDamTokenReserves.eth.toString(),
							Reserve1: balances.uniswapDamTokenReserves.dam.toString(),
						});
						apyPools.set(TokenPair.FLUX_ETH, {
							Reserve0: balances.uniswapFluxTokenReserves.flux.toString(),
							Reserve1: balances.uniswapFluxTokenReserves.eth.toString(),
						});
						apyPools.set(TokenPair.USDC_ETH, {
							Reserve0: balances.uniswapUsdcEthTokenReserves.usdc.toString(),
							Reserve1: balances.uniswapUsdcEthTokenReserves.eth.toString(),
						});
						const getBurnMultiplier = () => {
							return minBurnMultiplier;
						};
						const burnMultiplier = getBurnMultiplier();
						const apy = getApy(ecosystem, apyPools);
						if (!apy) {
							return null;
						}
						const actualApy = apy.apyPercent.noBurn * burnMultiplier;
						if (!actualApy) {
							return null;
						}
						return (
							<>
								<Typography component="div" color="textSecondary" display="inline">
									&nbsp;({actualApy.toFixed(2)}% Base APY)
								</Typography>
							</>
						);
					};
					const getBottomRightText = () => {
						/*if (forecastSettings.enabled) {
							return;
						}*/
						return (
							<>
								<Typography component="div" variant="h4">
									{getUsdcMint()}
								</Typography>
							</>
						);
					};
					return {
						disabledText: getDisabledText(),
						title: (
							<>
								<Grid container justifyContent="space-between">
									<Grid>
										Liquidity Dashboard{getMintHeaderLabel()}
										{/*getApyHeader()*/}
									</Grid>
									<Grid>
										<FormControlLabel
											value="start"
											control={
												<Switch
													checked={forecastSettings.enabled}
													color="secondary"
													onChange={() => dispatch({ type: commonLanguage.commands.Forecasting.ToggleMode })}
												/>
											}
											label={
												<>
													<Grid container alignItems="center">
														<Grid>
															<Box mr={0.5}>
																<DateRangeIcon color={forecastSettings.enabled ? 'secondary' : undefined} />
															</Box>
														</Grid>
														<Grid>
															{forecastSettings.enabled ? (
																<Typography component="div" color="secondary">
																	Forecasting Calculator Enabled
																</Typography>
															) : (
																<Typography component="div">Forecasting Calculator</Typography>
															)}
														</Grid>
													</Grid>
												</>
											}
											labelPlacement="start"
										/>
									</Grid>
								</Grid>
							</>
						),
						bottomRightItem: (
							<Grid>
								<Box textAlign="right">
									<Box display="inline-block" mb={1}>
										<Box mb={1}>
											<Typography component="div" color="textSecondary">
												= {`${formatBigInt(getMintAmount(), true)} ${mintableTokenShortName}`}
											</Typography>
										</Box>
										{getBottomRightText()}
									</Box>
								</Box>
							</Grid>
						),
						body: (
							<>
								<Box>
									<TableContainer className={classes.tableContainer}>
										<Table aria-label={`${mintableTokenShortName} Token Breakdown`} style={{ minWidth: 450 }}>
											<TableBody>
												<TableRow>
													<TableCell align="left">
														<Typography component="div" color="textSecondary" variant="body1">
															{lockableTokenShortName} Tokens Powering Validator {getDamLockedUsdc()}
														</Typography>
													</TableCell>
													<TableCell align="left" style={{ width: 25 }}>
														<LockIcon style={{ color: '#3fb57f', verticalAlign: 'middle' }} />
													</TableCell>
													<TableCell
														className={classes.formCell}
														component="th"
														scope="row"
														align="left"
														style={{ width: 175 }}
													>
														{getLockedInAmountArea()}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell align="left">
														<Typography component="div" color="textSecondary" variant="body1">
															{mintableTokenShortName} mintable every new block
														</Typography>
													</TableCell>
													<TableCell align="left">
														<AddIcon style={{ color: '#00ffff', verticalAlign: 'middle' }} />
													</TableCell>
													<TableCell component="th" scope="row" align="left">
														x {(1 / 10 ** mintableTokenMintPerBlockDivisor).toFixed(mintableTokenMintPerBlockDivisor)}
													</TableCell>
												</TableRow>
												{getStartDateArea()}
												<TableRow>
													<TableCell align="left">
														<Typography component="div" color="textSecondary" variant="body1">
															{getUnmintedBlocksText()}
														</Typography>
													</TableCell>
													<TableCell align="left">
														<AppsIcon style={{ color: '#00ffff', verticalAlign: 'middle' }} />
													</TableCell>
													<TableCell component="th" scope="row" align="left">
														{getUnmintedBlocksArea()}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell align="left">
														<Typography component="div" color="textSecondary" variant="body1">
															{mintableTokenShortName} Burn Multiplier{' '}
															<Typography component="div" variant="body2" display="inline">
																{getBurnBonusDescription()}
															</Typography>
															{getBurnButton()}
														</Typography>
														{getBurnSlider()}
													</TableCell>
													<TableCell align="left">
														<WhatshotIcon style={{ color: '#ff9b00', verticalAlign: 'middle' }} />
													</TableCell>
													<TableCell component="th" scope="row" align="left">
														{getBurnMultiplierText()}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell align="left">
														<Typography component="div" color="textSecondary" variant="body1">
															Mint Age Multiplier{' '}
															<Typography component="div" variant="body2" display="inline">
																(Applied at time of mint, x3 max)
															</Typography>
														</Typography>
														{getTimeSlider()}
													</TableCell>
													<TableCell align="left">
														<AlarmIcon style={{ color: '#0ff', verticalAlign: 'middle' }} />
													</TableCell>
													<TableCell component="th" scope="row" align="left">
														{getTimeMultiplierText()}
													</TableCell>
												</TableRow>
												{getFluxPriceRow()}
											</TableBody>
										</Table>
									</TableContainer>
								</Box>
							</>
						),
						action: <>Mint {mintableTokenShortName}</>,
						actionIcon: <RedeemIcon />,
						onClick: () => {
							if (isPlayingGame) {
								dispatch({
									type: commonLanguage.commands.Market.ShowGameDialog,
									payload: { game: isPlayingGameDatamineGems ? Game.DatamineGems : Game.HodlClicker },
								});
							} else {
								dispatch({ type: commonLanguage.commands.Dialog.Show, payload: { dialog: DialogType.Mint } });
							}
						},
						learnMoreHref: isHelpPageEnabled ? '#help/dashboard/mintFluxTokens' : undefined,
					};
				}
			}
			return {
				title: <>Start Validator</>,
				body: (
					<>
						<Box mx={2} mt={3}>
							{mintableTokenShortName} minting is enabled! You can now begin by clicking &quot;Start Validator&quot;
							button below. After starting your validator you will instantly start generating {mintableTokenShortName}{' '}
							tokens!
						</Box>
					</>
				),
				action: <>Start Validator</>,
				actionIcon: <LockIcon />,
				onClick: () => {
					dispatch({ type: commonLanguage.commands.Dialog.Show, payload: { dialog: DialogType.LockIn } });
				},
				learnMoreHref: isHelpPageEnabled ? '#help/dashboard/startingDecentralizedMint' : undefined,
			};
		}
		const getMintingText = () => {
			if (isArbitrumMainnet) {
				return `To run your own ${mintableTokenShortName} validator you must first enable minting on Arbitrum L2. Click the "Enable" button below to continue.`;
			}
			return `To run your own validator you must first enable ${mintableTokenShortName} minting. Click the "Enable" button below to continue.`;
		};
		return {
			title: (
				<>
					<Grid container justifyContent="space-between">
						<Grid>Liquidity Dashboard {getMintHeaderLabel()}</Grid>
						<Grid>
							<FormControlLabel
								value="start"
								control={
									<Switch
										checked={forecastSettings.enabled}
										color="secondary"
										onChange={() => dispatch({ type: commonLanguage.commands.Forecasting.ToggleMode })}
									/>
								}
								label={
									<>
										<Grid container alignItems="center">
											<Grid>
												<Box mr={0.5}>
													<DateRangeIcon />
												</Box>
											</Grid>
											<Grid>
												{forecastSettings.enabled ? (
													<Typography component="div" color="secondary">
														Forecasting Calculator Enabled
													</Typography>
												) : (
													<Typography component="div">Forecasting Calculator</Typography>
												)}
											</Grid>
										</Grid>
									</>
								}
								labelPlacement="start"
							/>
						</Grid>
					</Grid>
				</>
			),
			body: (
				<>
					<Box mx={2} mt={3}>
						{getMintingText()}
					</Box>
				</>
			),
			action: <>Enable</>,
			actionIcon: <PowerSettingsNewIcon />,
			onClick: () => {
				dispatch({ type: commonLanguage.commands.Flux.AuthorizeOperator });
			},
			learnMoreHref: isHelpPageEnabled ? '#help/onboarding/connectingMetamask' : undefined,
		};
	};
	const ctaDetails = getCtaDetails();
	if (!ctaDetails) {
		return null;
	}
	const { disabledText } = ctaDetails;
	const getButton = () => {
		const lockedInDamAmount = addressLock.amount;
		const isLocked = lockedInDamAmount !== 0n;
		if (isPlayingGame && isLocked) {
			return (
				<Button
					color="secondary"
					size="large"
					variant="outlined"
					onClick={() => ctaDetails.onClick()}
					startIcon={
						<Box display="flex" style={{ color: '#0ff' }}>
							{ctaDetails.actionIcon}
						</Box>
					}
				>
					Collect Rewards
				</Button>
			);
		}
		const button = (
			<Button
				color="secondary"
				disabled={!!disabledText}
				size="large"
				variant="outlined"
				onClick={() => ctaDetails.onClick()}
				startIcon={
					<Box display="flex" style={{ color: '#0ff' }}>
						{ctaDetails.actionIcon}
					</Box>
				}
			>
				{ctaDetails.action}
			</Button>
		);
		if (disabledText) {
			return (
				<LightTooltip title={disabledText}>
					<Box display="inline-block">{button}</Box>
				</LightTooltip>
			);
		}
		return button;
	};
	const getBridgeButton = () => {
		if (isArbitrumOnlyToken) {
			return null;
		}
		if (ecosystem === Ecosystem.Lockquidity) {
			return;
		}
		const startIcon = !isArbitrumMainnet ? ArbitrumLogo : EthereumPurpleLogo;
		// The link to Arbitrum bridge must be based on "L1" mintable token address
		const { mintableTokenContractAddress } = ecosystemConfig;
		return (
			<Box mr={1}>
				<LightTooltip title="Click to open Arbitrum L2 Bridge">
					<Button
						size="small"
						variant="outlined"
						color="secondary"
						href={`https://bridge.arbitrum.io?l2ChainId=42161&token=${mintableTokenContractAddress}`}
						rel="noopener noreferrer"
						target="_blank"
						startIcon={<img src={startIcon} width="24" height="24" />}
					>
						Bridge To {isArbitrumMainnet ? 'L1' : 'L2'}
					</Button>
				</LightTooltip>
			</Box>
		);
	};
	const getRealtimePrices = () => {
		const getIcon = (type: Token) => {
			const getIconPath = () => {
				switch (ecosystem) {
					case Ecosystem.ArbiFlux:
						return type === Token.Lockable ? fluxLogo : arbiFluxLogo;
					case Ecosystem.Flux:
						return type === Token.Lockable ? damLogo : fluxLogo;
					case Ecosystem.Lockquidity:
						return type === Token.Lockable ? arbiFluxLogo : lockquidityLogo;
				}
			};
			switch (type) {
				case Token.ETH:
					return <img src={EthereumPurpleLogo} width={24} height={24} style={{ verticalAlign: 'middle' }} />;
				default:
					return <img src={getIconPath()} width={24} height={24} style={{ verticalAlign: 'middle' }} />;
			}
		};
		const getFluxPrice = () => {
			const shortFluxPrice = `${getPriceToggle({ value: 1n * 10n ** 18n, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: mintableTokenPriceDecimals })}`;
			const actualFluxPrice = `$ ${shortFluxPrice}`;
			return (
				<>
					<Box display="inline" className={classes.topLeftPrices}>
						{getIcon(Token.Mintable)}{' '}
						<Typography component="div" variant="body2" color="textSecondary" display="inline">
							{mintableTokenShortName}:
						</Typography>{' '}
						{actualFluxPrice}
					</Box>
				</>
			);
		};
		const getDamPrice = () => {
			const shortDamPrice = `${getPriceToggle({ value: 1n * 10n ** 18n, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 4 })}`;
			const actualDamPrice = `$ ${shortDamPrice}`;
			return (
				<>
					<Box display="inline" className={classes.topLeftPrices}>
						{getIcon(Token.Lockable)}{' '}
						<Typography component="div" variant="body2" color="textSecondary" display="inline">
							{lockableTokenShortName}:
						</Typography>{' '}
						{actualDamPrice}
					</Box>
				</>
			);
		};
		const getEthPrice = () => {
			const shortFluxPrice = `${getPriceToggle({ value: 1n * 10n ** 18n, inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2 })}`;
			const actualFluxPrice = `$ ${shortFluxPrice}`;
			return (
				<>
					<Box display="inline" className={classes.topLeftPrices}>
						{getIcon(Token.ETH)}{' '}
						<Typography component="div" variant="body2" color="textSecondary" display="inline">
							ETH:
						</Typography>{' '}
						{actualFluxPrice}
					</Box>
				</>
			);
		};
		return (
			<>
				<Grid
					container
					justifyContent="space-between"
					alignItems="center"
					spacing={3}
					className={classes.topLeftPricesContainer}
				>
					<Grid>{getFluxPrice()}</Grid>
					<Grid>{getDamPrice()}</Grid>
					<Grid>{getEthPrice()}</Grid>
				</Grid>
			</>
		);
	};
	const getLearnMoreButton = () => {
		if (!isHelpPageEnabled) {
			return null;
		}
		return (
			<Box ml={2} display={'inline-block'}>
				<Link href={ctaDetails.learnMoreHref} rel="noopener noreferrer" target="_blank">
					<Button size="large">Learn More</Button>
				</Link>
			</Box>
		);
	};
	return (
		<>
			<Box mb={1.5}>
				<Grid container justifyContent="space-between" alignItems="center" className={classes.topContainer} spacing={3}>
					<Grid>{getRealtimePrices()}</Grid>
					<Grid>
						<Grid
							container
							justifyContent="flex-end"
							alignItems="center"
							className={classes.topRightContainer}
							spacing={2}
						>
							<Grid>{getBridgeButton()}</Grid>
							<Grid>
								{getNetworkDropdown({
									ecosystem,
									connectionMethod,
									dispatch,
									width: 260,
								})}
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</Box>
			<Card elevation={5}>
				<CardContent>
					<Typography variant="h5" component="h2">
						{ctaDetails.title}
					</Typography>
					<Box mt={1} mb={1}>
						<Divider />
					</Box>
					<Box mt={1}>{ctaDetails.body}</Box>
				</CardContent>
				<CardActions>
					<Box mx={2} width="100%">
						<Grid container justifyContent="space-between" alignItems="flex-end">
							<Grid>
								<Box mb={2}>
									{getButton()}
									{getLearnMoreButton()}
								</Box>
							</Grid>
							{ctaDetails.bottomRightItem}
						</Grid>
					</Box>
				</CardActions>
			</Card>
		</>
	);
};

export default CallToActionCard;
