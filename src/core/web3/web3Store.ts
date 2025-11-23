import { create } from 'zustand';
import { initialState } from './reducer/initialState';
import { Web3State } from './reducer/interfaces';
import { sideEffectReducer, commonLanguage, handleQueries } from '../sideEffectReducer';
import { handleCommand } from './reducer/commandHandler';
import { handleQueryResponse } from './reducer/queryHandler';
import { queryHandlers } from './Web3Bindings';

// Recreate the reducer
const reducer = sideEffectReducer({
	handleQueryResponse,
	handleCommand,
});

interface Web3Store {
	state: Web3State;
	dispatch: (action: any) => void;
}

export const useWeb3Store = create<Web3Store>((set, get) => ({
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
