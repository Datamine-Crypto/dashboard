import React, { useState } from 'react';
import {
	Box,
	Paper,
	Typography,
	IconButton,
	Popover,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	LinearProgress,
	Tooltip,
	useTheme,
	SelectChangeEvent,
} from '@mui/material';
import { SportsScore, MoreVert, DirectionsRun } from '@mui/icons-material';

import { Token, AddressLockDetailsViewModel } from '@/app/interfaces';
import { getPriceToggle } from '@/utils/mathHelpers';

export enum GemFilterType {
	PERCENT_90 = 'PERCENT_90',
	PERCENT_80 = 'PERCENT_80',
	PERCENT_50 = 'PERCENT_50',
	PERCENT_25 = 'PERCENT_25',
	PERCENT_10 = 'PERCENT_10',
	MANUAL_0_01 = 'MANUAL_0_01',
	MANUAL_0_05 = 'MANUAL_0_05',
	MANUAL_0_10 = 'MANUAL_0_10',
}

interface HodlClickerFaucetsProps {
	avgGemValue: number | null;
	minGemValue: number;
	selectedFilter: GemFilterType;
	onFilterChange: (filter: GemFilterType) => void;
	sortedMarketAddresses: AddressLockDetailsViewModel[];
	balances: any;
	truncateAddress: (address: string) => string;
}

const HodlClickerFaucets: React.FC<HodlClickerFaucetsProps> = ({
	avgGemValue,
	minGemValue,
	selectedFilter,
	onFilterChange,
	sortedMarketAddresses,
	balances,
	truncateAddress,
}) => {
	const theme = useTheme();
	const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

	return (
		<Paper sx={{ p: 3, mb: 4, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
				<Box display="flex" alignItems="center">
					<SportsScore sx={{ mr: 1, color: theme.palette.warning.main }} />
					<Typography variant="subtitle1" fontWeight="bold">
						Ready Faucets{' '}
						<Typography component="span" variant="subtitle1" color="textSecondary">
							(Average: ${avgGemValue?.toFixed(4) || '0.000'})
						</Typography>
					</Typography>
				</Box>
				<Box display="flex" alignItems="center" gap={1}>
					<Typography variant="caption" color="textSecondary">
						Goal: &gt;= ${minGemValue.toFixed(4)}
					</Typography>
					<IconButton
						size="small"
						onClick={(event) => setFilterAnchorEl(event.currentTarget)}
						aria-label="filter settings"
					>
						<MoreVert />
					</IconButton>
				</Box>
				<Popover
					open={Boolean(filterAnchorEl)}
					anchorEl={filterAnchorEl}
					onClose={() => setFilterAnchorEl(null)}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
				>
					<Box p={2} minWidth={250}>
						<Typography variant="subtitle2" gutterBottom fontWeight="bold">
							Filter Settings
						</Typography>
						<FormControl fullWidth size="small">
							<InputLabel id="min-gem-filter-label">Min Gem Filter</InputLabel>
							<Select
								labelId="min-gem-filter-label"
								id="min-gem-filter"
								value={selectedFilter}
								label="Min Gem Filter"
								onChange={(e: SelectChangeEvent<GemFilterType>) => onFilterChange(e.target.value as GemFilterType)}
							>
								{avgGemValue && (
									<MenuItem value={GemFilterType.PERCENT_90}>
										90% of Average (${(avgGemValue * 0.9).toFixed(4)})
									</MenuItem>
								)}
								{avgGemValue && (
									<MenuItem value={GemFilterType.PERCENT_80}>
										80% of Average (${(avgGemValue * 0.8).toFixed(4)})
									</MenuItem>
								)}
								{avgGemValue && (
									<MenuItem value={GemFilterType.PERCENT_50}>
										50% of Average (${(avgGemValue * 0.5).toFixed(4)})
									</MenuItem>
								)}
								{avgGemValue && (
									<MenuItem value={GemFilterType.PERCENT_25}>
										25% of Average (${(avgGemValue * 0.25).toFixed(4)})
									</MenuItem>
								)}
								{avgGemValue && (
									<MenuItem value={GemFilterType.PERCENT_10}>
										10% of Average (${(avgGemValue * 0.1).toFixed(4)})
									</MenuItem>
								)}
								<MenuItem value={GemFilterType.MANUAL_0_01}>$0.01 (Manual)</MenuItem>
								<MenuItem value={GemFilterType.MANUAL_0_05}>$0.05 (Manual)</MenuItem>
								<MenuItem value={GemFilterType.MANUAL_0_10}>$0.10 (Manual)</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</Popover>
			</Box>
			<Box sx={{ maxHeight: 250, overflowY: 'auto', pr: 1 }}>
				{(() => {
					// Scale bars to the Average Value (100% = Average)
					const scaleMax = avgGemValue || 0;

					return sortedMarketAddresses.map((addr, index) => {
						if (!balances) return null;
						const amountBN = addr.mintAmount;
						const rewardsPercent = addr.rewardsPercent === 0 ? 500 : addr.rewardsPercent;
						const rewardsAmount = amountBN + (amountBN * BigInt(rewardsPercent)) / 10000n;
						const balanceInUsdc = getPriceToggle({
							value: rewardsAmount - amountBN,
							inputToken: Token.Mintable,
							outputToken: Token.USDC,
							balances,
							round: 6,
							removeCommas: true,
						});
						const dollarAmount = parseFloat(balanceInUsdc) / 2;

						// Calculate progress relative to Average (capped at 100%)
						const progress = scaleMax > 0 ? Math.min((dollarAmount / scaleMax) * 100, 100) : 0;

						// Goal Marker is at minGemValue (e.g. 90% of Average)
						const goalPercent = scaleMax > 0 ? (minGemValue / scaleMax) * 100 : 0;

						const isWinner = dollarAmount >= minGemValue;

						return (
							<Box key={addr.currentAddress} mb={1} display="flex" alignItems="center">
								<Typography variant="caption" sx={{ width: 80, fontFamily: 'monospace' }}>
									{truncateAddress(addr.currentAddress)}
								</Typography>
								<Box sx={{ flexGrow: 1, mx: 1, position: 'relative' }}>
									<LinearProgress
										variant="determinate"
										value={progress}
										sx={{
											height: 10,
											borderRadius: 5,
											backgroundColor: theme.palette.grey[800],
											'& .MuiLinearProgress-bar': {
												backgroundColor: isWinner ? '#FFD700' : theme.palette.secondary.main, // Gold for winner
											},
										}}
									/>
									{/* Goal Marker Overlay (at minGemValue) */}
									{scaleMax > 0 && (
										<Tooltip title={`Goal: $${minGemValue.toFixed(4)}`}>
											<Box
												sx={{
													position: 'absolute',
													left: `${Math.min(goalPercent, 100)}%`,
													top: -2,
													bottom: -2,
													width: '2px',
													bgcolor: 'warning.main',
													zIndex: 1,
													boxShadow: '0 0 4px rgba(0,0,0,0.5)',
												}}
											/>
										</Tooltip>
									)}

									{isWinner && (
										<DirectionsRun
											sx={{
												position: 'absolute',
												left: `${progress}%`,
												top: -12,
												fontSize: 16,
												color: '#FFD700', // Gold icon
												transform: 'translateX(-50%)',
											}}
										/>
									)}
								</Box>
								<Typography variant="caption" sx={{ width: 60, textAlign: 'right' }}>
									${dollarAmount.toFixed(4)}
								</Typography>
							</Box>
						);
					});
				})()}
			</Box>
		</Paper>
	);
};

export default HodlClickerFaucets;
