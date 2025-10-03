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
import React, { useContext } from 'react';

import { ImportExport } from '@mui/icons-material';
import BN from 'bn.js';
import { getEcosystemConfig } from '../../../../../configs/config';
import { Ecosystem } from '../../../../../configs/config.common';
import { MarketAddressLock } from '../../../../interfaces';
import { BNToDecimal } from '../../../../web3/helpers';
import { useWeb3Context } from '../../../../web3/Web3Context';
import { Balances, commonLanguage, MarketAddress } from '../../../../web3/web3Reducer';

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
	marketAddressLock: MarketAddress;
}

const Render: React.FC<RenderParams> = React.memo(
	({ selectedAddress, balances, dispatch, error, total, ecosystem, marketAddressLock }) => {
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
						label={`${mintableTokenShortName} Tokens To Deposit`}
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
					label={<>I want to withdraw my entire {mintableTokenShortName} market balance</>}
				/>
			);
		};

		return (
			<Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
				<form onSubmit={onSubmit}>
					<DialogTitle id="form-dialog-title">
						<Box display="flex" alignItems="center" alignContent="center">
							Deposit/Withdraw Market Balance
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
							My Market Balance:{' '}
							<Box display="inline" fontWeight="fontWeightBold">
								{BNToDecimal(marketAddressLock.rewardsAmount, true)} {mintableTokenShortName}
							</Box>
						</Box>

						<Box my={2}>
							<Divider />
						</Box>
						<Box mb={4}>
							<Typography component="div">
								To continue select how many {mintableTokenShortName} tokens you wish to add to your market balance. You
								can withdraw 100% of your market balance back to your address at any time.
							</Typography>
						</Box>

						<Box my={3}>
							<FormControl component="fieldset">
								<FormLabel component="legend">Market Action</FormLabel>
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
												I want to deposit <strong>{mintableTokenShortName}</strong> tokens increasing my{' '}
												<strong>market balance</strong>
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
	const { state: web3State, dispatch: web3Dispatch } = useWeb3Context();

	const {
		balances,
		selectedAddress,
		error,
		ecosystem,
		marketAddresses,

		//marketAddressLock,
		//currentAddresMintableBalance,
		//currentAddressMarketAddressLock,
	} = web3State;

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
		marketAddresses && marketAddresses.addresses.length > 0 ? marketAddresses.addresses[0] : null;

	if (!currentAddressMarketAddress) {
		return null;
	}

	const currentAddresMintableBalance = currentAddressMarketAddress
		? currentAddressMarketAddress.rewardsAmount
		: new BN(0);
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
		/>
	);
};

export default MarketDepositWithdrawDialog;
