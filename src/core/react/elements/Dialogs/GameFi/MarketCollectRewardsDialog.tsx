import {
	Alert,
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Link,
	Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import { Diamond, ImportExport, Mouse } from '@mui/icons-material';
import BN from 'bn.js';
import { getEcosystemConfig } from '../../../../../configs/config';
import { Ecosystem } from '../../../../../configs/config.common';
import { AddressLockDetailsViewModel, DialogType, FluxAddressDetails, Game, Token } from '../../../../interfaces';
import { BNToDecimal, getPriceToggle } from '../../../../web3/helpers';
import { useWeb3Context } from '../../../../web3/Web3Context';
import {
	Balances,
	commonLanguage,
	ConnectionMethod,
	MarketAddresses,
	MarketDetails,
} from '../../../../web3/web3Reducer';
import DatamineGemsGame, { Gem } from '../../Fragments/DatamineGemsGame';
import { getNetworkDropdown } from '../../Fragments/EcosystemDropdown';
import Big from 'big.js';

interface RenderParams {
	selectedAddress: string;
	balances: Balances | null;
	dispatch: React.Dispatch<any>;

	error: string | null;

	ecosystem: Ecosystem;
	//marketAddressLock: MarketAddressLock | null;

	//currentAddresMintableBalance: BN | null;
	currentAddressMarketAddress: AddressLockDetailsViewModel | null;

	connectionMethod: ConnectionMethod;
	addressDetails: FluxAddressDetails | null;

	marketAddresses: MarketAddresses | null;
	hasWeb3: boolean | null;
	market: MarketDetails;
	game: Game;

	totalContractLockedAmount: BN | null;
	totalContractRewardsAmount: BN | null;
}
enum BlockReason {
	IsPaused,
	MinBlockNotMet,
	NoBlocksToMint,
	MinAmountNotMet,
}
const Render: React.FC<RenderParams> = React.memo(
	({
		selectedAddress,
		balances,
		dispatch,
		error,
		ecosystem,

		currentAddressMarketAddress,
		connectionMethod,
		addressDetails,
		marketAddresses,
		hasWeb3,
		market,
		game,
		totalContractLockedAmount,
		totalContractRewardsAmount,
	}) => {
		const localConfig = {
			/**
			 * Metamask added some strange block caching to requests and the only current way to work around this
			 * is to leave the Metamask window open. Then the latest block numbers are used for queries.
			 *
			 * So if we don't get a new block in ~36 seconds then show a warning (as a new block should be generated every 12 sec)
			 */
			blockLagWarningTimeout: 36 * 1000, // 3 blocks (12 sec each)
		};

		const [showBlockLagWarning, setShowBlockLagWarning] = useState(false);

		useEffect(() => {
			// Reset warning on a new block
			setShowBlockLagWarning(false);

			// Set a timer to show the warning if no new block arrives
			const timer = setTimeout(() => {
				setShowBlockLagWarning(true);
			}, localConfig.blockLagWarningTimeout); // 36 seconds

			// Cleanup timer on component unmount or when targetBlock changes
			return () => {
				clearTimeout(timer);
			};
		}, [marketAddresses?.targetBlock]);

		const { mintableTokenShortName, navigation, ecosystemName, marketAddress, gameHodlClickerAddress } =
			getEcosystemConfig(ecosystem);
		const { isHelpPageEnabled } = navigation;

		const getGameAddress = () => {
			switch (game) {
				case Game.DatamineGems:
					return marketAddress;
				case Game.HodlClicker:
					return gameHodlClickerAddress;
			}
		};
		const gameAddress = getGameAddress();

		const getGameName = () => {
			switch (game) {
				case Game.DatamineGems:
					return 'Datamine Gems';
				case Game.HodlClicker:
					return 'HODL Clicker';
			}
		};

		const getGameIcon = () => {
			switch (game) {
				case Game.DatamineGems:
					return <Diamond style={{ color: '#00ffff' }} />;
				case Game.HodlClicker:
					return <Mouse style={{ color: '#00ffff' }} />;
			}
		};

		/**
		 * Is the current game requiring a balance to play (Ex: Datamine Gems uses your balance for rewards)
		 */
		const isGameRequiringBalance = () => {
			switch (game) {
				case Game.DatamineGems:
					return true;
				default:
					return false;
			}
		};

		const isDepositRequired =
			isGameRequiringBalance() &&
			currentAddressMarketAddress &&
			currentAddressMarketAddress.rewardsAmount.eq(new BN(0));

		const onSubmit = async (e: any) => {
			e.preventDefault();

			if (!selectedAddress) {
				if (hasWeb3 === null) {
					dispatch({ type: commonLanguage.commands.Initialize, payload: { address: null } });
				} else {
					dispatch({ type: commonLanguage.commands.ConnectToWallet });
				}
				return;
			}

			if (!currentAddressMarketAddress) {
				console.log('currentAddressMarketAddress is null');
				return;
			}

			if (isDepositRequired) {
				dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.MarketDepositWithdraw } });
			}
		};
		const showDepositWithdrawDialog = () => {
			dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.MarketDepositWithdraw } });
		};
		const onClose = (event: any = undefined, reason: any = undefined) => {
			// Prevent closing by clicking outside dialog
			if (reason === 'backdropClick') {
				return;
			}
			dispatch({ type: commonLanguage.commands.CloseDialog });
		};

		const getLearnMoreBurningLink = () => {
			if (!isHelpPageEnabled) {
				return null;
			}

			return (
				<>
					{' '}
					<Link
						color="textSecondary"
						href="#help/dashboard/burningFluxTokens"
						rel="noopener noreferrer"
						target="_blank"
					>
						Click here
					</Link>{' '}
					to learn more about {mintableTokenShortName} market.
				</>
			);
		};

		const getDepositWithdrawButton = () => {
			if (!selectedAddress) {
				return null;
			}

			return (
				<Button
					color="secondary"
					size="small"
					variant="outlined"
					onClick={() => showDepositWithdrawDialog()}
					startIcon={
						<Box display="flex" style={{ color: '#0ff' }}>
							<ImportExport style={{ color: '#00ffff' }} />
						</Box>
					}
				>
					{game === Game.DatamineGems ? 'Deposit/Withdraw' : 'Stake/Unstake'}
				</Button>
			);
		};

		const getGems = (): Gem[] => {
			const gems: Gem[] = [];

			if (!marketAddresses || !balances) {
				return gems;
			}

			for (const address of marketAddresses.addresses) {
				const getError = () => {
					if (address.isPaused) {
						return 'Error: Address is paused for gem minting (by the address). Please check back later!';
					}
					if (address.minterAddress !== gameAddress) {
						return ': This address is not paricipating in public minting.';
					}
				};
				const amountBN = address.mintAmount;

				const getAmountReceived = (): BN => {
					const rewardsPercent = address.rewardsPercent === 0 ? 500 : address.rewardsPercent;
					const rewardsAmount = amountBN.add(amountBN.mul(new BN(rewardsPercent)).div(new BN(10000)));
					return rewardsAmount;
				};
				const amountReceived = getAmountReceived();
				const balanceInUsdc = getPriceToggle({
					value: amountReceived.sub(amountBN),
					inputToken: Token.Mintable,
					outputToken: Token.USDC,
					balances,
					round: 6,
					removeCommas: true,
				});

				gems.push({
					ethereumAddress: address.currentAddress,
					error: getError(),
					dollarAmount: parseFloat(balanceInUsdc),
					id: address.currentAddress,
				});
			}

			return gems;
		};

		const gems: Gem[] = getGems();

		console.log('marketAddresses:', marketAddresses);

		const onAttemptCollectGem = (gems: Gem[]) => {
			if (!currentAddressMarketAddress) {
				console.log('currentAddressMarketAddress is null');

				return false;
			}

			if (isDepositRequired) {
				dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.MarketDepositWithdraw } });
				return false;
			}

			dispatch({
				type: commonLanguage.commands.Market.MarketBurnFluxTokens,
				payload: {
					amountToBurn: new BN(0),
					gems,
				},
			});

			return true;
		};
		const onAddNewGem = (ethereumAddress: string) => {
			const stripNonEthereumChars = (addressString: string) => {
				// Ensure the string is lowercase first, as Ethereum addresses are case-insensitive
				// but typically represented in lowercase or mixed case with a checksum.
				// This regex specifically targets lowercase valid characters.
				const lowercasedString = addressString.toLowerCase();

				// The regex [^a-f0-9x] matches any character that is NOT:
				// - a lowercase letter from 'a' to 'f'
				// - a digit from '0' to '9'
				// - the lowercase letter 'x' (for the "0x" prefix)
				// The 'g' flag ensures all occurrences are replaced, not just the first.
				const strippedString = lowercasedString.replace(/[^a-f0-9x]/g, '');

				return strippedString;
			};
			if (!ethereumAddress) {
				return;
			}
			ethereumAddress = stripNonEthereumChars(ethereumAddress.toLowerCase());
			if (!ethereumAddress) {
				return;
			}
			if (ethereumAddress.length !== 42) {
				return;
			}

			// ensure ethereumAddress starts with 0x
			if (!ethereumAddress.startsWith('0x')) {
				return;
			}

			dispatch({
				type: commonLanguage.commands.Market.AddGemAddress,
				payload: {
					address: ethereumAddress,
				},
			});

			return true;
		};

		const getError = () => {
			if (!error) {
				return;
			}
			return (
				<Alert variant="filled" severity="warning">
					{error}
				</Alert>
			);
		};

		const getBalances = () => {
			if (!currentAddressMarketAddress || !balances) {
				return <></>;
			}
			const balanceInUsdc = getPriceToggle({
				value: currentAddressMarketAddress.rewardsAmount,
				inputToken: Token.Mintable,
				outputToken: Token.USDC,
				balances,
				round: 4,
				removeCommas: true,
			});
			return (
				<>
					<Box>
						My Ethereum Address:{' '}
						<Typography variant="body2" display="inline" color="textSecondary">
							{selectedAddress}
						</Typography>
					</Box>

					<Box my={1}>
						{game === Game.HodlClicker ? 'Staked Game' : 'Game'} Balance:{' '}
						<Typography variant="body2" display="inline" color="textSecondary">
							$ {balanceInUsdc} ( {BNToDecimal(currentAddressMarketAddress.rewardsAmount, true, 18, 6)}{' '}
							{mintableTokenShortName} )
						</Typography>
					</Box>
				</>
			);
		};

		const getRewards = () => {
			if (!currentAddressMarketAddress || !balances || !totalContractRewardsAmount || !totalContractLockedAmount) {
				return <></>;
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

			const rewardsToWithdraw = currentAddressMarketAddress.rewardsAmount
				.mul(totalContractRewardsAmount)
				.div(totalContractLockedAmount)
				.sub(totalContractLockedAmount);

			const balanceInUsdc = getPriceToggle({
				value: rewardsToWithdraw,
				inputToken: Token.Mintable,
				outputToken: Token.USDC,
				balances,
				round: 4,
				removeCommas: true,
			});

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
				<>
					<Alert severity="success">
						Game Rewards :{' '}
						<Typography variant="body2" display="inline" color="textSecondary">
							$ {balanceInUsdc} ( {BNToDecimal(rewardsToWithdraw, true, 18, 6)} {mintableTokenShortName} )
							<Box>
								<strong>
									[Tier {tier}] Passive Staking: + Earning {balancePercentage.toFixed(2)}% of all rewards collected{' '}
									{emoji}
								</strong>
							</Box>
						</Typography>
					</Alert>
				</>
			);
		};

		const getEthereumBlockNumber = () => {
			if (!addressDetails) {
				return;
			}
			return <>Ethereum Block #{addressDetails.blockNumber.toLocaleString()}</>;
		};

		const getSubmitButtonText = () => {
			if (!currentAddressMarketAddress) {
				return 'Connect';
			}
			return <>{isDepositRequired ? 'Deposit' : 'Continue'}</>;
		};

		const getGameElement = () => {
			if (!hasWeb3 || !selectedAddress) {
				return;
			}
			if (!marketAddress) {
				return (
					<Alert severity="info">
						{getGameName()} is coming to this ecosystem soon! Please select another ecosystem to continue.
					</Alert>
				);
			}
			return (
				<DatamineGemsGame
					initialGems={gems}
					onAttemptCollectGem={onAttemptCollectGem}
					onAddGem={onAddNewGem}
					gemsCollected={market.gemsCollected.count}
					totalCollectedBalance={market.gemsCollected.sumDollarAmount}
				/>
			);
		};

		const getInfoAlertElement = () => {
			const getInfoText = () => {
				if (!selectedAddress) {
					return hasWeb3 === null
						? 'Web3 connection required, click Connect button below'
						: 'Ethereum based wallet required, click Continue button below.';
				}

				if (isDepositRequired) {
					return <>Your {mintableTokenShortName} Game Balance is 0. Click Deposit button below to continue.</>;
				}
			};
			const infoText = getInfoText();
			if (!infoText) {
				return;
			}

			return (
				<Box mb={3}>
					<Alert severity="info">{infoText}</Alert>
				</Box>
			);
		};

		const getSubmitButton = () => {
			if (currentAddressMarketAddress && selectedAddress && currentAddressMarketAddress.rewardsAmount.gt(new BN(0))) {
				return;
			}
			return (
				<Button type="submit" color="secondary" size="large" variant="outlined">
					{getSubmitButtonText()}
				</Button>
			);
		};

		const getLagWarning = () => {
			return (
				showBlockLagWarning &&
				marketAddresses?.targetBlock && (
					<Box my={2}>
						<Alert severity="warning">
							<strong>Metamask Block Lag Detected:</strong> Click Metamask extension icon and leave the popup showing.
							This will update the gem rewards in realtime.
						</Alert>
					</Box>
				)
			);
		};

		return (
			<Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
				<form onSubmit={onSubmit}>
					<DialogTitle id="form-dialog-title">
						<Box display="flex" alignItems="center" alignContent="center">
							<Box display="flex" pr={1}>
								{getGameIcon()}
							</Box>
							{getGameName()}
							<Chip size="small" label="#GameFi" />
						</Box>
					</DialogTitle>
					<DialogContent>
						<Box display="flex" justifyContent={'space-between'} alignItems="center" mt={1}>
							<Box display="flex" alignItems="center" mr={2}>
								{getNetworkDropdown({
									ecosystem,
									connectionMethod,
									dispatch,
								})}
							</Box>
							{getDepositWithdrawButton()}
						</Box>
						<Box my={2}></Box>
						{getBalances()}
						{getRewards()}
						{getLagWarning()}

						<Box my={3}>
							<Divider />
						</Box>

						{getError()}
						{getInfoAlertElement()}

						{getGameElement()}

						<Box mt={2}>
							<Divider />
						</Box>
					</DialogContent>
					<DialogActions sx={{ justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1.5 }}>
						<Typography variant="caption" color="textSecondary">
							{/* Add your desired text for the bottom-left here */}
							{getEthereumBlockNumber()}
						</Typography>
						<Box>
							{' '}
							{/* This Box groups the buttons to keep them together on the right */}
							<Box display="inline-block" mr={1}>
								{' '}
								{/* Margin between buttons */}
								{/*<Button onClick={refreshAddresses}  >
							Refresh
						</Button>*/}
								<Button onClick={onClose}>Cancel</Button>
							</Box>
							{getSubmitButton()}
						</Box>
					</DialogActions>
				</form>
			</Dialog>
		);
	}
);

const MarketCollectRewardsDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useWeb3Context();

	const {
		balances,
		address,
		ecosystem,
		//marketAddressLock,
		//currentAddresMintableBalance,
		//currentAddressMarketAddressLock,
		selectedAddress,
		connectionMethod,
		addressDetails,
		games,
		error,
		hasWeb3,
		market,
		dialogParams,
		game,
	} = web3State;

	const { marketAddresses, totalContractRewardsAmount, totalContractLockedAmount } = games[game];

	const currentAddressMarketAddress =
		marketAddresses && marketAddresses.addresses.length > 0 ? marketAddresses.addresses[0] : null;
	console.log('currentAddressMarketAddress:', currentAddressMarketAddress);

	/*
	const game = dialogParams && dialogParams.game ? dialogParams.game : Game.DatamineGems;

	// On show fetch the latest market addresses
	useEffect(() => {
		web3Dispatch({ type: commonLanguage.commands.Market.RefreshMarketAddresses, payload: { game } });
	}, []);*/

	return (
		<Render
			balances={balances}
			selectedAddress={(address ?? selectedAddress) as string}
			error={error}
			dispatch={web3Dispatch}
			ecosystem={ecosystem}
			//marketAddressLock={marketAddressLock}
			//currentAddresMintableBalance={currentAddresMintableBalance}
			currentAddressMarketAddress={currentAddressMarketAddress}
			connectionMethod={connectionMethod}
			addressDetails={addressDetails}
			marketAddresses={marketAddresses}
			hasWeb3={hasWeb3}
			market={market}
			game={game}
			totalContractLockedAmount={totalContractLockedAmount}
			totalContractRewardsAmount={totalContractRewardsAmount}
		/>
	);
};

export default MarketCollectRewardsDialog;
