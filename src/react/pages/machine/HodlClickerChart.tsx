import React from 'react';
import { Box, Paper, Typography, Chip, Tooltip, useTheme } from '@mui/material';

interface ChartDataPoint {
	time: string;
	timestamp: number;
	burnedUSD: number;
	txCount: number;
	id?: string;
	caller?: string;
	jackpotUSD?: string;
	tipUSD?: string;
	blockNumber?: string;
}

interface HodlClickerChartProps {
	chartData: ChartDataPoint[];
	maxBurnedUSD: number;
	totalTransactions: number;
	chartTitle: string;
	averageValue?: number;
	hideTotalTransactions?: boolean;
	hideTooltipTxCount?: boolean;
}

const HodlClickerChart: React.FC<HodlClickerChartProps> = ({
	chartData,
	maxBurnedUSD,
	totalTransactions,
	chartTitle,
	averageValue,
	hideTotalTransactions,
	hideTooltipTxCount,
}) => {
	const theme = useTheme();

	return (
		<Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
				<Typography variant="h6">{chartTitle}</Typography>
				<Box display="flex" gap={1}>
					{averageValue !== undefined && (
						<Chip
							label={`Avg: $${averageValue.toFixed(4)}`}
							size="small"
							variant="outlined"
							sx={{ borderColor: theme.palette.info.main, color: theme.palette.info.main }}
						/>
					)}
					{!hideTotalTransactions && (
						<Chip label={`${totalTransactions} Transactions`} color="secondary" variant="outlined" size="small" />
					)}
				</Box>
			</Box>
			<Box sx={{ overflowX: 'auto', pb: 1 }}>
				<Box
					height={200}
					display="flex"
					alignItems="stretch"
					sx={{
						pt: 2,
						position: 'relative',
						minWidth: Math.max(100, chartData.length * 10), // Ensure minimum width per bar
					}}
				>
					{/* Average Line */}
					{averageValue !== undefined && maxBurnedUSD > 0 && (
						<Box
							sx={{
								position: 'absolute',
								left: 0,
								right: 0,
								bottom: `${(averageValue / maxBurnedUSD) * 100}%`,
								borderTop: `2px dashed ${theme.palette.info.main}`,
								opacity: 0.7,
								zIndex: 1,
								pointerEvents: 'none',
							}}
						/>
					)}

					{chartData.map((data, index) => {
						const heightPercent = maxBurnedUSD > 0 ? (data.burnedUSD / maxBurnedUSD) * 100 : 0;
						const isAboveAverage = averageValue !== undefined && data.burnedUSD > averageValue;

						return (
							<Tooltip
								key={data.id || data.timestamp}
								title={
									<Box textAlign="center">
										<Typography variant="body2" fontWeight="bold">
											{data.time}
										</Typography>
										<Typography variant="body2" color="warning.main" fontWeight="bold">
											${data.burnedUSD.toFixed(4)}
										</Typography>
										{data.caller && (
											<Typography variant="caption" display="block">
												By: {data.caller}
											</Typography>
										)}
										{data.jackpotUSD && (
											<Typography variant="caption" display="block" color="success.light">
												Jackpot: ${data.jackpotUSD}
											</Typography>
										)}
										{data.tipUSD && (
											<Typography variant="caption" display="block" color="info.light">
												Tip: ${data.tipUSD}
											</Typography>
										)}
										{data.blockNumber && (
											<Typography variant="caption" display="block" color="text.secondary">
												Block: {data.blockNumber}
											</Typography>
										)}
										{!hideTooltipTxCount && (
											<Typography variant="caption" display="block">
												{data.txCount} Tx{data.txCount !== 1 ? 's' : ''}
											</Typography>
										)}
									</Box>
								}
								arrow
							>
								<Box
									sx={{
										flex: 1,
										display: 'flex',
										alignItems: 'flex-end',
										px: 0.25,
										'&:hover .bar': {
											opacity: 0.7,
											transform: 'scaleY(1.05)',
										},
									}}
								>
									<Box
										className="bar"
										sx={{
											height: `${Math.max(heightPercent, 2)}%`, // Min height for visibility
											width: '100%',
											bgcolor: isAboveAverage ? theme.palette.success.light : theme.palette.warning.main,
											borderRadius: '4px 4px 0 0',
											transition: 'all 0.3s ease',
											opacity: 0.5,
										}}
									/>
								</Box>
							</Tooltip>
						);
					})}
				</Box>
			</Box>
			<Box display="flex" justifyContent="space-between" mt={1}>
				<Typography variant="caption" color="textSecondary">
					{chartData.length > 0 ? chartData[0].time : ''}
				</Typography>
				<Typography variant="caption" color="textSecondary">
					{chartData.length > 0 ? chartData[chartData.length - 1].time : ''}
				</Typography>
			</Box>
		</Paper>
	);
};

export default HodlClickerChart;
