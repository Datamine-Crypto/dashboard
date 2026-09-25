import { Box, Link, Slider, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import { useAppStore } from '@/react/utils/appStore';
import { getEcosystemConfig } from '@/app/configs/config';
import { Token } from '@/app/interfaces';
import {
	BURN_RATIO_DECIMALS,
	BurnSimulationInputs,
	bigIntToChartNumber,
	formatUsdValue,
	getBurnRatio,
	getBurnRatioForMaxMultiplier,
	getFormattedMultiplier,
	getSimulatedBurnMultiplier,
	formatBurnRatioValue,
} from '@/utils/mathHelpers';
import { appPalette, chartColors } from '@/theme/appTheme';
import LightTooltip from '@/react/elements/LightTooltip';
import { useShallow } from 'zustand/react/shallow';

/** Bar thickness in px. */
const BAR_HEIGHT = 12;
/** Height of the global ratio marker in px. */
const MARKER_HEIGHT = 20;
const MARKER_WIDTH = 2;
/** Legend swatch size in px. */
const SWATCH_SIZE = 10;
/** Headroom used only when the max multiplier can never be reached, so the track still has room. */
const SCALE_HEADROOM = 1.2;
/** Number of slider steps across the whole track. */
const SLIDER_STEPS = 1000;
/** Contract multipliers are fixed-point with 4 decimals (10000 = 1x). */
const MULTIPLIER_SCALE = 10000;

/** An extra value shown in the legend, for example the FLUX left to burn for the max bonus. */
export interface BurnRatioLegendItem {
	key: string;
	name: ReactNode;
	label: ReactNode;
	/** Shown on hover over the label, for example the token amount behind a USD value. */
	tooltip?: ReactNode;
}

interface BurnRatioChartProps {
	extraLegendItems?: BurnRatioLegendItem[];
}

/**
 * Your burn ratio against the global burn ratio, as a draggable bar.
 *
 * Dragging simulates burning more: the value label and legend show the burn multiplier you would
 * get and how much more you would need to burn. You cannot drag below your current ratio, since
 * burns cannot be undone.
 */
const BurnRatioChart: React.FC<BurnRatioChartProps> = ({ extraLegendItems = [] }) => {
	const { addressLock, addressDetails, addressTokenDetails, balances, ecosystem } = useAppStore(
		useShallow((state) => ({
			addressLock: state.addressLock,
			addressDetails: state.addressDetails,
			addressTokenDetails: state.addressTokenDetails,
			balances: state.balances,
			ecosystem: state.ecosystem,
		}))
	);
	const [simulatedRatio, setSimulatedRatio] = React.useState<number | null>(null);

	if (!addressLock || !addressDetails || !addressTokenDetails || !balances) {
		return null;
	}

	const { mintableTokenShortName, minBurnMultiplier, maxBurnMultiplier } = getEcosystemConfig(ecosystem);
	const { myRatio, globalRatio } = addressTokenDetails;

	const currentRatio = bigIntToChartNumber(myRatio, BURN_RATIO_DECIMALS);
	const currentGlobalRatio = bigIntToChartNumber(globalRatio, BURN_RATIO_DECIMALS);
	const simulationInputs: BurnSimulationInputs = {
		currentRatio,
		myDamLockedIn: bigIntToChartNumber(addressLock.amount),
		globalFluxBurned: bigIntToChartNumber(addressDetails.globalBurnedAmount),
		globalDamLockedIn: bigIntToChartNumber(addressDetails.globalLockedAmount),
		minBurnMultiplier,
		maxBurnMultiplier,
	};

	const maxMultiplierRatio = getBurnRatioForMaxMultiplier(simulationInputs);
	// The track ends at the ratio for the max multiplier, or at your ratio if you have overburned past it
	const scaleMax =
		(maxMultiplierRatio !== null
			? Math.max(maxMultiplierRatio, currentRatio, currentGlobalRatio)
			: Math.max(currentRatio, currentGlobalRatio) * SCALE_HEADROOM) || 1;
	const displayedRatio = Math.max(simulatedRatio ?? currentRatio, currentRatio);
	const isSimulating = displayedRatio > currentRatio;

	const getMultiplierLabel = (ratio: number) => {
		if (ratio <= currentRatio) {
			// Overburned: show the uncapped value (e.g. x10.2), otherwise the contract's own value
			const { uncappedMultiplier } = getSimulatedBurnMultiplier(currentRatio, simulationInputs);
			if (uncappedMultiplier > maxBurnMultiplier) {
				return getFormattedMultiplier(uncappedMultiplier * MULTIPLIER_SCALE);
			}
			return getFormattedMultiplier(addressDetails.addressBurnMultiplier);
		}
		const { multiplier } = getSimulatedBurnMultiplier(ratio, simulationInputs);
		return getFormattedMultiplier(multiplier * MULTIPLIER_SCALE);
	};

	const getRatioLabel = (ratio: number) => formatBurnRatioValue(ratio, ecosystem);

	const getExtraBurnLabel = () => {
		const { extraBurn } = getSimulatedBurnMultiplier(displayedRatio, simulationInputs);
		// Whole tokens to 18-decimal bigint, via 6 decimals to stay inside float precision
		const extraBurnAmount = BigInt(Math.round(extraBurn * 1e6)) * 10n ** 12n;
		return `Burn ${formatUsdValue(extraBurnAmount, Token.Mintable, balances)} more`;
	};

	const getLegendItem = (swatch: ReactNode, name: ReactNode, label: ReactNode) => {
		return (
			<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
				{swatch}
				<Box>
					<Typography component="div" variant="body2" color="textSecondary">
						{name}
					</Typography>
					<Typography component="div">{label}</Typography>
				</Box>
			</Box>
		);
	};

	return (
		<Box sx={{ p: 1 }}>
			<Typography component="div" color="textSecondary" variant="body2">
				{mintableTokenShortName} Burn Ratio (drag to simulate):
			</Typography>
			<Slider
				aria-label={`${mintableTokenShortName} burn ratio`}
				value={displayedRatio}
				min={0}
				max={scaleMax}
				step={scaleMax / SLIDER_STEPS}
				marks={[{ value: currentGlobalRatio }]}
				valueLabelDisplay="auto"
				valueLabelFormat={(ratio: number) => getMultiplierLabel(ratio)}
				onChange={(_event: Event, newValue: number | number[]) => {
					setSimulatedRatio(Math.max(newValue as number, currentRatio));
				}}
				sx={{
					color: chartColors.burned,
					'& .MuiSlider-rail': { height: BAR_HEIGHT, opacity: 1, backgroundColor: appPalette.borderSubtle },
					'& .MuiSlider-track': { height: BAR_HEIGHT, border: 'none' },
					'& .MuiSlider-mark': {
						height: MARKER_HEIGHT,
						width: MARKER_WIDTH,
						backgroundColor: appPalette.textPrimary,
					},
					'& .MuiSlider-markActive': { opacity: 1, backgroundColor: appPalette.textPrimary },
					'& .MuiSlider-valueLabel': {
						backgroundColor: appPalette.background,
						border: `1px solid ${appPalette.highlight}`,
					},
				}}
			/>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 4 }}>
				{getLegendItem(
					null,
					<>
						Burn multiplier{' '}
						{isSimulating && (
							<Link component="button" variant="body2" onClick={() => setSimulatedRatio(null)}>
								(reset)
							</Link>
						)}
					</>,
					<>
						{getMultiplierLabel(displayedRatio)}{' '}
						{isSimulating && (
							<Typography component="span" variant="body2" color="textSecondary">
								({getExtraBurnLabel()})
							</Typography>
						)}
					</>
				)}
				{getLegendItem(
					<Box
						sx={{
							width: SWATCH_SIZE,
							height: SWATCH_SIZE,
							borderRadius: '2px',
							flexShrink: 0,
							backgroundColor: chartColors.burned,
						}}
					/>,
					isSimulating ? 'Simulated burn ratio' : 'Your burn ratio',
					isSimulating ? getRatioLabel(displayedRatio) : getBurnRatio(myRatio, ecosystem)
				)}
				{getLegendItem(
					<Box
						sx={{
							width: MARKER_WIDTH,
							height: SWATCH_SIZE + MARKER_WIDTH * 2,
							flexShrink: 0,
							backgroundColor: appPalette.textPrimary,
						}}
					/>,
					'Global burn ratio',
					getBurnRatio(globalRatio, ecosystem)
				)}
				{extraLegendItems.map((item) => (
					<React.Fragment key={item.key}>
						{getLegendItem(
							null,
							item.name,
							item.tooltip ? (
								<LightTooltip title={item.tooltip}>
									<Box component="span">{item.label}</Box>
								</LightTooltip>
							) : (
								item.label
							)
						)}
					</React.Fragment>
				))}
			</Box>
		</Box>
	);
};

export default BurnRatioChart;
