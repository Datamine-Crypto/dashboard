/**
 * @file devLog.ts
 * @description Provides a conditional logging utility that is active only when a specific query parameter is present in the URL.
 * This is useful for enabling detailed logging during development without cluttering the console in production.
 */

/**
 * Checks if the development log is enabled based on the URL search parameters.
 * The log is enabled if the URL contains 'devLog=1'.
 * @returns True if dev logging is enabled, false otherwise.
 */
export const isDevLogEnabled = () => {
	return !!window.location.search && window.location.search.indexOf('devLog=1') !== -1;
};

/**
 * Logs messages to the console and dispatches a custom event if dev logging is enabled.
 * This allows other parts of the application to listen for and react to development logs.
 * @param args - The arguments to log.
 */
export const devLog = (...args: any) => {
	if (!isDevLogEnabled()) {
		return;
	}

	console.log('devLog:', args);
	window.dispatchEvent(new CustomEvent('devLog', { detail: args }));
};
