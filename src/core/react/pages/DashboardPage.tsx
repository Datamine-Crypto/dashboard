import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Container,
	Link,
	Menu,
	MenuItem,
	Snackbar,
	Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { ReactNode, useEffect } from 'react';
import { DialogType, FluxAddressDetails } from '@/core/interfaces';
import { useAppStore } from '@/core/web3/appStore';
import { commonLanguage } from '@/core/web3/reducer/common';
import { ConnectionMethod } from '@/core/web3/reducer/interfaces';
import Web3Account from '@/core/react/elements/Web3Account';
import logo from '@/svgs/logo.svg'; // Tell webpack this JS file uses this image
import LightTooltip from '@/core/react/elements/LightTooltip';
import { Settings } from '@mui/icons-material';
import { tss } from 'tss-react/mui';
import { getEcosystemConfig } from '@/configs/config';
import { Ecosystem } from '@/configs/config.common';
import metamaskIcon from '@/svgs/metamask.svg';
import walletconnectIcon from '@/svgs/walletconnect.svg';
import { isDevLogEnabled } from '@/core/utils/devLog';
import AddToFirefoxFragment from '@/core/react/elements/Fragments/AddToFirefoxFragment';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from '@/core/react/elements/Fragments/ExploreLiquidityPools';
import WalletConnectButton from '@/core/react/elements/Fragments/WalletConnectButton';
import { useShallow } from 'zustand/react/shallow';
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
	title: ReactNode;
	message: ReactNode;
	content?: ReactNode;
}
const useStyles = tss.create(({ theme }) => ({
	fullScreenSplash: {
		minHeight: '100vh',
		display: 'flex',
		alignContent: 'center',
		justifyContent: 'center',
	},
}));
/**
 * A memoized functional component that renders the main dashboard content.
 * It handles various states like loading, network errors, wallet connection, and displays account information.
 * @param params - Object containing various state variables and dispatch function.
 */
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
		const {
			ecosystemName,
			isSettingsValidatorDashboardButtonEnabled,
			lockableTokenShortName,
			mintableTokenShortName,
			isLiquidityPoolsEnabled,
		} = config;
		const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
		// Add loading to middle of the page
		/**
		 * Conditionally renders a loading indicator or network error messages.
		 * @returns A React element representing the loading state or null if the app is initialized.
		 */
		const getLoadingIndicator = () => {
			if (isIncorrectNetwork) {
				if (config.network.type === 'ropsten') {
					return getCenterContent({
						title: 'Looks like you are not on Ropsten Testnet Network...',
						message: (
							<>
								This Subdomain of {ecosystemName} Dashboard only works on Ethereum Ropsten Testnet. Please change your
								network provider to{' '}
								<Box fontWeight="bold" display="inline">
									&quot;Ropsten Test Network&quot;
								</Box>
							</>
						),
						content: <img src="./images/network.png" />,
					});
				}
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
					content: <img src="./images/network2.png" />,
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
		/**
		 * Renders the main logo of the application.
		 * @returns An img element displaying the logo.
		 */
		const getLogo = () => {
			return <img src={logo} alt="Logo" style={{ width: '128px' }} />;
		};
		/**
		 * Renders a centered content splash screen with a title, message, and optional content.
		 * Used for displaying initial loading, network errors, or wallet connection prompts.
		 * @param params - Object containing title, message, and optional content.
		 * @returns A React element for the centered content splash.
		 */
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
		/**
		 * Renders the splash screen prompting the user to install an Ethereum-based wallet.
		 * @returns A React element for the wallet installation splash screen.
		 */
		const getConnectWalletSplash = () => {
			const getLiquidityPoolsButton = () => {
				if (!isLiquidityPoolsEnabled) {
					return null;
				}
				return <ExploreLiquidityPools buttonType={LiquidityPoolButtonType.LargeButton} ecosystem={ecosystem} />;
			};
			return (
				<Box className={classes.fullScreenSplash}>
					<Box mt={8 + 6} mb={6} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
						<Grid container justifyContent="center">
							<Grid>{getLogo()}</Grid>
						</Grid>
						<Box mt={3} mb={6} textAlign="center">
							<Typography component="div" variant="h5" color="textPrimary" gutterBottom>
								You must have an Ethereum based wallet to continue...
							</Typography>
							<Typography component="div" color="textSecondary">
								We recommend MetaMask extension, Brave browser or WalletConnect.
							</Typography>
						</Box>
						<Box mb={3}>
							<Box display="inline-block" mr={3}>
								<Button
									variant="outlined"
									color="secondary"
									size="large"
									href="https://metamask.io/"
									rel="noopener noreferrer"
									target="_blank"
								>
									<Box mr={1} display="inline">
										<img src={metamaskIcon} alt="Metamask" width="24" height="24" style={{ verticalAlign: 'middle' }} />
									</Box>
									Install MetaMask
								</Button>
							</Box>
							<WalletConnectButton />
						</Box>
						{getLiquidityPoolsButton()}
					</Box>
				</Box>
			);
		};
		/**
		 * Renders the connect wallet button, adapting to whether MetaMask is detected.
		 * @returns A React element for the connect wallet button.
		 */
		const getConnectWalletButton = () => {
			/**
			 * Checks if MetaMask is installed and available in the browser.
			 * @returns True if MetaMask is detected, false otherwise.
			 */
			const isMetaMask = () => {
				const web3 = window.web3;
				if (!web3 || !web3.currentProvider || !web3.currentProvider.isMetaMask) {
					return false;
				}
				return true;
			};
			/**
			 * Returns the MetaMask icon if MetaMask is detected, otherwise null.
			 * @returns A React element containing the MetaMask icon or null.
			 */
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
								Connect to Ethereum Network
							</Typography>
							<Typography component="div" color="textSecondary">
								To interact with {lockableTokenShortName} and {mintableTokenShortName} tokens you must connect to your
								wallet and select an address.
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
									{isMetaMask() ? 'Connect Using MetaMask' : 'Connect To Wallet'}
								</Button>
							</Box>
							<WalletConnectButton />
						</Box>
					</Box>
				</Box>
			);
		};
		const getApp = () => {
			if (!isInitialized || hasWeb3 === null) {
				return null;
			}
			if (hasWeb3 === false) {
				return <>{getConnectWalletSplash()}</>;
			}
			if (!selectedAddress) {
				return <>{getConnectWalletButton()}</>;
			}
			const getBlock = () => {
				if (!addressDetails) {
					return;
				}
				return (
					<>
						{' '}
						-{' '}
						<LightTooltip title={`Click to show Address Export Options`}>
							<Box display="inline-block">
								<Link
									aria-controls="advanced-options"
									aria-haspopup="true"
									onClick={(e: any) => setAnchorEl(e.currentTarget)}
									color="textSecondary"
								>
									Block {addressDetails.blockNumber}
								</Link>
							</Box>
						</LightTooltip>
					</>
				);
			};
			const getNetwork = () => {
				if (config.network.type === 'main') {
					return;
				}
				return (
					<Box mr={3} display="inline">
						<Typography component="div" color="error" variant="body2" display="inline">
							{config.network.typeDisplay}
						</Typography>
					</Box>
				);
			};
			const getLateError = () => {
				if (!isLate) {
					return;
				}
				return (
					<Snackbar
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						open={true}
					>
						<Alert severity="warning">
							<Box fontWeight="bold">Ethereum Latency Warning</Box>
							Failed Fetching Last Block
							<Box mt={1}>
								<Button
									variant="outlined"
									color="secondary"
									size="small"
									onClick={() => dispatch({ type: commonLanguage.commands.RefreshAccountState })}
								>
									Reload Latest Block
								</Button>
							</Box>
						</Alert>
					</Snackbar>
				);
			};
			const getBuild = () => {
				return (
					<>
						{ecosystemName} {getBlock()}
						<Menu id="advanced-options" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
							<MenuItem
								onClick={() => {
									dispatch({ type: commonLanguage.commands.CopyAnalytics });
									setAnchorEl(null);
								}}
							>
								Copy My Address Analytics To Clipboard (JSON)
							</MenuItem>
						</Menu>
					</>
				);
			};
			const getDisconnectButton = () => {
				if (connectionMethod !== ConnectionMethod.WalletConnect) {
					return null;
				}
				return (
					<Button
						size="small"
						variant="outlined"
						onClick={() => dispatch({ type: commonLanguage.commands.DisconnectFromWalletConnect })}
						startIcon={
							<Box mr={1} display="inline">
								<img
									src={walletconnectIcon}
									alt="WalletConnect"
									width="24"
									height="24"
									style={{ verticalAlign: 'middle' }}
								/>
							</Box>
						}
					>
						Disconnect From WalletConnect
					</Button>
				);
			};
			const getSettingsButton = () => {
				if (!isSettingsValidatorDashboardButtonEnabled) {
					return null;
				}
				return (
					<Grid>
						<Box mr={3}>
							<Grid container alignItems="center">
								<Grid>
									<Button
										size="small"
										variant="outlined"
										color="secondary"
										onClick={() => {
											dispatch({
												type: commonLanguage.commands.ShowDialog,
												payload: { dialog: DialogType.ClientSettings },
											});
										}}
									>
										<Box mr={0.5}>
											<Settings style={{ verticalAlign: 'middle', marginRight: 8 }} />
										</Box>
										Settings
									</Button>
								</Grid>
							</Grid>
						</Box>
					</Grid>
				);
			};
			/**
			 * Conditionally renders a button to explore liquidity pools if enabled.
			 * @returns An ExploreLiquidityPools component or null.
			 */
			const getLiquidityPoolsButton = () => {
				if (!isLiquidityPoolsEnabled) {
					return null;
				}
				return (
					<Grid>
						<Box mr={3}>
							<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.SmallText} ecosystem={ecosystem} />
						</Box>
					</Grid>
				);
			};
			const getFooter = () => {
				return (
					<Box mt={6} pb={6} mx={4} display="flex" justifyContent="space-between">
						<Typography component="div" color="textSecondary" variant="body2">
							<Grid container alignItems="center">
								{getSettingsButton()}
								{getLiquidityPoolsButton()}
								<Grid>
									<Box mr={3}>
										<Link href="#terms" color="textSecondary">
											MIT License
										</Link>
									</Box>
								</Grid>
								<Grid>{getBuild()}</Grid>
							</Grid>
						</Typography>
						<Typography component="div" color="textSecondary" variant="body2">
							{getNetwork()}
							{getDisconnectButton()}
							<AddToFirefoxFragment />
						</Typography>
					</Box>
				);
			};
			return (
				<>
					{getLateError()}
					<Box mt={11}>
						<Web3Account />
						{getFooter()}
					</Box>
				</>
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
interface Props {
	address: string | null;
}
const DashboardPage: React.FC<Props> = ({ address }) => {
	const {
		addressDetails,
		isLate,
		isInitialized,
		hasWeb3,
		selectedAddress,
		isIncorrectNetwork,
		connectionMethod,
		ecosystem,
		dispatch: appDispatch,
	} = useAppStore(
		useShallow((state) => ({
			addressDetails: state.state.addressDetails,
			isLate: state.state.isLate,
			isInitialized: state.state.isInitialized,
			hasWeb3: state.state.hasWeb3,
			selectedAddress: state.state.selectedAddress,
			isIncorrectNetwork: state.state.isIncorrectNetwork,
			connectionMethod: state.state.connectionMethod,
			ecosystem: state.state.ecosystem,
			dispatch: state.dispatch,
		}))
	);
	useEffect(() => {
		// When the app starts initialize web3 connection
		appDispatch({ type: commonLanguage.commands.Initialize, payload: { address } });
		if (isDevLogEnabled()) {
			import('vconsole').then((VConsoleModule) => {
				const VConsole = VConsoleModule.default;
				new VConsole();
			});
		}
	}, [appDispatch]);
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
export default DashboardPage;
