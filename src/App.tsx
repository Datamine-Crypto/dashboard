import { ThemeProvider } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import React, { Suspense, lazy } from 'react';
import ErrorBoundary from './core/react/ErrorBoundary';
import { Web3ContextProvider } from './core/web3/Web3Context';
const PageFragment = lazy(() => import('./core/react/pages/PageFragment'))

import { theme } from './core/styles';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const CenteredLoading = () => (
	<div
		style={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			height: '100vh', // Full viewport height
			width: '100vw', // Full viewport width
			backgroundColor: '#222', // Optional: A dark background to make white text visible
		}}
	>
		<CircularProgress style={{ color: '#0ff' }} />
	</div>
);

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
