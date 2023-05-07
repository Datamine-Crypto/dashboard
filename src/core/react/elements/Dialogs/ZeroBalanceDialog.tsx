import React, { useContext } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@material-ui/core';

import { Web3Context } from '../../../web3/Web3Context'
import { commonLanguage, Balances } from '../../../web3/web3Reducer';
import { DialogType } from '../../../interfaces';
import Web3 from 'web3';
import { BNToDecimal } from '../../../web3/helpers';
import { ReducerQuery } from '../../../sideEffectReducer';
import { getConfig } from '../../../../config';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from '../Fragments/ExploreLiquidityPools';

interface Params {
	pendingQueries: ReducerQuery[];
	selectedAddress: string;
	balances: Balances;
	dispatch: React.Dispatch<any>;
	dialogType: DialogType;
	isArbitrumMainnet: boolean;
}

const Render: React.FC<Params> = React.memo(({ dispatch, selectedAddress, balances, dialogType, isArbitrumMainnet }) => {
	const config = getConfig(isArbitrumMainnet);

	const onClose = () => {
		dispatch({ type: commonLanguage.commands.CloseDialog });
	}

	const onContinue = () => {
		dispatch({
			type: commonLanguage.commands.RefreshAccountState, payload: {
				updateEthBalance: true,
				closeDialog: true
			}
		});
	}


	const getTitle = () => {
		switch (dialogType) {
			case DialogType.ZeroDam:
				if (isArbitrumMainnet) {
					return `You'll need a bit of FLUX (L2) Tokens on Arbitrum!`;
				}
				return `You'll need a bit of Datamine (DAM) Tokens!`;
		}

		return `You'll need a bit of Ethereum!`;
	}

	const getBalance = () => {
		const getEthBalance = () => {
			const { eth } = balances;
			if (!eth) {
				return '0 ETH';
			}

			return `${Web3.utils.fromWei(eth as any, 'ether')} ETH`
		}

		const getDamBalance = () => {
			const { damToken } = balances;
			if (!damToken) {
				return '0 DAM';
			}

			return `${BNToDecimal(damToken, true)} ${isArbitrumMainnet ? 'FLUX' : 'DAM'}`
		}


		switch (dialogType) {
			case DialogType.ZeroDam:
				return <>
					Current {isArbitrumMainnet ? 'FLUX (L2)' : 'Datamine (DAM)'} Balance: <Box display="inline" fontWeight="bold">{getDamBalance()}</Box>
				</>
		}
		return <>
			Current Ethereum Balance: <Box display="inline" fontWeight="bold">{getEthBalance()}</Box>
		</>
	}

	const getBody = () => {
		switch (dialogType) {
			case DialogType.ZeroDam:
				return `Before you can mint ${isArbitrumMainnet ? 'Arbi' : ''}FLUX tokens you will need a bit of Datamine ${isArbitrumMainnet ? 'FLUX' : '(DAM)'} and ETH in your`;
		}

		return `To interact with Datamine Smart Contracts you will need a bit of Ethereum (ETH) ${isArbitrumMainnet ? 'on Abtirum L2' : ''} in your`;
	}

	const getButtons = () => {

		if (dialogType === DialogType.ZeroDam) {
			return <>
				<Box mb={3} mr={2}>
					<Button type="submit" onClick={onContinue} size="large">
						Close
					</Button>
				</Box>

				<Box mb={3} mr={2}>
					<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.LargeButton} />
				</Box>
			</>
		}

		return <Box mb={3} mr={2}>
			<Button type="submit" onClick={onContinue} color="secondary" size="large" variant="outlined" >
				I Understand
			</Button>
		</Box>
	}

	return <Dialog
		open={true}
		onClose={onClose}
		aria-labelledby="alert-dialog-title"
	>
		<DialogTitle id="alert-dialog-title">{getTitle()}</DialogTitle>
		<DialogContent>
			<Box mb={4}>
				<Typography gutterBottom>{getBody()} <Box display="inline" fontWeight="bold">{selectedAddress}</Box> account. </Typography>
				<Box mt={3}>
					<Typography gutterBottom>
						{getBalance()}
					</Typography>
				</Box>
			</Box>
		</DialogContent>
		<DialogActions>
			{getButtons()}



		</DialogActions>
	</Dialog>
});

interface DialogParams {
	dialogType: DialogType;
}
const ZeroBalanceDialog: React.FC<DialogParams> = ({ dialogType }) => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const { pendingQueries, selectedAddress, balances, isArbitrumMainnet } = web3State;
	if (!pendingQueries || !selectedAddress || !balances) {
		return null;
	}

	return <Render
		pendingQueries={pendingQueries}
		selectedAddress={selectedAddress}
		balances={balances}
		dispatch={web3Dispatch}
		dialogType={dialogType}
		isArbitrumMainnet={isArbitrumMainnet}
	/>
}

export default ZeroBalanceDialog;