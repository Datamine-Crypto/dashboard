import { create } from 'zustand';
import { handleCommand } from '@/core/app/state/handleCommand';
import { AppState, initialState } from '@/core/app/state/initialState';
import { sideEffectReducer, commonLanguage, handleQueries } from '@/core/utils/reducer/sideEffectReducer';
import { handleQueryResponse } from '@/core/app/state/handleQueryResponse';
import { queryHandlers } from '@/core/app/state/handleQuery';

// Recreate the reducer
const reducer = sideEffectReducer({
	handleQueryResponse,
	handleCommand,
});

export const useAppStore = create<AppState>((set, get) => ({
	...initialState,
}));

export const dispatch = (action: any) => {
	const currentState = useAppStore.getState();
	const newState = reducer(currentState, action);

	useAppStore.setState(newState);

	// Handle side effects (queries)
	// Only run side effects if query object has changed (reference equality check)
	// and it is not undefined.
	// We also check if the action is NOT QueueQueries, because QueueQueries adds them to pending
	// but preserves the 'query' field in the state (shallow copy).
	// If we don't check this, we might re-trigger handleQueries for the same query array.
	// However, checking reference equality (newState.query !== currentState.query) handles most cases.
	// But QueueQueries returns ...state, so newState.query === currentState.query (same reference).
	// So the reference check alone is sufficient to prevent loop on QueueQueries.
	if (newState.query && newState.query !== currentState.query) {
		handleQueries({
			state: newState,
			dispatch: dispatch,
			queryHandlers,
		});

		// Queue the queries in the state
		dispatch({
			type: commonLanguage.commands.QueueQueries,
			payload: { queries: newState.query },
		});
	}
};
