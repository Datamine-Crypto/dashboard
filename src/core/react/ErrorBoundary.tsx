import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextareaAutosize, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import React, { ErrorInfo } from "react";
import logo from '../../svgs/logo.svg'; // Tell webpack this JS file uses this image

type ErrorState = {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}
/**
 * This will catch any exceptions that happen and show the middle of the screen (check console for more info)
 */
export default class ErrorBoundary extends React.Component<{}, ErrorState> {
	constructor(props: any) {
		super(props);

		this.state = {
			hasError: false
		}
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Display fallback UI
		this.setState({
			hasError: true,
			error,
			errorInfo
		});
	}

	render() {
		const { hasError, error, errorInfo } = this.state

		const getLogo = () => {
			return <img src={logo} alt="Datamine Network" style={{ width: '128px' }} />;
		}

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
							<Button onClick={reloadPage} variant="contained" color="warning" size="large" startIcon={<RefreshIcon />}>Refresh Page</Button>
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

