import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useAppStore } from '@/react/utils/appStore';
import { getBlocksRemaining } from '@/utils/mathHelpers';

import Big from 'big.js';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import { getRequiredFluxToBurn } from '@/utils/mathHelpers';
import DetailedListItem from '@/react/elements/Fragments/DetailedListItem';
import { useShallow } from 'zustand/react/shallow';

const MintStatsCard: React.FC = () => {
	const { selectedAddress, addressLock, addressDetails, addressTokenDetails, balances, ecosystem } = useAppStore(
		useShallow((state) => ({
			selectedAddress: state.selectedAddress,
			addressLock: state.addressLock,
			addressDetails: state.addressDetails,
			addressTokenDetails: state.addressTokenDetails,
			balances: state.balances,
			ecosystem: state.ecosystem,
		}))
	);

	if (!addressLock || !addressDetails || !addressTokenDetails || !selectedAddress || !balances) {
		return null;
	}

	const { mintableTokenShortName, maxBurnMultiplier, minBurnMultiplier } = getEcosystemConfig(ecosystem);

	const getBlockDuration = (startBlockNumber: number) => {
		const blocksDuration = addressDetails.blockNumber - startBlockNumber;
		const hoursDuration = (blocksDuration * 15) / (60 * 60);
		return {
			hours: `~${hoursDuration.toFixed(2)} hours`,
			blocks: `(${blocksDuration} block${blocksDuration > 1 ? 's' : ''})`,
		};
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

	if (addressLock.amount === 0n) {
		return null;
	}

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
							`${mintableTokenShortName} to Burn For Average Bonus (${ecosystem === Ecosystem.Lockquidity ? 1 : 2}X):`
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
						`${mintableTokenShortName} to Burn For ${maxBurnMultiplier}x MAX Bonus:`
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
};

export default MintStatsCard;
