import {
	Box,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Grid,
	Typography,
	useTheme,
	Paper,
	Tooltip,
} from '@mui/material';
import React, { useEffect, useState, useMemo } from 'react';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import { getPublicClient } from '@/web3/utils/web3ProviderUtils';
import gameHodlClickerAbi from '@/web3/abis/games/gameHodlClicker.json';
import { Address } from 'viem';
import moment from 'moment';
import { BNToDecimal, getPriceToggle } from '@/utils/mathHelpers';
import BN from 'bn.js';
import { Whatshot, AttachMoney, LocalGasStation } from '@mui/icons-material';
import { useAppStore } from '@/react/utils/appStore';
import { useShallow } from 'zustand/react/shallow';
import { Token } from '@/app/interfaces';

interface Props {
	ecosystem: Ecosystem;
}

interface TokensBurnedArgs {
	burnToAddress: string;
	caller: string;
	currentBlock: bigint;
	amountActuallyBurned: bigint;
	totalTipAmount: bigint;
	jackpotAmount: bigint;
	totalTipToAddAmount: bigint;
	amountToMintAfterBurn: bigint;
}

interface EventLog {
	id: string;
	eventName: string;
	args: TokensBurnedArgs;
	blockNumber: string;
	transactionHash: string;
	logIndex: number;
	timestamp: number; // Unix timestamp in seconds
}

const TimeAgo: React.FC<{ timestamp: number }> = ({ timestamp }) => {
	const [timeAgo, setTimeAgo] = useState(moment.unix(timestamp).fromNow());

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeAgo(moment.unix(timestamp).fromNow());
		}, 60000); // Update every minute
		return () => clearInterval(interval);
	}, [timestamp]);

	return <>{timeAgo}</>;
};

const HodlClickerEvents: React.FC<Props> = ({ ecosystem }) => {
	const [logs, setLogs] = useState<EventLog[]>([]);
	const theme = useTheme();
	const { balances } = useAppStore(
		useShallow((state) => ({
			balances: state.balances,
		}))
	);

	useEffect(() => {
		const publicClient = getPublicClient();
		const config = getEcosystemConfig(ecosystem);
		const address = config.gameHodlClickerAddress as Address;

		if (!publicClient || !address) return;

		const processLogs = async (rawLogs: any[], isHistory: boolean = false) => {
			const eventsOfInterest = ['TokensBurned'];

			// Filter and format logs
			const formattedLogsPromises = rawLogs
				.filter((log) => eventsOfInterest.includes(log.eventName))
				.map(async (log) => {
					const logIndex = typeof log.logIndex === 'bigint' ? Number(log.logIndex) : log.logIndex || 0;
					let timestamp = Math.floor(Date.now() / 1000);

					if (isHistory) {
						try {
							const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
							timestamp = Number(block.timestamp);
						} catch (e) {
							console.error('Error fetching block timestamp', e);
						}
					}

					return {
						id: `${log.transactionHash}-${logIndex}`,
						eventName: log.eventName,
						args: log.args as TokensBurnedArgs,
						blockNumber: log.blockNumber.toString(),
						transactionHash: log.transactionHash,
						logIndex,
						timestamp,
					};
				});

			const formattedLogs = await Promise.all(formattedLogsPromises);

			if (formattedLogs.length === 0) return;

			// Deduplicate within the batch
			const uniqueBatchLogs = Array.from(new Map(formattedLogs.map((log) => [log.id, log])).values());

			setLogs((prevLogs) => {
				const uniqueNewLogs = uniqueBatchLogs.filter((newLog) => !prevLogs.some((prevLog) => prevLog.id === newLog.id));
				if (uniqueNewLogs.length === 0) return prevLogs;
				// Sort by block number descending, then log index descending
				const allLogs = [...uniqueNewLogs, ...prevLogs].sort((a, b) => {
					if (BigInt(a.blockNumber) !== BigInt(b.blockNumber)) {
						return BigInt(b.blockNumber) > BigInt(a.blockNumber) ? 1 : -1;
					}
					return b.logIndex - a.logIndex;
				});
				return allLogs.slice(0, 500); // Keep last 500 events for charts
			});
		};

		const fetchHistory = async () => {
			try {
				const currentBlock = await publicClient.getBlockNumber();
				let collectedLogs: any[] = [];
				const targetCount = 100; // Fetch more for charts

				const isL1 = ecosystem === Ecosystem.Flux;
				const chunkSize = isL1 ? 10000n : 100000n;

				let toBlock = currentBlock;
				let iterations = 0;
				const maxIterations = 5; // Increase iterations to get more history

				while (collectedLogs.length < targetCount && iterations < maxIterations && toBlock > 0n) {
					const fromBlock = toBlock - chunkSize > 0n ? toBlock - chunkSize : 0n;

					const logs = await publicClient.getContractEvents({
						address,
						abi: gameHodlClickerAbi,
						eventName: 'TokensBurned',
						fromBlock,
						toBlock,
					});

					collectedLogs = [...logs, ...collectedLogs];
					toBlock = fromBlock - 1n;
					iterations++;
				}

				processLogs(collectedLogs, true);
			} catch (error) {
				console.error('Failed to fetch past events:', error);
			}
		};

		fetchHistory();

		const unwatch = publicClient.watchContractEvent({
			address,
			abi: gameHodlClickerAbi,
			eventName: 'TokensBurned',
			onLogs: (logs) => processLogs(logs, false),
		});

		return () => {
			unwatch();
		};
	}, [ecosystem]);

	// Calculate 24h Summary and Chart Data
	const { summary, chartData, maxBurned, totalTransactions, dateRange } = useMemo(() => {
		const now = Math.floor(Date.now() / 1000);
		const oneDayAgo = now - 24 * 3600;

		const recentLogs = logs.filter((log) => log.timestamp >= oneDayAgo);

		const totalBurned = recentLogs.reduce(
			(acc, log) => acc.add(new BN(log.args.amountActuallyBurned.toString())),
			new BN(0)
		);
		const totalJackpot = recentLogs.reduce((acc, log) => acc.add(new BN(log.args.jackpotAmount.toString())), new BN(0));
		const totalTip = recentLogs.reduce((acc, log) => acc.add(new BN(log.args.totalTipAmount.toString())), new BN(0));

		// Chart Data: Bucket by hour
		const buckets: { [key: string]: { burned: number; txCount: number } } = {};
		// Initialize last 24 hours
		for (let i = 0; i < 24; i++) {
			const hourTimestamp = moment().subtract(i, 'hours').startOf('hour').unix();
			buckets[hourTimestamp] = { burned: 0, txCount: 0 };
		}

		recentLogs.forEach((log) => {
			const hourTimestamp = moment.unix(log.timestamp).startOf('hour').unix();
			if (buckets[hourTimestamp] !== undefined) {
				const burned = parseFloat(BNToDecimal(new BN(log.args.amountActuallyBurned.toString()), false, 18, 2) || '0');
				buckets[hourTimestamp].burned += burned;
				buckets[hourTimestamp].txCount += 1;
			}
		});

		let maxBurnedVal = 0;
		const chartData = Object.entries(buckets)
			.map(([timestamp, data]) => {
				if (data.burned > maxBurnedVal) maxBurnedVal = data.burned;
				return {
					time: moment.unix(Number(timestamp)).format('HH:mm'),
					timestamp: Number(timestamp),
					burned: data.burned,
					txCount: data.txCount,
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);

		const startDate = moment.unix(oneDayAgo).format('MMM D, h:mm A');
		const endDate = moment.unix(now).format('MMM D, h:mm A');

		return {
			summary: {
				totalBurned,
				totalJackpot,
				totalTip,
			},
			chartData,
			maxBurned: maxBurnedVal,
			totalTransactions: recentLogs.length,
			dateRange: `${startDate} - ${endDate}`,
		};
	}, [logs]);

	const getUSDValue = (value: BN, round: number = 2) => {
		if (!balances) return '0.00';
		return getPriceToggle({
			value,
			inputToken: Token.Mintable,
			outputToken: Token.USDC,
			balances,
			round,
		});
	};

	const truncateAddress = (address: string) => {
		if (!address) return '';
		return `${address.substring(0, 12)}...${address.substring(address.length - 12)}`;
	};

	return (
		<Box mt={4}>
			{/* 24h Summary Card */}
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
					>
						{dateRange}
					</Typography>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 4 }}>
							<Box display="flex" alignItems="center">
								<Whatshot sx={{ mr: 2, fontSize: 48, opacity: 0.9, color: theme.palette.error.main }} />
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
								<LocalGasStation sx={{ mr: 2, fontSize: 48, opacity: 0.9, color: theme.palette.warning.main }} />
								<Box>
									<Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
										Distributed Rewards (USD)
									</Typography>
									<Typography variant="h4" fontWeight="bold">
										${getUSDValue(summary.totalTip, 4)}
									</Typography>
								</Box>
							</Box>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Custom Burn History Chart */}
			<Paper sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
					<Typography variant="h6">Burn History (Last 24h)</Typography>
					<Chip label={`${totalTransactions} Transactions`} color="secondary" variant="outlined" size="small" />
				</Box>
				<Box height={200} display="flex" alignItems="flex-end" justifyContent="space-between" sx={{ gap: 0.5, pt: 2 }}>
					{chartData.map((data, index) => {
						const heightPercent = maxBurned > 0 ? (data.burned / maxBurned) * 100 : 0;
						return (
							<Tooltip
								key={data.timestamp}
								title={
									<Box textAlign="center">
										<Typography variant="body2" fontWeight="bold">
											{data.time}
										</Typography>
										<Typography variant="body2">{data.burned.toFixed(2)} FLUX</Typography>
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
										width: '100%',
										bgcolor: theme.palette.secondary.main,
										borderRadius: '4px 4px 0 0',
										transition: 'all 0.3s ease',
										boxShadow: `0 0 8px ${theme.palette.secondary.main}`,
										'&:hover': {
											opacity: 0.9,
											transform: 'scaleY(1.05)',
											boxShadow: `0 0 12px ${theme.palette.secondary.light}`,
										},
									}}
								/>
							</Tooltip>
						);
					})}
				</Box>
				<Box display="flex" justifyContent="space-between" mt={1}>
					<Typography variant="caption" color="textSecondary">
						24h Ago
					</Typography>
					<Typography variant="caption" color="textSecondary">
						Now
					</Typography>
				</Box>
			</Paper>

			{/* Horizontal Timeline */}
			<Typography variant="h6" gutterBottom>
				Recent Burns Timeline
			</Typography>
			{logs.length === 0 ? (
				<Box display="flex" justifyContent="center" p={4}>
					<CircularProgress color="secondary" />
				</Box>
			) : (
				<Box
					sx={{
						display: 'flex',
						overflowX: 'auto',
						pb: 2,
						gap: 2,
						'&::-webkit-scrollbar': {
							height: 8,
						},
						'&::-webkit-scrollbar-track': {
							backgroundColor: theme.palette.action.hover,
							borderRadius: 4,
						},
						'&::-webkit-scrollbar-thumb': {
							backgroundColor: theme.palette.secondary.main,
							borderRadius: 4,
						},
					}}
				>
					{logs.map((log) => {
						const amountBurned = BNToDecimal(new BN(log.args.amountActuallyBurned.toString()), true, 18, 2);
						const jackpotBN = new BN(log.args.jackpotAmount.toString());
						const tipBN = new BN(log.args.totalTipAmount.toString());

						const jackpotUSDC = balances
							? getPriceToggle({
									value: jackpotBN,
									inputToken: Token.Mintable,
									outputToken: Token.USDC,
									balances,
									round: 4,
								})
							: '0.0000';

						const tipUSDC = balances
							? getPriceToggle({
									value: tipBN,
									inputToken: Token.Mintable,
									outputToken: Token.USDC,
									balances,
									round: 4,
								})
							: '0.0000';

						return (
							<Card
								key={log.id}
								variant="outlined"
								sx={{
									minWidth: 280,
									flexShrink: 0,
									position: 'relative',
									overflow: 'visible',
									mt: 2,
									bgcolor: theme.palette.background.paper, // Ensure contrast
									borderColor: theme.palette.divider,
								}}
							>
								<CardContent>
									<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
										<Typography variant="caption" color="textSecondary">
											<TimeAgo timestamp={log.timestamp} />
										</Typography>
										<Typography variant="caption" color="textSecondary">
											Block: {log.blockNumber}
										</Typography>
									</Box>
									<Box display="flex" alignItems="center" mb={1}>
										<Whatshot color="secondary" sx={{ mr: 1 }} />
										<Typography variant="h6" color="secondary">
											{amountBurned} FLUX
										</Typography>
									</Box>
									<Typography variant="caption" color="textSecondary" gutterBottom noWrap sx={{ fontSize: '0.7rem' }}>
										By: {truncateAddress(log.args.caller)}
									</Typography>
									<Box mt={2}>
										<Chip label={`Jackpot: $${jackpotUSDC}`} size="small" variant="outlined" sx={{ mr: 1, mb: 1 }} />
										<Chip label={`Tip: $${tipUSDC}`} size="small" variant="outlined" sx={{ mb: 1 }} />
									</Box>
								</CardContent>
							</Card>
						);
					})}
				</Box>
			)}
		</Box>
	);
};

export default HodlClickerEvents;
