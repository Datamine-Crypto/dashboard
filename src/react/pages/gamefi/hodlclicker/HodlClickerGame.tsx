import { Box, Button, Typography, useTheme, Alert } from '@mui/material';
import React, { useEffect, useState, useMemo } from 'react';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import { getPublicClient } from '@/web3/utils/web3ProviderUtils';
import { gameHodlClickerAbi } from '@/web3/abis/games/gameHodlClicker';
import { Address } from 'viem';
import { getPriceToggle } from '@/utils/mathHelpers';

import { Diamond, AutoAwesome } from '@mui/icons-material';
import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import { useShallow } from 'zustand/react/shallow';
import { Token, Game, AddressLockDetailsViewModel, DialogType } from '@/app/interfaces';
import { commonLanguage } from '@/app/state/commonLanguage';
import Big from 'big.js';
import { getNetworkDropdown } from '@/react/elements/Fragments/EcosystemDropdown';

// Sub-components
import HodlClickerFaucets, { GemFilterType } from './HodlClickerFaucets';

interface Props {
	ecosystem: Ecosystem;
	avgGemValue: number | null;
	truncateAddress: (address: string) => string;
}

const HodlClickerGame: React.FC<Props> = ({ ecosystem, avgGemValue, truncateAddress }) => {
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
		if (totalContractLockedAmount === 0n || currentAddressMarketAddress.rewardsAmount === 0n) {
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
		appDispatch({ type: commonLanguage.commands.Dialog.Show, payload: { dialog: DialogType.MarketDepositWithdraw } });
	};

	// Access Market Data for "Collect All" functionality
	const [selectedFilter, setSelectedFilter] = useState<GemFilterType>(() => {
		const saved = localStorage.getItem('hodlClickerGemFilter');
		return (saved as GemFilterType) || GemFilterType.PERCENT_50;
	});
	const [minGemValue, setMinGemValue] = useState<number>(0.05); // Default, will be updated by avg

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
			const rewardsAmount = amountBN + (amountBN * BigInt(rewardsPercent)) / 10000n;
			// For HodlClicker (Game 2), dollar amount is divided by 2?
			// In MarketCollectRewardsDialog: dollarAmount: parseFloat(balanceInUsdc) / (game === Game.DatamineGems ? 1 : 2)
			// So for HodlClicker it is / 2.

			const balanceInUsdc = getPriceToggle({
				value: rewardsAmount - amountBN,
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
				amountToBurn: 0n,
				gems: availableGems,
			},
		});
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
				const rewardsAmount = amountBN + (amountBN * BigInt(rewardsPercent)) / 10000n;
				const balanceInUsdc = getPriceToggle({
					value: rewardsAmount - amountBN,
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
					value: totalGasCost,
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
		</Box>
	);
};

export default HodlClickerGame;
