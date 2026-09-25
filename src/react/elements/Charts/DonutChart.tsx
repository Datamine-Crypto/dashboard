import { Box, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import LightTooltip from '@/react/elements/LightTooltip';
import { appPalette } from '@/theme/appTheme';

export interface DonutSegment {
	label: string;
	/** Relative size of the slice. Only the ratio between segments matters. */
	value: number;
	/** Displayed value, for example "$55,501.52". */
	valueLabel: string;
	/** Extra hover detail, for example the token amount behind a USD value. */
	tooltip?: ReactNode;
	color: string;
}

interface DonutChartProps {
	title: ReactNode;
	segments: DonutSegment[];
	/** Headline in the middle of the ring, usually the total. */
	centerValue: string;
	centerLabel: string;
}

/** Outer size of the chart in px. */
const CHART_SIZE = 168;
/** Ring thickness in px. */
const RING_WIDTH = 20;
/** Ring thickness while a slice is hovered. */
const RING_WIDTH_HOVER = 24;
/** Surface-colored gap between slices, measured along the ring in px. */
const SLICE_GAP = 2;
/** Legend swatch size in px. */
const SWATCH_SIZE = 10;
const PERCENT_DECIMALS = 2;

const RADIUS = (CHART_SIZE - RING_WIDTH_HOVER) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatPercent = (fraction: number) => `${(fraction * 100).toFixed(PERCENT_DECIMALS)}%`;

/**
 * Part-to-whole donut with a value legend.
 *
 * Every slice is labeled in the legend with its value and percent, so identity never depends on
 * color alone. Slices and legend rows share the same hover tooltip.
 *
 * Memoized per Rule 10: an expensive leaf (SVG chart) that derives everything from props.
 */
const DonutChart = React.memo(function DonutChart({ title, segments, centerValue, centerLabel }: DonutChartProps) {
	const visibleSegments = segments.filter((segment) => segment.value > 0);
	const total = visibleSegments.reduce((sum, segment) => sum + segment.value, 0);

	const getTooltip = (segment: DonutSegment) => {
		return (
			<>
				<Box sx={{ fontWeight: 'bold' }}>{segment.label}</Box>
				<Box>
					{segment.valueLabel} ({formatPercent(total > 0 ? segment.value / total : 0)})
				</Box>
				{segment.tooltip && <Box sx={{ color: appPalette.textMuted }}>{segment.tooltip}</Box>}
			</>
		);
	};

	const getSlices = () => {
		// A single slice is a full ring, so it gets no gap.
		const gap = visibleSegments.length > 1 ? SLICE_GAP : 0;
		let offset = 0;

		return visibleSegments.map((segment) => {
			const arcLength = (segment.value / total) * CIRCUMFERENCE;
			const slice = (
				<LightTooltip key={segment.label} title={getTooltip(segment)} placement="top">
					<circle
						cx={CHART_SIZE / 2}
						cy={CHART_SIZE / 2}
						r={RADIUS}
						fill="none"
						stroke={segment.color}
						strokeWidth={RING_WIDTH}
						strokeDasharray={`${Math.max(arcLength - gap, 0)} ${CIRCUMFERENCE}`}
						strokeDashoffset={-offset}
					/>
				</LightTooltip>
			);
			offset += arcLength;
			return slice;
		});
	};

	const getLegend = () => {
		return visibleSegments.map((segment) => (
			<LightTooltip key={segment.label} title={getTooltip(segment)} placement="left">
				<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, py: 0.5 }}>
					<Box
						sx={{
							width: SWATCH_SIZE,
							height: SWATCH_SIZE,
							borderRadius: '2px',
							flexShrink: 0,
							backgroundColor: segment.color,
						}}
					/>
					<Box>
						<Typography component="div" variant="body2" color="textSecondary">
							{segment.label}
						</Typography>
						<Typography component="div">
							{segment.valueLabel}{' '}
							<Typography component="span" variant="body2" color="textSecondary">
								({formatPercent(segment.value / total)})
							</Typography>
						</Typography>
					</Box>
				</Box>
			</LightTooltip>
		));
	};

	const ariaLabel = visibleSegments
		.map((segment) => `${segment.label} ${segment.valueLabel} (${formatPercent(segment.value / total)})`)
		.join(', ');

	return (
		<Box sx={{ p: 1 }}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 3 }}>
				{/* Title and ring share one column, so the title is centered over the ring */}
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
					<Typography
						component="div"
						color="textSecondary"
						variant="body2"
						sx={{ mb: 1, textAlign: 'center', whiteSpace: 'nowrap' }}
					>
						{title}
					</Typography>
					<Box sx={{ position: 'relative', width: CHART_SIZE, height: CHART_SIZE, flexShrink: 0 }}>
						<Box
							component="svg"
							role="img"
							aria-label={ariaLabel}
							width={CHART_SIZE}
							height={CHART_SIZE}
							viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
							sx={{
								display: 'block',
								'& circle': { transition: 'stroke-width 120ms' },
								'& circle:hover': { strokeWidth: RING_WIDTH_HOVER },
							}}
						>
							{/* Start slices at 12 o'clock and run clockwise */}
							<g transform={`rotate(-90 ${CHART_SIZE / 2} ${CHART_SIZE / 2})`}>{getSlices()}</g>
						</Box>
						<Box
							sx={{
								position: 'absolute',
								inset: 0,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								textAlign: 'center',
								pointerEvents: 'none',
							}}
						>
							<Typography component="div" sx={{ fontWeight: 'bold' }}>
								{centerValue}
							</Typography>
							<Typography component="div" variant="caption" color="textSecondary">
								{centerLabel}
							</Typography>
						</Box>
					</Box>
				</Box>
				{/* Same height as the ring and bottom-aligned, so the legend is centered on the ring */}
				<Box sx={{ minHeight: CHART_SIZE, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
					{getLegend()}
				</Box>
			</Box>
		</Box>
	);
});

export default DonutChart;
