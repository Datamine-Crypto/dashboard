import React from 'react';

import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';

import PendingActionDialog from '@/react/elements/Dialogs/PendingActionDialog';
import { useShallow } from 'zustand/react/shallow';

const PendingQueryFragment: React.FC = () => {
	const { pendingQueries, queriesCount, lastDismissedPendingActionCount, connectionMethod, ecosystem } = useAppStore(
		useShallow((state) => ({
			pendingQueries: state.pendingQueries,
			queriesCount: state.queriesCount,
			lastDismissedPendingActionCount: state.lastDismissedPendingActionCount,
			connectionMethod: state.connectionMethod,
			ecosystem: state.ecosystem,
		}))
	);

	const getPendingQueryIndicator = () => {
		if (pendingQueries.length === 0 || lastDismissedPendingActionCount == queriesCount) {
			return null;
		}
		const onClose = () => [appDispatch({ type: commonLanguage.commands.DismissPendingAction })];
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
};
export default PendingQueryFragment;
