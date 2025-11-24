import { create } from 'zustand';
import { handleCommand as handleAppCommand } from '@/app/state/handleCommand';
import { AppState, initialState } from '@/app/state/initialState';
import { sideEffectReducer, commonLanguage, handleQueries } from '@/utils/reducer/sideEffectReducer';
import { handleQueryResponse as handleAppQueryResponse } from '@/app/state/handleQueryResponse';
import { queryHandlers } from '@/app/state/handleQuery';

// Recreate the reducer
const reducer = sideEffectReducer({
	// These are prefixed with "app" to make it clear that they are from the app (not to be confused with the global reducer)
	handleQueryResponse: handleAppQueryResponse,
	handleCommand: handleAppCommand,
});

export const useAppStore = create<AppState>(() => initialState);

export const dispatch = (action: any) => {
	const currentState = useAppStore.getState();

	// state + action = newState (run the action through "handleCommand")
	const newState = reducer(currentState, action);

	// Update zustand with the new state
	useAppStore.setState(newState);

	// After this the state might contain a new { query: { ... } } object
	// This means a "side-effect" (query) occured and now we need to add it to pendingQueries (so it can be executed as async)

	// Handle side effects (queries)
	// Only run side effects if query object has changed (reference equality check)
	// and it is not undefined.
	if (newState.query) {
		// Queue the queries in the state (add then to pendingQueries)
		// This also sets query to undefined after
		dispatch({
			type: commonLanguage.commands.QueueQueries,
			payload: { queries: newState.query },
		});

		// Run all pendingQueries (run the async query and return the response back to the reducer "handleQueryResponse")
		handleQueries({
			state: newState,
			dispatch: dispatch,
			queryHandlers,
		});
	}
};
