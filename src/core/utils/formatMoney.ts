export const formatMoney = ({ amount, currency, includeCurrencySuffix = false }: { amount: number, currency: string, includeCurrencySuffix?: boolean }) => {
	const exchangedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(amount)

	if (includeCurrencySuffix && exchangedAmount.indexOf(currency) === -1) {
		return `${exchangedAmount} ${currency}`

	}

	return exchangedAmount
}