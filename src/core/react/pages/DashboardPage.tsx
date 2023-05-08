import React, { useContext, useEffect } from 'react';
import { CircularProgress, Box, Container, Button, Typography, Grid, Link, MenuItem, Menu, Snackbar, makeStyles } from '@material-ui/core';

import { Web3Context } from '../../web3/Web3Context'
import { commonLanguage as web3CommonLanguage, commonLanguage, ConnectionMethod } from '../../web3/web3Reducer'
import Web3Account from '../elements/Web3Account';
import PendingActionDialog from '../elements/Dialogs/PendingActionDialog';
import { FluxAddressDetails, DialogType } from '../../interfaces';

import logo from '../../../svgs/logo.svg'; // Tell webpack this JS file uses this image
import LightTooltip from '../elements/LightTooltip';
import Alert from '@material-ui/lab/Alert';

import metamaskIcon from '../../../svgs/metamask.svg';
import walletconnectIcon from '../../../svgs/walletconnect.svg';
import { ReducerQuery } from '../../sideEffectReducer';
import AddToFirefoxFragment from '../elements/Fragments/AddToFirefoxFragment';
import WalletConnectRpcDialog from '../elements/Dialogs/WalletConnectRpcDialog';
import SettingsIcon from '@material-ui/icons/Settings';
import { getConfig } from '../../../config';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from '../elements/Fragments/ExploreLiquidityPools';
import WalletConnectButton from '../elements/Fragments/WalletConnectButton';
import VConsole from 'vconsole';
import { isDevLogEnabled } from '../../utils/devLog';

interface RenderParams {
	isLate: boolean;
	isInitialized: boolean;
	hasWeb3: boolean | null;
	selectedAddress: string | null;
	pendingQueries: ReducerQuery[];
	queriesCount: number;
	lastDismissedPendingActionCount: number;
	isIncorrectNetwork: boolean;
	addressDetails: FluxAddressDetails | null;
	connectionMethod: ConnectionMethod;
	dialog: DialogType | null;

	dispatch: React.Dispatch<any>;
}

interface CenterContent {
	title: React.ReactFragment;
	message: React.ReactFragment;
	content?: React.ReactFragment;
}

const useStyles = makeStyles(() => ({
	fullScreenSplash: {
		minHeight: '100vh',
		display: 'flex',
		alignContent: 'center',
		justifyContent: 'center'
	}
}))

const Render: React.FC<RenderParams> = React.memo(({ isLate, dialog, isInitialized, addressDetails, hasWeb3, selectedAddress, pendingQueries, queriesCount, lastDismissedPendingActionCount, isIncorrectNetwork, connectionMethod, dispatch }) => {
	const classes = useStyles();

	const config = getConfig(false); // Mainnet
	const { ecosystemName, isSettingsValidatorDashboardButtonEnabled, lockableTokenShortName, mintableTokenShortName, isLiquidityPoolsEnabled } = config

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	// Add loading to middle of the page
	const getLoadingIndicator = () => {
		if (isIncorrectNetwork) {
			if (config.network.type === 'ropsten') {
				return getCenterContent({
					title: 'Looks like you are not on Ropsten Testnet Network...',
					message: <>This Subdomain of {ecosystemName} Dashboard only works on Ethereum Ropsten Testnet. Please change your network provider to <Box fontWeight="bold" display="inline">"Ropsten Test Network"</Box></>,
					content: <img src="./images/network.png" />
				})
			}

			const errorTitle = config.isArbitrumOnlyToken ? 'Arbitrum' : 'Ethereum Mainnet & Arbitrum'

			return getCenterContent({
				title: `Looks like you are not on ${errorTitle} Network...`,
				message: <>Currently {ecosystemName} Dashboard only works on {errorTitle}. Please change your network provider to <Box fontWeight="bold" display="inline">{errorTitle} L2</Box></>,
				content: <img src="./images/network2.png" />
			})
		}

		if (isInitialized && hasWeb3 !== null) {
			return null;
		}

		return <Box alignItems="center" justifyContent="center" display="flex" style={{ height: '100vh' }}>
			<CircularProgress color="secondary" />
		</Box>
	}

	//@todo move into it's own memo
	const getPendingQueryIndicator = () => {

		if (pendingQueries.length === 0 || lastDismissedPendingActionCount == queriesCount) {
			return null;
		}

		const onClose = () => [
			dispatch({ type: commonLanguage.commands.DismissPendingAction })
		]

		return <PendingActionDialog open={true} queries={pendingQueries} connectionMethod={connectionMethod} onClose={onClose} />
	}

	const getLogo = () => {
		return <img src={logo} alt="Logo" style={{ width: '128px' }} />;
	}

	const getCenterContent = ({ title, message, content }: CenterContent) => {
		return <Box className={classes.fullScreenSplash}>
			<Box mt={8 + 6} mb={6} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
				<Grid container justify="center"><Grid item>{getLogo()}</Grid></Grid>
				<Box mt={3} mb={6} textAlign="center">
					<Typography variant="h5" color="textPrimary" gutterBottom>{title}</Typography>
					<Typography color="textSecondary">{message}</Typography>
				</Box>
				{content}
			</Box>
		</Box>
	}

	const getConnectWalletSplash = () => {
		return <Box className={classes.fullScreenSplash}>
			<Box mt={8 + 6} mb={6} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
				<Grid container justify="center"><Grid item>{getLogo()}</Grid></Grid>
				<Box mt={3} mb={6} textAlign="center">
					<Typography variant="h5" color="textPrimary" gutterBottom>You must have an Ethereum based wallet to continue...</Typography>
					<Typography color="textSecondary">We recommend MetaMask extension, Brave browser or WalletConnect.</Typography>
				</Box>
				<Box mb={3}>
					<Box display="inline-block" mr={3}>
						<Button variant="outlined" color="secondary" size="large" href="https://metamask.io/" rel="noopener noreferrer" target="_blank">
							<Box mr={1} display="inline"><img src={metamaskIcon} alt="Metamask" width="24" height="24" style={{ verticalAlign: 'middle' }} /></Box>
							Install MetaMask
						</Button>
					</Box>
					<WalletConnectButton />
				</Box>
				<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.LargeButton} />
			</Box></Box>
	}

	const getConnectWalletButton = () => {
		const isMetaMask = () => {
			const web3 = (window as any).web3;
			if (!web3 || !web3.currentProvider || !web3.currentProvider.isMetaMask) {
				return false;
			}

			return true;
		}
		const getWalletIcon = () => {
			if (!isMetaMask()) {
				return null;
			}
			return <Box mr={1} display="inline"><img src={metamaskIcon} alt="Metamask" width="24" height="24" style={{ verticalAlign: 'middle' }} /></Box>
		}
		return <Box className={classes.fullScreenSplash}>
			<Box mt={8 + 6} mb={6} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
				<Grid container justify="center"><Grid item>{getLogo()}</Grid></Grid>
				<Box mt={3} mb={6} textAlign="center">
					<Typography variant="h5" color="textPrimary" gutterBottom>Connect to Ethereum Network</Typography>
					<Typography color="textSecondary">To interact with {lockableTokenShortName} and {mintableTokenShortName} tokens you must connect to your wallet and select an address.</Typography>
				</Box>

				<Box>
					<Box display="inline-block" mr={3}>
						<Button variant="outlined" color="secondary" size="large" onClick={() => dispatch({ type: web3CommonLanguage.commands.ConnectToWallet })}>
							{getWalletIcon()}
							{isMetaMask() ? 'Connect Using MetaMask' : 'Connect To Wallet'}
						</Button>
					</Box>
					<WalletConnectButton />
				</Box>
			</Box>
		</Box>
	}

	const getApp = () => {
		if (!isInitialized || hasWeb3 === null) {
			return null;
		}

		const getDialog = () => {
			switch (dialog) {
				case DialogType.WalletConnectRpc:
					return <WalletConnectRpcDialog />
			}
		}

		if (hasWeb3 === false) {
			return <>
				{getDialog()}
				{getConnectWalletSplash()}
			</>
		}

		if (!selectedAddress) {
			return <>
				{getDialog()}
				{getConnectWalletButton()}
			</>
		}

		const getBlock = () => {
			if (!addressDetails) {
				return;
			}
			return <> - <LightTooltip title={`Click to show Address Export Options`}>
				<Box display="inline-block">
					<Link aria-controls="advanced-options" aria-haspopup="true" onClick={(e: any) => setAnchorEl(e.currentTarget)} color="textSecondary">Block {addressDetails.blockNumber}</Link>
				</Box>
			</LightTooltip>
			</>
		}
		const getNetwork = () => {
			if (config.network.type === 'main') {
				return;
			}
			return <Box mr={3} display="inline">
				<Typography color="error" variant="body2" display="inline">
					{config.network.typeDisplay}
				</Typography>
			</Box>
		}
		const getLateError = () => {
			if (!isLate) {
				return;
			}
			return <Snackbar
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
						<Button variant="outlined" color="secondary" size="small" onClick={() => dispatch({ type: commonLanguage.commands.RefreshAccountState })}>
							Reload Latest Block
						</Button>
					</Box>
				</Alert>
			</Snackbar>
		}
		const getBuild = () => {
			return <>
				{ecosystemName} {getBlock()}

				<Menu
					id="advanced-options"
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={() => setAnchorEl(null)}
				>
					<MenuItem onClick={() => {
						dispatch({ type: commonLanguage.commands.CopyAnalytics });
						setAnchorEl(null);

					}}>Copy My Address Analytics To Clipboard (JSON)</MenuItem>
				</Menu>
			</>
		}
		const getDisconnectButton = () => {
			if (connectionMethod !== ConnectionMethod.WalletConnect) {
				return null;
			}

			return <Button size="small" variant="outlined" onClick={() => dispatch({ type: commonLanguage.commands.DisconnectFromWalletConnect })} startIcon={<Box mr={1} display="inline"><img src={walletconnectIcon} alt="WalletConnect" width="24" height="24" style={{ verticalAlign: 'middle' }} /></Box>}>Disconnect From WalletConnect</Button>
		}
		const getSettingsButton = () => {
			if (!isSettingsValidatorDashboardButtonEnabled) {
				return null
			}

			return (
				<Grid item>
					<Box mr={3}>
						<Grid container alignItems="center">
							<Grid item>
								<Button size="small" variant="outlined" color="secondary" onClick={() => { dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.ClientSettings } }) }}>
									<Box mr={0.5}>
										<SettingsIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
									</Box>
									Settings
								</Button>
							</Grid>
						</Grid>
					</Box>
				</Grid>
			)
		}

		const getLiquidityPoolsButton = () => {
			if (!isLiquidityPoolsEnabled) {
				return null
			}
			return (
				<Grid item>
					<Box mr={3}>
						<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.SmallText} />
					</Box>
				</Grid>
			)
		}

		const getFooter = () => {
			return <Box mt={6} pb={6} mx={4} display="flex" justifyContent="space-between">
				<Typography color="textSecondary" variant="body2">
					<Grid container alignItems="center">
						{getSettingsButton()}
						{getLiquidityPoolsButton()}
						<Grid item>
							<Box mr={3}>
								<Link href="#terms" color="textSecondary">MIT License</Link>
							</Box>
						</Grid>
						<Grid item>
							{getBuild()}
						</Grid>
					</Grid>

				</Typography>
				<Typography color="textSecondary" variant="body2">
					{getNetwork()}
					{getDisconnectButton()}
					<AddToFirefoxFragment />
				</Typography>
			</Box>
		}
		return <>
			{getLateError()}
			<Box mt={11}>
				<Web3Account />
				{getFooter()}
			</Box>
		</>
	}

	return (<Container style={{ height: '100vh' }}>
		{getPendingQueryIndicator()}
		{getLoadingIndicator()}
		{getApp()}
	</Container>
	);
});

interface Props {
	address: string | null;
}
const DashboardPage: React.FC<Props> = ({ address }) => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	useEffect(() => {
		// When the app starts initialize web3 connection
		web3Dispatch({ type: web3CommonLanguage.commands.Initialize, payload: { address } });

		if (isDevLogEnabled()) {
			const vConsole = new VConsole();
		}


	}, [web3Dispatch]);

	const { addressDetails } = web3State;

	const { isLate, dialog, isInitialized, hasWeb3, selectedAddress, pendingQueries, queriesCount, lastDismissedPendingActionCount, isIncorrectNetwork, connectionMethod } = web3State;

	return <Render
		isLate={isLate}
		dialog={dialog}
		isInitialized={isInitialized}
		hasWeb3={hasWeb3}
		selectedAddress={selectedAddress}
		pendingQueries={pendingQueries}
		queriesCount={queriesCount}
		lastDismissedPendingActionCount={lastDismissedPendingActionCount}
		isIncorrectNetwork={isIncorrectNetwork}
		dispatch={web3Dispatch}
		addressDetails={addressDetails}
		connectionMethod={connectionMethod}
	/>

}

export default DashboardPage;
