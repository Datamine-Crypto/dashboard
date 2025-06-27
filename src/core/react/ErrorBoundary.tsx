import { Refresh } from '@mui/icons-material';
import { Box, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextareaAutosize, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import React, { ErrorInfo } from "react";
import logo from '../../svgs/logo.svg'; // Tell webpack this JS file uses this image

/**
 * Defines the shape of the state for the ErrorBoundary component.
 */
type ErrorState = {
	/** Indicates whether an error has occurred. */
	hasError: boolean;
	/** The error object caught by the boundary. */
	error?: Error;
	/** Information about the error, including the component stack. */
	errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the crashed component tree.
 * This prevents the entire application from crashing.
 */
export default class ErrorBoundary extends React.Component<{}, ErrorState> {
	/**
	 * Constructs the ErrorBoundary component.
	 * @param props The component props.
	 */
	constructor(props: any) {
		super(props);

		this.state = {
			hasError: false
		}
	}

	/**
	 * Catches errors that occur in the component tree below and logs them.
	 * It also updates the component's state to display a fallback UI.
	 * @param error The error that was thrown.
	 * @param errorInfo Information about the component stack where the error occurred.
	 */
	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Display fallback UI
		this.setState({
			hasError: true,
			error,
			errorInfo
		});
	}

	/**
	 * Renders the component's children or a fallback error UI if an error has occurred.
	 * @returns The rendered React elements.
	 */
	render() {
		const { hasError, error, errorInfo } = this.state

		const getLogo = () => {
			return <img src={logo} alt="Datamine Network" style={{ width: '128px' }} />;
		}

		/**
		 * Renders the error message display, including error details and a refresh button.
		 * @returns React.ReactElement or empty fragment if no error.
		 */
		const getErrorMessage = () => {
			if (!hasError) {
				return <></>;
			}

			const getStack = () => {
				if (!errorInfo) {
					return <></>
				}

				return <TextareaAutosize
					aria-label="Error Stack"
					minRows={3}
					maxRows={17}
					value={errorInfo.componentStack as string}
					style={{ width: "600px" }}
				/>
			}

			const errorLines = typeof error === 'object' ? Object.entries(error) : [['Message', error as any]]
			console.log('errorLines:', errorLines, error)

			const errorLinesRows = errorLines.map(([key, value]) => <TableRow key={key}>
				<TableCell component="th" scope="row">
					{key}
				</TableCell>
				<TableCell>{value}</TableCell>
			</TableRow>);

			return <Box alignItems="center" justifyContent="center" display="flex" flexDirection="column" style={{ height: '100vh' }}>
				<Box my={6}>
					<Grid container justifyContent="center"><Grid>{getLogo()}</Grid></Grid>

					<Box my={3}><Grid
						container
						direction="column"
						sx={{
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Grid>
							<Box my={3}>
								<Typography variant="h4" color="primary">Something went wrong:</Typography>

							</Box>
						</Grid>
						<Grid>
							<Button onClick={reloadPage} variant="contained" color="warning" size="large" startIcon={<Refresh />}>Refresh Page</Button>
						</Grid>
					</Grid>
					</Box>
					<Box mt={6}>
						<TableContainer component={Paper}>
							<Table aria-label="simple table">
								<TableHead>
									<TableRow>
										<TableCell>Error</TableCell>
										<TableCell>Description</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{errorLinesRows}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
					<Box mt={3} mb={6}>
						{getStack()}
					</Box>
				</Box>
			</Box >
		}

		/**
		 * Reloads the current page, effectively resetting the application state.
		 */
		const reloadPage = () => {
			window.location.href = '?' + (new Date()).getTime()
		}

		if (hasError) {
			// You can render any custom fallback UI
			return <Container maxWidth="md">
				<Box my={3}>
					{getErrorMessage()}
				</Box>
			</Container>
		}
		return (this.props as any).children;
	}
}

