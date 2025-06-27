import { ThemeProvider } from '@mui/material';
import React, { Suspense, lazy } from 'react';

import ErrorBoundary from './core/react/ErrorBoundary';
import { theme } from './core/styles';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
const CssBaseline = lazy(() => import('@mui/material/CssBaseline'));
const Web3ContextProvider = lazy(() =>
	import('./core/web3/Web3Context').then((module) => ({ default: module.Web3ContextProvider }))
);
const PageFragment = lazy(() => import('./core/react/pages/PageFragment'));
const CenteredLoading = lazy(() => import('./core/react/elements/Fragments/CenteredLoading'));

/**
 * The main application component.
 * It sets up the Material-UI theme, ErrorBoundary, Web3Context, and renders the main PageFragment.
 * Uses React.lazy and Suspense for code splitting and loading indicators.
 */
function App() {
	return (
		<React.Fragment>
			<CssBaseline />
			<ThemeProvider theme={theme.muiTheme}>
				<ErrorBoundary>
					<Suspense fallback={<CenteredLoading />}>
						<Web3ContextProvider>
							<PageFragment />
						</Web3ContextProvider>
					</Suspense>
				</ErrorBoundary>
			</ThemeProvider>
		</React.Fragment>
	);
}

export default App;
