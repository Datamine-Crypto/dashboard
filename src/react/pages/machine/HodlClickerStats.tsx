import React from 'react';
import { Box, Card, CardContent, Typography, Grid, useTheme } from '@mui/material';
import { Whatshot, AttachMoney, LocalGasStation } from '@mui/icons-material';
import BN from 'bn.js';

interface HodlClickerStatsProps {
	summary: {
		totalBurned: BN;
		totalJackpot: BN;
		totalTip: BN;
	};
	getUSDValue: (value: BN, round?: number) => string;
}

const HodlClickerStats: React.FC<HodlClickerStatsProps> = ({ summary, getUSDValue }) => {
	const theme = useTheme();

	return (
		<Card
			sx={{
				mb: 4,
				background: `linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)`, // Much darker gradient
				border: `1px solid ${theme.palette.divider}`,
				color: 'white',
				boxShadow: 6,
			}}
		>
			<CardContent>
				<Typography
					variant="h6"
					gutterBottom
					sx={{ opacity: 0.7, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}
				></Typography>
				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 4 }}>
						<Box display="flex" alignItems="center">
							<Whatshot sx={{ mr: 2, fontSize: 48, opacity: 0.9, color: theme.palette.warning.main }} />
							<Box>
								<Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
									LOCK Burned (USD)
								</Typography>
								<Typography variant="h4" fontWeight="bold">
									${getUSDValue(summary.totalBurned)}
								</Typography>
							</Box>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Box display="flex" alignItems="center">
							<AttachMoney sx={{ mr: 2, fontSize: 48, opacity: 0.9, color: theme.palette.success.main }} />
							<Box>
								<Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
									Total Jackpot Won (USD)
								</Typography>
								<Typography variant="h4" fontWeight="bold">
									${getUSDValue(summary.totalJackpot)}
								</Typography>
							</Box>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Box display="flex" alignItems="center">
							<LocalGasStation sx={{ mr: 2, fontSize: 48, opacity: 0.9, color: theme.palette.info.main }} />
							<Box>
								<Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
									Total Tips Paid (USD)
								</Typography>
								<Typography variant="h4" fontWeight="bold">
									${getUSDValue(summary.totalTip)}
								</Typography>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};

export default HodlClickerStats;
