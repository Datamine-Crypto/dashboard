import { Box, Button, Card, CardContent, Divider, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
// AppStore for accessing blockchain state and dispatch functions
import { dispatch, useAppStore } from '@/react/utils/appStore';
// Balances and common language constants from the Web3 reducer
import { commonLanguage } from '@/app/state/commonLanguage';
// Material-UI icons for external links, stop, and whatshot
import { OpenInNew, Stop, Whatshot, Settings, Pause, PlayArrow } from '@mui/icons-material';
// Interfaces for dialog types, Flux address details, lock, token details, and token enum
import { DialogType, Token } from '@/app/interfaces';
// Helper functions for decimal conversion, burn ratio calculation, and price toggling
import { formatBigInt, getBurnRatio, getPriceToggle } from '@/utils/mathHelpers';
// Styling utility from tss-react
import { tss } from 'tss-react/mui';
// Ecosystem configuration getter
import { getEcosystemConfig as getConfig } from '@/app/configs/config';
// Ecosystem enum for type safety
// Custom detailed list item component
import DetailedListItem from '@/react/elements/Fragments/DetailedListItem';
// Custom light tooltip component
import LightTooltip from '@/react/elements/LightTooltip';
import { useShallow } from 'zustand/react/shallow';

/**
 * Styles for the AccountBalancesCard component.
 * Defines styles for address display and detailed list items container.
 */
const useStyles = tss.create(() => ({
	address: {
		fontSize: '0.7rem',
		letterSpacing: 0,
	},
	detailedListItemsContainer: {
		width: '100%',
	},
}));

/**
 * AccountBalancesCard component displays the balances and related information for the currently selected Web3 account.
 * It fetches data from the AppStore and renders various sub-components to show token balances, locked amounts, and actions like burning or unlocking tokens.
 */
export const AccountBalancesCard: React.FC = React.memo(function AccountBalancesCard() {
	const {
		addressLock,
		selectedAddress,
		address,
		addressDetails,
		balances,
		addressTokenDetails,
		ecosystem,
		currentAddressHodlClickerAddressLock,
	} = useAppStore(
		useShallow((state) => ({
			addressLock: state.addressLock,
			selectedAddress: state.selectedAddress,
			address: state.address,
			addressDetails: state.addressDetails,
			balances: state.balances,
			addressTokenDetails: state.addressTokenDetails,
			ecosystem: state.ecosystem,
			currentAddressHodlClickerAddressLock: state.currentAddressHodlClickerAddressLock,
		}))
	);
	const { classes } = useStyles();

	// Render nothing if essential data is not yet available
	if (!addressLock || !selectedAddress || !addressDetails || !balances || !addressTokenDetails) {
		return null;
	}

	const displayedAddress = address ?? selectedAddress;

	const config = getConfig(ecosystem);
	const {
		lockableTokenFullName,
		mintableTokenShortName,
		lockableTokenShortName,
		mintableTokenPriceDecimals,
		batchMinterAddress,
		gameHodlClickerAddress,
	} = config;
	const { myRatio } = addressTokenDetails;
	const { minterAddress } = addressLock;
	// Check if the selected address is the delegated minter (case-insensitive)

	// Check if the displayed address is the currently selected address
	const isCurrentAddress = selectedAddress?.toLowerCase() === displayedAddress?.toLowerCase();
	const isSelfMinter = addressLock.minterAddress === displayedAddress;
	/**
	 * Displays the mint dialog by dispatching a SHOW_DIALOG command.
	 */

	/**
	 * Renders the delegated minter address and a tooltip explaining its role.
	 * Returns null if no tokens are locked.
	 */
	const getDelegatedMinterAddress = () => {
		if (addressLock.amount === 0n) {
			return null;
		}
		const getSuffix = () => {
			return (
				<LightTooltip
					title={
						isSelfMinter
							? `The same address that locked-in ${lockableTokenFullName} tokens will mint it's own ${mintableTokenShortName} tokens`
							: `The address that locked-in ${lockableTokenFullName} tokens delegated this address to mint ${mintableTokenShortName} tokens.`
					}
				>
					<Typography color="textSecondary" component="span" display="inline" variant="body2">
						{isSelfMinter ? ' (Self Minter)' : ' (Delegated Minter)'}
					</Typography>
				</LightTooltip>
			);
		};
		return (
			<DetailedListItem
				title={`Minter Address:`}
				main={
					<Box className={classes.address} display="inline-block">
						{addressLock.minterAddress}
					</Box>
				}
				description={getSuffix()}
			/>
		);
	};
	/**
	 * Renders the FLUX/Mintable token balance and a burn button.
	 */
	const getFluxBalance = () => {
		const getBurnButton = () => {
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
						color="secondary"
						onClick={() => showBurnDialog()}
						startIcon={<Whatshot style={{ color: '#ff9b00' }} />}
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
		const getFluxAmount = () => {
			return (
				<>
					{formatBigInt(balances.fluxToken, true, 18, mintableTokenPriceDecimals)} {mintableTokenShortName}
				</>
			);
		};
		const getFluxAmountUSD = () => {
			const balanceInUsdc = `$ ${getPriceToggle({ value: balances.fluxToken, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;
			return <>{balanceInUsdc}</>;
		};
		return (
			<DetailedListItem
				title={`${mintableTokenShortName} Balance:`}
				main={getFluxAmount()}
				sub={getFluxAmountUSD()}
				buttons={[getBurnButton()]}
			/>
		);
	};
	/**
	 * Renders the DAM/Lockable token balance.
	 */
	const getDamBalance = () => {
		const getDamBalance = () => {
			return (
				<>
					{formatBigInt(balances.damToken, true, 18, 2)} {lockableTokenShortName}
				</>
			);
		};
		const getDamBalanceUSD = () => {
			const balanceInUsdc = `$ ${getPriceToggle({ value: balances.damToken, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;
			return <>{balanceInUsdc}</>;
		};
		return (
			<DetailedListItem title={`${lockableTokenShortName} Balance:`} main={getDamBalance()} sub={getDamBalanceUSD()} />
		);
	};
	/**
	 * Renders the amount of DAM/Lockable tokens locked in and an unlock button.
	 */
	const getDamLockedIn = () => {
		const getUnlockButton = () => {
			const showUnlockDialog = () => {
				dispatch({ type: commonLanguage.commands.Dialog.Show, payload: { dialog: DialogType.Unlock } });
			};
			const showMintSettingsDialog = () => {
				dispatch({ type: commonLanguage.commands.Dialog.Show, payload: { dialog: DialogType.MintSettings } });
			};
			const showPauseResumeGameDialog = () => {
				dispatch({ type: commonLanguage.commands.Dialog.Show, payload: { dialog: DialogType.PauseResumeGame } });
			};
			if (addressLock.amount === 0n) {
				return;
			}
			const getStopMintButton = () => {
				const stopMintButton = (
					<Button
						disabled={!isCurrentAddress}
						size="small"
						variant="outlined"
						onClick={() => showUnlockDialog()}
						startIcon={<Stop style={{ color: '#0FF' }} />}
					>
						Stop Mint
					</Button>
				);
				if (!isCurrentAddress) {
					return (
						<LightTooltip
							title={`You must select ${displayedAddress} account in your wallet to stop a validator for this address. Current account: ${selectedAddress}`}
						>
							<Box display="inline-block">{stopMintButton}</Box>
						</LightTooltip>
					);
				}
				return stopMintButton;
			};
			const getMintSettingsButton = () => {
				if (minterAddress?.toLowerCase() !== batchMinterAddress?.toLowerCase()) {
					return;
				}
				const stopMintButton = (
					<Button
						disabled={!isCurrentAddress}
						size="small"
						variant="outlined"
						onClick={() => showMintSettingsDialog()}
						startIcon={<Settings style={{ color: '#0FF' }} />}
					>
						Mint Settings
					</Button>
				);
				if (!isCurrentAddress) {
					return;
				}
				return stopMintButton;
			};
			const getGameSettingsButton = () => {
				// TODO: implement game settings
				return false;
			};
			const getPauseResumeGameButton = () => {
				if (minterAddress?.toLowerCase() !== gameHodlClickerAddress?.toLowerCase()) {
					return;
				}
				const isPaused = currentAddressHodlClickerAddressLock?.isPaused === true;

				const stopMintButton = (
					<Button
						disabled={!isCurrentAddress}
						size="small"
						variant="outlined"
						onClick={() => showPauseResumeGameDialog()}
						startIcon={isPaused ? <PlayArrow style={{ color: '#0FF' }} /> : <Pause style={{ color: '#0FF' }} />}
					>
						{isPaused ? 'Resume' : 'Pause'} Game
					</Button>
				);
				if (!isCurrentAddress) {
					return (
						<LightTooltip
							title={`You must select ${displayedAddress} account in your wallet to pause/resume the game for this address. Current account: ${selectedAddress}`}
						>
							<Box display="inline-block">{stopMintButton}</Box>
						</LightTooltip>
					);
				}
				return stopMintButton;
			};
			return (
				<Box mx={1} display="inline-block">
					{getStopMintButton()} {getMintSettingsButton()} {getGameSettingsButton()} {getPauseResumeGameButton()}
				</Box>
			);
		};
		const getLockedInAmount = () => {
			return (
				<>
					{formatBigInt(addressLock.amount, true, 18, 4)} {lockableTokenShortName}
				</>
			);
		};
		const getLockedInAmountUSD = () => {
			const lockedInUsdc = `$ ${getPriceToggle({ value: addressLock.amount, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;
			return <>{lockedInUsdc}</>;
		};
		return (
			<DetailedListItem
				title={`${lockableTokenShortName} Powering Validators:`}
				main={getLockedInAmount()}
				sub={getLockedInAmountUSD()}
				buttons={[<>{getUnlockButton()}</>]}
			/>
		);
	};
	/**
	 * Renders the FLUX/Mintable token burn ratio.
	 */
	const getFluxBurnRatio = () => {
		return <DetailedListItem title={`${mintableTokenShortName} Burn Ratio:`} main={getBurnRatio(myRatio, ecosystem)} />;
	};
	/**
	 * Renders the total amount of FLUX/Mintable tokens burned.
	 */
	const getFluxBurned = () => {
		const getFluxBurnedBalance = () => {
			return (
				<>
					{formatBigInt(addressLock.burnedAmount, true, 18, mintableTokenPriceDecimals)} {mintableTokenShortName}
				</>
			);
		};
		const getFluxBurnedBalanceUSD = () => {
			const balanceInUsdc = `$ ${getPriceToggle({ value: addressLock.burnedAmount, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;
			return <>{balanceInUsdc}</>;
		};
		return (
			<DetailedListItem
				title={`${mintableTokenShortName} Burned:`}
				main={getFluxBurnedBalance()}
				sub={getFluxBurnedBalanceUSD()}
			/>
		);
	};
	return (
		<Card>
			<CardContent>
				<Grid container justifyContent="space-between" alignItems="center">
					<Grid>
						<Typography variant="h5" component="h2">
							Address Balances
						</Typography>
					</Grid>
					<Grid>
						<Typography component="div" variant="body2" color="textSecondary">
							<LightTooltip title="Click to open address-specific dashboard link">
								<Link
									href={`#dashboard/${displayedAddress}`}
									color="textSecondary"
									target="_blank"
									className={classes.address}
								>
									<Grid container direction="row" justifyContent="center" alignItems="center">
										<Grid>{displayedAddress}</Grid>
										<Grid>
											<Box ml={0.5}>
												<OpenInNew fontSize="small" />
											</Box>
										</Grid>
									</Grid>
								</Link>
							</LightTooltip>
						</Typography>
					</Grid>
				</Grid>
				<Box mt={1} mb={1}>
					<Divider />
				</Box>
				<Grid container>
					<Grid size={{ md: 6 }} className={classes.detailedListItemsContainer}>
						<Box>
							{getFluxBalance()}
							{getFluxBurned()}
							{getFluxBurnRatio()}
						</Box>
					</Grid>
					<Grid size={{ md: 6 }} className={classes.detailedListItemsContainer}>
						{getDamBalance()}
						{getDamLockedIn()}
						{getDelegatedMinterAddress()}
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
});
