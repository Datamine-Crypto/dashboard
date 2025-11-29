import { Box, useTheme } from '@mui/material';
import React, { useEffect, useState, useMemo } from 'react';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import { getPublicClient } from '@/web3/utils/web3ProviderUtils';
import { gameHodlClickerAbi } from '@/web3/abis/games/gameHodlClicker';
import { Address } from 'viem';
import dayjs from 'dayjs';
import { getPriceToggle } from '@/utils/mathHelpers';

import { useAppStore } from '@/react/utils/appStore';
import { useShallow } from 'zustand/react/shallow';
import { Token } from '@/app/interfaces';

// Sub-components
import HodlClickerChart from './HodlClickerChart';
import HodlClickerFeed from './HodlClickerFeed';
import HodlClickerStats from './HodlClickerStats';
import HodlClickerLeaderboard from './HodlClickerLeaderboard';
import HodlClickerGame from './HodlClickerGame';

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

	const [avgGemValue, setAvgGemValue] = useState<number | null>(null);

	// Calculate Average Jackpot Value for Goal (from recent burns)
	useEffect(() => {
		if (logs.length > 0 && balances) {
			// Use only the last 50 transactions for the average
			const recentLogs = logs.slice(0, 50);

			const totalJackpotUSD = recentLogs.reduce((acc, log) => {
				const jackpotBN = log.args.jackpotAmount;
				const jackpotUSD = parseFloat(
					getPriceToggle({
						value: jackpotBN,
						inputToken: Token.Mintable,
						outputToken: Token.USDC,
						balances,
						round: 6,
						removeCommas: true,
					})
				);
				return acc + jackpotUSD;
			}, 0);

			const avgValue = totalJackpotUSD / recentLogs.length;
			setAvgGemValue(avgValue);
		}
	}, [logs, balances]);

	// Calculate 24h Summary and Chart Data
	const { summary, chartData, maxBurnedUSD, totalTransactions, dateRange, chartTitle } = useMemo(() => {
		const now = Math.floor(Date.now() / 1000);
		const oneDayAgo = now - 24 * 3600;

		const recentLogs = logs.filter((log) => log.timestamp >= oneDayAgo);

		const totalBurned = recentLogs.reduce((acc, log) => acc + log.args.amountActuallyBurned, 0n);
		const totalJackpot = recentLogs.reduce((acc, log) => acc + log.args.jackpotAmount, 0n);
		const totalTip = recentLogs.reduce((acc, log) => acc + log.args.totalTipAmount, 0n);

		// Chart Data: Bucket by hour
		const buckets: { [key: string]: { burnedUSD: number; txCount: number } } = {};

		recentLogs.forEach((log) => {
			const hourTimestamp = dayjs.unix(log.timestamp).startOf('hour').unix();
			if (!buckets[hourTimestamp]) {
				buckets[hourTimestamp] = { burnedUSD: 0, txCount: 0 };
			}

			const burnedBN = log.args.amountActuallyBurned;
			let burnedUSD = 0;
			if (balances) {
				const usdStr = getPriceToggle({
					value: burnedBN,
					inputToken: Token.Mintable,
					outputToken: Token.USDC,
					balances,
					round: 2,
					removeCommas: true,
				});
				burnedUSD = parseFloat(usdStr);
			}

			buckets[hourTimestamp].burnedUSD += burnedUSD;
			buckets[hourTimestamp].txCount += 1;
		});

		let maxBurnedVal = 0;
		const chartData = Object.entries(buckets)
			.map(([timestamp, data]) => {
				if (data.burnedUSD > maxBurnedVal) maxBurnedVal = data.burnedUSD;
				return {
					time: dayjs.unix(Number(timestamp)).format('HH:mm'),
					timestamp: Number(timestamp),
					value: data.burnedUSD,
					formattedValue: `$${data.burnedUSD.toFixed(2)}`,
					tooltipItems: [{ label: 'Tx Count', value: data.txCount }],
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);

		const startDate = dayjs.unix(oneDayAgo).format('MMM D, h:mm A');
		const endDate = dayjs.unix(now).format('MMM D, h:mm A');

		// Dynamic Chart Title
		let chartTitle = 'Collect History (Last 24h)';
		if (logs.length > 0) {
			if (recentLogs.length > 0) {
				const oldestTimestamp = Math.min(...recentLogs.map((l) => l.timestamp));
				const durationHours = Math.ceil((now - oldestTimestamp) / 3600);
				if (durationHours < 24 && durationHours > 0) {
					chartTitle = `Collect History (Last ${durationHours} hour${durationHours !== 1 ? 's' : ''})`;
				}
			}
		}

		return {
			summary: {
				totalBurned,
				totalJackpot,
				totalTip,
			},
			chartData,
			maxBurnedUSD: maxBurnedVal,
			totalTransactions: recentLogs.length,
			dateRange: `${startDate} - ${endDate}`,
			chartTitle,
		};
	}, [logs, balances]);

	const getUSDValue = (value: bigint, round: number = 2) => {
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
		<Box>
			{/* Game Interaction Section */}
			<HodlClickerGame ecosystem={ecosystem} avgGemValue={avgGemValue} truncateAddress={truncateAddress} />

			{/* Daily Summary Stats */}
			<HodlClickerStats summary={summary} getUSDValue={getUSDValue} />

			{/* Leaderboard */}
			<HodlClickerLeaderboard logs={logs} balances={balances} truncateAddress={truncateAddress} />
			{/* Collect History Chart */}
			<HodlClickerChart
				chartData={chartData}
				maxValue={maxBurnedUSD}
				totalTransactions={totalTransactions}
				chartTitle={chartTitle}
			/>

			{/* Horizontal Timeline */}
			<Box mb={6}>
				<HodlClickerFeed logs={logs} balances={balances} truncateAddress={truncateAddress} />
			</Box>
		</Box>
	);
};

export default HodlClickerEvents;
