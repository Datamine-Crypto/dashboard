import { Box, Button, Card, CardContent, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';

import { useWeb3Context } from '../../../web3/Web3Context';

import { BNToDecimal, getBlocksRemaining } from '../../../web3/helpers';

import BN from 'bn.js';
import { DialogType, FluxAddressDetails, FluxAddressLock, FluxAddressTokenDetails } from '../../../interfaces';
import { Balances, commonLanguage } from '../../../web3/web3Reducer';

import { LockOpen } from '@mui/icons-material';
import Big from 'big.js';
import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import { getRequiredFluxToBurn } from '../../../web3/helpers';
import DetailedListItem from '../Fragments/DetailedListItem';

/**
 * Props for the Render component within MintStatsCard.
 */
interface RenderParams {
	/** The Flux address lock details. */
	addressLock: FluxAddressLock;
	/** The address currently being displayed. */
	displayedAddress: string;
	/** Detailed information about the Flux address. */
	addressDetails: FluxAddressDetails;
	/** Token-related details for the Flux address. */
	addressTokenDetails: FluxAddressTokenDetails;
	/** The currently selected address in the wallet. */
	selectedAddress: string;
	/** Balances of various tokens. */
	balances: Balances;
	/** The dispatch function from the Web3Context. */
	dispatch: React.Dispatch<any>;
	/** The current ecosystem. */
	ecosystem: Ecosystem;
}

/**
 * A memoized functional component that renders the Minting Statistics card.
 * It displays various statistics related to token minting, such as locked amounts, burn ratios, and time until bonuses.
 * @param params - Object containing addressLock, addressDetails, addressTokenDetails, selectedAddress, balances, displayedAddress, dispatch, and ecosystem.
 */
const Render: React.FC<RenderParams> = React.memo(
	({
		addressLock,
		addressDetails,
		addressTokenDetails,
		selectedAddress,
		balances,
		displayedAddress,
		dispatch,
		ecosystem,
	}) => {
		const { mintableTokenShortName, maxBurnMultiplier, minBurnMultiplier } = getEcosystemConfig(ecosystem);

		const getBlockDuration = (startBlockNumber: number) => {
			const blocksDuration = addressDetails.blockNumber - startBlockNumber;
			const hoursDuration = (blocksDuration * 15) / (60 * 60);

			return {
				hours: `~${hoursDuration.toFixed(2)} hours`,
				blocks: `(${blocksDuration} block${blocksDuration > 1 ? 's' : ''})`,
			};
		};

		const showUnlockDialog = () => {
			dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Unlock } });
		};

		const getLockedInAmount = () => {
			return `${BNToDecimal(addressLock.amount, true)} DAM`;
		};
		const getDamLockedInHeader = () => {
			const getUnlockButton = () => {
				if (new BN(addressLock.amount).isZero()) {
					return;
				}

				if (displayedAddress !== selectedAddress) {
					return;
				}

				return (
					<Box px={2} display="inline-block">
						<Button
							size="small"
							variant="outlined"
							onClick={() => showUnlockDialog()}
							startIcon={<LockOpen style={{ color: '#0FF' }} />}
						>
							Unlock DAM
						</Button>
					</Box>
				);
			};
			return (
				<>
					DAM Powering Validators
					{getUnlockButton()}
				</>
			);
		};
		const getLastMint = () => {
			const getDuration = () => {
				if (addressLock.blockNumber === addressLock.lastMintBlockNumber) {
					return {
						hours: 'No Mint Since Start',
						blocks: undefined,
					};
				}
				return getBlockDuration(addressLock.lastMintBlockNumber);
			};
			const duration = getDuration();

			return (
				<DetailedListItem
					title="Last Mint:"
					main={<>{duration.hours}</>}
					description={
						<Typography component="div" color="textSecondary" display="inline" variant="body2">
							{duration.blocks}
						</Typography>
					}
				/>
			);
		};

		if (addressLock.amount.isZero()) {
			return null;
		}
		const { myRatio } = addressTokenDetails;

		const { isTargetReached, fluxRequiredToBurn, fluxRequiredToBurnInUsdc } = getRequiredFluxToBurn({
			addressDetails,
			addressLock,
			balances,
			ecosystem,
			targetMultiplier: new Big(maxBurnMultiplier - minBurnMultiplier),
		});

		const getDamLockinDuration = () => {
			const duration = getBlockDuration(addressLock.blockNumber);

			return (
				<DetailedListItem
					title="Started Mint Age:"
					main={<>{duration.hours}</>}
					description={
						<Typography component="div" color="textSecondary" display="inline" variant="body2">
							{duration.blocks}
						</Typography>
					}
				/>
			);
		};

		const getFluxToBurnFor2x = () => {
			if (isTargetReached || addressDetails.addressBurnMultiplier >= 20000) {
				return null;
			}
			const { fluxRequiredToBurn, fluxRequiredToBurnInUsdc } = getRequiredFluxToBurn({
				addressDetails,
				addressLock,
				balances,
				ecosystem,
				targetMultiplier: new Big('1'),
			});

			return (
				<Box my={2}>
					<DetailedListItem
						title={
							isTargetReached ? (
								<>
									{mintableTokenShortName} {maxBurnMultiplier}x Bonus Reserves (
									<Typography component="div" color="secondary" display="inline">
										OVERBURNED
									</Typography>
									)
								</>
							) : (
								`${mintableTokenShortName} to Burn For 2x Bonus:`
							)
						}
						main={
							<>
								{fluxRequiredToBurn} {mintableTokenShortName}
							</>
						}
						sub={<>{fluxRequiredToBurnInUsdc}</>}
					/>
				</Box>
			);
		};

		const getFluxToBurnForMaxBurn = () => {
			return (
				<DetailedListItem
					title={
						isTargetReached ? (
							<>
								{mintableTokenShortName} {maxBurnMultiplier}x Bonus Reserves (
								<Typography component="div" color="secondary" display="inline">
									OVERBURNED
								</Typography>
								)
							</>
						) : (
							`${mintableTokenShortName} to Burn For ${maxBurnMultiplier}x Bonus:`
						)
					}
					main={
						<>
							{fluxRequiredToBurn} {mintableTokenShortName}
						</>
					}
					sub={<>{fluxRequiredToBurnInUsdc}</>}
				/>
			);
		};
		const getTimeUntil3xBonus = () => {
			return (
				<DetailedListItem
					title={'Time Until 3x Time Bonus:'}
					main={getBlocksRemaining(
						addressLock.blockNumber,
						161280 + 5760,
						addressDetails.blockNumber,
						'Awaiting Mint Start',
						false,
						true
					)}
					description={
						<>
							<Typography component="div" color="textSecondary" display="inline" variant="body2">
								{getBlocksRemaining(
									addressLock.blockNumber,
									161280 + 5760,
									addressDetails.blockNumber,
									'Awaiting Mint Start',
									true,
									false
								)}
							</Typography>
						</>
					}
				/>
			);
		};

		return (
			<Card>
				<CardContent>
					<Grid container justifyContent="space-between" alignItems="center">
						<Grid>
							<Typography variant="h5" component="h2">
								{mintableTokenShortName} Minting Statistics
							</Typography>
						</Grid>
					</Grid>
					<Box mt={1} mb={2}>
						<Divider />
					</Box>
					<Grid container>
						<Grid size={{ xs: 12, md: 6 }}>
							{getTimeUntil3xBonus()}
							{getFluxToBurnFor2x()}
							{getFluxToBurnForMaxBurn()}
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							{getDamLockinDuration()}
							{getLastMint()}
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		);
	}
);

const MintStatsCard: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useWeb3Context();

	const { address, selectedAddress, addressLock, addressDetails, addressTokenDetails, balances, ecosystem } = web3State;
	if (!addressLock || !addressDetails || !addressTokenDetails || !selectedAddress || !balances) {
		return null;
	}

	return (
		<Render
			addressDetails={addressDetails}
			addressLock={addressLock}
			addressTokenDetails={addressTokenDetails}
			selectedAddress={selectedAddress}
			displayedAddress={address ?? selectedAddress}
			balances={balances}
			dispatch={web3Dispatch}
			ecosystem={ecosystem}
		/>
	);
};

export default MintStatsCard;
