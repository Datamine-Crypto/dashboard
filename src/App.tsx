import { ThemeProvider } from '@mui/material';
import { Web3ContextProvider } from './core/web3/Web3Context';

import ErrorBoundary from './core/react/ErrorBoundary';
import PageFragment from './core/react/pages/PageFragment';
import { theme } from './core/styles';

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
