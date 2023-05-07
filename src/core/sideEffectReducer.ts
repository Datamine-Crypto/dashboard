interface SideEffectReducerParams {
	handleQueryResponse: (data: ReducerQueryHandler<any>) => any;
	handleCommand: (state: any, data: any) => any;
}

interface HandlerQueriesParams {
	dispatch: React.Dispatch<any>;
	state: any;
	queryHandlers: any;
}

export interface ReducerCommand {
	type: string;
	payload: any;
}

interface ReducerQueryData {
	err: string;
	response: any;
	query: ReducerQuery;
}

export interface ReducerQuery {
	id?: string;
	type: string;
	payload?: any;
}

export interface ReducerQueryHandler<T> {
	state: T,
	payload: ReducerQueryData;
}


export interface QueryHandler<T> {
	state: T;
	query: ReducerQuery;
	dispatch: React.Dispatch<any>;
}


const handleQueries = async ({ state, dispatch, queryHandlers }: HandlerQueriesParams) => {
	const { query: queries } = state;
	if (!queries) {
		return;
	}

	for (const query of queries) {
		const queryHandler = queryHandlers[query.type];
		if (!queryHandler) {
			throw commonLanguage.errors.QueryHandlerNotFound
		}

		try {
			const response = await queryHandler({ state, query, dispatch })
			dispatch({
				type: commonLanguage.commands.HandleQuery,
				payload: {
					query,
					response
				}
			})
		}
		catch (err) {
			dispatch({
				type: commonLanguage.commands.HandleQuery,
				payload: {
					query,
					err
				}
			})
		}
	}
}
const sideEffectReducer = (params: SideEffectReducerParams) => {
	const { handleQueryResponse, handleCommand } = params;

	return (state: any, data: any) => {
		const handleData = () => {
			if (data.type === commonLanguage.commands.HandleQuery) {
				const newState = handleQueryResponse({ state, payload: data.payload });

				// Remove query from pending queries;
				const { query } = data.payload;
				const stateWithoutPendingQuery = {
					...newState,
					pendingQueries: newState.pendingQueries.filter((pendingQuery: ReducerQuery) => pendingQuery.id !== query.id)
				}
				return stateWithoutPendingQuery;
			}

			return handleCommand(state, data);
		}

		const newState = handleData();


		return newState;
	}
}

const commonLanguage = {
	commands: {
		HandleQuery: 'HANDLE_QUERY',
		HandleQueries: 'HANDLE_QUERIES',
		QueueQueries: 'QUEUE_QUERIES'
	},
	errors: {
		QueryHandlerNotFound: 'Query handler not found.'
	}
}

export {
	handleQueries,
	sideEffectReducer,
	commonLanguage
}