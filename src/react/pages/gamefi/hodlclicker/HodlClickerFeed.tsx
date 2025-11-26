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

		// Group logs by block number
		const groupedLogs: {
			[blockNumber: string]: {
				id: string;
				timestamp: number;
				burnedBN: BN;
				jackpotBN: BN;
				tipBN: BN;
				callers: Set<string>;
				txCount: number;
			};
		} = {};

		recentLogs.forEach((log) => {
			if (!groupedLogs[log.blockNumber]) {
				groupedLogs[log.blockNumber] = {
					id: log.id,
					timestamp: log.timestamp,
					burnedBN: new BN(0),
					jackpotBN: new BN(0),
					tipBN: new BN(0),
					callers: new Set(),
					txCount: 0,
				};
			}

			const group = groupedLogs[log.blockNumber];
			group.burnedBN = group.burnedBN.add(new BN(log.args.amountActuallyBurned.toString()));
			group.jackpotBN = group.jackpotBN.add(new BN(log.args.jackpotAmount.toString()));
			group.tipBN = group.tipBN.add(new BN(log.args.totalTipAmount.toString()));
			group.callers.add(log.args.caller);
			group.txCount += 1;
		});

		const chartData = Object.entries(groupedLogs).map(([blockNumber, group]) => {
			let burnedUSD = 0;
			let jackpotUSD = 0;
			let jackpotUSDStr = '$0.00';
			let tipUSDStr = undefined;

			if (balances) {
				const burnedUSDStr = getPriceToggle({
					value: group.burnedBN,
					inputToken: Token.Mintable,
					outputToken: Token.USDC,
					balances,
					round: 4,
					removeCommas: true,
				});
				burnedUSD = parseFloat(burnedUSDStr);

				const jackpotRawStr = getPriceToggle({
					value: group.jackpotBN,
					inputToken: Token.Mintable,
					outputToken: Token.USDC,
					balances,
					round: 4,
					removeCommas: true,
				});
				jackpotUSD = parseFloat(jackpotRawStr);
				jackpotUSDStr = getPriceToggle({
					value: group.jackpotBN,
					inputToken: Token.Mintable,
					outputToken: Token.USDC,
					balances,
					round: 4,
				});

				if (!group.tipBN.isZero()) {
					tipUSDStr = getPriceToggle({
						value: group.tipBN,
						inputToken: Token.Mintable,
						outputToken: Token.USDC,
						balances,
						round: 4,
					});
				}
			}

			if (jackpotUSD > maxBurnedVal) maxBurnedVal = jackpotUSD;

			const callersArray = Array.from(group.callers);
			const caller =
				callersArray.length > 1 ? 'Multiple Callers' : callersArray.length > 0 ? truncateAddress(callersArray[0]) : '';

			return {
				id: group.id,
				time: moment.unix(group.timestamp).format('HH:mm:ss'),
				timestamp: group.timestamp,
				value: jackpotUSD,
				formattedValue: `$${jackpotUSDStr}`,
				tooltipItems: [
					{ label: 'Burned', value: `$${burnedUSD.toFixed(4)}`, color: 'warning.main' },
					...(tipUSDStr ? [{ label: 'Tip', value: `$${tipUSDStr}`, color: 'info.light' }] : []),
					{ label: 'By', value: caller },
					{ label: 'Block', value: blockNumber, color: 'text.secondary' },
					{ label: 'Tx Count', value: group.txCount },
				],
			};
		});

		// Sort by timestamp ascending for the chart
		chartData.sort((a, b) => a.timestamp - b.timestamp);

		const totalJackpotUSD = chartData.reduce((acc, curr) => acc + curr.value, 0);
		const averageJackpotUSD = chartData.length > 0 ? totalJackpotUSD / chartData.length : 0;

		return {
			chartData,
			maxBurnedUSD: maxBurnedVal,
			totalTransactions: logs.length,
			averageBurnedUSD: averageJackpotUSD,
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
					maxValue={maxBurnedUSD}
					totalTransactions={totalTransactions}
					chartTitle="Recent Jackpots"
					averageValue={averageBurnedUSD}
					hideTotalTransactions
				/>
			)}
		</>
	);
};

export default HodlClickerFeed;
