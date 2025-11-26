import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { FluxAddressDetails } from '@/app/interfaces';
import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';
import { ReducerDispatch, ConnectionMethod } from '@/app/interfaces';
import { tss } from 'tss-react/mui';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem, Layer } from '@/app/configs/config.common';
import metamaskIcon from '@/react/svgs/metamask.svg';
import { isDevLogEnabled } from '@/utils/devLog';
import { useShallow } from 'zustand/react/shallow';
import HodlClickerEvents from '@/react/pages/machine/HodlClickerEvents';
import { getNetworkDropdown } from '@/react/elements/Fragments/EcosystemDropdown';
import FooterFragment from '@/react/elements/Fragments/FooterFragment';

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
		display: 'block',
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

		const getCenterContent = ({ title, message, content }: CenterContent) => {
			return (
				<Box className={classes.fullScreenSplash}>
					<Box mt={8 + 6} mb={6} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
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

		const getEcosystemDropdown = () => {
			return (
				<Box mb={4} display="flex" justifyContent="center">
					{getNetworkDropdown({
						ecosystem,
						connectionMethod,
						dispatch,
						width: 300,
					})}
				</Box>
			);
		};

		const getApp = () => {
			if (!isInitialized || hasWeb3 === null) {
				return null;
			}

			if (!hasWeb3 || !selectedAddress) {
				return (
					<>
						{getEcosystemDropdown()}
						{getConnectWalletButton()}
					</>
				);
			}

			const isL2 = config.layer === Layer.Layer2;

			if (!isL2) {
				return (
					<Box className={classes.fullScreenSplash}>
						<Box mt={8 + 6} mb={6} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
							<Box mt={3} mb={6} textAlign="center">
								<Typography component="div" variant="h5" color="error" gutterBottom>
									Incorrect Ecosystem
								</Typography>
								<Typography component="div" color="textSecondary">
									HodlClicker is only available on Arbitrum. Please switch to an Arbitrum ecosystem.
								</Typography>
							</Box>
							{getEcosystemDropdown()}
						</Box>
					</Box>
				);
			}

			return (
				<Box className={classes.fullScreenSplash}>
					<Box mt={8 + 3} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
						<Box width="100%" maxWidth={800}>
							<HodlClickerEvents ecosystem={ecosystem} />
						</Box>
					</Box>
				</Box>
			);
		};

		return (
			<>
				<Container>
					{getLoadingIndicator()}
					{getApp()}
				</Container>

				<FooterFragment ecosystem={ecosystem} />
			</>
		);
	}
);

interface Props {}

const HodlClickerPage: React.FC<Props> = () => {
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

export default HodlClickerPage;
