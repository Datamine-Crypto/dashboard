import React, { useMemo } from 'react';
import {
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	useTheme,
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

import { Balances, Token } from '@/app/interfaces';
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
	timestamp: number;
}

interface Props {
	logs: EventLog[];
	balances: Balances;
	truncateAddress: (address: string) => string;
}

const HodlClickerLeaderboard: React.FC<Props> = ({ logs, balances, truncateAddress }) => {
	const theme = useTheme();

	const leaderboardData = useMemo(() => {
		if (!logs || logs.length === 0 || !balances) return [];

		const addressStats: { [key: string]: { address: string; totalJackpot: bigint; wins: number } } = {};

		logs.forEach((log) => {
			const address = log.args.caller;
			const jackpot = log.args.jackpotAmount;

			if (jackpot === 0n) return;

			if (!addressStats[address]) {
				addressStats[address] = { address, totalJackpot: 0n, wins: 0 };
			}

			addressStats[address].totalJackpot = addressStats[address].totalJackpot + jackpot;
			addressStats[address].wins += 1;
		});

		return Object.values(addressStats)
			.map((stat) => {
				const usdValue = parseFloat(
					getPriceToggle({
						value: stat.totalJackpot,
						inputToken: Token.Mintable,
						outputToken: Token.USDC,
						balances,
						round: 4,
						removeCommas: true,
					})
				);
				return { ...stat, usdValue };
			})
			.sort((a, b) => b.usdValue - a.usdValue)
			.slice(0, 10); // Top 10
	}, [logs, balances]);

	if (leaderboardData.length === 0) return null;

	return (
		<Box mt={4} mb={4}>
			<Box display="flex" alignItems="center" mb={2}>
				<EmojiEvents sx={{ color: theme.palette.warning.main, mr: 1, fontSize: 28 }} />
				<Typography variant="h5" fontWeight="bold" color="textPrimary">
					Jackpot Leaderboard
				</Typography>
			</Box>
			<TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[3] }}>
				<Table size="small">
					<TableHead
						sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }}
					>
						<TableRow>
							<TableCell>Rank</TableCell>
							<TableCell>Address</TableCell>
							<TableCell align="right">Wins</TableCell>
							<TableCell align="right">Total Won (USD)</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{leaderboardData.map((row, index) => (
							<TableRow key={row.address} hover>
								<TableCell>
									<Typography fontWeight="bold" color={index < 3 ? 'primary' : 'textSecondary'}>
										#{index + 1}
									</Typography>
								</TableCell>
								<TableCell>
									{truncateAddress(row.address)}
									{index === 0 && (
										<EmojiEvents sx={{ fontSize: 16, color: '#FFD700', ml: 1, verticalAlign: 'middle' }} />
									)}
									{index === 1 && (
										<EmojiEvents sx={{ fontSize: 16, color: '#C0C0C0', ml: 1, verticalAlign: 'middle' }} />
									)}
									{index === 2 && (
										<EmojiEvents sx={{ fontSize: 16, color: '#CD7F32', ml: 1, verticalAlign: 'middle' }} />
									)}
								</TableCell>
								<TableCell align="right">{row.wins}</TableCell>
								<TableCell align="right">
									<Typography fontWeight="bold" color="success.main">
										${row.usdValue.toFixed(4)}
									</Typography>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default HodlClickerLeaderboard;
