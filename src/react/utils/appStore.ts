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
	// This is the core of our "Commands & Queries" architecture.
	// 1. The reducer runs and returns a `newState`.
	// 2. If `newState.query` is present, it means the reducer wants to perform a side effect (e.g., fetch data, call a smart contract).
	// 3. We detect this here and queue the query for execution.
	// 4. `handleQueries` is then called to execute the async operation.
	// 5. When the async operation finishes, it dispatches a new action (Command) back to the store to update the state.
	//
	// This loop allows us to keep the reducer pure while managing complex async flows like blockchain transactions.
	if (newState.query) {
		// Queue the queries in the state (add them to pendingQueries)
		// This also sets query to undefined after, ensuring we don't re-trigger it.
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
