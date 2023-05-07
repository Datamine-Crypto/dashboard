import React, { useContext } from 'react';
import { Box, Typography, Grid, List, ListItem, ListItemText, Card, CardContent, Divider, Hidden, useMediaQuery, useTheme, makeStyles } from '@material-ui/core';

import { Web3Context } from '../../../web3/Web3Context'

import { BNToDecimal, getBurnRatio, getBlocksRemaining, getBNPercent, getPriceToggle } from '../../../web3/helpers';
import { FluxAddressDetails, FluxAddressTokenDetails, Token } from '../../../interfaces';
import { Balances } from '../../../web3/web3Reducer';
import DetailedListItem from '../Fragments/DetailedListItem';

interface RenderParams {
	addressDetails: FluxAddressDetails;
	addressTokenDetails: FluxAddressTokenDetails;
	balances: Balances;
	isArbitrumMainnet: boolean;
}

const Render: React.FC<RenderParams> = React.memo(({ addressDetails, addressTokenDetails, balances, isArbitrumMainnet }) => {
	const { globalRatio, blockNumber } = addressTokenDetails;

	const getBurnedUsdc = () => {
		const balanceInUsdc = `$ ${getPriceToggle({ value: addressDetails.globalBurnedAmount, inputToken: Token.FLUX, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return <>{balanceInUsdc}</>
	}
	const getBurnPercent = () => {
		const burnPercent = getBNPercent(addressDetails.globalBurnedAmount, balances.fluxTotalSupply)
		return <>({burnPercent}% of minted {isArbitrumMainnet ? 'Arbi' : ''}FLUX)</>
	}

	const getFluxCurrentSupply = () => {
		const balanceInUsdc = `$ ${getPriceToggle({ value: balances.fluxTotalSupply, inputToken: Token.FLUX, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return <DetailedListItem
			title={`${isArbitrumMainnet ? 'Arbi' : ''}FLUX Current Supply:`}
			main={<>{BNToDecimal(balances.fluxTotalSupply, true, 18, 2)} {isArbitrumMainnet ? 'Arbi' : ''}FLUX</>}
			sub={<>{balanceInUsdc}</>}
		/>
	}

	const getFluxBurned = () => {
		return <DetailedListItem
			title={`${isArbitrumMainnet ? 'Arbi' : ''}FLUX Burned:`}
			main={<>{BNToDecimal(addressDetails.globalBurnedAmount, true, 18, 2)} {isArbitrumMainnet ? 'Arbi' : ''}FLUX</>}
			sub={<>{getBurnedUsdc()}</>}
			description={<Typography variant="body2" color="textSecondary" display="inline">{getBurnPercent()}</Typography>}
		/>
	}
	const getDamLockedIn = () => {
		const lockedPercent = getBNPercent(addressDetails.globalLockedAmount, balances.damTotalSupply, false)
		const getLockedPercent = () => {
			const balanceInUsdc = `$ ${getPriceToggle({ value: addressDetails.globalLockedAmount, inputToken: Token.DAM, outputToken: Token.USDC, balances, round: 2 })} USD`;
			return <>{balanceInUsdc}</>
		}

		return <DetailedListItem
			title={`${isArbitrumMainnet ? 'FLUX (L2)' : 'DAM'} Powering Validators:`}
			main={<>{BNToDecimal(addressDetails.globalLockedAmount, true, 18, 2)} {isArbitrumMainnet ? 'FLUX' : 'DAM'}</>}
			sub={<>{getLockedPercent()}</>}
			description={<Typography variant="body2" color="textSecondary" display="inline"> ({lockedPercent}% of {isArbitrumMainnet ? 'L2' : 'lifetime'} supply)</Typography>}
		/>
	}

	const getFluxBurnRatio = () => {
		return <DetailedListItem
			title={`${isArbitrumMainnet ? 'Arbi' : ''}FLUX Burn Ratio:`}
			main={getBurnRatio(globalRatio, isArbitrumMainnet)}
		/>
	}

	return <Card >
		<CardContent>
			<Grid container justify="space-between" alignItems="center">
				<Grid item>
					<Typography variant="h5" component="h2">
						Global Statistics
					</Typography>
				</Grid>
			</Grid>
			<Box mt={1} mb={2}>
				<Divider />
			</Box>
			<Grid container>
				<Grid item xs={12} md={6}>
					{getFluxCurrentSupply()}
					{getFluxBurned()}
					{getFluxBurnRatio()}
				</Grid>
				<Grid item xs={12} md={6}>
					{getDamLockedIn()}
					{/*getFailsafeDetails()*/}
				</Grid>
			</Grid>
		</CardContent>
	</Card>
});

const GlobalCard: React.FC = () => {
	const { state: web3State } = useContext(Web3Context)

	const { addressDetails, addressTokenDetails, balances, isArbitrumMainnet } = web3State;
	if (!addressDetails || !addressTokenDetails || !balances) {
		return null;
	}

	return <Render
		addressDetails={addressDetails}
		addressTokenDetails={addressTokenDetails}
		balances={balances}
		isArbitrumMainnet={isArbitrumMainnet}
	/>
}

export default GlobalCard;