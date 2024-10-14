import React, { useContext } from 'react';
import Typography from '@material-ui/core/Typography';
import { Button, AppBar, Toolbar, IconButton, makeStyles, Box, Tooltip, Link, Hidden, Card, CardActionArea } from '@material-ui/core';
import clsx from 'clsx';
import MenuIcon from '@material-ui/icons/Menu';
import BuildIcon from '@material-ui/icons/Build';
import DamLogo from '../../../../svgs/logo.svg';

import HomeIcon from '@material-ui/icons/Home';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import TimelineIcon from '@material-ui/icons/Timeline';
import { Web3Context } from '../../../web3/Web3Context';
import { commonLanguage } from '../../../web3/web3Reducer';
import HelpComboboxFragment from './HelpComboboxFragment';
import { getEcosystemConfig as getConfig } from '../../../../configs/config';

const useStyles = makeStyles(theme => ({
	toolbar: {
		paddingRight: 24, // keep right padding when drawer closed
		padding: '0 8px 0 0',
		justifyContent: 'space-between',
	},
	logo: {
		fontSize: 35,
		verticalAlign: "middle",
	},
	appBar: {
		backgroundColor: theme.palette.type == 'dark' ? '#272936' : theme.palette.primary.main,
		color: '#fff',
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),

	},
	menuButton: {
		marginRight: 16,
	},
	menuButtonHidden: {
		display: 'none',
	},
	title: {
		flexGrow: 1,
	},

	link: {
		marginLeft: theme.spacing(2)
	},
	logoArea: {
		display: 'flex',
		padding: theme.spacing(0, 2, 0, 2),
	},
	nav: {
		display: 'flex',
		flex: 1,
		maxWidth: 500,
		alignItems: 'center'
	}
}));

interface INavProps {
	sidebar: boolean;

	dispatch: React.Dispatch<any>;
	isArbitrumMainnet: boolean;
	selectedAddress: string | null;
}


const Render: React.FC<INavProps> = React.memo(({ sidebar, dispatch }) => {
	//const { state: socketState, dispatch: socketDispatch } = useContext(SocketContext)
	const { navigation } = getConfig()
	const { isHelpPageEnabled } = navigation

	const classes = useStyles();

	const userSessionState = {
		isDrawerOpen: false,
		isLoggedIn: false,
		balance: 0,
		usdBalance: 0,
		theme: 'ThemeDark'
	}
	const isToggleEnabled = false

	const getSearchTextField = () => {
		if (!isHelpPageEnabled) {
			return null
		}

		return <HelpComboboxFragment id={'nav-search'} />
	}

	const { ecosystemName } = getConfig()

	return <AppBar className={clsx(classes.appBar)}>
		<Toolbar className={classes.toolbar}>
			{isToggleEnabled && sidebar && (
				<IconButton
					edge="start"
					color="inherit"
					aria-label="Open drawer"
					//onClick={userSessionActions.drawerOpen}
					className={clsx(classes.menuButton, userSessionState.isDrawerOpen && classes.menuButtonHidden)}
				>
					<MenuIcon />
				</IconButton>
			)}

			<Link href="#">
				<Card elevation={0}>
					<CardActionArea className={classes.logoArea}>
						<Box mr={2} mt={0.5}>
							<img src={DamLogo} width="54" height="54" />
						</Box>
						<Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
							<Hidden smDown>
								{ecosystemName}
							</Hidden>
						</Typography>

					</CardActionArea>
				</Card>
			</Link>


			{isToggleEnabled && (<Tooltip title="Settings (Coming Soon)"><IconButton color='inherit' /*onClick={userSessionActions.toggleTheme}*/>
				<BuildIcon />
			</IconButton>
			</Tooltip>)}

			<nav className={classes.nav}>
				{getSearchTextField()}

				<Hidden lgUp>
					<Box ml={1}>
						<Tooltip title="Open Menu">
							<IconButton onClick={() => dispatch({ type: commonLanguage.commands.OpenDrawer })}>
								<MenuIcon />
							</IconButton>
						</Tooltip>
					</Box>
				</Hidden>
			</nav>

			{false && userSessionState.isLoggedIn && <Button color='inherit'/* onClick={() => userSessionActions.userExit()}*/>Log Out</Button>}
			{false && !userSessionState.isLoggedIn && <Button color='inherit'>Log In</Button>}
		</Toolbar>
	</AppBar>
})

interface AppBarProps {
	sidebar: boolean;
}
const MainAppBar: React.FC<AppBarProps> = ({ sidebar }) => {
	const { state: web3State, dispatch } = useContext(Web3Context)

	const { isArbitrumMainnet, selectedAddress } = web3State;

	return <Render
		sidebar={sidebar}
		dispatch={dispatch}
		isArbitrumMainnet={isArbitrumMainnet}
		selectedAddress={selectedAddress}
	/>
}

export default MainAppBar