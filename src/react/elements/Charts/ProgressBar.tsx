import { Box, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import LightTooltip from '@/react/elements/LightTooltip';
import { appPalette, chartColors } from '@/theme/appTheme';

interface ProgressBarProps {
	title: ReactNode;
	/** Completed share, 0 to 1. Values outside that range are clamped. */
	progress: number;
	/** Label under the start of the bar, for example the time elapsed. */
	startName: string;
	startLabel: ReactNode;
	/** Label under the end of the bar, for example the time remaining. */
	endName: string;
	endLabel: ReactNode;
	/** Optional label centered under the bar, between start and end. */
	middleName?: string;
	middleLabel?: ReactNode;
}

/** Bar thickness in px. */
const BAR_HEIGHT = 12;
/** Rounded data-end of the bar in px. */
const BAR_END_RADIUS = 4;
const PERCENT_DECIMALS = 2;

/**
 * One bar from a start to an end, filled to the current progress, with both ends labeled.
 *
 * Memoized per Rule 10: a chart leaf that derives everything from props.
 */
const ProgressBar = React.memo(function ProgressBar({
	title,
	progress,
	startName,
	startLabel,
	endName,
	endLabel,
	middleName,
	middleLabel,
}: ProgressBarProps) {
	const clampedProgress = Math.min(Math.max(progress, 0), 1);
	const percentLabel = `${(clampedProgress * 100).toFixed(PERCENT_DECIMALS)}%`;

	const getLabel = (name: string, label: ReactNode, textAlign: 'left' | 'center' | 'right') => {
		return (
			<Box sx={{ flex: 1, textAlign }}>
				<Typography component="div" variant="body2" color="textSecondary">
					{name}
				</Typography>
				<Typography component="div">{label}</Typography>
			</Box>
		);
	};

	return (
		<Box sx={{ p: 1 }}>
			<Typography component="div" color="textSecondary" variant="body2" sx={{ mb: 1.5 }}>
				{title}{' '}
				<Typography component="span" variant="body2" color="textPrimary">
					{percentLabel}
				</Typography>
			</Typography>
			<LightTooltip title={`${percentLabel} complete`} placement="top">
				<Box
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Number((clampedProgress * 100).toFixed(PERCENT_DECIMALS))}
					sx={{
						position: 'relative',
						height: BAR_HEIGHT,
						borderRadius: `${BAR_END_RADIUS}px`,
						backgroundColor: appPalette.borderSubtle,
						overflow: 'hidden',
					}}
				>
					<Box
						sx={{
							width: `${clampedProgress * 100}%`,
							height: '100%',
							borderRadius: `0 ${BAR_END_RADIUS}px ${BAR_END_RADIUS}px 0`,
							backgroundColor: chartColors.primary,
						}}
					/>
				</Box>
			</LightTooltip>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 1.5 }}>
				{getLabel(startName, startLabel, 'left')}
				{middleName && getLabel(middleName, middleLabel, 'center')}
				{getLabel(endName, endLabel, 'right')}
			</Box>
		</Box>
	);
});

export default ProgressBar;
