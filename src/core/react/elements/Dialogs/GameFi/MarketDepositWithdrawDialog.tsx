import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
	TextField,
	Typography,
} from '@mui/material';
import React from 'react';

import { ImportExport } from '@mui/icons-material';
import BN from 'bn.js';
import { getEcosystemConfig } from '@/configs/config';
import { Ecosystem } from '@/configs/config.common';
import { BNToDecimal } from '@/core/web3/helpers';
import { useAppStore } from '@/core/web3/appStore';
import { Balances } from '@/core/web3/reducer/interfaces';
import { commonLanguage } from '@/core/web3/reducer/common';
import { AddressLockDetailsViewModel, Game } from '@/core/interfaces';

enum Action {
	Deposit = 'Deposit',
	Withdraw = 'Withdraw',
}

interface RenderParams {
	selectedAddress: string;
	balances: Balances;
	dispatch: React.Dispatch<any>;
	ecosystem: Ecosystem;

	error: string | null;
	total: string | null;
	marketAddressLock: AddressLockDetailsViewModel;
	currentAddresMintableBalance: BN | null;
	game: Game;

	totalContractLockedAmount: BN | null;
	totalContractRewardsAmount: BN | null;
}

const Render: React.FC<RenderParams> = React.memo(
	({
		selectedAddress,
		balances,
		dispatch,
		error,
		total,
		ecosystem,
		marketAddressLock,
		currentAddresMintableBalance,
		game,
		totalContractLockedAmount,
		totalContractRewardsAmount,
	}) => {
		const { lockableTokenShortName, mintableTokenShortName } = getEcosystemConfig(ecosystem);

		const [amount, setAmount] = React.useState(total);
		const [minterAddress, setMinterAddress] = React.useState(selectedAddress);
		const [action, setAction] = React.useState(Action.Deposit);

		const onSubmit = async (e: any) => {
			e.preventDefault();

			switch (action) {
				case Action.Deposit:
					dispatch({
						type: commonLanguage.commands.Market.DepositTokens,
						payload: {
							amount,
							minterAddress,
						},
					});
					break;
				case Action.Withdraw:
					dispatch({
						type: commonLanguage.commands.Market.WithdrawTokens,
						payload: {
							amount,
							minterAddress,
						},
					});
					break;
			}
		};
		const onClose = (event: any = undefined, reason: any = undefined) => {
			// Prevent closing by clicking outside dialog
			if (reason === 'backdropClick') {
				return;
			}
			dispatch({ type: commonLanguage.commands.CloseDialog });
		};

		const getTokensToDepositField = () => {
			if (action !== Action.Deposit) {
				return;
			}
			return (
				<Box my={1}>
					<TextField
						autoFocus
						id="name"
						label={`${mintableTokenShortName} Tokens To ${game === Game.DatamineGems ? 'Deposit' : 'Stake'}`}
						type="text"
						variant="outlined"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						error={!!error}
						helperText={error}
						fullWidth
					/>
				</Box>
			);
		};

		const getWithdrawOption = () => {
			return (
				<FormControlLabel
					disabled={marketAddressLock.rewardsAmount.eq(new BN(0))}
					value={Action.Withdraw}
					control={<Radio color="secondary" />}
					label={
						<>
							I want to {game === Game.DatamineGems ? 'withdraw' : 'unstake'} my entire {mintableTokenShortName} game
							balance
						</>
					}
				/>
			);
		};
		const getRewardsAmount = () => {
			if (game === Game.DatamineGems) {
				return marketAddressLock.rewardsAmount;
			}

			if (!totalContractRewardsAmount || !totalContractLockedAmount) {
				return new BN(0);
			}

			const rewardsToWithdraw = marketAddressLock.rewardsAmount
				.mul(totalContractRewardsAmount)
				.div(totalContractLockedAmount);

			return rewardsToWithdraw;
		};

		const rewardsAmount = getRewardsAmount();

		return (
			<Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
				<form onSubmit={onSubmit}>
					<DialogTitle id="form-dialog-title">
						<Box display="flex" alignItems="center" alignContent="center">
							{game === Game.DatamineGems ? 'Deposit/Withdraw' : 'Stake/Unstake'} Game Balance
							<Box display="flex" pl={1}>
								<ImportExport style={{ color: '#00ffff' }} />
							</Box>
						</Box>
					</DialogTitle>
					<DialogContent>
						<Box>
							My Address:{' '}
							<Box display="inline" fontWeight="fontWeightBold">
								{selectedAddress}
							</Box>
						</Box>
						<Box my={1}>
							My Address Balance{' '}
							<Typography variant="body2" color="textSecondary" component="span">
								(Depositable)
							</Typography>
							:{' '}
							<Box display="inline" fontWeight="fontWeightBold">
								{BNToDecimal(currentAddresMintableBalance, true)} {mintableTokenShortName}
							</Box>
						</Box>
						<Box my={1}>
							{game === Game.DatamineGems ? 'My' : 'Staked'} Game Balance{' '}
							<Typography variant="body2" color="textSecondary" component="span">
								(Withdrawable)
							</Typography>
							:{' '}
							<Box display="inline" fontWeight="fontWeightBold">
								{BNToDecimal(rewardsAmount, true)} {mintableTokenShortName}
							</Box>
						</Box>

						<Box my={2}>
							<Divider />
						</Box>
						<Box mb={4}>
							<Typography component="div">
								To continue select how many {mintableTokenShortName} tokens you wish to{' '}
								{game === Game.DatamineGems ? 'add to your game balance' : 'stake'}. You can withdraw 100%+ of your game
								balance back to your address at any time.
							</Typography>
						</Box>

						<Box my={3}>
							<FormControl component="fieldset">
								<FormLabel component="legend">Action To Perform:</FormLabel>
								<RadioGroup
									aria-label="action"
									name="action"
									value={action}
									onChange={(event) => setAction((event.target as any).value)}
								>
									<FormControlLabel
										value={Action.Deposit}
										control={<Radio color="secondary" />}
										label={
											<>
												I want to {game === Game.DatamineGems ? 'deposit' : 'stake'}{' '}
												<strong>{mintableTokenShortName}</strong> tokens increasing my <strong>game balance</strong>
											</>
										}
									/>
									{getWithdrawOption()}
								</RadioGroup>
							</FormControl>
						</Box>

						{getTokensToDepositField()}

						<Box mt={2}>
							<Divider />
						</Box>
					</DialogContent>
					<DialogActions>
						<Box mb={1} mr={2}>
							<Box mr={2} display="inline-block">
								<Button onClick={onClose}>Cancel</Button>
							</Box>
							<Button type="submit" color="secondary" size="large" variant="outlined">
								Continue
							</Button>
						</Box>
					</DialogActions>
				</form>
			</Dialog>
		);
	}
);

const MarketDepositWithdrawDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useAppStore();

	const {
		balances,
		selectedAddress,
		error,
		ecosystem,
		games,
		game,

		currentAddresMintableBalance,

		//marketAddressLock,
		//currentAddresMintableBalance,
		//currentAddressMarketAddressLock,
	} = web3State;

	const { marketAddresses, totalContractRewardsAmount, totalContractLockedAmount } = games[game];

	if (
		!balances ||
		!selectedAddress
		//!marketAddressLock ||
		//!currentAddresMintableBalance ||
		//!currentAddressMarketAddressLock
	) {
		return null;
	}

	const currentAddressMarketAddress =
		marketAddresses && marketAddresses.addresses.length > 0
			? marketAddresses.addresses.find(
					(address) => address.currentAddress.toLowerCase() === selectedAddress?.toLowerCase()
				)
			: null;

	if (!currentAddressMarketAddress) {
		return null;
	}
	const total = BNToDecimal(currentAddresMintableBalance);

	return (
		<Render
			balances={balances}
			selectedAddress={selectedAddress}
			error={error}
			total={total}
			dispatch={web3Dispatch}
			ecosystem={ecosystem}
			marketAddressLock={currentAddressMarketAddress}
			currentAddresMintableBalance={currentAddresMintableBalance}
			game={game}
			totalContractLockedAmount={totalContractLockedAmount}
			totalContractRewardsAmount={totalContractRewardsAmount}
		/>
	);
};

export default MarketDepositWithdrawDialog;
