import React, { ReactNode, useEffect, useReducer } from 'react';

import { queryHandlers } from './Web3Bindings';
import { handleCommand, handleQueryResponse, initialState, Web3State } from './web3Reducer';

import { EventEmitter } from 'events';
import { commonLanguage, handleQueries, sideEffectReducer } from '../sideEffectReducer';

export interface Web3ContextValue {
	state: Web3State;
	dispatch: any;
	emitter: EventEmitter;
}

const Web3Context = React.createContext<Web3ContextValue>(null as any);

const emitter = new EventEmitter();
const reducer = sideEffectReducer({
	handleQueryResponse,
	handleCommand,
});

interface Props {
	children?: ReactNode;
}
const Web3ContextProvider: React.FC<Props> = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	// Handle new query & event effects
	useEffect(() => {
		const { query } = state;
		handleQueries({ state, dispatch, queryHandlers });

		if (query) {
			dispatch({ type: commonLanguage.commands.QueueQueries, payload: { queries: query } });
		}
	}, [state.query]);

	return <Web3Context.Provider value={{ state, dispatch, emitter }}>{children}</Web3Context.Provider>;
};

export { Web3Context, Web3ContextProvider };
