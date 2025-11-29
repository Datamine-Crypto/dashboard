import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import React, { useEffect } from 'react';

import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';

import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import metamaskIcon from '@/react/svgs/metamask.svg';
import { isDevLogEnabled } from '@/utils/devLog';
import { useShallow } from 'zustand/react/shallow';
import HodlClickerEvents from '@/react/pages/gamefi/hodlclicker/HodlClickerEvents';
import { getNetworkDropdown } from '@/react/elements/Fragments/EcosystemDropdown';
import FooterFragment from '@/react/elements/Fragments/FooterFragment';
import { switchNetwork } from '@/web3/utils/web3Helpers';
import { tss } from 'tss-react/mui';

interface CenterContent {
	title: React.ReactNode;
	message: React.ReactNode;
	content?: React.ReactNode;
}

const useStyles = tss.create(() => ({
	fullScreenSplash: {
		display: 'block',
		alignContent: 'center',
		justifyContent: 'center',
	},
}));

const HodlClickerPage: React.FC = () => {
	const { classes } = useStyles();
	const { isInitialized, hasWeb3, selectedAddress, isIncorrectNetwork, connectionMethod, ecosystem } = useAppStore(
		useShallow((state) => ({
			isInitialized: state.isInitialized,
			hasWeb3: state.hasWeb3,
			selectedAddress: state.selectedAddress,
			isIncorrectNetwork: state.isIncorrectNetwork,
			connectionMethod: state.connectionMethod,
			ecosystem: state.ecosystem,
		}))
	);

	const config = getEcosystemConfig(ecosystem);
	const { ecosystemName } = config;

	useEffect(() => {
		// When the app starts initialize web3 connection
		appDispatch({ type: commonLanguage.commands.Web3.Initialize, payload: { address: null } });
		if (isDevLogEnabled()) {
			import('vconsole').then((VConsoleModule) => {
				const VConsole = VConsoleModule.default;
				new VConsole();
			});
		}
	}, []);

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
								onClick={() => appDispatch({ type: commonLanguage.commands.Web3.ConnectToWallet })}
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
					dispatch: appDispatch,
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

		if (ecosystem !== Ecosystem.Lockquidity) {
			return (
				<Box className={classes.fullScreenSplash}>
					<Box mt={8 + 6} mb={6} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
						<Box mt={3} mb={6} textAlign="center">
							<Typography component="div" variant="h2" color="textPrimary" gutterBottom style={{ fontWeight: 'bold' }}>
								One more step...
							</Typography>
							<Typography component="div" variant="h6" color="textSecondary">
								HODL Clicker game runs on the Arbitrum ecosystem.
								<br />
								You will need to switch to the right network to play.
							</Typography>
						</Box>
						<Box mb={4} display="flex" justifyContent="center">
							<Button
								variant="outlined"
								color="secondary"
								size="large"
								startIcon={<RocketLaunchIcon />}
								style={{ borderRadius: 50, padding: '10px 30px', fontSize: '1.2rem' }}
								onClick={async () => {
									const targetEcosystem = Ecosystem.Lockquidity;
									await switchNetwork(targetEcosystem, connectionMethod, '0xa4b1');
									localStorage.setItem('targetEcosystem', targetEcosystem);
									appDispatch({ type: commonLanguage.commands.Web3.Reinitialize, payload: { targetEcosystem } });
								}}
							>
								Switch To Arbitum (L2)
							</Button>
						</Box>
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
};

export default HodlClickerPage;
