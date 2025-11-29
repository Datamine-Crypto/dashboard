/**
 * This file implements a higher-order reducer pattern to manage asynchronous operations (side effects)
 * and state updates in a React application using `useReducer`. It separates the concerns of handling commands
 * (direct state changes) and processing queries (asynchronous data fetching).
 */

/**
 * Defines the parameters required to create a `sideEffectReducer`.
 */
interface SideEffectReducerParams<T> {
	/**
	 * A function that processes the response of a query and returns the updated state.
	 * This is where the state is modified based on the results of an asynchronous operation.
	 */
	handleQueryResponse: (data: ReducerQueryHandler<T>) => T;
	/**
	 * A function that handles direct state-modifying commands.
	 * This is the core reducer logic for synchronous state updates.
	 */
	handleCommand: (state: T, data: any) => T;
}

/**
 * Defines the parameters for the `handleQueries` function, which executes pending queries.
 */
interface HandlerQueriesParams<T> {
	/**
	 * The dispatch function from React's `useReducer`, used to dispatch actions
	 * (e.g., `HANDLE_QUERY` for query responses).
	 */
	dispatch: ReducerDispatch;
	/**
	 * The current state of the application, from which pending queries are read.
	 */
	state: T;
	/**
	 * An object containing functions that handle specific query types.
	 * Each key is a query `type`, and its value is the corresponding handler function.
	 */
	queryHandlers: Record<string, QueryHandler<T>>;
}

/**
 * A function that dispatches an action to the reducer.
 */
export type ReducerDispatch = (action: any) => void;

/**
 * Represents a synchronous command dispatched to the reducer to modify state.
 */
export interface ReducerCommand {
	/**
	 * The type of the command, indicating the action to be performed.
	 */
	type: string;
	/**
	 * The data associated with the command, used to update the state.
	 */
	payload: any;
}

/**
 * Represents the data structure for the result of a processed query.
 */
interface ReducerQueryData {
	/**
	 * An error message if the query execution failed.
	 */
	err: any;
	/**
	 * The successful response data from the query.
	 */
	response: any;
	/**
	 * A reference to the original query that was executed.
	 */
	query: ReducerQuery;
}

/**
 * Represents an asynchronous query to be processed by the `sideEffectReducer`.
 * These queries typically trigger side effects like API calls.
 */
export interface ReducerQuery<P = any> {
	/**
	 * Optional: A unique identifier for the query, useful for tracking and removing pending queries.
	 */
	id?: string;
	/**
	 * The type of the query, which maps to a specific query handler.
	 */
	type: string;
	/**
	 * Optional: The data associated with the query, passed to the query handler.
	 */
	payload?: P;
}

/**
 * Defines the structure of the data passed to the `handleQueryResponse` function.
 */
export interface ReducerQueryHandler<T> {
	/**
	 * The current state of the reducer before processing the query response.
	 */
	state: T;
	/**
	 * The payload containing the query result (response or error) and the original query.
	 */
	payload: ReducerQueryData;
}

/**
 * Defines the parameters passed to an individual query handler function.
 */
export type QueryHandler<T, P = any> = (params: {
	state: T;
	query: ReducerQuery<P>;
	dispatch: ReducerDispatch;
}) => Promise<any>;

/**
 * Interface representing the state shape required for side effects.
 */
interface SideEffectState {
	query?: ReducerQuery[];
	pendingQueries: ReducerQuery[];
}

/**
 * Processes a queue of `ReducerQueries` by invoking their respective handlers.
 * It iterates through the `queries` array in the state, executes each query handler asynchronously,
 * and dispatches a `HANDLE_QUERY` action with the result (success or error).
 * @param {HandlerQueriesParams} params - Object containing the current state, dispatch function, and query handlers.
 */
const handleQueries = async <T>({ state, dispatch, queryHandlers }: HandlerQueriesParams<T>) => {
	const { query: queries } = state as unknown as SideEffectState;
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
 * Creates a higher-order reducer that intercepts and processes `HANDLE_QUERY` actions.
 * When a `HANDLE_QUERY` action is dispatched (typically by `handleQueries`),
 * this reducer calls `handleQueryResponse` to update the state based on the query result
 * and then removes the processed query from the `pendingQueries` list.
 * All other actions are passed to the `handleCommand` function for synchronous state updates.
 * @param {SideEffectReducerParams} params - Object containing `handleQueryResponse` and `handleCommand` functions.
 * @returns {Function} A reducer function that processes state based on commands and query responses.
 */
const sideEffectReducer = <T>(params: SideEffectReducerParams<T>) => {
	const { handleQueryResponse, handleCommand } = params;

	return (state: T, data: any) => {
		const handleData = () => {
			if (data.type === commonLanguage.commands.HandleQuery) {
				const newState = handleQueryResponse({ state, payload: data.payload });

				// Remove query from pending queries;
				const { query } = data.payload;
				const stateWithoutPendingQuery = {
					...newState,
					pendingQueries: (newState as unknown as SideEffectState).pendingQueries.filter(
						(pendingQuery: ReducerQuery) => pendingQuery.id !== query.id
					),
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
 * Defines a set of common command types and error messages used across the reducer system.
 * This helps in standardizing action types and error handling.
 */
const commonLanguage = {
	commands: {
		/**
		 * Command type for handling a single query response. (Used in above code)
		 *  */
		HandleQuery: 'HANDLE_QUERY',

		/**
		 * Command type for adding new queries to the pending queue.
		 * This one is used in app commonLanguage! There it appends to pendingQueries and clears the query object.
		 */
		QueueQueries: 'QUEUE_QUERIES',
	},
	errors: {
		/** Error message when a query handler is not found for a given query type. */
		QueryHandlerNotFound: 'Query handler not found.',
	},
};

export { commonLanguage, handleQueries, sideEffectReducer };
