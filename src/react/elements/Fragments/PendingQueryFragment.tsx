import React from 'react';
import { Ecosystem } from '@/app/configs/config.common';
import { ReducerQuery } from '@/utils/reducer/sideEffectReducer';
import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';
import { ReducerDispatch, ConnectionMethod } from '@/app/interfaces';
import PendingActionDialog from '@/react/elements/Dialogs/PendingActionDialog';
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
	const { pendingQueries, queriesCount, lastDismissedPendingActionCount, connectionMethod, ecosystem } = useAppStore(
		useShallow((state) => ({
			pendingQueries: state.pendingQueries,
			queriesCount: state.queriesCount,
			lastDismissedPendingActionCount: state.lastDismissedPendingActionCount,
			connectionMethod: state.connectionMethod,
			ecosystem: state.ecosystem,
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
