import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useAppStore } from '@/react/utils/appStore';
import {
	formatHoursDuration,
	getBlocksRemaining,
	getRequiredFluxToBurn,
	TIME_BONUS_FULL_BLOCKS,
} from '@/utils/mathHelpers';

import Big from 'big.js';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import ProgressBar from '@/react/elements/Charts/ProgressBar';
import BurnRatioChart, { BurnRatioLegendItem } from '@/react/elements/Charts/BurnRatioChart';
import { useShallow } from 'zustand/react/shallow';

/** Contract multipliers are fixed-point with 4 decimals (10000 = 1x, 20000 = 2x). */
const AVERAGE_BURN_MULTIPLIER = 20000;

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

	if (addressLock.amount === 0n) {
		return null;
	}

	const { mintableTokenShortName, maxBurnMultiplier, minBurnMultiplier } = getEcosystemConfig(ecosystem);

	const getBlockDuration = (startBlockNumber: number) => {
		const blocksDuration = addressDetails.blockNumber - startBlockNumber;
		const hoursDuration = (blocksDuration * 15) / (60 * 60);
		return {
			time: formatHoursDuration(hoursDuration),
			blocks: `(${blocksDuration} block${blocksDuration > 1 ? 's' : ''})`,
		};
	};

	const getDurationLabel = (duration: { time: string; blocks?: string }) => {
		return (
			<>
				{duration.time}{' '}
				<Typography component="span" variant="body2" color="textSecondary">
					{duration.blocks}
				</Typography>
			</>
		);
	};

	const getLastMintLabel = () => {
		if (addressLock.blockNumber === addressLock.lastMintBlockNumber) {
			return 'No Mint Since Start';
		}
		return getDurationLabel(getBlockDuration(addressLock.lastMintBlockNumber));
	};

	/**
	 * FLUX left to burn for the average and max burn bonus, shown in the burn ratio legend.
	 * When the max is already reached, the max row shows the "bonus reserves" (burned beyond the max).
	 */
	const getBurnLegendItems = (): BurnRatioLegendItem[] => {
		const maxBurn = getRequiredFluxToBurn({
			addressDetails,
			addressLock,
			balances,
			ecosystem,
			targetMultiplier: new Big(maxBurnMultiplier - minBurnMultiplier),
		});

		const maxBurnItem: BurnRatioLegendItem = {
			key: 'max',
			name: maxBurn.isTargetReached ? (
				<>
					{mintableTokenShortName} {maxBurnMultiplier}x Bonus Reserves (
					<Typography component="span" variant="body2" color="secondary">
						OVERBURNED
					</Typography>
					)
				</>
			) : (
				`${mintableTokenShortName} to Burn For ${maxBurnMultiplier}x MAX Bonus`
			),
			label: maxBurn.fluxRequiredToBurnInUsdc,
			tooltip: `${maxBurn.fluxRequiredToBurn} ${mintableTokenShortName}`,
		};

		if (maxBurn.isTargetReached || addressDetails.addressBurnMultiplier >= AVERAGE_BURN_MULTIPLIER) {
			return [maxBurnItem];
		}

		const averageBurn = getRequiredFluxToBurn({
			addressDetails,
			addressLock,
			balances,
			ecosystem,
			targetMultiplier: new Big('1'),
		});

		return [
			{
				key: 'average',
				name: `${mintableTokenShortName} to Burn For Average Bonus (${ecosystem === Ecosystem.Lockquidity ? 1 : 2}X)`,
				label: averageBurn.fluxRequiredToBurnInUsdc,
				tooltip: `${averageBurn.fluxRequiredToBurn} ${mintableTokenShortName}`,
			},
			maxBurnItem,
		];
	};

	/**
	 * Time bonus progress: from lock-in (mint age) to the full 3x time bonus, with the last mint in between.
	 */
	const getTimeBonusProgress = () => {
		const elapsedBlocks = addressDetails.blockNumber - addressLock.blockNumber;
		const isFullBonus = elapsedBlocks >= TIME_BONUS_FULL_BLOCKS;
		const getRemaining = (showBlocks: boolean, showDuration: boolean) =>
			getBlocksRemaining(
				addressLock.blockNumber,
				TIME_BONUS_FULL_BLOCKS,
				addressDetails.blockNumber,
				'Awaiting Mint Start',
				showBlocks,
				showDuration
			);

		return (
			<ProgressBar
				title="3x Time Bonus:"
				progress={elapsedBlocks / TIME_BONUS_FULL_BLOCKS}
				startName="Started Mint Age"
				startLabel={getDurationLabel(getBlockDuration(addressLock.blockNumber))}
				middleName="Last Mint"
				middleLabel={getLastMintLabel()}
				endName="Time Until 3x Time Bonus"
				endLabel={
					isFullBonus
						? 'Reached'
						: getDurationLabel({ time: getRemaining(false, true), blocks: getRemaining(true, false) })
				}
			/>
		);
	};

	return (
		<Card>
			<CardContent>
				<Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
					<Grid>
						<Typography variant="h5" component="h2">
							{mintableTokenShortName} Minting Statistics
						</Typography>
					</Grid>
				</Grid>
				<Box
					sx={{
						mt: 1,
						mb: 2,
					}}
				>
					<Divider />
				</Box>
				<BurnRatioChart extraLegendItems={getBurnLegendItems()} />
				<Box sx={{ mt: 3 }}>{getTimeBonusProgress()}</Box>
			</CardContent>
		</Card>
	);
};

export default MintStatsCard;
