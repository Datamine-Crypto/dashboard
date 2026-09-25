import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useAppStore } from '@/react/utils/appStore';

import { getEcosystemConfig } from '@/app/configs/config';
import { Layer, LiquidityPoolType } from '@/app/configs/config.common';
import { Token } from '@/app/interfaces';
import { bigIntToChartNumber, formatBigInt, formatUsdValue, getPriceToggle } from '@/utils/mathHelpers';
import DonutChart from '@/react/elements/Charts/DonutChart';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from '@/react/elements/Fragments/ExploreLiquidityPools';
import LightTooltip from '@/react/elements/LightTooltip';
import { chartColors } from '@/theme/appTheme';
import { useShallow } from 'zustand/react/shallow';

/** Clamps a token amount at zero, so a slice can never go negative. */
const atLeastZero = (amount: bigint) => (amount > 0n ? amount : 0n);

const RealtimeLiqudityCard: React.FC = () => {
	const { balances, addressTokenDetails, addressDetails, ecosystem } = useAppStore(
		useShallow((state) => ({
			balances: state.balances,
			addressTokenDetails: state.addressTokenDetails,
			addressDetails: state.addressDetails,
			ecosystem: state.ecosystem,
		}))
	);

	if (!balances || !addressTokenDetails || !addressDetails) {
		return null;
	}

	const config = getEcosystemConfig(ecosystem);
	const { layer, mintableTokenShortName, lockableTokenShortName, liquidityPoolType } = config;
	const { uniswapDamTokenReserves, uniswapFluxTokenReserves, uniswapDamFluxTokenReserves } = balances;
	const poolName = liquidityPoolType === LiquidityPoolType.SushiSwap ? 'SushiSwap' : 'Uniswap';

	// Available liquidity is the token side of the token / ETH pool plus the token side of the Lockable / Mintable pool
	const availableDamLiquidity = uniswapDamTokenReserves.dam + uniswapDamFluxTokenReserves.dam;
	const availableFluxLiquidity = uniswapFluxTokenReserves.flux + uniswapDamFluxTokenReserves.flux;

	const shortDamPrice = `${getPriceToggle({ value: 1n * 10n ** 18n, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 4 })}`;
	const shortFluxPrice = `${getPriceToggle({ value: 1n * 10n ** 18n, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: config.mintableTokenPriceDecimals })}`;
	document.title = `${mintableTokenShortName}: $${shortFluxPrice} ${lockableTokenShortName}: $${shortDamPrice}`;

	const getLiquidityLabel = () => `Available liquidity (${poolName})`;

	/**
	 * Slices cover everything ever minted: burned + current supply (burning reduces supply).
	 * Current supply (the market cap, shown in the center) = available liquidity + the rest.
	 */
	const getFluxChart = () => {
		const { fluxTotalSupply } = balances;
		const { globalBurnedAmount } = addressDetails;
		const restOfSupply = atLeastZero(fluxTotalSupply - availableFluxLiquidity);
		const getTokenAmount = (amount: bigint) => `${formatBigInt(amount, true, 18, 2)} ${mintableTokenShortName}`;

		return (
			<DonutChart
				title={`${mintableTokenShortName} Realtime Market Cap:`}
				centerValue={formatUsdValue(fluxTotalSupply, Token.Mintable, balances, true)}
				centerLabel="Market cap"
				segments={[
					{
						label: getLiquidityLabel(),
						value: bigIntToChartNumber(availableFluxLiquidity),
						valueLabel: formatUsdValue(availableFluxLiquidity, Token.Mintable, balances, true),
						tooltip: getTokenAmount(availableFluxLiquidity),
						color: chartColors.secondary,
					},
					{
						label: 'Rest of current supply',
						value: bigIntToChartNumber(restOfSupply),
						valueLabel: formatUsdValue(restOfSupply, Token.Mintable, balances, true),
						tooltip: getTokenAmount(restOfSupply),
						color: chartColors.rest,
					},
					{
						label: 'Burned',
						value: bigIntToChartNumber(globalBurnedAmount),
						valueLabel: formatUsdValue(globalBurnedAmount, Token.Mintable, balances, true),
						tooltip: getTokenAmount(globalBurnedAmount),
						color: chartColors.burned,
					},
				]}
			/>
		);
	};

	/**
	 * Total supply = liquidity + powering validators + other circulating.
	 * Circulating supply (not powering validators) is the liquidity and "other" slices together.
	 */
	const getDamChart = () => {
		const { damTotalSupply } = balances;
		const { globalLockedAmount } = addressDetails;
		const otherCirculating = atLeastZero(damTotalSupply - globalLockedAmount - availableDamLiquidity);
		const getTokenAmount = (amount: bigint) => `${formatBigInt(amount, true, 18, 2)} ${lockableTokenShortName}`;

		return (
			<DonutChart
				title={`${lockableTokenShortName} Realtime Market Cap${layer === Layer.Layer2 ? ' (on L2)' : ''}:`}
				centerValue={formatUsdValue(damTotalSupply, Token.Lockable, balances, true)}
				centerLabel="Market cap"
				segments={[
					{
						label: getLiquidityLabel(),
						value: bigIntToChartNumber(availableDamLiquidity),
						valueLabel: formatUsdValue(availableDamLiquidity, Token.Lockable, balances, true),
						tooltip: getTokenAmount(availableDamLiquidity),
						color: chartColors.secondary,
					},
					{
						label: 'Powering validators',
						value: bigIntToChartNumber(globalLockedAmount),
						valueLabel: formatUsdValue(globalLockedAmount, Token.Lockable, balances, true),
						tooltip: getTokenAmount(globalLockedAmount),
						color: chartColors.primary,
					},
					{
						label: 'Other circulating',
						value: bigIntToChartNumber(otherCirculating),
						valueLabel: formatUsdValue(otherCirculating, Token.Lockable, balances, true),
						tooltip: getTokenAmount(otherCirculating),
						color: chartColors.rest,
					},
				]}
			/>
		);
	};

	const getCardTitle = () => {
		if (liquidityPoolType === LiquidityPoolType.SushiSwap) {
			return 'Available Liquidity (SushiSwap L2)';
		}
		return 'Available Liquidity (Uniswap)';
	};

	return (
		<Card>
			<CardContent>
				<Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
					<Grid>
						<LightTooltip title="Our realtime global liquidity is fetched from Uniswap on-chain data through a smart contract">
							<Typography variant="h5" component="h2">
								{getCardTitle()}
							</Typography>
						</LightTooltip>
					</Grid>
					<Grid>
						<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.SmallButton} ecosystem={ecosystem} />
					</Grid>
				</Grid>
				<Box
					sx={{
						mt: 1,
						mb: 1,
					}}
				>
					<Divider />
				</Box>
				<Grid container>
					<Grid size={{ xs: 12, md: 6 }}>{getDamChart()}</Grid>
					<Grid size={{ xs: 12, md: 6 }}>{getFluxChart()}</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};

export default RealtimeLiqudityCard;
