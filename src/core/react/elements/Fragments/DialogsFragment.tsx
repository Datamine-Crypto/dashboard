import React, { lazy } from 'react';
import { DialogType } from '@/core/interfaces';
import { useAppStore } from '@/core/web3/appStore';
import { commonLanguage } from '@/core/web3/reducer/common';
import BurnDialog from '@/core/react/elements/Dialogs/BurnDialog';
import DamLockDialog from '@/core/react/elements/Dialogs/DamLockDialog';
import MarketDepositWithdrawDialog from '@/core/react/elements/Dialogs/GameFi/MarketDepositWithdrawDialog';
import MessageDialog from '@/core/react/elements/Dialogs/MessageDialog';
import MintDialog from '@/core/react/elements/Dialogs/MintDialog';
import SettingsDialog from '@/core/react/elements/Dialogs/SettingsDialog';
import TradeDialog from '@/core/react/elements/Dialogs/TradeDialog';
import UnlockDialog from '@/core/react/elements/Dialogs/UnlockDialog';
import WalletConnectRpcDialog from '@/core/react/elements/Dialogs/WalletConnectRpcDialog';
import MintSettingsDialog from '@/core/react/elements/Dialogs/MinterSettingsDialog';
import { useShallow } from 'zustand/react/shallow';
import { ReducerDispatch } from '@/core/web3/reducer/interfaces';
const MarketCollectRewardsDialog = lazy(
	() => import('@/core/react/elements/Dialogs/GameFi/MarketCollectRewardsDialog')
);
const ZeroBalanceDialog = lazy(() => import('@/core/react/elements/Dialogs/ZeroBalanceDialog'));
interface Props {
	dispatch: ReducerDispatch;
	dialog: DialogType | null;
	dialogParams: any;
}
const Render: React.FC<Props> = ({ dialog, dialogParams, dispatch }) => {
	const getDialog = () => {
		const onClose = () => {
			dispatch({ type: commonLanguage.commands.CloseDialog });
		};
		if (!dialog) {
			return null;
		}
		switch (dialog) {
			case DialogType.Mint:
				return <MintDialog />;
			case DialogType.LockIn:
				return <DamLockDialog />;
			case DialogType.Burn:
				return <BurnDialog />;
			case DialogType.Unlock:
				return <UnlockDialog />;
			case DialogType.MintSettings:
				return <MintSettingsDialog />;
			case DialogType.Trade:
				return <TradeDialog />;
			case DialogType.ZeroEth:
			case DialogType.ZeroDam:
				return <ZeroBalanceDialog dialogType={dialog} />;
			case DialogType.TitleMessage: {
				const { title, message } = dialogParams;
				return <MessageDialog title={title} message={message} open={true} onClose={onClose} />;
			}
			case DialogType.ClientSettings: {
				return <SettingsDialog />;
			}
			case DialogType.WalletConnectRpc:
				return <WalletConnectRpcDialog />;
			// Market dialogs
			case DialogType.MarketCollectRewards:
				return <MarketCollectRewardsDialog />;
			case DialogType.MarketDepositWithdraw:
				return <MarketDepositWithdrawDialog />;
		}
	};
	return getDialog();
};
interface Params {}
/**
 * This fragment contains all the dialogs in one place
 * Help Dialog is excluded as it's a seperate system
 */
const DialogsFragment: React.FC<Params> = () => {
	const {
		dialog,
		dialogParams,
		dispatch: appDispatch,
	} = useAppStore(
		useShallow((state) => ({
			dialog: state.state.dialog,
			dialogParams: state.state.dialogParams,
			dispatch: state.dispatch,
		}))
	);
	return <Render dialog={dialog} dialogParams={dialogParams} dispatch={appDispatch} />;
};
export default DialogsFragment;
