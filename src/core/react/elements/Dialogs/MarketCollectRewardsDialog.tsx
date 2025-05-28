import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Link, TextField, Typography } from '@mui/material';
import React, { useContext } from 'react';

import ImportExportIcon from '@mui/icons-material/ImportExport';
import RedeemIcon from '@mui/icons-material/Redeem';
import BN from 'bn.js';
import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import { DialogType, MarketAddressLock, Token } from '../../../interfaces';
import { BNToDecimal, getPriceToggle, parseBN } from '../../../web3/helpers';
import { Web3Context } from '../../../web3/Web3Context';
import { Balances, commonLanguage } from '../../../web3/web3Reducer';

interface RenderParams {
	selectedAddress: string;
	balances: Balances;
	dispatch: React.Dispatch<any>;

	error: string | null;
	amount: string | null;
	setAmount: React.Dispatch<any>;

	ecosystem: Ecosystem;
	marketAddressLock: MarketAddressLock;
	maxAmountToBurn: BN;

	currentAddresMintableBalance: BN;
	currentAddressMarketAddressLock: MarketAddressLock;
}

const Render: React.FC<RenderParams> = React.memo(({ selectedAddress, balances, dispatch, error, amount, setAmount, ecosystem, marketAddressLock, maxAmountToBurn, currentAddresMintableBalance, currentAddressMarketAddressLock }) => {

	const { mintableTokenShortName, navigation, ecosystemName } = getEcosystemConfig(ecosystem)
	const { isHelpPageEnabled } = navigation

	const [targetAddress, setTargetAddress] = React.useState(selectedAddress);

	if (!marketAddressLock) {
		return;
	}

	const onSubmit = async (e: any) => {
		e.preventDefault();


		if (currentAddressMarketAddressLock.rewardsAmount.eq(new BN(0))) {
			dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.MarketDepositWithdraw } })

		} else {
			dispatch({
				type: commonLanguage.commands.Market.BurnFluxTokens,
				payload: { amount, address: targetAddress, maxAmountToBurn }
			})

		}


		/*
		dispatch({
			type: commonLanguage.commands.BurnFluxTokens,
			payload: { amount, address: targetAddress }
		});*/
	}
	const showDepositWithdrawDialog = () => {
		dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.MarketDepositWithdraw } })
	}
	const onClose = (event: any = undefined, reason: any = undefined) => {
		// Prevent closing by clicking outside dialog
		if (reason === 'backdropClick') {
			return;
		}
		dispatch({ type: commonLanguage.commands.CloseDialog });
	}

	const getLearnMoreBurningLink = () => {
		if (!isHelpPageEnabled) {
			return null;
		}

		return <>
			{' '}
			<Link color="textSecondary" href="#help/dashboard/burningFluxTokens" rel="noopener noreferrer" target="_blank">Click here</Link> to learn more about {mintableTokenShortName} market.
		</>
	}


	const getAmountReceivedElement = () => {
		const getAmountReceived = (): BN | null => {
			if (!amount) {
				return null
			}
			try {
				const amountBN = parseBN(amount)
				const rewardsAmount = amountBN.add(amountBN.mul(new BN(marketAddressLock.rewardsPercent)).div(new BN(10000)))
				return rewardsAmount
			} catch {
				return null
			}
		}
		const amountReceived = getAmountReceived()

		if (!amountReceived) {
			return
		}
		if (amountReceived.eq(new BN(0))) {
			return
		}

		const balanceInUsdc = getPriceToggle({ value: amountReceived, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 6, removeCommas: true });


		return <Box>You Will Receive: <Box display="inline" fontWeight="fontWeightBold">
			{BNToDecimal(amountReceived, true)} {mintableTokenShortName} ( +$ {balanceInUsdc})
		</Box></Box>
	}

	const getDialogContents = () => {
		const sharedContent = <>
			<Box my={4}>
				<Typography component="div">If your transaction succeeds you are guaranteed <strong>+ {(marketAddressLock.rewardsPercent / 100).toFixed(2)}%</strong> instant return to {mintableTokenShortName} tokens you used.</Typography>
			</Box>
		</>
		if (currentAddressMarketAddressLock.rewardsAmount.eq(new BN(0))) {
			return <>
				{sharedContent}
				<Alert severity="info">
					<Typography component="div" gutterBottom={true}>Your current {mintableTokenShortName} <strong>market balance</strong> is <strong>0</strong>. Please click "Deposit" button below to fund your market balance.</Typography>
				</Alert>
			</>
		}

		return <>
			<Typography component="div" gutterBottom={true}>To continue select how many {mintableTokenShortName} tokens you wish to deposit.</Typography>

			{sharedContent}
			<Box mt={3} mb={3}>
				<TextField
					autoFocus
					id="name"
					label={`Total ${mintableTokenShortName} Tokens to use for rewards`}
					type="text"
					variant="outlined"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					error={!!error}
					helperText={error}
					fullWidth
				/>
			</Box>
			{getAmountReceivedElement()}
		</>
	}

	const getDepositWithdrawButton = () => {
		if (currentAddressMarketAddressLock.rewardsAmount.eq(new BN(0))) {
			return
		}
		return <Button color="secondary" size="small" variant="outlined" onClick={() => showDepositWithdrawDialog()} startIcon={<Box display="flex" style={{ color: '#0ff' }}><ImportExportIcon style={{ color: '#00ffff' }} /></Box>}>
			Deposit/Withdraw
		</Button>
	}

	return <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
		<form onSubmit={onSubmit}>
			<DialogTitle id="form-dialog-title">
				<Box display="flex" alignItems="center" alignContent="center">
					Market: Collect {mintableTokenShortName} tokens
					<Box display="flex" pl={1} ><RedeemIcon style={{ color: '#00ffff' }} /></Box>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Box>Collect From Address: <Box display="inline" fontWeight="fontWeightBold">{selectedAddress}</Box></Box>
				<Box my={1}>Max address usable {mintableTokenShortName} : <Box display="inline" fontWeight="fontWeightBold">{BNToDecimal(maxAmountToBurn, true)} {mintableTokenShortName}</Box></Box>
				<Box my={1}>
					My Current Market Balance: <Box display="inline" fontWeight="fontWeightBold">{BNToDecimal(currentAddressMarketAddressLock.rewardsAmount, true)} {mintableTokenShortName}</Box>
					{' '}
					{getDepositWithdrawButton()}
				</Box>

				<Box my={3}><Divider /></Box>

				{getDialogContents()}

				<Box mt={2}><Divider /></Box>
			</DialogContent>
			<DialogActions>
				<Box mb={1} mr={2}>
					<Box mr={2} display="inline-block">
						<Button onClick={onClose}  >
							Cancel
						</Button>
					</Box>
					<Button type="submit" color="secondary" size="large" variant="outlined"  >
						{currentAddressMarketAddressLock.rewardsAmount.eq(new BN(0)) ? 'Deposit' : 'Continue'}
					</Button>
				</Box>
			</DialogActions>
		</form>
	</Dialog>
});


const MarketCollectRewardsDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const getMaxAmountToBurn = () => {
		if (!web3State.addressDetails || !web3State.marketAddressLock) {
			return null
		}
		const amount = web3State.addressDetails.mintAmount
		const rewardsPercent = web3State.marketAddressLock.rewardsPercent

		const maxAmountToBurn = amount.sub(amount.mul(new BN(rewardsPercent)).div(new BN(10000)))

		return maxAmountToBurn
	}
	const maxAmountToBurn = getMaxAmountToBurn()

	const getInitialAmountToBurn = () => {
		if (!web3State.addressDetails || !web3State.marketAddressLock || !web3State.currentAddresMintableBalance) {
			return null
		}
		if (!maxAmountToBurn) {
			return null
		}

		const totalAddressBalance = web3State.balances?.fluxToken ?? new BN(0);

		if (totalAddressBalance.gt(maxAmountToBurn)) {
			return maxAmountToBurn
		}

		if (web3State.currentAddresMintableBalance.lt(maxAmountToBurn)) {
			return web3State.currentAddresMintableBalance
		}

		return maxAmountToBurn
	}

	const total = BNToDecimal(getInitialAmountToBurn());

	const [amount, setAmount] = React.useState(total);

	const { balances, address, error, ecosystem, marketAddressLock, currentAddresMintableBalance, currentAddressMarketAddressLock, selectedAddress } = web3State;
	console.log({
		currentAddresMintableBalance,
		currentAddressMarketAddressLock,
		balances,
		address,
		error,
		ecosystem,
		marketAddressLock,

	})
	if (!balances || !maxAmountToBurn || !marketAddressLock || !currentAddresMintableBalance || !currentAddressMarketAddressLock) {
		return null;
	}
	if (!address && !selectedAddress) {
		return
	}

	return <Render
		balances={balances}
		selectedAddress={(address ?? selectedAddress) as string}
		error={error}
		amount={amount}
		setAmount={setAmount}
		dispatch={web3Dispatch}
		ecosystem={ecosystem}
		marketAddressLock={marketAddressLock}
		maxAmountToBurn={maxAmountToBurn}
		currentAddresMintableBalance={currentAddresMintableBalance}
		currentAddressMarketAddressLock={currentAddressMarketAddressLock}
	/>
}

export default MarketCollectRewardsDialog;