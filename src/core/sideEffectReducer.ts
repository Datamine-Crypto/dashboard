/**
 * Parameters for the SideEffectReducer.
 */
interface SideEffectReducerParams {
	/**
	 * Function to handle the response of a query.
	 * @param data - The query response data.
	 * @returns The updated state.
	 */
	handleQueryResponse: (data: ReducerQueryHandler<any>) => any;
	/**
	 * Function to handle a command.
	 * @param state - The current state.
	 * @param data - The command data.
	 * @returns The updated state.
	 */
	handleCommand: (state: any, data: any) => any;
}

/**
 * Parameters for handling queries.
 */
interface HandlerQueriesParams {
	/** The dispatch function from React's useReducer. */
	dispatch: React.Dispatch<any>;
	/** The current state. */
	state: any;
	/** An object containing query handlers, keyed by query type. */
	queryHandlers: any;
}

/**
 * Represents a command dispatched to the reducer.
 */
export interface ReducerCommand {
	/** The type of the command. */
	type: string;
	/** The payload of the command. */
	payload: any;
}

/**
 * Represents the data structure for a query response within the reducer.
 */
interface ReducerQueryData {
	/** Error message if the query failed. */
	err: string;
	/** The response data from the query. */
	response: any;
	/** The original query that was executed. */
	query: ReducerQuery;
}

/**
 * Represents a query to be processed by the reducer.
 */
export interface ReducerQuery {
	/** Optional: Unique identifier for the query. */
	id?: string;
	/** The type of the query. */ type: string;
	/** Optional: The payload of the query. */
	payload?: any;
}

/**
 * Represents the data passed to a ReducerQueryHandler.
 * @template T - The type of the state.
 */
export interface ReducerQueryHandler<T> {
	/** The current state. */
	state: T;
	/** The payload containing query response data. */
	payload: ReducerQueryData;
}

/**
 * Represents the parameters passed to a QueryHandler function.
 * @template T - The type of the state.
 */
export interface QueryHandler<T> {
	/** The current state. */
	state: T;
	/** The query to be handled. */
	query: ReducerQuery;
	/** The dispatch function from React's useReducer. */
	dispatch: React.Dispatch<any>;
}

/**
 * Processes a queue of ReducerQueries by invoking their respective handlers.
 * It dispatches success or error actions based on the query handler's outcome.
 * @param params - Object containing the current state, dispatch function, and query handlers.
 */
const handleQueries = async ({ state, dispatch, queryHandlers }: HandlerQueriesParams) => {
	const { query: queries } = state;
	if (!queries) {
		return;
	}

	for (const query of queries) {
		const queryHandler = queryHandlers[query.type];
		if (!queryHandler) {
			throw commonLanguage.errors.QueryHandlerNotFound;
		}

		try {
			const response = await queryHandler({ state, query, dispatch });
			dispatch({
				type: commonLanguage.commands.HandleQuery,
				payload: {
					query,
					response,
				},
			});
		} catch (err) {
			dispatch({
				type: commonLanguage.commands.HandleQuery,
				payload: {
					query,
					err,
				},
			});
		}
	}
};
/**
 * Creates a higher-order reducer that handles both commands and query responses.
 * It intercepts query responses to remove them from the pending queries list.
 * @param params - Object containing handleQueryResponse and handleCommand functions.
 * @returns A reducer function that processes state based on commands and query responses.
 */
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
					pendingQueries: newState.pendingQueries.filter((pendingQuery: ReducerQuery) => pendingQuery.id !== query.id),
				};
				return stateWithoutPendingQuery;
			}

			return handleCommand(state, data);
		};

		const newState = handleData();

		return newState;
	};
};

const commonLanguage = {
	commands: {
		HandleQuery: 'HANDLE_QUERY',
		HandleQueries: 'HANDLE_QUERIES',
		QueueQueries: 'QUEUE_QUERIES',
	},
	errors: {
		QueryHandlerNotFound: 'Query handler not found.',
	},
};

export { commonLanguage, handleQueries, sideEffectReducer };
