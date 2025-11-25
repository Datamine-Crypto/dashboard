import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { getPublicClient } from '@/web3/utils/web3ProviderUtils';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import gameHodlClickerAbi from '@/web3/abis/games/gameHodlClicker.json';
import { Address } from 'viem';

interface Props {
	ecosystem: Ecosystem;
}

interface EventLog {
	id: string;
	eventName: string;
	args: any;
	blockNumber: string;
	transactionHash: string;
	logIndex: number;
	timestamp: string;
}

const HodlClickerEvents: React.FC<Props> = ({ ecosystem }) => {
	const [logs, setLogs] = useState<EventLog[]>([]);

	useEffect(() => {
		const publicClient = getPublicClient();
		const config = getEcosystemConfig(ecosystem);
		const address = config.gameHodlClickerAddress as Address;

		if (!publicClient || !address) return;

		const processLogs = (rawLogs: any[], isHistory: boolean = false) => {
			const eventsOfInterest = ['Deposited', 'NormalMint', 'PausedChanged', 'TokensBurned', 'Withdrawn'];

			const formattedLogs = rawLogs
				.filter((log) => eventsOfInterest.includes(log.eventName))
				.map((log) => {
					const logIndex = typeof log.logIndex === 'bigint' ? Number(log.logIndex) : log.logIndex || 0;
					return {
						id: `${log.transactionHash}-${logIndex}`,
						eventName: log.eventName,
						args: log.args,
						blockNumber: log.blockNumber.toString(),
						transactionHash: log.transactionHash,
						logIndex,
						timestamp: isHistory ? 'History' : new Date().toLocaleTimeString(),
					};
				});

			if (formattedLogs.length === 0) return;

			// Deduplicate within the batch
			const uniqueBatchLogs = Array.from(new Map(formattedLogs.map((log) => [log.id, log])).values());

			console.log(`[HodlClicker Events] ${isHistory ? '(History)' : '(Live)'}`, uniqueBatchLogs);

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
				return allLogs.slice(0, 1000); // Keep last 1000 events
			});
		};

		const fetchHistory = async () => {
			try {
				const currentBlock = await publicClient.getBlockNumber();
				let collectedLogs: any[] = [];
				const targetCount = 100;

				// Adjust chunk size based on ecosystem (L2s have faster blocks, so we need larger chunks to cover same time)
				// Arbitrum: ~0.25s blocks -> 4x blocks per second compared to L1 (12s) is not accurate comparison for RPC limits.
				// L1 (12s): 10,000 blocks = ~33 hours
				// Arbitrum (0.25s): 10,000 blocks = ~40 minutes
				// To get ~24 hours of history on Arbitrum we need ~345k blocks.
				// We increase chunk size for L2s to ensure we look back far enough per iteration.
				const isL1 = ecosystem === Ecosystem.Flux;
				const chunkSize = isL1 ? 10000n : 100000n;

				let toBlock = currentBlock;
				let iterations = 0;
				const maxIterations = 3; // Reduced to 3 as requested

				while (collectedLogs.length < targetCount && iterations < maxIterations && toBlock > 0n) {
					const fromBlock = toBlock - chunkSize > 0n ? toBlock - chunkSize : 0n;

					const logs = await publicClient.getContractEvents({
						address,
						abi: gameHodlClickerAbi,
						fromBlock,
						toBlock,
					});

					// Filter for relevant events before counting
					const eventsOfInterest = ['Deposited', 'NormalMint', 'PausedChanged', 'TokensBurned', 'Withdrawn'];
					const relevantLogs = logs.filter((log) => eventsOfInterest.includes(log.eventName));

					// Prepend older logs to maintain chronological order if needed, though we sort later
					collectedLogs = [...relevantLogs, ...collectedLogs];

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
			onLogs: (logs) => processLogs(logs, false),
		});

		return () => {
			unwatch();
		};
	}, [ecosystem]);

	return (
		<Paper elevation={3} sx={{ p: 2, mt: 4, maxHeight: 400, overflow: 'auto' }}>
			<Typography variant="h6" gutterBottom>
				HodlClicker Events (Debug)
			</Typography>
			<List dense>
				{logs.length === 0 && (
					<ListItem>
						<ListItemText primary="Waiting for events..." />
					</ListItem>
				)}
				{logs.map((log) => (
					<ListItem key={log.id} divider>
						<ListItemText
							primary={
								<Typography variant="subtitle2" color="primary">
									[{log.timestamp}] {log.eventName} (Block: {log.blockNumber} | Idx: {log.logIndex})
								</Typography>
							}
							secondary={
								<Box
									component="pre"
									sx={{
										m: 0,
										p: 1,
										bgcolor: 'background.default',
										borderRadius: 1,
										fontSize: '0.75rem',
										overflowX: 'auto',
									}}
								>
									{JSON.stringify(log.args, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2)}
								</Box>
							}
						/>
					</ListItem>
				))}
			</List>
		</Paper>
	);
};

export default HodlClickerEvents;
