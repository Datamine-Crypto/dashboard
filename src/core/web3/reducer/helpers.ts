import { v4 as uuidv4 } from 'uuid';
import { ReducerQuery } from '../sideEffectReducer';

/**
 * A factory function to create a `withQueries` helper, which simplifies adding new queries to the state.
 * @param state - The current state.
 * @returns A function that takes an array of queries and returns an object to be merged into the new state.
 */
export const createWithWithQueries = (state: any) => {
	const withQueries = (queries: ReducerQuery[]) => {
		const queriesWithIds = queries.map((query) => {
			return {
				...query,
				id: uuidv4(),
			};
		});

		return {
			query: queriesWithIds,
			queriesCount: state.queriesCount + queries.length,
		};
	};
	return withQueries;
};

export const localConfig = {
	/**
	 * Make sure we don't refresh accounts more than X miliseconds between each call (for thottling)
	 */
	throttleAccountRefreshMs: 2000,
};
