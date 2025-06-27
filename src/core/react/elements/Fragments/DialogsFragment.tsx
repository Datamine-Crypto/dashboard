import React, { lazy, useContext } from 'react';
import { DialogType } from '../../../interfaces';
import { Web3Context } from '../../../web3/Web3Context';
import { commonLanguage } from '../../../web3/web3Reducer';
import BurnDialog from '../Dialogs/BurnDialog';
import DamLockDialog from '../Dialogs/DamLockDialog';
import MarketDepositWithdrawDialog from '../Dialogs/MarketDepositWithdrawDialog';
import MessageDialog from '../Dialogs/MessageDialog';
import MintDialog from '../Dialogs/MintDialog';
import SettingsDialog from '../Dialogs/SettingsDialog';
import TradeDialog from '../Dialogs/TradeDialog';
import UnlockDialog from '../Dialogs/UnlockDialog';
import WalletConnectRpcDialog from '../Dialogs/WalletConnectRpcDialog';
const MarketCollectRewardsDialog = lazy(() => import('../Dialogs/MarketCollectRewardsDialog'));
const ZeroBalanceDialog = lazy(() => import('../Dialogs/ZeroBalanceDialog'));

interface Props {
	dispatch: React.Dispatch<any>;
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
const DialogsFragment: React.FC<Params> = ({}) => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context);

	const { dialog, dialogParams } = web3State;

	return <Render dialog={dialog} dialogParams={dialogParams} dispatch={web3Dispatch} />;
};
export default DialogsFragment;
