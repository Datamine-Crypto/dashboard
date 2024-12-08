import React, { } from 'react';

import { Web3ContextProvider } from './core/web3/Web3Context';
import { ThemeProvider } from '@mui/material';

import { theme } from './core/styles'
import ErrorBoundary from './core/react/ErrorBoundary';
import PageFragment from './core/react/pages/PageFragment';

function App() {

	return (
		<ThemeProvider theme={theme.muiTheme}>
			<ErrorBoundary>
				<Web3ContextProvider>
					<PageFragment />
				</Web3ContextProvider>
			</ErrorBoundary>
		</ThemeProvider>
	);
}

export default App;
