import { ThemeProvider } from '@mui/material';
import React, { Suspense, lazy } from 'react';

const CssBaseline = lazy(() => import('@mui/material/CssBaseline'))

import ErrorBoundary from './core/react/ErrorBoundary';
const Web3ContextProvider = lazy(() => import('./core/web3/Web3Context').then(module => ({ default: module.Web3ContextProvider })));
const PageFragment = lazy(() => import('./core/react/pages/PageFragment'))
const CenteredLoading = lazy(() => import('./core/react/elements/Fragments/CenteredLoading'))

import { theme } from './core/styles';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

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
