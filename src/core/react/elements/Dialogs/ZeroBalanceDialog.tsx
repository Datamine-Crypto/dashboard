import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react';
import { Web3 } from 'web3';
import { getEcosystemConfig as getConfig } from '@/core/app/configs/config';
import { Ecosystem, Layer } from '@/core/app/configs/config.common';
import { DialogType } from '@/core/app/interfaces';
import { ReducerQuery } from '@/core/utils/reducer/sideEffectReducer';
import { BNToDecimal } from '@/core/utils/helperFunctions';
import { useAppStore } from '@/core/react/appStore';
import { ReducerDispatch, Balances } from '@/core/app/state/stateInterfaces';
import { commonLanguage } from '@/core/app/state/commonLanguage';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from '@/core/react/elements/Fragments/ExploreLiquidityPools';
import { useShallow } from 'zustand/react/shallow';
interface Params {
	pendingQueries: ReducerQuery[];
	selectedAddress: string;
	balances: Balances;
	dispatch: ReducerDispatch;
	dialogType: DialogType;
	ecosystem: Ecosystem;
}
const Render: React.FC<Params> = React.memo(({ dispatch, selectedAddress, balances, dialogType, ecosystem }) => {
	const config = getConfig(ecosystem);
	const { mintableTokenShortName, lockableTokenShortName, ecosystemName, layer } = config;
	const onClose = () => {
		dispatch({ type: commonLanguage.commands.CloseDialog });
	};
	const onContinue = () => {
		dispatch({
			type: commonLanguage.commands.RefreshAccountState,
			payload: {
				updateEthBalance: true,
				closeDialog: true,
			},
		});
	};
	const getTitle = () => {
		switch (dialogType) {
			case DialogType.ZeroDam:
				if (layer === Layer.Layer2) {
					return `You'll need a bit of ${lockableTokenShortName} Tokens on Arbitrum!`;
				}
				return `You'll need a bit of ${lockableTokenShortName} Tokens!`;
		}
		return `You'll need a bit of Ethereum!`;
	};
	const getBalance = () => {
		const getEthBalance = () => {
			const { eth } = balances;
			if (!eth) {
				return '0 ETH';
			}
			return `${Web3.utils.fromWei(eth as any, 'ether')} ETH`;
		};
		const getDamBalance = () => {
			const { damToken } = balances;
			if (!damToken) {
				return '0 DAM';
			}
			return `${BNToDecimal(damToken, true)} ${lockableTokenShortName}`;
		};
		switch (dialogType) {
			case DialogType.ZeroDam:
				return (
					<>
						Current {lockableTokenShortName} Balance:{' '}
						<Box display="inline" fontWeight="bold">
							{getDamBalance()}
						</Box>
					</>
				);
		}
		return (
			<>
				Current Ethereum Balance:{' '}
				<Box display="inline" fontWeight="bold">
					{getEthBalance()}
				</Box>
			</>
		);
	};
	const getBody = () => {
		switch (dialogType) {
			case DialogType.ZeroDam:
				return `Before you can mint ${mintableTokenShortName} tokens you will need a bit of ${lockableTokenShortName} and ETH in your`;
		}
		return `To interact with ${ecosystemName} Smart Contracts you will need a bit of Ethereum (ETH) ${layer === Layer.Layer2 ? 'on Abtirum L2' : ''} in your`;
	};
	const getButtons = () => {
		if (dialogType === DialogType.ZeroDam) {
			return (
				<>
					<Box mb={3} mr={2}>
						<Button type="submit" onClick={onContinue} size="large">
							Close
						</Button>
					</Box>
					<Box mb={3} mr={2}>
						<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.LargeButton} ecosystem={ecosystem} />
					</Box>
				</>
			);
		}
		return (
			<Box mb={3} mr={2}>
				<Button type="submit" onClick={onContinue} color="secondary" size="large" variant="outlined">
					I Understand
				</Button>
			</Box>
		);
	};
	return (
		<Dialog open={true} onClose={onClose} aria-labelledby="alert-dialog-title">
			<DialogTitle id="alert-dialog-title">{getTitle()}</DialogTitle>
			<DialogContent>
				<Box mb={4}>
					<Typography component="div" gutterBottom>
						{getBody()}{' '}
						<Box display="inline" fontWeight="bold">
							{selectedAddress}
						</Box>{' '}
						account.{' '}
					</Typography>
					<Box mt={3}>
						<Typography component="div" gutterBottom>
							{getBalance()}
						</Typography>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions>{getButtons()}</DialogActions>
		</Dialog>
	);
});
interface DialogParams {
	dialogType: DialogType;
}
const ZeroBalanceDialog: React.FC<DialogParams> = ({ dialogType }) => {
	const {
		pendingQueries,
		selectedAddress,
		balances,
		ecosystem,
		dispatch: appDispatch,
	} = useAppStore(
		useShallow((state) => ({
			pendingQueries: state.state.pendingQueries,
			selectedAddress: state.state.selectedAddress,
			balances: state.state.balances,
			ecosystem: state.state.ecosystem,
			dispatch: state.dispatch,
		}))
	);
	if (!pendingQueries || !selectedAddress || !balances) {
		return null;
	}
	return (
		<Render
			pendingQueries={pendingQueries}
			selectedAddress={selectedAddress}
			balances={balances}
			dispatch={appDispatch}
			dialogType={dialogType}
			ecosystem={ecosystem}
		/>
	);
};
export default ZeroBalanceDialog;
