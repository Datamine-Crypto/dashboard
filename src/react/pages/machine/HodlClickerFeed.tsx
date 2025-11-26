import React, { useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import BN from 'bn.js';
import moment from 'moment';
import { Token } from '@/app/interfaces';
import { getPriceToggle } from '@/utils/mathHelpers';
import HodlClickerChart from './HodlClickerChart';

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

const HodlClickerFeed: React.FC<HodlClickerFeedProps> = ({ logs, balances, truncateAddress }) => {
	const { chartData, maxBurnedUSD, totalTransactions, averageBurnedUSD } = useMemo(() => {
		let maxBurnedVal = 0;

		// Take only the latest 500 logs for the chart to ensure bars are visible
		const recentLogs = logs.slice(0, 500);

		const chartData = recentLogs.map((log) => {
			const amountBurnedBN = new BN(log.args.amountActuallyBurned.toString());
			const jackpotAmountBN = new BN(log.args.jackpotAmount.toString());
			const tipAmountBN = new BN(log.args.totalTipAmount.toString());

			let burnedUSD = 0;
			let jackpotUSD = undefined;
			let tipUSD = undefined;

			if (balances) {
				const usdStr = getPriceToggle({
					value: amountBurnedBN,
					inputToken: Token.Mintable,
					outputToken: Token.USDC,
					balances,
					round: 4,
					removeCommas: true,
				});
				burnedUSD = parseFloat(usdStr);

				if (!jackpotAmountBN.isZero()) {
					jackpotUSD = getPriceToggle({
						value: jackpotAmountBN,
						inputToken: Token.Mintable,
						outputToken: Token.USDC,
						balances,
						round: 4,
					});
				}

				if (!tipAmountBN.isZero()) {
					tipUSD = getPriceToggle({
						value: tipAmountBN,
						inputToken: Token.Mintable,
						outputToken: Token.USDC,
						balances,
						round: 4,
					});
				}
			}

			if (burnedUSD > maxBurnedVal) maxBurnedVal = burnedUSD;

			return {
				id: log.id,
				time: moment.unix(log.timestamp).format('HH:mm:ss'),
				timestamp: log.timestamp,
				burnedUSD,
				txCount: 1,
				caller: truncateAddress(log.args.caller),
				jackpotUSD,
				tipUSD,
				blockNumber: log.blockNumber,
			};
		});

		// Sort by timestamp ascending for the chart
		chartData.sort((a, b) => a.timestamp - b.timestamp);

		const totalBurnedUSD = chartData.reduce((acc, curr) => acc + curr.burnedUSD, 0);
		const averageBurnedUSD = chartData.length > 0 ? totalBurnedUSD / chartData.length : 0;

		return {
			chartData,
			maxBurnedUSD: maxBurnedVal,
			totalTransactions: logs.length,
			averageBurnedUSD,
		};
	}, [logs, balances]);

	return (
		<>
			{logs.length === 0 ? (
				<Box display="flex" justifyContent="center" p={4}>
					<CircularProgress color="secondary" />
				</Box>
			) : (
				<HodlClickerChart
					chartData={chartData}
					maxBurnedUSD={maxBurnedUSD}
					totalTransactions={totalTransactions}
					chartTitle="Recent Collections"
					averageValue={averageBurnedUSD}
					hideTotalTransactions
					hideTooltipTxCount
				/>
			)}
		</>
	);
};

export default HodlClickerFeed;
