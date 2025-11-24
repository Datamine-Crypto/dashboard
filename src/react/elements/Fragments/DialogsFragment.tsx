import React, { lazy } from 'react';
import { DialogType } from '@/app/interfaces';
import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';
import BurnDialog from '@/react/elements/Dialogs/BurnDialog';
import DamLockDialog from '@/react/elements/Dialogs/DamLockDialog';
import MarketDepositWithdrawDialog from '@/react/elements/Dialogs/GameFi/MarketDepositWithdrawDialog';
import MessageDialog from '@/react/elements/Dialogs/MessageDialog';
import MintDialog from '@/react/elements/Dialogs/MintDialog';
import SettingsDialog from '@/react/elements/Dialogs/SettingsDialog';
import TradeDialog from '@/react/elements/Dialogs/TradeDialog';
import UnlockDialog from '@/react/elements/Dialogs/UnlockDialog';
import WalletConnectRpcDialog from '@/react/elements/Dialogs/WalletConnectRpcDialog';
import MintSettingsDialog from '@/react/elements/Dialogs/MinterSettingsDialog';
import { useShallow } from 'zustand/react/shallow';
import { ReducerDispatch } from '@/utils/reducer/sideEffectReducer';
const MarketCollectRewardsDialog = lazy(() => import('@/react/elements/Dialogs/GameFi/MarketCollectRewardsDialog'));
const ZeroBalanceDialog = lazy(() => import('@/react/elements/Dialogs/ZeroBalanceDialog'));
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
	const { dialog, dialogParams } = useAppStore(
		useShallow((state) => ({
			dialog: state.dialog,
			dialogParams: state.dialogParams,
		}))
	);

	return <Render dialog={dialog} dialogParams={dialogParams} dispatch={appDispatch} />;
};
export default DialogsFragment;
