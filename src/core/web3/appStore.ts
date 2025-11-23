import { create } from 'zustand';
import { handleCommand, handleQueryResponse, initialState, Web3State } from '@/core/web3/web3Reducer';
import { sideEffectReducer, commonLanguage, handleQueries } from '@/core/sideEffectReducer';
import { queryHandlers } from '@/core/web3/Web3Bindings';

// Recreate the reducer
const reducer = sideEffectReducer({
	handleQueryResponse,
	handleCommand,
});

interface Web3Store {
	state: Web3State;
	dispatch: (action: any) => void;
}

export const useAppStore = create<Web3Store>((set, get) => ({
	state: initialState,
	dispatch: (action: any) => {
		const currentState = get().state;
		const newState = reducer(currentState, action);

		set({ state: newState });

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
				dispatch: get().dispatch,
				queryHandlers,
			});

			// Queue the queries in the state
			get().dispatch({
				type: commonLanguage.commands.QueueQueries,
				payload: { queries: newState.query },
			});
		}
	},
}));
