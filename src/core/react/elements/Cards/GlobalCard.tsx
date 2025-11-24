import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useAppStore } from '@/core/react/utils/appStore';
import { getEcosystemConfig } from '@/core/app/configs/config';
import { Ecosystem, Layer } from '@/core/app/configs/config.common';
import { FluxAddressDetails, FluxAddressTokenDetails, Token } from '@/core/app/interfaces';
import { BNToDecimal, getBNPercent, getBurnRatio, getPriceToggle } from '@/core/utils/mathHelpers';
import { Balances } from '@/core/app/interfaces';
import DetailedListItem from '@/core/react/elements/Fragments/DetailedListItem';
import { useShallow } from 'zustand/react/shallow';

/**
 * Props for the Render component within GlobalCard.
 */
interface RenderParams {
	/** Detailed information about the Flux address. */
	addressDetails: FluxAddressDetails;
	/** Token-related details for the Flux address. */
	addressTokenDetails: FluxAddressTokenDetails;
	/** Balances of various tokens. */
	balances: Balances;
	/** The current ecosystem. */
	ecosystem: Ecosystem;
}
/**
 * A memoized functional component that renders the Global Statistics card.
 * It displays global data such as token supply, burned amounts, locked amounts, and burn ratios.
 * @param params - Object containing addressDetails, addressTokenDetails, balances, and ecosystem.
 */
const Render: React.FC<RenderParams> = React.memo(({ addressDetails, addressTokenDetails, balances, ecosystem }) => {
	const { lockableTokenShortName, mintableTokenShortName, mintableTokenPriceDecimals, layer } =
		getEcosystemConfig(ecosystem);
	const { globalRatio, blockNumber } = addressTokenDetails;
	/**
	 * Calculates and returns the USD value of the globally burned mintable tokens.
	 * @returns A React element displaying the USD value.
	 */
	const getBurnedUsdc = () => {
		const balanceInUsdc = `$ ${getPriceToggle({ value: addressDetails.globalBurnedAmount, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return <>{balanceInUsdc}</>;
	};
	/**
	 * Calculates and returns the percentage of burned mintable tokens relative to the total supply.
	 * @returns A React element displaying the percentage.
	 */
	const getBurnPercent = () => {
		const burnPercent = getBNPercent(addressDetails.globalBurnedAmount, balances.fluxTotalSupply, false);
		return (
			<>
				({burnPercent}% of minted {mintableTokenShortName})
			</>
		);
	};
	/**
	 * Renders a DetailedListItem component for the current supply of the mintable token.
	 * @returns A DetailedListItem component.
	 */
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
	/**
	 * Renders a DetailedListItem component for the globally burned mintable tokens.
	 * @returns A DetailedListItem component.
	 */
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
	/**
	 * Renders a DetailedListItem component for the globally locked-in lockable tokens.
	 * @returns A DetailedListItem component.
	 */
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
	/**
	 * Renders a DetailedListItem component for the global burn ratio of mintable tokens.
	 * @returns A DetailedListItem component.
	 */
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
});
/**
 * GlobalCard component that displays global statistics for the Datamine Network.
 * It fetches global data from the Web3Context and renders it using the Render component.
 */
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
	return (
		<Render
			addressDetails={addressDetails}
			addressTokenDetails={addressTokenDetails}
			balances={balances}
			ecosystem={ecosystem}
		/>
	);
};
export default GlobalCard;
