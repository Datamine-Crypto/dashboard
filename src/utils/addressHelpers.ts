/**
 * Helpers for comparing and normalising Ethereum addresses.
 *
 * Ethereum addresses are case-insensitive, but their EIP-55 checksum form mixes case to
 * encode a checksum. The same address therefore reaches us in different casings depending
 * on where it came from:
 *
 *   - viem returns checksummed addresses from contract reads
 *   - our ecosystem configs are hand-written and inconsistent (ArbiFLUX appears checksummed
 *     in one file and lowercase in another)
 *   - users paste addresses in whatever casing they copied
 *   - localStorage holds whatever was written by an older build
 *
 * Comparing any of those with `===` silently returns false for addresses that are in fact
 * the same. Always use `isSameAddress` instead.
 */

/**
 * Normalises an address for comparison or storage.
 *
 * @returns The lowercased, trimmed address, or an empty string for nullish input.
 */
export const normalizeAddress = (address: string | null | undefined): string => {
	if (!address) {
		return '';
	}
	return address.trim().toLowerCase();
};

/**
 * Case-insensitive address equality.
 *
 * Two nullish values are NOT considered equal — an absent address should not match another
 * absent address, otherwise "no minter set" would compare equal to "no address selected".
 */
export const isSameAddress = (left: string | null | undefined, right: string | null | undefined): boolean => {
	if (!left || !right) {
		return false;
	}
	return normalizeAddress(left) === normalizeAddress(right);
};

/**
 * True when `address` appears anywhere in `addresses`, ignoring case.
 */
export const containsAddress = (addresses: readonly string[], address: string | null | undefined): boolean => {
	if (!address) {
		return false;
	}
	const normalized = normalizeAddress(address);
	return addresses.some((candidate) => normalizeAddress(candidate) === normalized);
};
