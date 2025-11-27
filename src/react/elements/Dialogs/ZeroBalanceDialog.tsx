import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react';
import { formatEther } from 'viem';
import { getEcosystemConfig as getConfig } from '@/app/configs/config';
import { Layer } from '@/app/configs/config.common';
import { DialogType } from '@/app/interfaces';

import { BNToDecimal } from '@/utils/mathHelpers';
import { useAppStore } from '@/react/utils/appStore';

import { commonLanguage } from '@/app/state/commonLanguage';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from '@/react/elements/Fragments/ExploreLiquidityPools';
import { useShallow } from 'zustand/react/shallow';
import { dispatch as appDispatch } from '@/react/utils/appStore';

interface DialogParams {
	dialogType: DialogType;
}
const ZeroBalanceDialog: React.FC<DialogParams> = ({ dialogType }) => {
	const { pendingQueries, selectedAddress, balances, ecosystem } = useAppStore(
		useShallow((state) => ({
			pendingQueries: state.pendingQueries,
			selectedAddress: state.selectedAddress,
			balances: state.balances,
			ecosystem: state.ecosystem,
		}))
	);

	if (!pendingQueries || !selectedAddress || !balances) {
		return null;
	}

	const config = getConfig(ecosystem);
	const { mintableTokenShortName, lockableTokenShortName, ecosystemName, layer } = config;
	const onClose = () => {
		appDispatch({ type: commonLanguage.commands.CloseDialog });
	};
	const onContinue = () => {
		appDispatch({
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
			return `${formatEther(eth)} ETH`;
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
};
export default ZeroBalanceDialog;
