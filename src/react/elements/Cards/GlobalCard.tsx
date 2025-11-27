import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useAppStore } from '@/react/utils/appStore';
import { getEcosystemConfig } from '@/app/configs/config';
import { Layer } from '@/app/configs/config.common';
import { Token } from '@/app/interfaces';
import { BNToDecimal, getBNPercent, getBurnRatio, getPriceToggle } from '@/utils/mathHelpers';
import DetailedListItem from '@/react/elements/Fragments/DetailedListItem';
import { useShallow } from 'zustand/react/shallow';

const GlobalCard: React.FC = () => {
	const { addressDetails, addressTokenDetails, balances, ecosystem } = useAppStore(
		useShallow((state) => ({
			addressDetails: state.addressDetails,
			addressTokenDetails: state.addressTokenDetails,
			balances: state.balances,
			ecosystem: state.ecosystem,
		}))
	);

	if (!addressDetails || !addressTokenDetails || !balances) {
		return null;
	}

	const { lockableTokenShortName, mintableTokenShortName, mintableTokenPriceDecimals, layer } =
		getEcosystemConfig(ecosystem);
	const { globalRatio, blockNumber } = addressTokenDetails;

	const getBurnedUsdc = () => {
		const balanceInUsdc = `$ ${getPriceToggle({ value: addressDetails.globalBurnedAmount, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return <>{balanceInUsdc}</>;
	};

	const getBurnPercent = () => {
		const burnPercent = getBNPercent(addressDetails.globalBurnedAmount, balances.fluxTotalSupply, false);
		return (
			<>
				({burnPercent}% of minted {mintableTokenShortName})
			</>
		);
	};

	const getFluxCurrentSupply = () => {
		const balanceInUsdc = `$ ${getPriceToggle({ value: balances.fluxTotalSupply, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return (
			<DetailedListItem
				title={`${mintableTokenShortName} Current Supply:`}
				main={
					<>
						{BNToDecimal(balances.fluxTotalSupply, true, 18, mintableTokenPriceDecimals)} {mintableTokenShortName}
					</>
				}
				sub={<>{balanceInUsdc}</>}
			/>
		);
	};

	const getFluxBurned = () => {
		return (
			<DetailedListItem
				title={`${mintableTokenShortName} Burned:`}
				main={
					<>
						{BNToDecimal(addressDetails.globalBurnedAmount, true, 18, mintableTokenPriceDecimals)}{' '}
						{mintableTokenShortName}
					</>
				}
				sub={<>{getBurnedUsdc()}</>}
				description={
					<Typography component="div" variant="body2" color="textSecondary" display="inline">
						{getBurnPercent()}
					</Typography>
				}
			/>
		);
	};

	const getDamLockedIn = () => {
		const lockedPercent = getBNPercent(addressDetails.globalLockedAmount, balances.damTotalSupply, false);
		const getLockedPercent = () => {
			const balanceInUsdc = `$ ${getPriceToggle({ value: addressDetails.globalLockedAmount, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;
			return <>{balanceInUsdc}</>;
		};
		return (
			<DetailedListItem
				title={`${lockableTokenShortName} Powering Validators:`}
				main={
					<>
						{BNToDecimal(addressDetails.globalLockedAmount, true, 18, 2)} {lockableTokenShortName}
					</>
				}
				sub={<>{getLockedPercent()}</>}
				description={
					<Typography component="div" variant="body2" color="textSecondary" display="inline">
						{' '}
						({lockedPercent}% of {layer === Layer.Layer2 ? 'L2' : 'lifetime'} supply)
					</Typography>
				}
			/>
		);
	};

	const getFluxBurnRatio = () => {
		return (
			<DetailedListItem title={`${mintableTokenShortName} Burn Ratio:`} main={getBurnRatio(globalRatio, ecosystem)} />
		);
	};

	return (
		<Card>
			<CardContent>
				<Grid container justifyContent="space-between" alignItems="center">
					<Grid>
						<Typography variant="h5" component="h2">
							Global Statistics
						</Typography>
					</Grid>
				</Grid>
				<Box mt={1} mb={2}>
					<Divider />
				</Box>
				<Grid container>
					<Grid size={{ xs: 12, md: 6 }}>
						{getFluxCurrentSupply()}
						{getFluxBurned()}
						{getFluxBurnRatio()}
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						{getDamLockedIn()}
						{/*getFailsafeDetails()*/}
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};

export default GlobalCard;
