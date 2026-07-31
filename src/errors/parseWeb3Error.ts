import {
	fallbackWeb3Error,
	humanMessageHeuristics,
	passthroughWeb3Error,
	viemNoiseMarkers,
	web3ErrorRules,
	type Web3ErrorRule,
	type Web3ErrorSeverity,
} from '@/errors/config.web3Errors';

/**
 * Turns raw wallet / viem errors into something a person can actually read.
 *
 * viem errors are excellent for debugging and terrible for end users — a rejected
 * MetaMask prompt produces several hundred characters of calldata, ABI signatures and
 * documentation links. This module keeps all of that (in a collapsible panel) while
 * leading with a one-line explanation of what actually happened.
 *
 * The matching rules themselves live in `config.web3Errors.ts`.
 */

/** The user-facing shape consumed by the error dialog. */
export interface ParsedWeb3Error {
	/** Stable rule id that produced this result. Useful for logging. */
	id: string;
	severity: Web3ErrorSeverity;
	title: string;
	/** Plain-English explanation. */
	message: string;
	/** Optional next step. */
	suggestion?: string;
	/** On-chain revert reason, when one could be extracted. */
	revertReason: string | null;
	/** Full original error text, shown only when the user expands details. */
	technicalDetails: string;
	/** True when the user simply cancelled — callers may choose not to alarm them. */
	isUserRejection: boolean;
}

/**
 * Normalises whatever was thrown into a single searchable string.
 *
 * Errors arrive here as `Error` instances, plain strings, or provider objects carrying
 * nested `cause` / `shortMessage` / `details` fields, so every reachable text field is
 * concatenated rather than trusting any one of them.
 */
const extractRawText = (error: unknown): string => {
	if (error === null || error === undefined) return '';
	if (typeof error === 'string') return error;

	const parts: string[] = [];
	const seen = new Set<unknown>();

	const visit = (value: unknown, depth: number) => {
		if (depth > 5 || value === null || typeof value !== 'object' || seen.has(value)) return;
		seen.add(value);

		const record = value as Record<string, unknown>;
		for (const key of ['shortMessage', 'details', 'message', 'reason', 'name']) {
			const field = record[key];
			if (typeof field === 'string' && field.length > 0) parts.push(field);
		}
		for (const key of ['cause', 'error', 'data', 'info']) {
			visit(record[key], depth + 1);
		}
	};

	visit(error, 0);

	if (parts.length === 0 && error instanceof Error) return error.message;
	if (parts.length === 0) return String(error);

	// Preserve order while dropping duplicates — nested causes repeat the same message.
	return Array.from(new Set(parts)).join(' | ');
};

/**
 * Pulls an EIP-1193 numeric error code out of the error object, if present.
 */
const extractErrorCode = (error: unknown): number | null => {
	if (error === null || typeof error !== 'object') return null;

	const seen = new Set<unknown>();
	const visit = (value: unknown, depth: number): number | null => {
		if (depth > 5 || value === null || typeof value !== 'object' || seen.has(value)) return null;
		seen.add(value);

		const record = value as Record<string, unknown>;
		if (typeof record.code === 'number') return record.code;

		for (const key of ['cause', 'error', 'data', 'info']) {
			const found = visit(record[key], depth + 1);
			if (found !== null) return found;
		}
		return null;
	};

	return visit(error, 0);
};

/**
 * Extracts a contract revert reason when the chain provided one.
 */
const extractRevertReason = (rawText: string): string | null => {
	const patterns = [
		/reverted with reason string ['"]([^'"]+)['"]/i,
		/execution reverted:\s*([^\n|]+)/i,
		/reverted with the following reason:\s*\n?\s*([^\n|]+)/i,
	];

	for (const pattern of patterns) {
		const found = rawText.match(pattern);
		if (found?.[1]) {
			// viem appends its own sections on the same line, so cut the reason at the
			// first marker — otherwise "Version: viem@x.y.z" ends up inside the reason.
			let reason = found[1].trim();
			for (const marker of viemNoiseMarkers) {
				const at = reason.indexOf(marker);
				if (at > 0) reason = reason.slice(0, at);
			}
			reason = reason.trim();
			if (reason.length > 0) return reason;
		}
	}
	return null;
};

/**
 * Finds the first configured rule matching this error.
 */
const findMatchingRule = (rawText: string, code: number | null): Web3ErrorRule | null => {
	const haystack = rawText.toLowerCase();

	for (const rule of web3ErrorRules) {
		if (code !== null && rule.codes?.includes(code)) return rule;
		if (rule.match.some((needle) => haystack.includes(needle))) return rule;
	}
	return null;
};

/**
 * Trims viem's appended debugging sections so the details panel leads with the part
 * that actually identifies the failure.
 */
const tidyTechnicalDetails = (rawText: string): string => {
	let earliestMarker = rawText.length;
	for (const marker of viemNoiseMarkers) {
		const at = rawText.indexOf(marker);
		if (at > 0 && at < earliestMarker) earliestMarker = at;
	}

	const headline = rawText.slice(0, earliestMarker).trim();
	const remainder = rawText.slice(earliestMarker).trim();

	// Put the human-meaningful headline first, then the raw dump beneath it.
	return remainder.length > 0 ? `${headline}\n\n${remainder}` : headline;
};

/**
 * Decides whether an unmatched error is already written for humans.
 *
 * Our own validation errors ("Invalid number") reach this module alongside viem dumps.
 * Replacing those with a generic fallback would discard the only useful information, so
 * short prose containing no calldata is passed through verbatim.
 */
const isAlreadyHumanReadable = (rawText: string): boolean => {
	const text = rawText.trim();
	if (text.length === 0 || text.length > humanMessageHeuristics.maxLength) return false;
	if (viemNoiseMarkers.some((marker) => text.includes(marker))) return false;

	const hexBlob = new RegExp(`0x[0-9a-fA-F]{${humanMessageHeuristics.hexBlobMinLength},}`);
	if (hexBlob.test(text)) return false;

	return true;
};

/**
 * Converts any thrown value into a display-ready error description.
 *
 * Always returns a result — it never throws and never returns null, so callers can
 * render it unconditionally.
 */
export const parseWeb3Error = (error: unknown): ParsedWeb3Error => {
	const rawText = extractRawText(error);
	const code = extractErrorCode(error);
	const rule = findMatchingRule(rawText, code);
	const revertReason = extractRevertReason(rawText);
	const technicalDetails = tidyTechnicalDetails(rawText);

	if (rule) {
		return {
			id: rule.id,
			severity: rule.severity,
			title: rule.title,
			message: rule.message,
			suggestion: rule.suggestion,
			revertReason,
			technicalDetails,
			isUserRejection: rule.id === 'user-rejected',
		};
	}

	// No rule matched. Preserve already-human text rather than burying it.
	if (isAlreadyHumanReadable(rawText)) {
		return {
			id: passthroughWeb3Error.id,
			severity: passthroughWeb3Error.severity,
			title: passthroughWeb3Error.title,
			message: rawText.trim(),
			suggestion: passthroughWeb3Error.suggestion,
			revertReason,
			// Nothing extra to reveal: the message already is the whole error.
			technicalDetails: '',
			isUserRejection: false,
		};
	}

	return {
		id: fallbackWeb3Error.id,
		severity: fallbackWeb3Error.severity,
		title: fallbackWeb3Error.title,
		message: fallbackWeb3Error.message,
		suggestion: fallbackWeb3Error.suggestion,
		revertReason,
		technicalDetails,
		isUserRejection: false,
	};
};
