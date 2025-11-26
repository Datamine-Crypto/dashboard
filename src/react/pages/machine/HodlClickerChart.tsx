import React from 'react';
import { Box, Paper, Typography, Chip, Tooltip, useTheme } from '@mui/material';

interface ChartDataPoint {
	time: string;
	timestamp: number;
	burnedUSD: number;
	txCount: number;
}

interface HodlClickerChartProps {
	chartData: ChartDataPoint[];
	maxBurnedUSD: number;
	totalTransactions: number;
	chartTitle: string;
}

const HodlClickerChart: React.FC<HodlClickerChartProps> = ({
	chartData,
	maxBurnedUSD,
	totalTransactions,
	chartTitle,
}) => {
	const theme = useTheme();

	return (
		<Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
				<Typography variant="h6">{chartTitle}</Typography>
				<Chip label={`${totalTransactions} Transactions`} color="secondary" variant="outlined" size="small" />
			</Box>
			<Box height={200} display="flex" alignItems="flex-end" justifyContent="space-between" sx={{ gap: 0.5, pt: 2 }}>
				{chartData.map((data, index) => {
					const heightPercent = maxBurnedUSD > 0 ? (data.burnedUSD / maxBurnedUSD) * 100 : 0;
					return (
						<Tooltip
							key={data.timestamp}
							title={
								<Box textAlign="center">
									<Typography variant="body2" fontWeight="bold">
										{data.time}
									</Typography>
									<Typography variant="body2">${data.burnedUSD.toFixed(2)}</Typography>
									<Typography variant="caption" display="block">
										{data.txCount} Tx{data.txCount !== 1 ? 's' : ''}
									</Typography>
								</Box>
							}
							arrow
						>
							<Box
								sx={{
									height: `${Math.max(heightPercent, 2)}%`, // Min height for visibility
									width: `${100 / chartData.length}%`, // Dynamic width
									bgcolor: theme.palette.warning.main,
									borderRadius: '4px 4px 0 0',
									transition: 'all 0.3s ease',
									boxShadow: `0 0 8px ${theme.palette.warning.main}`,
									opacity: 0.5,
									'&:hover': {
										opacity: 0.7,
										transform: 'scaleY(1.05)',
										boxShadow: `0 0 12px ${theme.palette.warning.light}`,
									},
								}}
							/>
						</Tooltip>
					);
				})}
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
