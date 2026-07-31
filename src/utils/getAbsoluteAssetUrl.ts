/**
 * Builds absolute, publicly reachable URLs for files served out of `public/`.
 *
 * Most of the app can reference these with a relative path, because the browser resolves
 * them against the current page. External consumers cannot: when we hand a token logo to
 * MetaMask via `wallet_watchAsset`, MetaMask fetches that image itself, from its own
 * extension context. A relative path — or a link to the source repository — resolves to
 * nothing there, and the wallet silently falls back to a letter avatar.
 *
 * This app builds with `base: './'` so it can be hosted at any domain or subfolder, which
 * is why the origin is resolved at runtime rather than hardcoded.
 */

/**
 * Resolves a path inside `public/` to an absolute URL.
 *
 * @param assetPath Path relative to `public/`, with or without a leading slash (ex: `logos/dam.png`).
 * @param configuredBaseUrl Optional explicit base URL. When empty, the URL is derived from
 *   wherever the dashboard is currently being served.
 * @returns An absolute URL, or the original path if no absolute URL can be determined
 *   (non-browser contexts such as tests or SSR).
 */
export const getAbsoluteAssetUrl = (assetPath: string, configuredBaseUrl?: string): string => {
	const relativePath = assetPath.replace(/^\/+/, '');

	// An explicitly configured host always wins.
	if (configuredBaseUrl) {
		return `${configuredBaseUrl.replace(/\/+$/, '')}/${relativePath}`;
	}

	// `document.baseURI` is the document's own URL, so this resolves correctly whether the
	// dashboard sits at a domain root or in a subfolder. Any hash route is discarded by the
	// URL constructor, which matters here because this app uses hash-based routing.
	if (typeof document !== 'undefined' && document.baseURI) {
		return new URL(relativePath, document.baseURI).href;
	}

	if (typeof window !== 'undefined' && window.location?.origin) {
		return `${window.location.origin}/${relativePath}`;
	}

	// No browser context available — return the path unchanged rather than throwing.
	return relativePath;
};
