import { Box, Button, Card, CardActions, CardContent, Chip, Divider, FormControlLabel, LinearProgress, Link, Slider, Switch, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from '@mui/material';
import React, { useContext } from 'react';

import Grid from '@mui/material/Grid2';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import Big from 'big.js';
import BN from 'bn.js';
import { Web3Context } from '../../../web3/Web3Context';
import { Balances, ClientSettings, commonLanguage, ConnectionMethod, ForecastSettings } from '../../../web3/web3Reducer';

import AlarmIcon from '@mui/icons-material/Alarm';
import AppsIcon from '@mui/icons-material/Apps';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/AvTimer';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LockIcon from '@mui/icons-material/PlayArrow';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import RedeemIcon from '@mui/icons-material/Redeem';
import WhatshotIcon from '@mui/icons-material/Whatshot';

import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import moment, { Moment } from 'moment';
import { Ecosystem, Layer } from '../../../../configs/config.common';
import arbiFluxLogo from '../../../../svgs/arbiFluxLogo.svg';
import ArbitrumLogo from '../../../../svgs/arbitrum.svg';
import EthereumPurpleLogo from '../../../../svgs/ethereumPurple.svg';
import fluxLogo from '../../../../svgs/fluxLogo.svg';
import lockquidityLogo from '../../../../svgs/lockquidity.svg';
import damLogo from '../../../../svgs/logo.svg';
import { DialogType, FluxAddressDetails, FluxAddressLock, FluxAddressTokenDetails, MarketAddressLock, Token } from '../../../interfaces';
import { formatMoney } from '../../../utils/formatMoney';
import { getApy, TokenPair } from '../../../utils/getApy';
import { getRequiredFluxToBurn, getRequiredFluxToBurnDecimal, numberWithCommas } from '../../../web3/helperElements';
import { BNToDecimal, getBlocksRemaining, getFormattedMultiplier, getPriceToggle, getPriceToggleBig } from '../../../web3/helpers';
import LightTooltip from '../LightTooltip';

import { tss } from 'tss-react/mui';
import { getEcosystemConfig as getConfig, getEcosystemConfig } from '../../../../configs/config';
import { getNetworkDropdown } from '../Fragments/EcosystemDropdown';

const useStyles = tss.create(({ theme }) => ({
	progressBarLeft: {
		height: '15px',
		borderTopLeftRadius: '5px',
		borderBottomLeftRadius: '5px'
	},
	progressBarRight: {
		height: '15px',
		borderTopRightRadius: '5px',
		borderBottomRightRadius: '5px'
	},
	formCell: {
		paddingTop: 0,
		paddingBottom: 0
	},
	largeSlider: {
		'& .MuiSlider-rail': {
			height: 15,
			borderRadius: 5
		},
		'& .MuiSlider-track': {
			height: 15,
			borderRadius: 5
		},
		'& .MuiSlider-thumb': {
			width: 26,
			height: 26,
			border: '2px solid #187a82'
		}
	},
	datePicker: {
		'& .MuiPickersDay-current': {
			color: '#0FF'
		},
		'& .MuiPickersYear-yearSelected': {
			color: '#0FF'
		},

		'& .MuiPickersDay-daySelected': {
			backgroundColor: '#303030'
		},

	},
	tableContainer: {
		'& .MuiTableCell-root': {
			padding: 11,
			borderBottomColor: '#32333d'
		}
	},
	topLeftPrices: {
		color: '#FFF'
	},
	topLeftPricesContainer: {
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column'
		}
	},
	topRightContainer: {
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column'
		}
	},
	topContainer: {
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column'
		}

	}
}));


interface RenderParams {
	addressLock: FluxAddressLock;
	selectedAddress: string;
	displayedAddress: string;
	addressDetails: FluxAddressDetails;
	addressTokenDetails: FluxAddressTokenDetails;
	balances: Balances;
	forecastSettings: ForecastSettings;
	clientSettings: ClientSettings;
	dispatch: React.Dispatch<any>;
	ecosystem: Ecosystem;
	connectionMethod: ConnectionMethod;
	marketAddressLock: MarketAddressLock;
}
const Render: React.FC<RenderParams> = React.memo(({ addressLock, balances, selectedAddress, displayedAddress, addressDetails, addressTokenDetails, dispatch, forecastSettings, clientSettings, ecosystem, connectionMethod, marketAddressLock }) => {
	const { classes } = useStyles();

	const { navigation, isArbitrumOnlyToken, lockableTokenShortName, mintableTokenShortName, isTokenLogoEnabled, maxBurnMultiplier, minBurnMultiplier, mintableTokenMintPerBlockDivisor, mintableTokenPriceDecimals, mintableTokenContractAddress } = getConfig(ecosystem)
	const { isHelpPageEnabled } = navigation

	const ecosystemConfig = getEcosystemConfig(ecosystem)
	const isArbitrumMainnet = ecosystemConfig.layer === Layer.Layer2;

	const isMarketLock = addressLock && ecosystemConfig.marketAddress && ecosystemConfig.marketAddress.toLowerCase() === addressLock.minterAddress

	// Prevent inputs from autofills
	const removeAutocompleteProps = {
		'data-lpignore': 'true', 'data-form-type': 'other', autocomplete: "off"
	}

	// Only show CTA once account is loaded
	if (addressDetails === null || selectedAddress === null) {
		return null;
	}

	const getMintHeaderLabel = () => {
		if (!isArbitrumMainnet || isArbitrumOnlyToken) {
			return null;
		}

		return <>
			<Typography component="div" color="textSecondary" display="inline">&nbsp;(Arbitrum L2)</Typography>
		</>
	}
	const getCtaDetails = () => {
		const isForecastingModeEnabled = forecastSettings.enabled
		if (addressTokenDetails.isFluxOperator || isForecastingModeEnabled) {

			if (addressLock && addressDetails) {
				const lockedInDamAmount = new BN(addressLock.amount);
				const isLocked = !lockedInDamAmount.isZero()


				if (isLocked || isForecastingModeEnabled) {
					const { minterAddress } = addressLock;
					const isDelegatedMinter = selectedAddress?.toLowerCase() === minterAddress?.toLowerCase(); // Lowercase for WalletConnect

					const getLockedInAmountArea = () => {
						const getAmount = () => {
							return addressLock.amount
						}
						const amount = getAmount()

						if (forecastSettings.enabled) {
							return <>
								<TextField
									label={`${lockableTokenShortName} Amount`}
									variant="outlined"
									size="small"
									autoFocus
									onFocus={(e) => e.target.select()}
									value={forecastSettings.forecastAmount}
									onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetAmount, payload: e.target.value })} />
							</>
						}


						return `${BNToDecimal(amount, true)}`
					}

					const getUnmintedBlocks = () => {
						if (forecastSettings.enabled) {
							return forecastSettings.blocks
						}
						return addressDetails.blockNumber - addressLock.lastMintBlockNumber;
					}

					const isCurrentAddress = selectedAddress === displayedAddress;
					const getBurnButton = () => {
						if (isMarketLock) {
							return
						}
						const showBurnDialog = () => {
							dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Burn } })
						}

						const getButton = () => {
							const isDisabled = !isCurrentAddress || addressDetails.fluxBalance.isZero()
							const button = <Button disabled={isDisabled} size="small" variant="outlined" onClick={() => showBurnDialog()} startIcon={<WhatshotIcon style={{ color: '#ff9b00' }} />}>Burn {mintableTokenShortName}</Button>

							if (addressDetails.fluxBalance.isZero()) {
								return <LightTooltip title={`This address must have ${mintableTokenShortName} tokens to burn.`}><Box display="inline-block">{button}</Box></LightTooltip>
							}
							if (!isCurrentAddress) {
								return <LightTooltip title={`You must select this account in your wallet to Burn ${mintableTokenShortName} for this address.`}><Box display="inline-block">{button}</Box></LightTooltip>
							}

							return button;
						}

						return <Box mx={1} display="inline-block">{getButton()}</Box>
					}

					const unmintedBlocks = getUnmintedBlocks()

					const getLockedInAmount = () => {
						if (forecastSettings.enabled) {
							return forecastSettings.amount
						}
						return addressLock.amount;
					}

					const rawAmount = getLockedInAmount().div(new BN(10).pow(new BN(mintableTokenMintPerBlockDivisor))).mul(new BN(unmintedBlocks));

					const rawAmountBig = new Big(rawAmount.toString(10))

					const blanceWithoutBonusesInUsdc = getPriceToggleBig({ valueBig: rawAmountBig.mul(minBurnMultiplier), inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 6 });


					const blanceWitMaxBonusesInUsdc = getPriceToggle({ value: rawAmount.mul(new BN(3 * maxBurnMultiplier)), inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 6 });

					const getMintAmount = () => {
						if (forecastSettings.enabled) {
							const percentMultiplier = new BN("10000");
							return rawAmount.mul(new BN(forecastSettings.forecastBurn)).div(percentMultiplier).mul(new BN(forecastSettings.forecastTime)).div(percentMultiplier)
						}
						return addressDetails.mintAmount
					}

					const getUsdcMint = () => {
						const mintAmount = getMintAmount();

						const balanceInUsdc = getPriceToggle({ value: mintAmount, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 6, removeCommas: true });

						const getMintTooltip = () => {
							const getMaxMultipliers = () => {
								if (blanceWitMaxBonusesInUsdc === blanceWithoutBonusesInUsdc) {
									return null;
								}
								return <TableRow>
									<TableCell>
										With x{3 * maxBurnMultiplier} Multiplier
									</TableCell>
									<TableCell align="right">
										$ {blanceWitMaxBonusesInUsdc} USD
									</TableCell>
								</TableRow>
							}
							return <>
								<Table size="small">

									<TableBody>
										<TableRow>
											<TableCell width={20}>
												Without Multipliers
											</TableCell>
											<TableCell align="right">
												$ {blanceWithoutBonusesInUsdc} USD
											</TableCell>
										</TableRow>
										{getMaxMultipliers()}
									</TableBody>
								</Table>
							</>
						}

						const amount = parseFloat(balanceInUsdc) * clientSettings.priceMultiplier
						const moneyAmount = formatMoney({ amount, currency: clientSettings.currency })

						return <>
							<LightTooltip title={getMintTooltip()}>
								<Box>
									{moneyAmount} <Typography component="div" color="textSecondary" display="inline">{clientSettings.currency}</Typography>
								</Box>
							</LightTooltip>
						</>
					}

					const { isTargetReached, fluxRequiredToBurn, fluxRequiredToBurnInUsdc } = getRequiredFluxToBurn({ addressDetails, addressLock, balances, ecosystem, targetMultiplier: new Big(maxBurnMultiplier - minBurnMultiplier) });


					const getFluxBurnTooltip = () => {
						const getBurnTooltip = () => {
							return <>
								<Box fontWeight="bold">{fluxRequiredToBurn} {mintableTokenShortName}</Box>
								<Box fontWeight="bold">{fluxRequiredToBurnInUsdc}</Box>
							</>
						}
						const getDescription = () => {
							if (isTargetReached) {
								return <>You've burned enough {mintableTokenShortName} for x10 burn bonus. <Typography component="div" color="secondary" display="inline">OVERBURNED</Typography> {mintableTokenShortName} remaining: </>
							}
							return <>The amount of {mintableTokenShortName} you burn is permanent and will be used in the burn ratio equation. To get the full {maxBurnMultiplier}x burn bonus you will need to burn</>
						}
						return <>
							{getDescription()}
							<Box py={2}>
								<Divider />
							</Box>
							<Box fontWeight="bold">{getBurnTooltip()}</Box>
						</>
					}


					const getStartDateArea = () => {
						if (!forecastSettings.enabled) {
							return null
						}
						const getStartArea = () => {
							const value = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(parseFloat(forecastSettings.forecastStartBlocks) / (60 / 12), 'minutes')

							const getBlocksDropdown = () => {
								return <LocalizationProvider dateAdapter={AdapterMoment}>
									<MobileDatePicker
										closeOnSelect={true}
										value={value}
										//autoOk={true}
										/*PopoverProps={{
											anchorOrigin: {
												vertical: 'top',
												horizontal: 'left',
											},
											transformOrigin: {
												vertical: 'bottom',
												horizontal: 'right',
											},
											className: classes.datePicker
										}}
										inputFormat="YYYY/MM/DD"
										renderInput={(props: any) => <TextField
											type="text"

											name="startBlocks"
											//variant="inline"
											label="From"
											//inputVariant="outlined"
											//value={new Date()}
											size="small"
											{...props}
											inputProps={{
												...props.inputProps,
												...removeAutocompleteProps
											} as any}
										/>}*/

										onChange={(date: any) => {
											if (date) {
												date = date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

												const currentDate = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

												const blocksDiff = date.diff(currentDate, 'minutes') * (60 / 12)
												//const additionalBlocks = addressLock.amount.isZero() ? 0 : (forecastSettings.alreadyMintedBlocks)

												dispatch({ type: commonLanguage.commands.ForecastSetStartBlocks, payload: (blocksDiff).toString() })
											}
										}}
									/>
								</LocalizationProvider>
							}
							return <>
								<Box display="flex" alignItems="center">
									{getBlocksDropdown()}
									{/*}
										<TextField
											label="Blocks"
											variant="outlined"
											size="small"
											onFocus={(e) => e.target.select()}
											value={forecastSettings.forecastBlocks}
											onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetBlocks, payload: e.target.value })} />
										<BlocksDropdown onClick={(blocks) => dispatch({ type: commonLanguage.commands.ForecastSetBlocks, payload: blocks.toString() })} />
										*/}
								</Box>


							</>
						}

						return <TableRow>
							<TableCell align="left">
								<Typography component="div" color="textSecondary" variant="body1">
									Mint Start Date / Last Mint Date
								</Typography>
							</TableCell>
							<TableCell align="left">
								<InsertInvitationIcon style={{ color: '#00ffff', verticalAlign: 'middle' }} />
							</TableCell>
							<TableCell component="th" scope="row" align="left">
								{getStartArea()}
							</TableCell>
						</TableRow>
					}

					const getUnmintedBlocksArea = () => {
						const blocksDiff = addressDetails.blockNumber - addressLock.lastMintBlockNumber;


						if (forecastSettings.enabled) {
							//const additionalBlocks = forecastSettings.forecastStartBlocks
							const value = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(parseFloat(forecastSettings.forecastBlocks) / (60 / 12), 'minutes')

							const getBlocksDropdown = () => {
								return <LocalizationProvider dateAdapter={AdapterMoment}>
									<MobileDatePicker
										closeOnSelect={true}
										/*
										renderInput={(props: any) => <TextField
											type="text"
											name="endBlocks"
											//variant="inline"
											label="From"
											//inputVariant="outlined"
											//value={new Date()}
											size="small"

											{...props}
											inputProps={{
												...props.inputProps,
												...removeAutocompleteProps
											} as any}
										/>}
										inputFormat="YYYY/MM/DD"
										*/
										label="To"
										//value={new Date()}
										value={value}

										onChange={(date: Moment | null) => {
											if (date) {
												date = date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

												const currentDate = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

												const blocksDiff = date.diff(currentDate, 'minutes') * (60 / 12)
												//const additionalBlocks = addressLock.amount.isZero() ? 0 : (forecastSettings.alreadyMintedBlocks)

												dispatch({ type: commonLanguage.commands.ForecastSetBlocks, payload: blocksDiff.toString() })
											}
										}}
									/>
								</LocalizationProvider>
							}
							return <>
								<Box display="flex" alignItems="center">
									{getBlocksDropdown()}
									{/*}
									<TextField
										label="Blocks"
										variant="outlined"
										size="small"
										onFocus={(e) => e.target.select()}
										value={forecastSettings.forecastBlocks}
										onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetBlocks, payload: e.target.value })} />
									<BlocksDropdown onClick={(blocks) => dispatch({ type: commonLanguage.commands.ForecastSetBlocks, payload: blocks.toString() })} />
									*/}
								</Box>


							</>
						}

						return <>x {blocksDiff}</>
					}

					const getUnmintedBlocksDuration = () => {
						if (forecastSettings.enabled) {
							const blocksRemaining = getBlocksRemaining(forecastSettings.blocks, 0, 0, 'None', false)

							const getForecastedDate = () => {
								const blocksDuration = Math.max(0, forecastSettings.blocks + (addressLock.lastMintBlockNumber - addressDetails.blockNumber)); // This number comes from migration (28 days approx)
								if (blocksDuration === 0 || true) {
									return null;
								}

							}

							return <>{blocksRemaining}{getForecastedDate()}</>
						}
						return getBlocksRemaining(addressDetails.blockNumber, 0, addressLock.lastMintBlockNumber, 'None', false)
					}

					const getBurnSlider = () => {
						if (forecastSettings.enabled) {
							return <Slider
								color="secondary"
								valueLabelDisplay="off"
								value={forecastSettings.forecastBurn}
								className={classes.largeSlider}
								min={10000 * minBurnMultiplier}
								max={10000 * maxBurnMultiplier}
								onChange={(event: any, newValue: number | number[]) => {
									dispatch({ type: commonLanguage.commands.ForecastSetBurn, payload: newValue as number });
								}}
							/>
						}
						const maxBurnBarWidth = 10000 * maxBurnMultiplier

						return <Box mt={0.5}>
							<Grid container>
								<Grid style={{ width: `${Math.floor((addressDetails.addressBurnMultiplier / maxBurnBarWidth) * 100)}%` }}>
									<LightTooltip title={getFluxBurnTooltip()}>
										<LinearProgress variant="determinate" value={100} color="secondary" className={classes.progressBarLeft} />
									</LightTooltip>
								</Grid>
								<Grid style={{ width: `${Math.ceil(((maxBurnBarWidth - addressDetails.addressBurnMultiplier) / maxBurnBarWidth) * 100)}%` }}>
									<LightTooltip title={getFluxBurnTooltip()}>
										<LinearProgress variant="determinate" value={0} color="secondary" className={classes.progressBarRight} />
									</LightTooltip>
								</Grid>
							</Grid>
						</Box>
					}

					const getTimeSlider = () => {
						if (forecastSettings.enabled) {
							return <Slider
								color="secondary"
								valueLabelDisplay="off"
								value={forecastSettings.forecastTime}
								className={classes.largeSlider}
								min={10000}
								max={30000}
								onChange={(event: any, newValue: number | number[]) => {
									dispatch({ type: commonLanguage.commands.ForecastSetTime, payload: newValue as number });
								}}
							/>
						}

						return <Box mt={0.5}>
							<Grid container>
								<Grid style={{ width: `${Math.floor((addressDetails.addressTimeMultiplier / 30000) * 100)}%` }}>
									<LightTooltip title="Your current bonus is permanent for duration of your started mint. If you stop your validator this bonus is reset.">
										<LinearProgress variant="determinate" value={100} color="secondary" className={classes.progressBarLeft} />
									</LightTooltip>
								</Grid>
								<Grid style={{ width: `${Math.ceil(((30000 - addressDetails.addressTimeMultiplier) / 30000) * 100)}%` }}>
									<LightTooltip title={`You will receive the full x3 Time Bonus multiplier after leaving your ${lockableTokenShortName} locked-in for another ${getBlocksRemaining(addressLock.blockNumber, 161280 + 5760, addressDetails.blockNumber, 'Awaiting Mint Start')}`}>
										<LinearProgress variant="determinate" value={0} color="secondary" className={classes.progressBarRight} />
									</LightTooltip>
								</Grid>
							</Grid>
						</Box>
					}

					const getBurnMultiplierText = () => {
						if (forecastSettings.enabled) {
							return <>
								<TextField
									label="Burn Multiplier"
									variant="outlined"
									size="small"
									inputProps={{
										maxLength: 7,
									}}
									onFocus={(e) => e.target.select()}
									value={forecastSettings.forecastBurnAmount}
									onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetBurnAmount, payload: e.target.value })} />
							</>
						}


						return getFormattedMultiplier(addressDetails.addressBurnMultiplier)
					}
					const getTimeMultiplierText = () => {
						if (forecastSettings.enabled) {
							return <>
								<TextField
									label="Mint Age Multiplier"
									variant="outlined"
									size="small"
									inputProps={{
										maxLength: 7,
									}}
									onFocus={(e) => e.target.select()}
									value={forecastSettings.forecastTimeAmount}
									onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetTimeAmount, payload: e.target.value })} />
							</>
						}

						return getFormattedMultiplier(addressDetails.addressTimeMultiplier)
					}

					const getBurnBonusDescription = () => {

						const getTargetBurnMultiplier = () => {
							if (forecastSettings.enabled) {
								return Math.floor(forecastSettings.forecastBurn / 10000)
							}

							return 1;
						}

						const getTargetBurnMultiplierDecimal = () => {
							if (forecastSettings.enabled) {
								return (forecastSettings.forecastBurn / 10000)
							}

							return 1;
						}

						if (forecastSettings.enabled) {
							const fluxRequiredToBurn = getRequiredFluxToBurnDecimal({
								ecosystem,
								globalFluxBurned: new Big(addressDetails.globalBurnedAmount.toString()),
								targetMultiplier: getTargetBurnMultiplierDecimal(),
								globalDamLockedIn: new Big(addressDetails.globalLockedAmount.toString()),
								myFluxBurned: new Big(addressLock.burnedAmount.toString()),
								myDamLockedIn: new Big(forecastSettings.amount.toString()),
							})

							if (fluxRequiredToBurn.gt(new Big(0))) {
								const actualFluxRequiredToBurn = fluxRequiredToBurn.mul(new Big(10).pow(18)).round(0).toFixed()
								const amountToBurnUsd = getPriceToggle({ value: new BN(actualFluxRequiredToBurn), inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })
								return <>(~<strong style={{ color: '#0FF' }}>{numberWithCommas(fluxRequiredToBurn.toFixed(4))} {mintableTokenShortName}</strong> / <strong style={{ color: '#0FF' }}>${amountToBurnUsd}</strong> left to burn for x{getTargetBurnMultiplierDecimal().toFixed(4)} burn multiplier)</>
							}

						}


						return <>(Applied at time of mint, x{maxBurnMultiplier} max)</>
					}
					const getDisabledText = () => {
						if (!isLocked) {
							return <>This option will be available once you start your validator in this address.</>
						}
						if (!isDelegatedMinter) {
							return <>Select the <Box fontWeight="bold" display="inline">Delegated Minter Address</Box> account in your wallet to mint for this address.</>
						}
						if (isForecastingModeEnabled) {
							return <>You must disable forecasting mode to mint.</>
						}

						return null
					}

					const getFluxPriceRow = () => {
						if (!isForecastingModeEnabled) {
							return null;
						}
						//return null //@todo
						const getPriceArea = () => {
							const blocksDiff = addressDetails.blockNumber - addressLock.lastMintBlockNumber;

							if (forecastSettings.enabled) {
								return <>
									<Box display="flex">
										<TextField
											label="Price"
											variant="outlined"
											size="small"
											value={forecastSettings.forecastFluxPrice}
											onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetFluxPrice, payload: e.target.value })} />
									</Box>
								</>
							}

							return <>x {blocksDiff}</>
						}
						return <TableRow>
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
					}

					const getUnmintedBlocksText = () => {
						if (forecastSettings.enabled) {

							return <>
								Forecasted {forecastSettings.blocks.toFixed(0)} Unminted Blocks <LightTooltip title="This estimated time is based on assumption that 1 Ethereum Block is genereated every 12 seconds"><Box display="inline">({getUnmintedBlocksDuration()})</Box></LightTooltip>
							</>
						}

						return <>
							Unminted Blocks <LightTooltip title="This estimated time is based on assumption that 1 Ethereum Block is genereated every 12 seconds"><Box display="inline">({getUnmintedBlocksDuration()})</Box></LightTooltip>
						</>
					}

					const getDamLockedUsdc = () => {
						const lockedAmount = forecastSettings.enabled ? new Big(forecastSettings.forecastAmount).mul(new Big(10).pow(18)) : new Big(addressLock?.amount.toString());
						if (lockedAmount.toString() === '0') {
							return null;
						}

						const usdcAmount = getPriceToggle({ value: new BN(lockedAmount.toFixed(0)), inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })
						return `($ ${usdcAmount} USD)`
					}

					const getApyHeader = () => {
						if (!balances) {
							return null;
						}

						const apyPools = new Map<TokenPair, any>();
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
						}
						const burnMultiplier = getBurnMultiplier();

						const apy = getApy(ecosystem, apyPools)
						if (!apy) {
							return null;
						}
						const actualApy = apy.apyPercent.noBurn * burnMultiplier
						if (!actualApy) {
							return null
						}

						return <>
							<Typography component="div" color="textSecondary" display="inline">&nbsp;({actualApy.toFixed(2)}% Base APY)</Typography>
						</>
					}

					const getMarketRewards = () => {

						const getAmountReceived = (): BN | null => {
							const amountBN = getMintAmount();

							try {
								const rewardsAmount = amountBN.add(amountBN.mul(new BN(marketAddressLock.rewardsPercent)).div(new BN(10000)))
								return rewardsAmount
							} catch {
								return null
							}
						}
						const amountReceived = getAmountReceived()

						if (!amountReceived) {
							return
						}
						if (amountReceived.eq(new BN(0))) {
							return
						}

						const balanceInUsdc = getPriceToggle({ value: amountReceived, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 6, removeCommas: true });

						if (isMarketLock) {
							return <Chip label={`Available Reward For Burning: +$ ${balanceInUsdc}`} color="success" />
						}
					}
					const getBottomRightText = () => {
						if (isMarketLock) {
							return
						}
						return <>
							<Typography component="div" variant="h4">{getUsdcMint()}</Typography>
						</>
					}
					return {
						disabledText: getDisabledText(),
						title: <>
							<Grid container justifyContent="space-between">
								<Grid>
									Liquidity Dashboard{getMintHeaderLabel()}{/*getApyHeader()*/}
								</Grid>
								<Grid>
									<FormControlLabel
										value="start"
										control={<Switch checked={forecastSettings.enabled} color="secondary" onChange={() => dispatch({ type: commonLanguage.commands.ToggleForecastMode })} />}
										label={<>
											<Grid container alignItems="center">
												<Grid>
													<Box mr={0.5}><DateRangeIcon color={forecastSettings.enabled ? 'secondary' : undefined} /></Box>
												</Grid>
												<Grid>
													{forecastSettings.enabled ? <Typography component="div" color="secondary">Forecasting Calculator Enabled</Typography> : <Typography component="div">Forecasting Calculator</Typography>}
												</Grid>
											</Grid>
										</>}
										labelPlacement="start"
									/>
								</Grid>
							</Grid>
						</>,
						bottomRightItem: <Grid>
							<Box textAlign="right">
								<Box display="inline-block" mb={1}>
									<Box mb={1}>
										<Typography component="div" color="textSecondary">
											= {`${BNToDecimal(getMintAmount(), true)} ${mintableTokenShortName}`}
										</Typography>
									</Box>
									{getBottomRightText()}
									{getMarketRewards()}
								</Box>
							</Box>
						</Grid>,
						body: <>
							<Box>
								<TableContainer className={classes.tableContainer} >
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
												<TableCell className={classes.formCell} component="th" scope="row" align="left" style={{ width: 140 }}>
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
													x {(1 / (10 ** mintableTokenMintPerBlockDivisor)).toFixed(mintableTokenMintPerBlockDivisor)}
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
														{mintableTokenShortName} Burn Multiplier <Typography component="div" variant="body2" display="inline">{getBurnBonusDescription()}</Typography>
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
														Mint Age Multiplier <Typography component="div" variant="body2" display="inline">(Applied at time of mint, x3 max)</Typography>
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
						</>,
						action: <>Mint {mintableTokenShortName}</>,
						actionIcon: <RedeemIcon />,
						onClick: () => {
							if (isMarketLock) {

								dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.MarketCollectRewards } })
							} else {

								dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Mint } })
							}
						},
						learnMoreHref: isHelpPageEnabled ? '#help/dashboard/mintFluxTokens' : undefined
					}
				}
			}


			return {
				title: <>Start Validator</>,
				body: <>
					<Box mx={2} mt={3}>{mintableTokenShortName} minting is enabled! You can now begin by clicking "Start Validator" button below. After starting your validator you will instantly start generating {mintableTokenShortName} tokens!</Box>
				</>,
				action: <>Start Validator</>,
				actionIcon: <LockIcon />,
				onClick: () => {
					dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.LockIn } })
				},
				learnMoreHref: isHelpPageEnabled ? '#help/dashboard/startingDecentralizedMint' : undefined
			}
		}

		const getMintingText = () => {
			if (isArbitrumMainnet) {
				return `To run your own ${mintableTokenShortName} validator you must first enable minting on Arbitrum L2. Click the "Enable" button below to continue.`

			}
			return `To run your own validator you must first enable ${mintableTokenShortName} minting. Click the "Enable" button below to continue.`
		}

		return {
			title: <>
				<Grid container justifyContent="space-between">
					<Grid>
						Liquidity Dashboard {getMintHeaderLabel()}
					</Grid>
					<Grid>
						<FormControlLabel
							value="start"
							control={<Switch checked={forecastSettings.enabled} color="secondary" onChange={() => dispatch({ type: commonLanguage.commands.ToggleForecastMode })} />}
							label={<>
								<Grid container alignItems="center">
									<Grid>
										<Box mr={0.5}><DateRangeIcon /></Box>
									</Grid>
									<Grid>
										{forecastSettings.enabled ? <Typography component="div" color="secondary">Forecasting Calculator Enabled</Typography> : <Typography component="div">Forecasting Calculator</Typography>}
									</Grid>
								</Grid>
							</>}
							labelPlacement="start"
						/>
					</Grid>
				</Grid>
			</>,
			body: <><Box mx={2} mt={3}>
				{getMintingText()}
			</Box></>,
			action: <>Enable</>,
			actionIcon: <PowerSettingsNewIcon />,
			onClick: () => {
				dispatch({ type: commonLanguage.commands.AuthorizeFluxOperator });
			},
			learnMoreHref: isHelpPageEnabled ? '#help/onboarding/connectingMetamask' : undefined
		}
	}

	const ctaDetails = getCtaDetails();
	if (!ctaDetails) {
		return null;
	}

	const { disabledText } = ctaDetails;

	const getButton = () => {

		const lockedInDamAmount = new BN(addressLock.amount);
		const isLocked = !lockedInDamAmount.isZero()
		if (isMarketLock && isLocked) {
			return <Button color="secondary" size="large" variant="outlined" onClick={() => ctaDetails.onClick()} startIcon={<Box display="flex" style={{ color: '#0ff' }}>{ctaDetails.actionIcon}</Box>}>
				Collect Rewards
			</Button>
		}

		const button = <Button color="secondary" disabled={!!disabledText} size="large" variant="outlined" onClick={() => ctaDetails.onClick()} startIcon={<Box display="flex" style={{ color: '#0ff' }}>{ctaDetails.actionIcon}</Box>}>
			{ctaDetails.action}
		</Button>

		if (disabledText) {
			return <LightTooltip title={disabledText}><Box display="inline-block">{button}</Box></LightTooltip>
		}

		return button
	}

	const getBridgeButton = () => {
		if (isArbitrumOnlyToken) {
			return null;
		}
		if (ecosystem === Ecosystem.Lockquidity) {
			return;
		}

		const startIcon = !isArbitrumMainnet ? ArbitrumLogo : EthereumPurpleLogo


		// The link to Arbitrum bridge must be based on "L1" mintable token address
		const { mintableTokenContractAddress } = ecosystemConfig

		return <Box mr={1}>
			<LightTooltip title="Click to open Arbitrum L2 Bridge">
				<Button size="small" variant="outlined" color="secondary" href={`https://bridge.arbitrum.io?l2ChainId=42161&token=${mintableTokenContractAddress}`} rel="noopener noreferrer" target="_blank" startIcon={<img src={startIcon} width="24" height="24" />}>Bridge To {isArbitrumMainnet ? 'L1' : 'L2'}</Button>
			</LightTooltip>
		</Box>
	}

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
			}

			switch (type) {
				case Token.ETH:
					return <img src={EthereumPurpleLogo} width={24} height={24} style={{ verticalAlign: 'middle' }} />
				default:
					return <img src={getIconPath()} width={24} height={24} style={{ verticalAlign: 'middle' }} />
			}
		}

		const getFluxPrice = () => {
			const shortFluxPrice = `${getPriceToggle({ value: new BN(1).mul(new BN(10).pow(new BN(18))), inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: mintableTokenPriceDecimals })}`
			const actualFluxPrice = `$ ${shortFluxPrice}`;

			return <>
				<Box display="inline" className={classes.topLeftPrices}>{getIcon(Token.Mintable)} <Typography component="div" variant="body2" color="textSecondary" display="inline">{mintableTokenShortName}:</Typography> {actualFluxPrice}</Box>
			</>
		}
		const getDamPrice = () => {
			const shortDamPrice = `${getPriceToggle({ value: new BN(1).mul(new BN(10).pow(new BN(18))), inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 4 })}`
			const actualDamPrice = `$ ${shortDamPrice}`;

			return <>
				<Box display="inline" className={classes.topLeftPrices}>{getIcon(Token.Lockable)} <Typography component="div" variant="body2" color="textSecondary" display="inline">{lockableTokenShortName}:</Typography> {actualDamPrice}</Box>
			</>
		}
		const getEthPrice = () => {
			const shortFluxPrice = `${getPriceToggle({ value: new BN(1).mul(new BN(10).pow(new BN(18))), inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2 })}`
			const actualFluxPrice = `$ ${shortFluxPrice}`;

			return <>
				<Box display="inline" className={classes.topLeftPrices}>{getIcon(Token.ETH)} <Typography component="div" variant="body2" color="textSecondary" display="inline">ETH:</Typography> {actualFluxPrice}</Box>
			</>
		}
		return <>
			<Grid container justifyContent="space-between" alignItems="center" spacing={3} className={classes.topLeftPricesContainer}>
				<Grid>
					{getFluxPrice()}
				</Grid>
				<Grid>
					{getDamPrice()}
				</Grid>
				<Grid>
					{getEthPrice()}
				</Grid>
			</Grid>
		</>
	}

	const getLearnMoreButton = () => {
		if (!isHelpPageEnabled) {
			return null;
		}
		return (
			<Box ml={2} display={"inline-block"}>
				<Link href={ctaDetails.learnMoreHref} rel="noopener noreferrer" target="_blank">
					<Button size="large">
						Learn More
					</Button>
				</Link>
			</Box>
		)
	}

	return <>
		<Box mb={1.5}>
			<Grid container justifyContent="space-between" alignItems="center" className={classes.topContainer} spacing={3}>
				<Grid>
					{getRealtimePrices()}
				</Grid>
				<Grid>
					<Grid container justifyContent="flex-end" alignItems="center" className={classes.topRightContainer} spacing={2}>
						<Grid>
							{getBridgeButton()}
						</Grid>
						<Grid>
							{getNetworkDropdown(ecosystem, connectionMethod, dispatch)}
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
				<Box mt={1}>
					{ctaDetails.body}
				</Box>
			</CardContent>
			<CardActions>
				<Box mx={2} width="100%">
					<Grid
						container
						justifyContent="space-between"
						alignItems="flex-end">
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
});

const CallToActionCard: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const { addressLock, address, selectedAddress, addressDetails, addressTokenDetails, balances, forecastSettings, clientSettings, ecosystem, connectionMethod, marketAddressLock } = web3State;
	if (!addressLock || !selectedAddress || !addressDetails || !addressTokenDetails || !balances || !connectionMethod || !marketAddressLock) {
		return null;
	}

	const displayedAddress = address ?? selectedAddress

	return <Render
		addressLock={addressLock}
		selectedAddress={selectedAddress}
		addressDetails={addressDetails}
		addressTokenDetails={addressTokenDetails}
		displayedAddress={displayedAddress}
		balances={balances}
		dispatch={web3Dispatch}
		forecastSettings={forecastSettings}
		clientSettings={clientSettings}
		ecosystem={ecosystem}
		connectionMethod={connectionMethod}
		marketAddressLock={marketAddressLock}
	/>
}

export default CallToActionCard;