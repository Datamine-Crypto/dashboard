import { Box, Button, Typography, useTheme, Alert } from '@mui/material';
import React, { useEffect, useState, useMemo } from 'react';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import { getPublicClient } from '@/web3/utils/web3ProviderUtils';
import gameHodlClickerAbi from '@/web3/abis/games/gameHodlClicker.json';
import { Address } from 'viem';
import moment from 'moment';
import { getPriceToggle } from '@/utils/mathHelpers';
import BN from 'bn.js';
import { Diamond, AutoAwesome } from '@mui/icons-material';
import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import { useShallow } from 'zustand/react/shallow';
import { Token, Game, AddressLockDetailsViewModel, DialogType } from '@/app/interfaces';
import { commonLanguage } from '@/app/state/commonLanguage';
import Big from 'big.js';
import { getNetworkDropdown } from '@/react/elements/Fragments/EcosystemDropdown';

// Sub-components
import HodlClickerChart from './HodlClickerChart';
import HodlClickerFaucets, { GemFilterType } from './HodlClickerFaucets';
import HodlClickerFeed from './HodlClickerFeed';
import HodlClickerStats from './HodlClickerStats';
import HodlClickerLeaderboard from './HodlClickerLeaderboard';

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
	const { balances, games, selectedAddress } = useAppStore(
		useShallow((state) => ({
			balances: state.balances,
			games: state.games,
			selectedAddress: state.selectedAddress,
		}))
	);

	// Game Details Logic
	const game = Game.HodlClicker;
	const { marketAddresses, totalContractRewardsAmount, totalContractLockedAmount } = games[game];
	const currentAddressMarketAddress =
		marketAddresses && marketAddresses.addresses.length > 0
			? marketAddresses.addresses.find(
					(address) => address.currentAddress.toLowerCase() === selectedAddress?.toLowerCase()
				) || null
			: null;

	const getRewardsAlert = () => {
		if (!currentAddressMarketAddress || !balances || !totalContractRewardsAmount || !totalContractLockedAmount) {
			return null;
		}
		const getBalancePercentage = () => {
			if (!totalContractLockedAmount) {
				return 0;
			}
			const test = new Big(currentAddressMarketAddress.rewardsAmount.toString()).div(
				new Big(totalContractLockedAmount.toString())
			);
			return test.toNumber() * 100;
		};
		if (totalContractLockedAmount.eq(new BN(0)) || currentAddressMarketAddress.rewardsAmount.eq(new BN(0))) {
			return <></>;
		}
		const balancePercentage = getBalancePercentage();
		const getTierDetails = () => {
			if (balancePercentage > 20) {
				return { tier: 7, emoji: <>👀</> };
			}
			if (balancePercentage > 10) {
				return { tier: 6, emoji: <>👑</> };
			}
			if (balancePercentage > 5) {
				return { tier: 5, emoji: <>💎</> };
			}
			if (balancePercentage > 2) {
				return { tier: 4, emoji: <>🏅</> };
			}
			if (balancePercentage > 1) {
				return { tier: 3, emoji: <>🥈</> };
			}
			if (balancePercentage > 0.5) {
				return { tier: 2, emoji: <>🥉</> };
			}
			return { tier: 1 };
		};
		const { emoji, tier } = getTierDetails();
		return (
			<Alert severity="success" sx={{ mt: 2 }}>
				[Tier {tier}] Passive Staking:{' '}
				<Typography variant="body2" display="inline" color="textSecondary">
					<strong>
						Earning {balancePercentage.toFixed(4)}% of all rewards collected {emoji}
					</strong>
				</Typography>
			</Alert>
		);
	};

	const showDepositWithdrawDialog = () => {
		appDispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.MarketDepositWithdraw } });
	};

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

	// Access Market Data for "Collect All" functionality
	const [selectedFilter, setSelectedFilter] = useState<GemFilterType>(() => {
		const saved = localStorage.getItem('hodlClickerGemFilter');
		return (saved as GemFilterType) || GemFilterType.PERCENT_80;
	});
	const [minGemValue, setMinGemValue] = useState<number>(0.05); // Default, will be updated by avg
	const [avgGemValue, setAvgGemValue] = useState<number | null>(null);

	// Persist filter selection
	useEffect(() => {
		localStorage.setItem('hodlClickerGemFilter', selectedFilter);
	}, [selectedFilter]);

	// Recalculate minGemValue when filter or average changes
	useEffect(() => {
		if (avgGemValue === null) return;

		let newVal = 0.05;
		switch (selectedFilter) {
			case GemFilterType.PERCENT_90:
				newVal = avgGemValue * 0.9;
				break;
			case GemFilterType.PERCENT_80:
				newVal = avgGemValue * 0.8;
				break;
			case GemFilterType.PERCENT_50:
				newVal = avgGemValue * 0.5;
				break;
			case GemFilterType.PERCENT_25:
				newVal = avgGemValue * 0.25;
				break;
			case GemFilterType.PERCENT_10:
				newVal = avgGemValue * 0.1;
				break;
			case GemFilterType.MANUAL_0_01:
				newVal = 0.01;
				break;
			case GemFilterType.MANUAL_0_05:
				newVal = 0.05;
				break;
			case GemFilterType.MANUAL_0_10:
				newVal = 0.1;
				break;
		}
		setMinGemValue(newVal);
	}, [selectedFilter, avgGemValue]);

	// Fetch Market Addresses if missing
	const hasFetchedMarketAddresses = React.useRef(false);
	useEffect(() => {
		// Ensure the game is set to HodlClicker so dialogs work correctly
		appDispatch({
			type: commonLanguage.commands.Market.UpdateGame,
			payload: { game: Game.HodlClicker },
		});

		const marketData = games[Game.HodlClicker];
		// Only fetch if marketAddresses is null/undefined and we haven't fetched yet.
		if ((!marketData || !marketData.marketAddresses) && !hasFetchedMarketAddresses.current) {
			hasFetchedMarketAddresses.current = true;
			appDispatch({
				type: commonLanguage.commands.Market.RefreshMarketAddresses,
				payload: { game: Game.HodlClicker },
			});
		}
	}, [games]);

	const validGems = useMemo(() => {
		const marketData = games[Game.HodlClicker];
		if (!marketData || !marketData.marketAddresses) return [];

		const gems: any[] = []; // Using any to avoid complex type imports if Gem isn't easily available, but better to match structure
		// We need to map marketAddresses to Gem structure expected by MarketBurnFluxTokens
		// Gem interface: { id: string; dollarAmount: number; ethereumAddress: string; ... }

		const config = getEcosystemConfig(ecosystem);
		const gameAddress = config.gameHodlClickerAddress;

		marketData.marketAddresses.addresses.forEach((addr: AddressLockDetailsViewModel) => {
			// Filter out paused addresses or addresses not belonging to this game
			if (addr.isPaused || addr.minterAddress.toLowerCase() !== gameAddress?.toLowerCase()) {
				return;
			}

			// Logic to calculate dollar amount for the gem
			// This mimics logic from MarketCollectRewardsDialog
			// We need 'balances' to calculate USD value.
			if (!balances) return;

			const amountBN = addr.mintAmount;
			const rewardsPercent = addr.rewardsPercent === 0 ? 500 : addr.rewardsPercent;
			const rewardsAmount = amountBN.add(amountBN.mul(new BN(rewardsPercent)).div(new BN(10000)));
			// For HodlClicker (Game 2), dollar amount is divided by 2?
			// In MarketCollectRewardsDialog: dollarAmount: parseFloat(balanceInUsdc) / (game === Game.DatamineGems ? 1 : 2)
			// So for HodlClicker it is / 2.

			const balanceInUsdc = getPriceToggle({
				value: rewardsAmount.sub(amountBN),
				inputToken: Token.Mintable,
				outputToken: Token.USDC,
				balances,
				round: 6,
				removeCommas: true,
			});

			const dollarAmount = parseFloat(balanceInUsdc) / 2;

			gems.push({
				id: addr.currentAddress,
				ethereumAddress: addr.currentAddress,
				dollarAmount: dollarAmount,
				error: undefined,
			});
		});
		return gems;
	}, [games, balances]);

	// Calculate Average Jackpot Value for Goal (from recent burns)
	useEffect(() => {
		if (logs.length > 0 && balances) {
			// Use only the last 50 transactions for the average
			const recentLogs = logs.slice(0, 50);

			const totalJackpotUSD = recentLogs.reduce((acc, log) => {
				const jackpotBN = new BN(log.args.jackpotAmount.toString());
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

	const availableGems = useMemo(() => {
		return validGems.filter((gem) => gem.dollarAmount >= minGemValue);
	}, [validGems, minGemValue]);

	const totalAvailableGemsUSD = useMemo(() => {
		return availableGems.reduce((acc, gem) => acc + gem.dollarAmount, 0);
	}, [availableGems]);

	const handleCollectAll = () => {
		if (availableGems.length === 0) return;

		appDispatch({
			type: commonLanguage.commands.Market.MarketBurnFluxTokens,
			payload: {
				amountToBurn: new BN(0),
				gems: availableGems,
			},
		});
	};

	// Calculate 24h Summary and Chart Data
	const { summary, chartData, maxBurnedUSD, totalTransactions, dateRange, chartTitle } = useMemo(() => {
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
		const buckets: { [key: string]: { burnedUSD: number; txCount: number } } = {};

		recentLogs.forEach((log) => {
			const hourTimestamp = moment.unix(log.timestamp).startOf('hour').unix();
			if (!buckets[hourTimestamp]) {
				buckets[hourTimestamp] = { burnedUSD: 0, txCount: 0 };
			}

			const burnedBN = new BN(log.args.amountActuallyBurned.toString());
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
					time: moment.unix(Number(timestamp)).format('HH:mm'),
					timestamp: Number(timestamp),
					burnedUSD: data.burnedUSD,
					txCount: data.txCount,
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);

		const startDate = moment.unix(oneDayAgo).format('MMM D, h:mm A');
		const endDate = moment.unix(now).format('MMM D, h:mm A');

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

	const sortedMarketAddresses = useMemo(() => {
		if (!marketAddresses?.addresses || !balances) return [];

		const config = getEcosystemConfig(ecosystem);
		const gameAddress = config.gameHodlClickerAddress;

		// Filter out paused addresses or addresses not belonging to this game
		const filteredAddresses = marketAddresses.addresses.filter((addr) => {
			if (addr.isPaused || addr.minterAddress.toLowerCase() !== gameAddress?.toLowerCase()) {
				return false;
			}
			return true;
		});

		return [...filteredAddresses].sort((a, b) => {
			const getDollarAmount = (addr: AddressLockDetailsViewModel) => {
				const amountBN = addr.mintAmount;
				const rewardsPercent = addr.rewardsPercent === 0 ? 500 : addr.rewardsPercent;
				const rewardsAmount = amountBN.add(amountBN.mul(new BN(rewardsPercent)).div(new BN(10000)));
				const balanceInUsdc = getPriceToggle({
					value: rewardsAmount.sub(amountBN),
					inputToken: Token.Mintable,
					outputToken: Token.USDC,
					balances,
					round: 6,
					removeCommas: true,
				});
				return parseFloat(balanceInUsdc) / 4;
			};

			const amountA = getDollarAmount(a);
			const amountB = getDollarAmount(b);
			const isWinnerA = amountA >= minGemValue;
			const isWinnerB = amountB >= minGemValue;

			if (isWinnerA && !isWinnerB) return -1;
			if (!isWinnerA && isWinnerB) return 1;
			return amountB - amountA; // Sort by amount descending within groups
		});
	}, [marketAddresses, balances, minGemValue, ecosystem]);

	const [gasEstimateUSD, setGasEstimateUSD] = useState<string | null>(null);

	// Estimate Gas
	useEffect(() => {
		const calculateGas = async () => {
			if (availableGems.length === 0 || !selectedAddress || !balances) {
				setGasEstimateUSD(null);
				return;
			}

			try {
				const publicClient = getPublicClient();
				const config = getEcosystemConfig(ecosystem);
				const address = config.gameHodlClickerAddress as Address;

				if (!publicClient || !address) {
					return;
				}

				let gasEstimate = 0n;
				const amountToBurn = 0n; // We are burning 0 flux to collect

				if (availableGems.length === 1) {
					const gem = availableGems[0];
					gasEstimate = await publicClient.estimateContractGas({
						address,
						abi: gameHodlClickerAbi,
						functionName: 'burnTokens',
						args: [amountToBurn, gem.ethereumAddress],
						account: selectedAddress as Address,
					});
				} else {
					const requests = availableGems.map((gem) => ({
						amountToBurn: amountToBurn,
						burnToAddress: gem.ethereumAddress,
					}));
					gasEstimate = await publicClient.estimateContractGas({
						address,
						abi: gameHodlClickerAbi,
						functionName: 'burnTokensFromAddresses',
						args: [requests],
						account: selectedAddress as Address,
					});
				}

				const gasPrice = await publicClient.getGasPrice();
				const totalGasCost = gasEstimate * gasPrice;

				const usdValue = getPriceToggle({
					value: new BN(totalGasCost.toString()),
					inputToken: Token.ETH,
					outputToken: Token.USDC,
					balances,
					round: 4,
					removeCommas: true,
				});

				setGasEstimateUSD(usdValue);
			} catch (error) {
				console.error('Error estimating gas:', error);
				setGasEstimateUSD(null);
			}
		};

		calculateGas();
	}, [availableGems, selectedAddress, balances, ecosystem]);

	const isGasHigh = useMemo(() => {
		if (!gasEstimateUSD) return false;
		return parseFloat(gasEstimateUSD) > totalAvailableGemsUSD;
	}, [gasEstimateUSD, totalAvailableGemsUSD]);

	return (
		<Box>
			{/* Header: Dropdown & Staked Balance */}
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
				{getNetworkDropdown({
					ecosystem,
					connectionMethod: useAppStore.getState().connectionMethod,
					dispatch: appDispatch,
					width: 300,
				})}

				<Box display="flex" alignItems="center" gap={2}>
					<Box textAlign="right">
						<Typography variant="caption" display="block" color="textSecondary">
							Your Staked Balance
						</Typography>
						<Typography variant="h6" fontWeight="bold" color="textPrimary">
							{currentAddressMarketAddress && balances
								? '$' +
									getPriceToggle({
										value: currentAddressMarketAddress.rewardsAmount,
										inputToken: Token.Mintable,
										outputToken: Token.USDC,
										balances,
										round: 4,
									})
								: '$0.00'}
						</Typography>
					</Box>
					<Button
						variant="outlined"
						color="secondary"
						startIcon={<Diamond />}
						onClick={showDepositWithdrawDialog}
						size="small"
					>
						Stake / Unstake
					</Button>
				</Box>
			</Box>

			{getRewardsAlert()}

			<Box mt={4} mb={4} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
				<Button
					variant="contained"
					size="large"
					startIcon={<AutoAwesome sx={{ fontSize: 28, color: availableGems.length > 0 ? '#009688' : 'inherit' }} />}
					onClick={handleCollectAll}
					disabled={availableGems.length === 0}
					sx={{
						px: 6,
						py: 2,
						fontSize: '1.2rem',
						fontWeight: 'bold',
						borderRadius: 3,
						background:
							availableGems.length > 0
								? 'linear-gradient(45deg, #FFD700 30%, #FF8C00 90%)'
								: theme.palette.action.disabledBackground,
						color: availableGems.length > 0 ? '#000' : theme.palette.text.disabled,
						boxShadow: availableGems.length > 0 ? '0 3px 5px 2px rgba(255, 105, 135, .3)' : 'none',
						backfaceVisibility: 'hidden',
						WebkitFontSmoothing: 'antialiased',
						MozOsxFontSmoothing: 'grayscale',
						willChange: 'transform',
						animation: availableGems.length > 0 ? 'pulse 2s infinite' : 'none',
						'@keyframes pulse': {
							'0%': {
								transform: 'scale(1) translateZ(0)',
								boxShadow: '0 0 0 0 rgba(255, 165, 0, 0.7)',
							},
							'70%': {
								transform: 'scale(1.05) translateZ(0)',
								boxShadow: '0 0 0 20px rgba(255, 165, 0, 0)',
							},
							'100%': {
								transform: 'scale(1) translateZ(0)',
								boxShadow: '0 0 0 0 rgba(255, 165, 0, 0)',
							},
						},
						transition: 'all 0.3s ease',
						'&:hover': {
							transform: 'scale(1.05)',
							boxShadow: '0 0 30px rgba(255, 140, 0, 0.8)',
						},
					}}
				>
					{availableGems.length > 0 ? `Collect $${totalAvailableGemsUSD.toFixed(4)}` : 'Waiting...'}
				</Button>
				{gasEstimateUSD ? (
					<Typography
						variant="caption"
						sx={{
							mt: 1,
							color: isGasHigh ? 'error.main' : 'success.main',
							fontWeight: 'bold',
						}}
					>
						Gas Estimate: ~${gasEstimateUSD}
					</Typography>
				) : (
					<Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
						Waiting for Faucets to Fill...
					</Typography>
				)}
			</Box>

			{/* Ready Faucets List */}
			<HodlClickerFaucets
				avgGemValue={avgGemValue}
				minGemValue={minGemValue}
				selectedFilter={selectedFilter}
				onFilterChange={setSelectedFilter}
				sortedMarketAddresses={sortedMarketAddresses}
				balances={balances}
				truncateAddress={truncateAddress}
			/>

			{/* Daily Summary Stats */}
			<HodlClickerStats summary={summary} getUSDValue={getUSDValue} />

			{/* Leaderboard */}
			<HodlClickerLeaderboard logs={logs} balances={balances} truncateAddress={truncateAddress} />
			{/* Collect History Chart */}
			<HodlClickerChart
				chartData={chartData}
				maxBurnedUSD={maxBurnedUSD}
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
