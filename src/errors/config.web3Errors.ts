/**
 * Configuration for translating raw wallet / viem errors into human-readable messages.
 *
 * This file is the ONLY place where error-matching strings and user-facing copy live
 * (Rule 1: no hardcoded values scattered through logic; Rule 5: config lives in the
 * feature folder it belongs to).
 *
 * To handle a new error, add a rule to `web3ErrorRules` — no parser changes required.
 */

/**
 * How serious an error is, which drives the icon and accent color in the dialog.
 *
 * - `cancelled` — the user deliberately backed out. Not a failure; nothing went wrong.
 * - `warning`   — the action could not proceed, but the cause is understood and recoverable.
 * - `error`     — an unexpected failure.
 */
export type Web3ErrorSeverity = 'cancelled' | 'warning' | 'error';

/**
 * A single matching rule. The first rule whose `match` hits wins, so order matters:
 * put the most specific rules first.
 */
export interface Web3ErrorRule {
	/** Stable identifier, useful for logging and tests. */
	id: string;
	/**
	 * Lowercased substrings searched for in the raw error text. A rule matches if ANY
	 * entry is present. Kept as plain substrings rather than regex because wallet
	 * vendors reword these strings frequently and substrings survive that better.
	 */
	match: string[];
	/** Numeric provider error codes (EIP-1193) that also select this rule. */
	codes?: number[];
	severity: Web3ErrorSeverity;
	/** Short dialog heading. */
	title: string;
	/** Plain-English explanation of what happened. */
	message: string;
	/** Optional next step the user can take. */
	suggestion?: string;
}

/**
 * Ordered matching rules. First match wins.
 */
export const web3ErrorRules: Web3ErrorRule[] = [
	{
		id: 'user-rejected',
		match: [
			'user rejected the request',
			'user denied transaction signature',
			'user denied message signature',
			'user rejected',
			'request rejected',
			'transaction was rejected',
			'ethjs-query',
			'action_rejected',
		],
		codes: [4001],
		severity: 'cancelled',
		title: 'Transaction Cancelled',
		message: 'You cancelled the request in your wallet.',
		suggestion: 'Nothing was sent to the blockchain and no gas was spent. You can try again whenever you are ready.',
	},
	{
		id: 'insufficient-funds',
		match: ['insufficient funds', 'insufficient balance for transfer', 'gas required exceeds allowance'],
		severity: 'warning',
		title: 'Not Enough ETH for Gas',
		message: 'Your wallet does not hold enough ETH to cover the network fee for this transaction.',
		suggestion: 'Add a small amount of ETH to your wallet on this network and try again.',
	},
	{
		id: 'wrong-network',
		match: ['chain mismatch', 'does not match the target chain', 'unsupported chain', 'chain not configured'],
		codes: [4902],
		severity: 'warning',
		title: 'Wrong Network',
		message: 'Your wallet is connected to a different network than this action requires.',
		suggestion: 'Switch networks in your wallet, then try again.',
	},
	{
		id: 'already-pending',
		match: [
			'nonce too low',
			'already known',
			'replacement transaction underpriced',
			'transaction with the same hash was already imported',
		],
		severity: 'warning',
		title: 'Transaction Already Pending',
		message: 'A transaction from this wallet is already in flight, or this one was already submitted.',
		suggestion: 'Wait for the pending transaction to confirm before sending another.',
	},
	{
		id: 'execution-reverted',
		match: ['execution reverted', 'unpredictable_gas_limit', 'cannot estimate gas', 'gas estimation failed'],
		severity: 'warning',
		title: 'Transaction Would Fail',
		message: 'The contract rejected this transaction during simulation, so it was not submitted.',
		suggestion:
			'This usually means a condition was not met — for example a balance changed, an amount is too large, or a required waiting period has not elapsed. Refresh your balances and try again.',
	},
	{
		id: 'request-timeout',
		match: ['timed out', 'timeout', 'took too long to respond', 'request failed with status code 429', 'rate limit'],
		severity: 'warning',
		title: 'Network Busy',
		message: 'The network did not respond in time.',
		suggestion: 'This is usually temporary. Wait a few seconds and try again.',
	},
	{
		id: 'connector-not-connected',
		match: ['connector not connected', 'no ethereum provider', 'provider not found', 'wallet not connected'],
		severity: 'warning',
		title: 'Wallet Not Connected',
		message: 'We could not reach your wallet.',
		suggestion: 'Make sure your wallet extension is unlocked and connected to this site, then try again.',
	},
];

/**
 * Used when no rule matches AND the raw text looks machine-generated.
 * Deliberately avoids blaming the user or guessing a cause.
 */
export const fallbackWeb3Error = {
	id: 'unknown',
	severity: 'error' as Web3ErrorSeverity,
	title: 'Something Went Wrong',
	message: 'The request could not be completed.',
	suggestion: 'The technical details below may help identify the cause.',
};

/**
 * Used when no rule matches but the raw text is already short and human-readable —
 * for example our own validation strings ("Invalid number").
 *
 * Without this, such messages would be replaced by the generic fallback above and the
 * user would lose the one piece of information that actually told them what to fix.
 */
export const passthroughWeb3Error = {
	id: 'passthrough',
	severity: 'warning' as Web3ErrorSeverity,
	title: 'Unable to Continue',
	suggestion: undefined as string | undefined,
};

/**
 * Heuristics deciding whether an unmatched error is already fit to show as-is.
 */
export const humanMessageHeuristics = {
	/** Longer than this and we assume it is a machine dump, not a written sentence. */
	maxLength: 160,
	/** Hex blobs of at least this length indicate calldata rather than prose. */
	hexBlobMinLength: 20,
};

/**
 * Noise that viem appends to error messages. These sections are useful for debugging but
 * unreadable in a dialog, so the parser splits them off into the collapsible details panel.
 */
export const viemNoiseMarkers = [
	'Request Arguments:',
	'Contract Call:',
	'Estimate Gas Arguments:',
	'Raw Call Arguments:',
	'Docs:',
	'Details:',
	'Version:',
];

/**
 * Copy used by the dialog chrome itself.
 */
export const web3ErrorDialogText = {
	detailsToggleShow: 'Show technical details',
	detailsToggleHide: 'Hide technical details',
	copyButton: 'Copy',
	copiedButton: 'Copied',
	closeButton: 'Close',
};
