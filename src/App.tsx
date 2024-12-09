import { ThemeProvider } from '@mui/material';
import { Web3ContextProvider } from './core/web3/Web3Context';

import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import ErrorBoundary from './core/react/ErrorBoundary';
import PageFragment from './core/react/pages/PageFragment';
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
					<Web3ContextProvider>
						<PageFragment />
					</Web3ContextProvider>
				</ErrorBoundary>
			</ThemeProvider>
		</React.Fragment>
	);
}

export default App;
