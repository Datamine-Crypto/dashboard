import {
	Box,
	Button,
	Card,
	CardActionArea,
	Chip,
	Divider,
	Drawer,
	Link,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';
import React, { useContext } from 'react';

import Grid from '@mui/material/Grid';

import clsx from 'clsx';
import {
	Diamond as DiamondIcon,
	Equalizer as EqualizerIcon,
	ExpandMore,
	HelpOutline as HelpIcon,
	Home as HomeIcon,
	LocalLibrary as LocalLibraryIcon,
	People as PeopleIcon,
	PlayArrow as PlayArrowIcon,
	Whatshot as WhatshotIcon,
} from '@mui/icons-material';

import { tss } from 'tss-react/mui';
import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import discordWhiteLogo from '../../../../svgs/discordWhite.svg';
import Logo from '../../../../svgs/logo.svg';
import { Web3Context } from '../../../web3/Web3Context';
import { commonLanguage } from '../../../web3/web3Reducer';

const drawerWidth = 280;

const useStyles = tss.create(({ theme }) => ({
	root: {
		display: 'flex',
	},
	drawer: {
		[theme.breakpoints.up('lg')]: {
			width: drawerWidth,
			flexShrink: 0,
		},
	},
	bigDrawerRoot: {},
	mobileDrawerRoot: {
		zIndex: `${theme.zIndex.drawer + 12} !important`,
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
		...(theme.mixins.toolbar as any),
		marginTop: theme.spacing(2),
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
		height: '100%',
	},
	nested: {
		paddingLeft: theme.spacing(4),
		background: '#22242e',
	},
	logoArea: {
		display: 'flex',
		padding: theme.spacing(0, 2, 0, 2),
	},
	title: {
		flexGrow: 1,
	},
	parent: {
		background: '#22242e',
	},
	drawerGridContainer: {
		height: '100%',
	},
	discordButton: {
		background: '#40486c',
		fontSize: '0.7rem',
		'&:hover': {
			background: '#333851',
		},
	},
	lastExpandedItem: {
		paddingBottom: theme.spacing(2),
	},
}));

interface RenderParams {
	dispatch: React.Dispatch<any>;
	isMobileDrawerOpen: boolean;
	ecosystem: Ecosystem;
}
const Render: React.FC<RenderParams> = React.memo(({ dispatch, isMobileDrawerOpen, ecosystem }) => {
	const { navigation, ecosystemName } = getEcosystemConfig(ecosystem);
	const {
		isL1PageEnabled,
		isL2PageEnabled,
		isCommunityPageEnabled,
		isAnalyticsPagesEnabled,
		ecosystemButtonlabel,
		discordInviteLink,
		isHelpPageEnabled,
	} = navigation;

	//const { classes } = useStyles() ;

	const { cx, classes } = useStyles();

	const isBigDrawerOpen = true;

	const getL2Page = () => {
		return [
			{
				title: <>Learn More</>,
				icon: <LocalLibraryIcon />,
				href: '#about',
				className: classes.nested,
			},
		];
	};
	const getCommunityPage = () => {
		if (!isCommunityPageEnabled) {
			return [];
		}
		return [
			{
				title: 'Community',
				icon: <PeopleIcon />,
				href: '#community',
				className: classes.nested,
			},
		];
	};
	const getAnalyticsPages = () => {
		if (!isAnalyticsPagesEnabled) {
			return [];
		}
		return [
			{
				isBasicDivider: true,
			},
			{
				title: (
					<>
						Datamine Gems <Chip size="small" label="#GameFi" />
					</>
				),
				icon: <DiamondIcon />,
				href: '#gamefi',
			},
			{
				isBasicDivider: true,
			},
			{
				title: 'Ecosystem Analytics',
				icon: <EqualizerIcon />,
				expandIcon: true,
				href: 'https://datamine-crypto.github.io/datamine-pro-portal/',
			},
			{
				isBasicDivider: true,
			},
			/*
			{
				title: <>Trend Analytics <Typography component="div" display="inline" color="textSecondary">(Beta)</Typography></>,
				icon: <TrendingUpIcon />,
				expandIcon: false,
				href: 'https://datamine-crypto.github.io/datamine-pro-portal/#/trends/datamine'
			},
			{
				isBasicDivider: true
			},*/
		];
	};
	const getHelpPage = () => {
		if (!isHelpPageEnabled) {
			return [];
		}
		return [
			{
				title: 'Help',
				icon: <HelpIcon />,
				href: '#help',
				className: `${classes.nested} ${classes.lastExpandedItem}`,
			},
		];
	};

	const buttons = [
		{
			isBasicDivider: true,
		},
		{
			title: ecosystemButtonlabel,

			icon: <WhatshotIcon />,
			className: classes.parent,
			expandIcon: true,
		},
		{
			title: 'Homepage',
			icon: <HomeIcon />,
			href: '#',
			className: classes.nested,
		},
		{
			title: 'Liquidity Dashboard',
			icon: <PlayArrowIcon />,
			href: '#dashboard',
			className: classes.nested,
		},
		...getL2Page(),
		...getCommunityPage(),
		...getHelpPage(),
		...getAnalyticsPages(),
	];

	const getDrawer = () => {
		const getExpandIcon = (shouldExpand: boolean) => {
			if (!shouldExpand) {
				return null;
			}

			return <ExpandMore />;
		};

		const drawerButtons = buttons.map((button: any) => {
			if (button.isDivider) {
				return (
					<Box my={2}>
						<Divider />
					</Box>
				);
			}
			if (button.isBasicDivider) {
				return <Divider />;
			}
			const getListItemProps = () => {
				if (button.href) {
					return {
						button: true,
						component: 'a',
						href: button.href,
						color: 'textPrimary',
						onClick: () => {
							dispatch({ type: commonLanguage.commands.CloseDrawer });
						},
					};
				}

				if (!button.onClick) {
					return {};
				}

				return {
					button: true,
					onClick: () => {
						dispatch({ type: commonLanguage.commands.CloseDrawer });
						button.onClick();
					},
				};
			};
			return (
				<ListItemButton key={button.title} className={button.className} {...(getListItemProps() as any)}>
					<ListItemIcon style={{ minWidth: 40 }}>{button.icon}</ListItemIcon>
					<ListItemText primary={button.title} />
					{getExpandIcon(!!button.expandIcon)}
				</ListItemButton>
			);
		});

		const getDiscordButton = () => {
			if (!discordInviteLink) {
				return null;
			}
			return (
				<Box my={3}>
					<Grid container justifyContent="center">
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
			);
		};

		return (
			<>
				<div className={classes.toolbar}>
					<Box sx={{ display: { xs: 'block', lg: 'none' } /*lgUp*/ }}>
						<Link href="#">
							<Card elevation={0}>
								<CardActionArea className={classes.logoArea}>
									<Box mr={2}>
										<img src={Logo} width="54" height="54" />
									</Box>
									<Typography component="div" color="inherit" noWrap className={classes.title}>
										{ecosystemName}
									</Typography>
								</CardActionArea>
							</Card>
						</Link>
					</Box>
				</div>
				<Box height="100%">
					<Grid container direction="column" justifyContent="space-between" className={classes.drawerGridContainer}>
						<Grid>
							<List>{drawerButtons}</List>
						</Grid>
						<Grid>{getDiscordButton()}</Grid>
					</Grid>
				</Box>
			</>
		);
	};

	const handleDrawerToggle = () => {
		dispatch({ type: commonLanguage.commands.CloseDrawer });
	};

	return (
		<nav className={classes.drawer} aria-label="mailbox folders">
			{/* The implementation can be swapped with js to avoid SEO duplication of links. */}
			<Box sx={{ display: { xs: 'block', lg: 'none' } /*lgUp*/ }}>
				<Drawer
					variant="temporary"
					onClose={handleDrawerToggle}
					//open={mobileOpen}
					//onClose={handleDrawerToggle}
					classes={{
						root: clsx(classes.drawerRoot, classes.mobileDrawerRoot),
						paper: clsx(classes.drawerPaper, !isMobileDrawerOpen && classes.drawerPaperClose),
					}}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
					PaperProps={{
						elevation: 4,
					}}
					open={isMobileDrawerOpen}
				>
					{getDrawer()}
				</Drawer>
			</Box>
			<Box sx={{ display: { xs: 'none', lg: 'block' } /*mdDown*/ }}>
				<Drawer
					classes={{
						root: clsx(classes.drawerRoot, classes.bigDrawerRoot),
						paper: clsx(classes.drawerPaper, !isBigDrawerOpen && classes.drawerPaperClose),
					}}
					variant="permanent"
					open={isBigDrawerOpen}
					PaperProps={{
						elevation: 4,
					}}
				>
					{getDrawer()}
				</Drawer>
			</Box>
		</nav>
	);
});

export const MainDrawer: React.FC = () => {
	const { state: web3State, dispatch } = useContext(Web3Context);
	const { ecosystem } = web3State;

	return <Render isMobileDrawerOpen={web3State.isMobileDrawerOpen} dispatch={dispatch} ecosystem={ecosystem} />;
};
