import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useEffect } from 'react';
import { FluxAddressDetails } from '@/app/interfaces';
import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';
import { ReducerDispatch, ConnectionMethod } from '@/app/interfaces';
import logo from '@/react/svgs/logo.svg';
import { tss } from 'tss-react/mui';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import metamaskIcon from '@/react/svgs/metamask.svg';
import { isDevLogEnabled } from '@/utils/devLog';
import { useShallow } from 'zustand/react/shallow';
import HodlClickerEvents from '@/react/pages/machine/HodlClickerEvents';

interface RenderParams {
	isLate: boolean;
	isInitialized: boolean;
	hasWeb3: boolean | null;
	selectedAddress: string | null;
	isIncorrectNetwork: boolean;
	addressDetails: FluxAddressDetails | null;
	connectionMethod: ConnectionMethod;
	dispatch: ReducerDispatch;
	ecosystem: Ecosystem;
}

interface CenterContent {
	title: React.ReactNode;
	message: React.ReactNode;
	content?: React.ReactNode;
}

const useStyles = tss.create(({ theme }) => ({
	fullScreenSplash: {
		minHeight: '100vh',
		display: 'flex',
		alignContent: 'center',
		justifyContent: 'center',
	},
}));

const Render: React.FC<RenderParams> = React.memo(
	({
		isLate,
		isInitialized,
		addressDetails,
		hasWeb3,
		selectedAddress,
		isIncorrectNetwork,
		connectionMethod,
		dispatch,
		ecosystem,
	}) => {
		const { classes } = useStyles();
		const config = getEcosystemConfig(ecosystem);
		const { ecosystemName } = config;

		const getLoadingIndicator = () => {
			if (isIncorrectNetwork) {
				const errorTitle = config.isArbitrumOnlyToken ? 'Arbitrum' : 'Ethereum Mainnet & Arbitrum';
				return getCenterContent({
					title: `Looks like you are not on ${errorTitle} Network...`,
					message: (
						<>
							Currently {ecosystemName} Dashboard only works on {errorTitle}. Please change your network provider to{' '}
							<Box fontWeight="bold" display="inline">
								{errorTitle} L2
							</Box>
						</>
					),
					content: <img src="./images/network2.png" alt="Network Error" />,
				});
			}
			if (isInitialized && hasWeb3 !== null) {
				return null;
			}
			return (
				<Box alignItems="center" justifyContent="center" display="flex" style={{ height: '100vh' }}>
					<CircularProgress color="secondary" />
				</Box>
			);
		};

		const getLogo = () => {
			return <img src={logo} alt="Logo" style={{ width: '128px' }} />;
		};

		const getCenterContent = ({ title, message, content }: CenterContent) => {
			return (
				<Box className={classes.fullScreenSplash}>
					<Box mt={8 + 6} mb={6} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
						<Grid container justifyContent="center">
							<Grid>{getLogo()}</Grid>
						</Grid>
						<Box mt={3} mb={6} textAlign="center">
							<Typography component="div" variant="h5" color="textPrimary" gutterBottom>
								{title}
							</Typography>
							<Typography component="div" color="textSecondary">
								{message}
							</Typography>
						</Box>
						{content}
					</Box>
				</Box>
			);
		};

		const getConnectWalletButton = () => {
			const isMetaMask = () => {
				const ethereum = (window as any).ethereum;
				if (!ethereum || !ethereum.isMetaMask) {
					return false;
				}
				return true;
			};

			const getWalletIcon = () => {
				if (!isMetaMask()) {
					return null;
				}
				return (
					<Box mr={1} display="inline">
						<img src={metamaskIcon} alt="Metamask" width="24" height="24" style={{ verticalAlign: 'middle' }} />
					</Box>
				);
			};

			return (
				<Box className={classes.fullScreenSplash}>
					<Box mt={8 + 6} mb={6} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
						<Grid container justifyContent="center">
							<Grid>{getLogo()}</Grid>
						</Grid>
						<Box mt={3} mb={6} textAlign="center">
							<Typography component="div" variant="h5" color="textPrimary" gutterBottom>
								Welcome to {ecosystemName} Machine
							</Typography>
							<Typography component="div" color="textSecondary">
								Connect to the network to view the machine status.
							</Typography>
						</Box>
						<Box>
							<Box display="inline-block" mr={3}>
								<Button
									variant="outlined"
									color="secondary"
									size="large"
									onClick={() => dispatch({ type: commonLanguage.commands.ConnectToWallet })}
								>
									{getWalletIcon()}
									Enter Network
								</Button>
							</Box>
						</Box>
					</Box>
				</Box>
			);
		};

		const getApp = () => {
			if (!isInitialized || hasWeb3 === null) {
				return null;
			}

			if (!hasWeb3 || !selectedAddress) {
				return <>{getConnectWalletButton()}</>;
			}

			const getBlock = () => {
				if (!addressDetails) {
					return null;
				}
				return (
					<Box mt={4} textAlign="center">
						<Typography variant="h4" color="textPrimary">
							Current Block
						</Typography>
						<Typography variant="h2" color="secondary">
							{addressDetails.blockNumber}
						</Typography>
					</Box>
				);
			};

			return (
				<Box className={classes.fullScreenSplash}>
					<Box mt={8 + 6} mb={6} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
						<Grid container justifyContent="center">
							<Grid>{getLogo()}</Grid>
						</Grid>
						{getBlock()}
						<Box width="100%" maxWidth={800}>
							<HodlClickerEvents ecosystem={ecosystem} />
						</Box>
					</Box>
				</Box>
			);
		};

		return (
			<Container style={{ height: '100vh' }}>
				{getLoadingIndicator()}
				{getApp()}
			</Container>
		);
	}
);

interface Props {}

const MachinePage: React.FC<Props> = () => {
	const {
		addressDetails,
		isLate,
		isInitialized,
		hasWeb3,
		selectedAddress,
		isIncorrectNetwork,
		connectionMethod,
		ecosystem,
	} = useAppStore(
		useShallow((state) => ({
			addressDetails: state.addressDetails,
			isLate: state.isLate,
			isInitialized: state.isInitialized,
			hasWeb3: state.hasWeb3,
			selectedAddress: state.selectedAddress,
			isIncorrectNetwork: state.isIncorrectNetwork,
			connectionMethod: state.connectionMethod,
			ecosystem: state.ecosystem,
		}))
	);

	useEffect(() => {
		// When the app starts initialize web3 connection
		appDispatch({ type: commonLanguage.commands.Initialize, payload: { address: null } });
		if (isDevLogEnabled()) {
			import('vconsole').then((VConsoleModule) => {
				const VConsole = VConsoleModule.default;
				new VConsole();
			});
		}
	}, []);

	return (
		<Render
			isLate={isLate}
			isInitialized={isInitialized}
			hasWeb3={hasWeb3}
			selectedAddress={selectedAddress}
			isIncorrectNetwork={isIncorrectNetwork}
			dispatch={appDispatch}
			addressDetails={addressDetails}
			connectionMethod={connectionMethod}
			ecosystem={ecosystem}
		/>
	);
};

export default MachinePage;
