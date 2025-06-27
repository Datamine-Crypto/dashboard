import { Box, Button, Card, CardContent, Divider, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useContext } from 'react';

import { Web3Context } from '../../../web3/Web3Context';
import { Balances, commonLanguage } from '../../../web3/web3Reducer';

import { OpenInNew, Stop, Whatshot } from '@mui/icons-material';
import { DialogType, FluxAddressDetails, FluxAddressLock, FluxAddressTokenDetails, Token } from '../../../interfaces';
import { BNToDecimal, getBurnRatio, getPriceToggle } from '../../../web3/helpers';

import BN from 'bn.js';
import { tss } from 'tss-react/mui';
import { getEcosystemConfig as getConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import DetailedListItem from '../Fragments/DetailedListItem';
import LightTooltip from '../LightTooltip';

const useStyles = tss.create(({ theme }) => ({
	address: {
		fontSize: '0.7rem',
		letterSpacing: 0,
	},
	detailedListItemsContainer: {
		width: '100%',
	},
}));

/**
 * Props for the Render component within AccountBalancesCard.
 */
interface RenderParams {
	/** The Flux address lock details. */
	addressLock: FluxAddressLock;
	/** The address currently being displayed. */
	displayedAddress: string;
	/** The currently selected address in the wallet. */
	selectedAddress: string;
	/** Detailed information about the Flux address. */
	addressDetails: FluxAddressDetails;
	/** Token-related details for the Flux address. */
	addressTokenDetails: FluxAddressTokenDetails;
	/** Balances of various tokens. */
	balances: Balances;
	/** The dispatch function from the Web3Context. */
	dispatch: React.Dispatch<any>;
	/** The current ecosystem. */
	ecosystem: Ecosystem;
}

/**
 * A memoized functional component that renders the account balances card.
 * It displays various token balances, locked amounts, and related actions for a given address.
 * @param params - Object containing addressLock, displayedAddress, selectedAddress, addressDetails, addressTokenDetails, balances, dispatch, and ecosystem.
 */
const Render: React.FC<RenderParams> = React.memo(
	({
		addressLock,
		selectedAddress,
		addressTokenDetails,
		displayedAddress,
		addressDetails,
		balances,
		dispatch,
		ecosystem,
	}) => {
		const config = getConfig(ecosystem);
		const {
			lockableTokenFullName,
			mintableTokenShortName,
			lockableTokenShortName,
			isLiquidityPoolsEnabled,
			mintableTokenPriceDecimals,
			isLiquidityPoolAdditionalButtonsEnabled,
			liquidityPoolType,
		} = config;

		const { classes } = useStyles();

		const { myRatio } = addressTokenDetails;
		const { minterAddress } = addressLock;

		const isDelegatedMinter = selectedAddress?.toLowerCase() === minterAddress?.toLowerCase(); // Lowercase for WalletConnect
		const isCurrentAddress = selectedAddress === displayedAddress;

		/**
		 * Displays the mint dialog.
		 */
		const showMintDialog = () => {
			dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Mint } });
		};

		const getDelegatedMinterAddress = () => {
			if (new BN(addressLock.amount).isZero()) {
				return null;
			}

			const isSelfMinter = addressLock.minterAddress === displayedAddress;
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

		const getFluxBalance = () => {
			const getBurnButton = () => {
				const showBurnDialog = () => {
					dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Burn } });
				};

				const getButton = () => {
					const isDisabled = !isCurrentAddress || addressDetails.fluxBalance.isZero();
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

					if (addressDetails.fluxBalance.isZero()) {
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
						{BNToDecimal(balances.fluxToken, true, 18, mintableTokenPriceDecimals)} {mintableTokenShortName}
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

		const getDamBalance = () => {
			const getDamBalance = () => {
				return (
					<>
						{BNToDecimal(balances.damToken, true, 18, 2)} {lockableTokenShortName}
					</>
				);
			};
			const getDamBalanceUSD = () => {
				const balanceInUsdc = `$ ${getPriceToggle({ value: balances.damToken, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;
				return <>{balanceInUsdc}</>;
			};
			return (
				<DetailedListItem
					title={`${lockableTokenShortName} Balance:`}
					main={getDamBalance()}
					sub={getDamBalanceUSD()}
				/>
			);
		};

		const getDamLockedIn = () => {
			const getUnlockButton = () => {
				const showUnlockDialog = () => {
					dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Unlock } });
				};

				if (new BN(addressLock.amount).isZero()) {
					return;
				}

				const getButton = () => {
					const button = (
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
							<LightTooltip title="You must select this account in your wallet to stop a validator for this address.">
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

			const getLockedInAmount = () => {
				return (
					<>
						{BNToDecimal(addressLock.amount, true, 18, 4)} {lockableTokenShortName}
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

		const getFluxBurnRatio = () => {
			return (
				<DetailedListItem title={`${mintableTokenShortName} Burn Ratio:`} main={getBurnRatio(myRatio, ecosystem)} />
			);
		};

		const getFluxBurned = () => {
			const getFluxBurnedBalance = () => {
				return (
					<>
						{BNToDecimal(addressLock.burnedAmount, true, 18, mintableTokenPriceDecimals)} {mintableTokenShortName}
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
	}
);

/**
 * AccountBalancesCard component displays the balances and related information for the currently selected Web3 account.
 * It fetches data from the Web3Context and renders various sub-components to show token balances, locked amounts, and actions like burning or unlocking tokens.
 */
const AccountBalancesCard: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context);

	const { addressLock, selectedAddress, address, addressDetails, balances, addressTokenDetails, ecosystem } = web3State;
	if (!addressLock || !selectedAddress || !addressDetails || !balances || !addressTokenDetails) {
		return null;
	}

	return (
		<Render
			addressLock={addressLock}
			selectedAddress={selectedAddress}
			displayedAddress={address ?? selectedAddress}
			addressDetails={addressDetails}
			addressTokenDetails={addressTokenDetails}
			balances={balances}
			dispatch={web3Dispatch}
			ecosystem={ecosystem}
		/>
	);
};

export default AccountBalancesCard;
