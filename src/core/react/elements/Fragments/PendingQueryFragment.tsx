import React from 'react';
import { Ecosystem } from '@/configs/config.common';
import { ReducerQuery } from '@/core/sideEffectReducer';
import { useAppStore } from '@/core/web3/appStore';
import { commonLanguage } from '@/core/web3/reducer/common';
import { ReducerDispatch, ConnectionMethod } from '@/core/web3/reducer/interfaces';
import PendingActionDialog from '@/core/react/elements/Dialogs/PendingActionDialog';
import { useShallow } from 'zustand/react/shallow';
interface RenderProps {
	pendingQueries: ReducerQuery[];
	queriesCount: number;
	lastDismissedPendingActionCount: number;
	connectionMethod: ConnectionMethod;
	ecosystem: Ecosystem;
	dispatch: ReducerDispatch;
}
const Render: React.FC<RenderProps> = React.memo(
	({ pendingQueries, queriesCount, lastDismissedPendingActionCount, connectionMethod, ecosystem, dispatch }) => {
		const getPendingQueryIndicator = () => {
			if (pendingQueries.length === 0 || lastDismissedPendingActionCount == queriesCount) {
				return null;
			}
			const onClose = () => [dispatch({ type: commonLanguage.commands.DismissPendingAction })];
			return (
				<PendingActionDialog
					open={true}
					queries={pendingQueries}
					connectionMethod={connectionMethod}
					onClose={onClose}
					ecosystem={ecosystem}
				/>
			);
		};
		return getPendingQueryIndicator();
	}
);
interface Params {}
/**
 * This is a little dialog that shows up when something is loading (shows a little infinite loading progress to user)
 */
const PendingQueryFragment: React.FC<Params> = () => {
	const {
		pendingQueries,
		queriesCount,
		lastDismissedPendingActionCount,
		connectionMethod,
		ecosystem,
		dispatch: appDispatch,
	} = useAppStore(
		useShallow((state) => ({
			pendingQueries: state.state.pendingQueries,
			queriesCount: state.state.queriesCount,
			lastDismissedPendingActionCount: state.state.lastDismissedPendingActionCount,
			connectionMethod: state.state.connectionMethod,
			ecosystem: state.state.ecosystem,
			dispatch: state.dispatch,
		}))
	);
	return (
		<Render
			pendingQueries={pendingQueries}
			queriesCount={queriesCount}
			lastDismissedPendingActionCount={lastDismissedPendingActionCount}
			connectionMethod={connectionMethod}
			ecosystem={ecosystem}
			dispatch={appDispatch}
		/>
	);
};
export default PendingQueryFragment;
