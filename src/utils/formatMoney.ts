/**
 * Provides a utility function to format a numeric value into a currency string,
 * supporting different currency codes and formatting options.
 */

/**
 * Formats a numeric amount into a currency string.
 * It uses the `Intl.NumberFormat` API for locale-aware currency formatting.
 * @param params - An object containing the amount, currency code, and an optional flag to include the currency suffix.
 * @param params.amount - The numeric amount to format.
 * @param params.currency - The currency code (e.g., 'USD', 'EUR').
 * @param [params.includeCurrencySuffix=false] - Whether to explicitly append the currency code if not already present in the formatted string.
 * @returns The formatted currency string.
 */
export const formatMoney = ({
	amount,
	currency,
	includeCurrencySuffix = false,
}: {
	amount: number;
	currency: string;
	includeCurrencySuffix?: boolean;
}) => {
	const exchangedAmount = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		currencyDisplay: 'narrowSymbol',
	}).format(amount);

	if (includeCurrencySuffix && exchangedAmount.indexOf(currency) === -1) {
		return `${exchangedAmount} ${currency}`;
	}

	return exchangedAmount;
};
