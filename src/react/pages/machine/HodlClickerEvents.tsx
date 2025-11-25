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

		const handleLogs = (newRawLogs: any[]) => {
			console.log('newRawLogs:', newRawLogs);
			const eventsOfInterest = ['Deposited', 'NormalMint', 'PausedChanged', 'TokensBurned', 'Withdrawn'];

			const formattedLogs = newRawLogs
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
						timestamp: new Date().toLocaleTimeString(),
					};
				});

			if (formattedLogs.length === 0) return;

			// Deduplicate within the batch
			const uniqueBatchLogs = Array.from(new Map(formattedLogs.map((log) => [log.id, log])).values());

			console.log('[HodlClicker Events]', uniqueBatchLogs);

			setLogs((prevLogs) => {
				const uniqueNewLogs = uniqueBatchLogs.filter((newLog) => !prevLogs.some((prevLog) => prevLog.id === newLog.id));
				if (uniqueNewLogs.length === 0) return prevLogs;
				return [...uniqueNewLogs, ...prevLogs].slice(0, 50);
			});
		};

		const unwatch = publicClient.watchContractEvent({
			address,
			abi: gameHodlClickerAbi,
			onLogs: handleLogs,
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
