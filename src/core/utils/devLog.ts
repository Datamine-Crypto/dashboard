export const isDevLogEnabled = () => {
	return !!window.location.search && window.location.search.indexOf('devLog=1') !== -1
}

export const devLog = (...args: any) => {
	if (!isDevLogEnabled()) {
		return;
	}

	console.log('devLog:', args)
	window.dispatchEvent(new CustomEvent('devLog', { detail: args }))
}