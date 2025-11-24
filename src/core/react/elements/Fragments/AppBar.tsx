import { Build, Menu } from '@mui/icons-material';
import { AppBar, Box, Card, CardActionArea, IconButton, Link, Toolbar, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import React from 'react';
import DamLogo from '@/core/react/svgs/logo.svg';
import Grid from '@mui/material/Grid';
import { tss } from 'tss-react/mui';
import { getEcosystemConfig } from '@/core/app/configs/config';
import { Ecosystem } from '@/core/app/configs/config.common';
import { useAppStore } from '@/core/react/utils/appStore';
import { commonLanguage } from '@/core/app/state/commonLanguage';
import HelpComboboxFragment from '@/core/react/elements/Fragments/HelpComboboxFragment';
import { useShallow } from 'zustand/react/shallow';
import { ReducerDispatch } from '@/core/utils/reducer/sideEffectReducer';
const useStyles = tss.create(({ theme }) => ({
	toolbar: {
		paddingRight: 24, // keep right padding when drawer closed
		padding: '0 8px 0 0 !important',
		justifyContent: 'space-between',
	},
	logo: {
		fontSize: 35,
		verticalAlign: 'middle',
	},
	appBar: {
		backgroundColor: theme.palette.mode === 'dark' ? '#272936' : theme.palette.primary.main,
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
		marginLeft: theme.spacing(2),
	},
	logoArea: {
		display: 'flex',
		padding: theme.spacing(0, 2, 0, 2),
	},
	nav: {
		display: 'flex',
		flex: 1,
		maxWidth: 500,
		alignItems: 'center',
	},
}));
interface INavProps {
	sidebar: boolean;
	dispatch: ReducerDispatch;
	selectedAddress: string | null;
	ecosystem: Ecosystem;
}
const Render: React.FC<INavProps> = React.memo(({ sidebar, dispatch, ecosystem }) => {
	//const { state: socketState, dispatch: socketDispatch } = useContext(SocketContext)
	const { navigation, ecosystemName } = getEcosystemConfig(ecosystem);
	const { isHelpPageEnabled } = navigation;
	const { cx, classes } = useStyles();
	const userSessionState = {
		isDrawerOpen: false,
		isLoggedIn: false,
		balance: 0,
		usdBalance: 0,
		theme: 'ThemeDark',
	};
	const isToggleEnabled = false;
	const getSearchTextField = () => {
		if (!isHelpPageEnabled) {
			return null;
		}
		return <HelpComboboxFragment id={'nav-search'} />;
	};
	return (
		<AppBar className={clsx(classes.appBar)}>
			<Toolbar className={classes.toolbar}>
				{isToggleEnabled && sidebar && (
					<IconButton
						edge="start"
						color="inherit"
						aria-label="Open drawer"
						//onClick={userSessionActions.drawerOpen}
						className={clsx(classes.menuButton, userSessionState.isDrawerOpen && classes.menuButtonHidden)}
					>
						<Menu />
					</IconButton>
				)}
				<Link href="#">
					<Card elevation={0}>
						<CardActionArea className={classes.logoArea}>
							<Grid container alignItems="center">
								<Grid>
									<Box mr={2} mt={0.5}>
										<img src={DamLogo} width="54" height="54" alt="Datemine Network" />
									</Box>
								</Grid>
								<Grid>
									<Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
										<Box sx={{ display: { xs: 'none', md: 'block' } /*smDown*/ }}>{ecosystemName}</Box>
									</Typography>
								</Grid>
							</Grid>
						</CardActionArea>
					</Card>
				</Link>
				{isToggleEnabled && (
					<Tooltip title="Settings (Coming Soon)">
						<IconButton color="inherit" /*onClick={userSessionActions.toggleTheme}*/>
							<Build />
						</IconButton>
					</Tooltip>
				)}
				<nav className={classes.nav}>
					{getSearchTextField()}
					<Box sx={{ display: { xs: 'block', lg: 'none' } /*lgUp*/ }}>
						<Box ml={1}>
							<Tooltip title="Open Menu">
								<IconButton onClick={() => dispatch({ type: commonLanguage.commands.OpenDrawer })}>
									<Menu />
								</IconButton>
							</Tooltip>
						</Box>
					</Box>
				</nav>
			</Toolbar>
		</AppBar>
	);
});
interface AppBarProps {
	sidebar: boolean;
}
const MainAppBar: React.FC<AppBarProps> = ({ sidebar }) => {
	const { ecosystem, selectedAddress, dispatch } = useAppStore(
		useShallow((state) => ({
			ecosystem: state.state.ecosystem,
			selectedAddress: state.state.selectedAddress,
			dispatch: state.dispatch,
		}))
	);
	return <Render sidebar={sidebar} dispatch={dispatch} selectedAddress={selectedAddress} ecosystem={ecosystem} />;
};
export default MainAppBar;
