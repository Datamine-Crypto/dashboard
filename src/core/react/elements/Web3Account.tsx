import React, { useContext } from 'react';
import { Box, makeStyles } from '@material-ui/core';

import { Web3Context } from '../../web3/Web3Context'
import CallToActionCard from './Cards/CallToActionCard'
import MintDialog from './Dialogs/MintDialog';

import GlobalCard from './Cards/GlobalCard';
import MarketSentiment from './Cards/MarketSentiment';

import { DialogType } from '../../interfaces';
import DamLockDialog from './Dialogs/DamLockDialog';
import BurnDialog from './Dialogs/BurnDialog';
import UnlockDialog from './Dialogs/UnlockDialog';
import ZeroBalanceDialog from './Dialogs/ZeroBalanceDialog';
import TradeDialog from './Dialogs/TradeDialog';

import AccountBalancesCard from './Cards/AccountBalancesCard';
import MintStatsCard from './Cards/MintStatsCard';
import MessageDialog from './Dialogs/MessageDialog';
import { commonLanguage } from '../../web3/web3Reducer';
import RealtimeLiqudityCard from './Cards/RealtimeLiqudityCard';
import SettingsDialog from './Dialogs/SettingsDialog';

interface RenderParams {
	dialog: DialogType | null;
	dialogParams: any;
	dispatch: React.Dispatch<any>;
}

const useStyles = makeStyles((theme) => {
	return {
		cardsContainer: {
			'& .MuiListItemText-primary': {
				color: theme.palette.text.secondary,
				fontSize: theme.typography.body2.fontSize,
				marginBottom: theme.spacing(0.5)

			},
			'& .MuiListItemText-secondary': {
				color: theme.palette.text.primary,
				fontSize: theme.typography.body1.fontSize
			}
		}
	}
});

const Render: React.FC<RenderParams> = React.memo(({ dialog, dialogParams, dispatch }) => {
	const classes = useStyles();

	const onClose = () => {
		dispatch({ type: commonLanguage.commands.CloseDialog });
	}


	const getDialog = () => {
		if (!dialog) {
			return null;
		}

		switch (dialog) {
			case DialogType.Mint:
				return <MintDialog />
			case DialogType.LockIn:
				return <DamLockDialog />
			case DialogType.Burn:
				return <BurnDialog />
			case DialogType.Unlock:
				return <UnlockDialog />
			case DialogType.Trade:
				const { token } = dialogParams;
				return <TradeDialog token={token} />
			case DialogType.ZeroEth:
			case DialogType.ZeroDam:
				return <ZeroBalanceDialog dialogType={dialog} />
			case DialogType.TitleMessage: {
				const { title, message } = dialogParams;
				return <MessageDialog title={title} message={message} open={true} onClose={onClose} />
			}
			case DialogType.ClientSettings: {
				return <SettingsDialog />
			}
		}
	}
	return <>
		{getDialog()}

		<Box my={3}>
			<CallToActionCard />
		</Box>
		<Box className={classes.cardsContainer}>
			<Box my={3}>
				<RealtimeLiqudityCard />
			</Box>
			<Box my={3}>
				<MarketSentiment />
			</Box>
			<Box my={3}>
				<MintStatsCard />
			</Box>
			<Box my={3}>
				<AccountBalancesCard />
			</Box>
			<Box my={3}>
				<GlobalCard />
			</Box>
		</Box>
	</>
})

const Web3Account: React.FC = () => {
	const { state: web3State, dispatch } = useContext(Web3Context)

	const { dialog, dialogParams } = web3State;

	return <Render
		dialog={dialog}
		dialogParams={dialogParams}
		dispatch={dispatch}
	/>
}

export default Web3Account;