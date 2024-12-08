import React, { useContext } from 'react';
import { Drawer, createStyles, Theme, Hidden, Divider, List, ListItem, ListItemIcon, ListItemText, Link, Card, CardActionArea, Typography, Box, Button } from '@mui/material';

import Grid from '@mui/material/Grid2';
import { makeStyles } from '@mui/styles';

import clsx from 'clsx';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HomeIcon from '@mui/icons-material/Home';
import HelpIcon from '@mui/icons-material/HelpOutline';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WhatshotIcon from '@mui/icons-material/Whatshot';

import { ExpandMore } from '@mui/icons-material';
import Logo from '../../../../svgs/logo.svg';
import EthereumPurple from '../../../../svgs/ethereumPurple.svg';
import Arbitrum from '../../../../svgs/arbitrum.svg';
import discordWhiteLogo from '../../../../svgs/discordWhite.svg';
import { Web3Context } from '../../../web3/Web3Context';
import { commonLanguage } from '../../../web3/web3Reducer';
import { getEcosystemConfig as getConfig, getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';

const drawerWidth = 280;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: 'flex',
		},
		drawer: {
			[theme.breakpoints.up('lg')]: {
				width: drawerWidth,
				flexShrink: 0,
			},
		},
		appBar: {
			[theme.breakpoints.up('lg')]: {
				width: `calc(100% - ${drawerWidth}px)`,
				marginLeft: drawerWidth,
			},
		},
		menuButton: {
			marginRight: theme.spacing(2),
			[theme.breakpoints.up('lg')]: {
				display: 'none',
			},
		},
		// necessary for content to be below app bar
		toolbar: {
			...theme.mixins.toolbar,
			marginTop: theme.spacing(2)
		},
		content: {
			flexGrow: 1,
			padding: theme.spacing(3),
		},
		drawerPaper: {
			position: 'fixed',
			whiteSpace: 'nowrap',
			width: drawerWidth,
			transition: theme.transitions.create('width', {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.enteringScreen,
			}),
		},
		drawerPaperClose: {
			overflowX: 'hidden',
			transition: theme.transitions.create('width', {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.leavingScreen,
			}),
			width: theme.spacing(7),
			[theme.breakpoints.up('lg')]: {
				width: theme.spacing(9),
			},
		},
		drawerRoot: {
			height: '100%'
		},
		nested: {
			paddingLeft: theme.spacing(4),
			background: '#22242e'
		},
		logoArea: {
			display: 'flex',
			padding: theme.spacing(0, 2, 0, 2),
		},
		title: {
			flexGrow: 1,
		},
		parent: {
			background: '#22242e'
		},
		drawerGridContainer: {
			height: '100%',
		},
		discordButton: {
			background: '#40486c',
			fontSize: '0.7rem',
			'&:hover': {
				background: '#333851',
			}
		},
		lastExpandedItem: {
			paddingBottom: theme.spacing(2)
		}
	}),
);

interface RenderParams {
	dispatch: React.Dispatch<any>;
	isMobileDrawerOpen: boolean;
	ecosystem: Ecosystem;
}
const Render: React.FC<RenderParams> = React.memo(({ dispatch, isMobileDrawerOpen, ecosystem }) => {

	const { navigation, ecosystemName } = getEcosystemConfig(ecosystem)
	const { isL1PageEnabled, isL2PageEnabled, isCommunityPageEnabled, isAnalyticsPagesEnabled, ecosystemButtonlabel, discordInviteLink, isHelpPageEnabled } = navigation

	const classes = useStyles();

	const isDrawerOpen = true;
	const isBigDrawerOpen = true;

	const getL1Page = () => {
		if (!isL1PageEnabled) {
			return []
		}
		return [
			{
				title: <>FLUX <Typography display="inline" variant="body2" color="textSecondary">(L1 Ecosystem)</Typography></>,
				icon: <img src={EthereumPurple} width="24" height="24" />,
				href: '#token/flux',
				className: classes.nested
			},
		]
	}
	const getL2Page = () => {
		if (!isL2PageEnabled) {
			return []
		}
		return [
			{
				title: <>ArbiFLUX <Typography display="inline" variant="body2" color="textSecondary">(L2 Ecosystem)</Typography></>,
				icon: <img src={Arbitrum} width="24" height="24" />,
				href: '#token/arbiflux',
				className: classes.nested
			},
		]
	}
	const getCommunityPage = () => {
		if (!isCommunityPageEnabled) {
			return []
		}
		return [
			{
				title: 'Community',
				icon: <PeopleIcon />,
				href: '#community',
				className: classes.nested
			},
		]
	}
	const getAnalyticsPages = () => {
		if (!isAnalyticsPagesEnabled) {
			return []
		}
		return [
			{
				isBasicDivider: true
			},
			{
				title: 'Ecosystem Analytics',
				icon: <EqualizerIcon />,
				expandIcon: true,
				href: 'https://datamine-crypto.github.io/datamine-pro-portal/'
			},
			{
				isBasicDivider: true
			},
			/*
			{
				title: <>Trend Analytics <Typography display="inline" color="textSecondary">(Beta)</Typography></>,
				icon: <TrendingUpIcon />,
				expandIcon: false,
				href: 'https://datamine-crypto.github.io/datamine-pro-portal/#/trends/datamine'
			},
			{
				isBasicDivider: true
			},*/
		]
	}
	const getHelpPage = () => {
		if (!isHelpPageEnabled) {
			return []
		}
		return [
			{
				title: 'Help',
				icon: <HelpIcon />,
				href: '#help',
				className: `${classes.nested} ${classes.lastExpandedItem}`
			},
		]
	}

	const buttons = [
		{
			isBasicDivider: true
		},
		{
			title: ecosystemButtonlabel,

			icon: <WhatshotIcon />,
			className: classes.parent,
			expandIcon: true
		},
		{
			title: 'Homepage',
			icon: <HomeIcon />,
			href: '#',
			className: classes.nested
		},
		{
			title: 'Validator Dashboard',
			icon: <MonetizationOnIcon />,
			href: '#dashboard',
			className: classes.nested
		},
		...getL1Page(),
		...getL2Page(),
		...getCommunityPage(),
		...getHelpPage(),
		...getAnalyticsPages()
	]

	const getDrawer = () => {

		const getExpandIcon = (shouldExpand: boolean) => {
			if (!shouldExpand) {
				return null;
			}

			return <ExpandMore />
		}

		const drawerButtons = buttons.map((button: any) => {
			if (button.isDivider) {
				return <Box my={2}><Divider /></Box>
			}
			if (button.isBasicDivider) {
				return <Divider />
			}
			const getListItemProps = () => {
				if (button.href) {
					return {
						button: true,
						component: 'a',
						href: button.href,
						color: 'textPrimary',
						onClick: () => {
							dispatch({ type: commonLanguage.commands.CloseDrawer })
						}
					}
				}

				if (!button.onClick) {
					return {

					}
				}

				return {
					button: true,
					onClick: () => {
						dispatch({ type: commonLanguage.commands.CloseDrawer })
						button.onClick();
					}
				}
			}
			return <ListItem key={button.title} className={button.className} {...getListItemProps() as any}>
				<ListItemIcon>{button.icon}</ListItemIcon>
				<ListItemText primary={button.title} />
				{getExpandIcon(!!button.expandIcon)}
			</ListItem>
		})

		const getDiscordButton = () => {
			if (!discordInviteLink) {
				return null;
			}
			return <Box my={3}>
				<Grid
					container
					justifyContent="center">
					<Grid>
						<Button
							variant="contained"
							color="secondary"
							startIcon={<img src={discordWhiteLogo} alt={`Discord: ${ecosystemName}`} width="18" height="18" />}
							size="medium"
							className={classes.discordButton}
							href={discordInviteLink}
							target="_blank"
							rel="noopener noreferrer"
						>
							Chat With Us On Discord!
						</Button>

					</Grid>
				</Grid>
			</Box>
		}

		return <>
			<div className={classes.toolbar}>
				<Hidden lgUp>
					<Link href="#">
						<Card elevation={0}>
							<CardActionArea className={classes.logoArea}>
								<Box mr={2}>
									<img src={Logo} width="54" height="54" />
								</Box>
								<Typography color="inherit" noWrap className={classes.title}>
									{ecosystemName}
								</Typography>

							</CardActionArea>
						</Card>
					</Link>
				</Hidden>
			</div>
			<Box height="100%">
				<Grid container direction="column" justifyContent="space-between" className={classes.drawerGridContainer}>
					<Grid>
						<List>
							{drawerButtons}
						</List>
					</Grid>
					<Grid>
						{getDiscordButton()}
					</Grid>
				</Grid>
			</Box>
		</>
	}

	const handleDrawerToggle = () => {
		dispatch({ type: commonLanguage.commands.CloseDrawer })
	}

	return <nav className={classes.drawer} aria-label="mailbox folders">
		{/* The implementation can be swapped with js to avoid SEO duplication of links. */}
		<Hidden lgUp>
			<Drawer
				variant="temporary"
				onClose={handleDrawerToggle}
				//open={mobileOpen}
				//onClose={handleDrawerToggle}
				classes={{
					root: classes.drawerRoot,
					paper: clsx(classes.drawerPaper, !isDrawerOpen && classes.drawerPaperClose),
				}}
				ModalProps={{
					keepMounted: true, // Better open performance on mobile.
				}}
				PaperProps={{
					elevation: 4
				}}
				open={isMobileDrawerOpen}
			>
				{getDrawer()}
			</Drawer>
		</Hidden>
		<Hidden mdDown>
			<Drawer
				classes={{
					root: classes.drawerRoot,
					paper: clsx(classes.drawerPaper, !isBigDrawerOpen && classes.drawerPaperClose),
				}}
				variant="permanent"
				open={isBigDrawerOpen}
				PaperProps={{
					elevation: 4
				}}
			>
				{getDrawer()}
			</Drawer>
		</Hidden>
	</nav>
})

export const MainDrawer: React.FC = () => {
	const { state: web3State, dispatch } = useContext(Web3Context)
	const { ecosystem } = web3State;

	return <Render
		isMobileDrawerOpen={web3State.isMobileDrawerOpen}
		dispatch={dispatch}
		ecosystem={ecosystem}
	/>
}