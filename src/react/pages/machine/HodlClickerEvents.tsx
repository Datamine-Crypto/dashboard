import {
	Box,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Grid,
	List,
	ListItem,
	Typography,
	useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import { getPublicClient } from '@/web3/utils/web3ProviderUtils';
import gameHodlClickerAbi from '@/web3/abis/games/gameHodlClicker.json';
import { Address } from 'viem';
import moment from 'moment';
import { BNToDecimal, getPriceToggle } from '@/utils/mathHelpers';
import BN from 'bn.js';
import { Whatshot } from '@mui/icons-material';
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
				return allLogs.slice(0, 100); // Keep last 100 events
			});
		};

		const fetchHistory = async () => {
			try {
				const currentBlock = await publicClient.getBlockNumber();
				let collectedLogs: any[] = [];
				const targetCount = 20; // Fetch fewer for timeline to avoid clutter

				const isL1 = ecosystem === Ecosystem.Flux;
				const chunkSize = isL1 ? 10000n : 100000n;

				let toBlock = currentBlock;
				let iterations = 0;
				const maxIterations = 3;

				while (collectedLogs.length < targetCount && iterations < maxIterations && toBlock > 0n) {
					const fromBlock = toBlock - chunkSize > 0n ? toBlock - chunkSize : 0n;

					const logs = await publicClient.getContractEvents({
						address,
						abi: gameHodlClickerAbi,
						eventName: 'TokensBurned', // Only fetch TokensBurned
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
			eventName: 'TokensBurned', // Only watch TokensBurned
			onLogs: (logs) => processLogs(logs, false),
		});

		return () => {
			unwatch();
		};
	}, [ecosystem]);

	return (
		<Box mt={4}>
			<Typography variant="h5" gutterBottom align="center">
				Recent Burns
			</Typography>
			{logs.length === 0 ? (
				<Box display="flex" justifyContent="center" p={4}>
					<CircularProgress color="secondary" />
				</Box>
			) : (
				<Box position="relative">
					{/* Vertical Line */}
					<Box
						position="absolute"
						left="50%"
						top={0}
						bottom={0}
						width="2px"
						bgcolor={theme.palette.divider}
						sx={{ transform: 'translateX(-50%)' }}
					/>
					<List sx={{ p: 0 }}>
						{logs.map((log, index) => {
							const amountBurned = BNToDecimal(new BN(log.args.amountActuallyBurned.toString()), true, 18, 2);

							const jackpotBN = new BN(log.args.jackpotAmount.toString());
							const tipBN = new BN(log.args.totalTipAmount.toString());

							const jackpotUSDC = balances
								? getPriceToggle({
										value: jackpotBN,
										inputToken: Token.Mintable,
										outputToken: Token.USDC,
										balances,
										round: 3,
									})
								: '0.0000';

							const tipUSDC = balances
								? getPriceToggle({
										value: tipBN,
										inputToken: Token.Mintable,
										outputToken: Token.USDC,
										balances,
										round: 3,
									})
								: '0.0000';

							return (
								<ListItem key={log.id} sx={{ p: 0, mb: 4 }}>
									<Grid container alignItems="center">
										{/* Left Side (Time) */}
										<Grid item xs={5} sx={{ textAlign: 'right', pr: 4 }}>
											<Typography variant="body2" color="textSecondary">
												<TimeAgo timestamp={log.timestamp} />
											</Typography>
											<Typography variant="caption" color="textSecondary" display="block">
												Block: {log.blockNumber}
											</Typography>
										</Grid>

										{/* Center (Dot) */}
										<Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
											<Box
												sx={{
													width: 16,
													height: 16,
													borderRadius: '50%',
													bgcolor: theme.palette.secondary.main,
													zIndex: 1,
													boxShadow: `0 0 0 4px ${theme.palette.background.default}`,
												}}
											/>
										</Grid>

										{/* Right Side (Card) */}
										<Grid item xs={5} sx={{ pl: 4 }}>
											<Card variant="outlined" sx={{ position: 'relative', overflow: 'visible' }}>
												<CardContent>
													<Box display="flex" alignItems="center" mb={1}>
														<Whatshot color="secondary" sx={{ mr: 1 }} />
														<Typography variant="h6" color="secondary">
															{amountBurned} FLUX
														</Typography>
													</Box>
													<Typography variant="body2" color="textSecondary" gutterBottom>
														Burned by {log.args.caller.slice(0, 6)}...{log.args.caller.slice(-4)}
													</Typography>
													<Box mt={2}>
														<Chip
															label={`Jackpot: $${jackpotUSDC}`}
															size="small"
															variant="outlined"
															sx={{ mr: 1, mb: 1 }}
														/>
														<Chip label={`Tip: $${tipUSDC}`} size="small" variant="outlined" sx={{ mb: 1 }} />
													</Box>
												</CardContent>
											</Card>
										</Grid>
									</Grid>
								</ListItem>
							);
						})}
					</List>
				</Box>
			)}
		</Box>
	);
};

export default HodlClickerEvents;
