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

import { getEcosystemConfig } from '@/app/configs/config';
import { BNToDecimal } from '@/utils/mathHelpers';
import { useAppStore } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';
import { Game } from '@/app/interfaces';
import { useShallow } from 'zustand/react/shallow';
import { dispatch as appDispatch } from '@/react/utils/appStore';

enum Action {
	Deposit = 'Deposit',
	Withdraw = 'Withdraw',
}

const MarketDepositWithdrawDialog: React.FC = () => {
	const { balances, selectedAddress, error, ecosystem, games, game, currentAddressMintableBalance } = useAppStore(
		useShallow((state) => ({
			balances: state.balances,
			selectedAddress: state.selectedAddress,
			error: state.error,
			ecosystem: state.ecosystem,
			games: state.games,
			game: state.game,
			currentAddressMintableBalance: state.currentAddressMintableBalance,
		}))
	);

	const { marketAddresses, totalContractRewardsAmount, totalContractLockedAmount } = games[game];

	// Derived state
	const currentAddressMarketAddress =
		marketAddresses && marketAddresses.addresses.length > 0
			? marketAddresses.addresses.find(
					(address) => address.currentAddress.toLowerCase() === selectedAddress?.toLowerCase()
				)
			: null;

	const total = BNToDecimal(currentAddressMintableBalance);
	const { mintableTokenShortName } = getEcosystemConfig(ecosystem);

	// Local state
	const [amount, setAmount] = React.useState(total);
	const [minterAddress] = React.useState(selectedAddress); // minterAddress was initialized with selectedAddress and never updated in original code
	const [action, setAction] = React.useState(Action.Deposit);

	if (!balances || !selectedAddress || !currentAddressMarketAddress) {
		return null;
	}

	const onSubmit = async (e: any) => {
		e.preventDefault();
		switch (action) {
			case Action.Deposit:
				appDispatch({
					type: commonLanguage.commands.Market.DepositTokens,
					payload: {
						amount,
						minterAddress,
					},
				});
				break;
			case Action.Withdraw:
				appDispatch({
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
		appDispatch({ type: commonLanguage.commands.Dialog.Close });
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
				disabled={currentAddressMarketAddress.rewardsAmount === 0n}
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
			return currentAddressMarketAddress.rewardsAmount;
		}
		if (!totalContractRewardsAmount || !totalContractLockedAmount) {
			return 0n;
		}
		const rewardsToWithdraw =
			(currentAddressMarketAddress.rewardsAmount * totalContractRewardsAmount) / totalContractLockedAmount;
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
							{BNToDecimal(currentAddressMintableBalance, true)} {mintableTokenShortName}
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
};

export default MarketDepositWithdrawDialog;
