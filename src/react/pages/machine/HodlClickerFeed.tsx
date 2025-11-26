import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, Chip, useTheme } from '@mui/material';
import { Whatshot } from '@mui/icons-material';
import BN from 'bn.js';
import moment from 'moment';
import { Token } from '@/app/interfaces';
import { getPriceToggle } from '@/utils/mathHelpers';

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

interface HodlClickerFeedProps {
	logs: EventLog[];
	balances: any;
	truncateAddress: (address: string) => string;
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

const HodlClickerFeed: React.FC<HodlClickerFeedProps> = ({ logs, balances, truncateAddress }) => {
	const theme = useTheme();

	return (
		<>
			<Typography variant="h6" gutterBottom color="textPrimary">
				Recent Collections
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
						const amountBurnedBN = new BN(log.args.amountActuallyBurned.toString());
						const amountBurnedUSD = balances
							? getPriceToggle({
									value: amountBurnedBN,
									inputToken: Token.Mintable,
									outputToken: Token.USDC,
									balances,
									round: 2,
								})
							: '0.00';

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
											${amountBurnedUSD}
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
		</>
	);
};

export default HodlClickerFeed;
