/**
 * @file sideEffectReducer.ts
 * @description This file implements a higher-order reducer pattern to manage asynchronous operations (side effects)
 * and state updates in a React application using `useReducer`. It separates the concerns of handling commands
 * (direct state changes) and processing queries (asynchronous data fetching).
 */

/**
 * @interface SideEffectReducerParams
 * @description Defines the parameters required to create a `sideEffectReducer`.
 */
interface SideEffectReducerParams {
	/**
	 * @property {(data: ReducerQueryHandler<any>) => any} handleQueryResponse
	 * @description A function that processes the response of a query and returns the updated state.
	 * This is where the state is modified based on the results of an asynchronous operation.
	 */
	handleQueryResponse: (data: ReducerQueryHandler<any>) => any;
	/**
	 * @property {(state: any, data: any) => any} handleCommand
	 * @description A function that handles direct state-modifying commands.
	 * This is the core reducer logic for synchronous state updates.
	 */
	handleCommand: (state: any, data: any) => any;
}

/**
 * @interface HandlerQueriesParams
 * @description Defines the parameters for the `handleQueries` function, which executes pending queries.
 */
interface HandlerQueriesParams {
	/**
	 * @property {React.Dispatch<any>} dispatch
	 * @description The dispatch function from React's `useReducer`, used to dispatch actions
	 * (e.g., `HANDLE_QUERY` for query responses).
	 */
	dispatch: React.Dispatch<any>;
	/**
	 * @property {any} state
	 * @description The current state of the application, from which pending queries are read.
	 */
	state: any;
	/**
	 * @property {any} queryHandlers
	 * @description An object containing functions that handle specific query types.
	 * Each key is a query `type`, and its value is the corresponding handler function.
	 */
	queryHandlers: any;
}

/**
 * @interface ReducerCommand
 * @description Represents a synchronous command dispatched to the reducer to modify state.
 */
export interface ReducerCommand {
	/**
	 * @property {string} type
	 * @description The type of the command, indicating the action to be performed.
	 */
	type: string;
	/**
	 * @property {any} payload
	 * @description The data associated with the command, used to update the state.
	 */
	payload: any;
}

/**
 * @interface ReducerQueryData
 * @description Represents the data structure for the result of a processed query.
 */
interface ReducerQueryData {
	/**
	 * @property {string} err
	 * @description An error message if the query execution failed.
	 */
	err: string;
	/**
	 * @property {any} response
	 * @description The successful response data from the query.
	 */
	response: any;
	/**
	 * @property {ReducerQuery} query
	 * @description A reference to the original query that was executed.
	 */
	query: ReducerQuery;
}

/**
 * @interface ReducerQuery
 * @description Represents an asynchronous query to be processed by the `sideEffectReducer`.
 * These queries typically trigger side effects like API calls.
 */
export interface ReducerQuery {
	/**
	 * @property {string} [id]
	 * @description Optional: A unique identifier for the query, useful for tracking and removing pending queries.
	 */
	id?: string;
	/**
	 * @property {string} type
	 * @description The type of the query, which maps to a specific query handler.
	 */
	type: string;
	/**
	 * @property {any} [payload]
	 * @description Optional: The data associated with the query, passed to the query handler.
	 */
	payload?: any;
}

/**
 * @interface ReducerQueryHandler
 * @description Defines the structure of the data passed to the `handleQueryResponse` function.
 * @template T The type of the state being managed by the reducer.
 */
export interface ReducerQueryHandler<T> {
	/**
	 * @property {T} state
	 * @description The current state of the reducer before processing the query response.
	 */
	state: T;
	/**
	 * @property {ReducerQueryData} payload
	 * @description The payload containing the query result (response or error) and the original query.
	 */
	payload: ReducerQueryData;
}

/**
 * @interface QueryHandler
 * @description Defines the parameters passed to an individual query handler function.
 * @template T The type of the state being managed by the reducer.
 */
export interface QueryHandler<T> {
	/**
	 * @property {T} state
	 * @description The current state of the reducer when the query is being executed.
	 */
	state: T;
	/**
	 * @property {ReducerQuery} query
	 * @description The specific query to be handled.
	 */
	query: ReducerQuery;
	/**
	 * @property {React.Dispatch<any>} dispatch
	 * @description The dispatch function, allowing query handlers to dispatch further actions
	 * (e.g., to update loading states or show notifications).
	 */
	dispatch: React.Dispatch<any>;
}

/**
 * @function handleQueries
 * @description Processes a queue of `ReducerQueries` by invoking their respective handlers.
 * It iterates through the `queries` array in the state, executes each query handler asynchronously,
 * and dispatches a `HANDLE_QUERY` action with the result (success or error).
 * @param {HandlerQueriesParams} params - Object containing the current state, dispatch function, and query handlers.
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
 * @function sideEffectReducer
 * @description Creates a higher-order reducer that intercepts and processes `HANDLE_QUERY` actions.
 * When a `HANDLE_QUERY` action is dispatched (typically by `handleQueries`),
 * this reducer calls `handleQueryResponse` to update the state based on the query result
 * and then removes the processed query from the `pendingQueries` list.
 * All other actions are passed to the `handleCommand` function for synchronous state updates.
 * @param {SideEffectReducerParams} params - Object containing `handleQueryResponse` and `handleCommand` functions.
 * @returns {Function} A reducer function that processes state based on commands and query responses.
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

/**
 * @constant commonLanguage
 * @description Defines a set of common command types and error messages used across the reducer system.
 * This helps in standardizing action types and error handling.
 */
const commonLanguage = {
	commands: {
		/** Command type for handling a single query response. */
		HandleQuery: 'HANDLE_QUERY',
		/** Command type for initiating the processing of all queued queries. */
		HandleQueries: 'HANDLE_QUERIES',
		/** Command type for adding new queries to the pending queue. */
		QueueQueries: 'QUEUE_QUERIES',
	},
	errors: {
		/** Error message when a query handler is not found for a given query type. */
		QueryHandlerNotFound: 'Query handler not found.',
	},
};

export { commonLanguage, handleQueries, sideEffectReducer };
