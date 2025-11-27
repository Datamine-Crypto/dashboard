import { ThemeProvider } from '@mui/material';
import React, { Suspense, lazy } from 'react';

// Error boundary for catching and displaying UI errors
import ErrorBoundary from '@/react/utils/ErrorBoundary';
// Application-wide Material-UI theme
import { theme } from '@/react/utils/theme';

// Font imports for Roboto typeface
import '@fontsource-variable/roboto';

// Lazy-loaded components for code splitting
const CssBaseline = lazy(() => import('@mui/material/CssBaseline'));
const PageFragment = lazy(() => import('@/react/pages/PageFragment'));
const CenteredLoading = lazy(() => import('@/react/elements/Fragments/CenteredLoading'));

/**
 * The main application component.
 * It sets up the Material-UI theme, ErrorBoundary, and renders the main PageFragment.
 * Uses React.lazy and Suspense for code splitting and loading indicators.
 */
function App() {
	return (
		<React.Fragment>
			{/* CssBaseline provides a consistent baseline for Material-UI components */}
			<CssBaseline />
			{/* ThemeProvider applies the custom Material-UI theme to the application */}
			<ThemeProvider theme={theme.muiTheme}>
				{/* ErrorBoundary catches JavaScript errors anywhere in its child component tree */}
				<ErrorBoundary>
					{/* Suspense displays a fallback UI while waiting for lazy-loaded components to load */}
					<Suspense fallback={<CenteredLoading />}>
						<PageFragment />
					</Suspense>
				</ErrorBoundary>
			</ThemeProvider>
		</React.Fragment>
	);
}

export default App;
