import React, { ReactNode, useContext, useEffect, useReducer } from 'react';

import { queryHandlers } from './Web3Bindings';
import { handleCommand, handleQueryResponse, initialState, Web3State } from './web3Reducer';

import { EventEmitter } from 'events';
import { commonLanguage, handleQueries, sideEffectReducer } from '../sideEffectReducer';

export interface Web3ContextValue {
	state: Web3State;
	dispatch: any;
	emitter: EventEmitter;
}

const Web3Context = React.createContext<Web3ContextValue | undefined>(undefined);

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

const useWeb3Context = () => {
	const context = useContext(Web3Context);
	if (context === undefined) {
		throw new Error('useWeb3Context must be used within a Web3ContextProvider');
	}
	return context;
};

export { Web3ContextProvider, useWeb3Context };
