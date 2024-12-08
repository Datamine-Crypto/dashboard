import React, { JSX, useContext } from 'react';
import { Box, Container, Typography, Paper, Card, CardActionArea, Link, List, ListSubheader, ListItem, Chip } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { makeStyles } from '@mui/styles';

import RedditIcon from '@mui/icons-material/Reddit';
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import TimelineIcon from '@mui/icons-material/Timeline';

import discordLogo from '../../../svgs/discord.svg';
import mediumLogo from '../../../svgs/medium.svg';
import btcLogo from '../../../svgs/bitcoin.svg';

import { theme } from '../../styles'

import FooterFragment from '../elements/Fragments/FooterFragment';
import { helpArticles, SearchCategory, SearchCategoryText } from '../../helpArticles';
import { commonLanguage } from '../../web3/web3Reducer';
import { Web3Context } from '../../web3/Web3Context';
import { Ecosystem } from '../../../configs/config.common';

const useStyles = makeStyles(() => ({
	logoContainer: {
		[theme.muiTheme.breakpoints.down('sm')]: {
			flexGrow: '1',
			textAlign: 'center'
		},
	},
	title: {
		fontSize: '2.8rem',
		'& .MuiGrid-item': {
			display: 'flex',
			alignItems: 'center'
		},

		[theme.muiTheme.breakpoints.down('md')]: {
			fontSize: '2rem',
		},
		[theme.muiTheme.breakpoints.down('sm')]: {
			fontSize: '1.5rem',
			textAlign: 'center',
			'& .MuiGrid-container': {
				justifyContent: 'center'
			},
			marginBottom: theme.muiTheme.spacing(3)
		},
	},
	titleSlogan: {
		[theme.muiTheme.breakpoints.down('sm')]: {
			textAlign: 'center',
		}
	},
	arrow: {
		color: '#0ff',
		fontSize: '2rem',
		verticalAlign: 'middle',
		[theme.muiTheme.breakpoints.down('md')]: {
			fontSize: '1.5rem',
		},
		[theme.muiTheme.breakpoints.down('sm')]: {
			fontSize: '1rem',
		},
	},
	heroContent: {
	},
	cardHeader: {
		border: `1px solid ${theme.classes.palette.highlight}`,
		color: theme.muiTheme.palette.secondary.contrastText
	},
	cardPricing: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'baseline',
		marginBottom: theme.muiTheme.spacing(2),
	},
	paperBorders: {
		borderTop: `1px solid ${theme.classes.palette.highlight}`,
		borderBottom: `1px solid ${theme.classes.palette.highlight}`,
	},
	paperBottom: {
		borderTop: `1px solid ${theme.classes.palette.highlight}`,
	},
	comparisonTable: {
		'& .MuiTableCell-head': {
			background: theme.classes.palette.secondaryBackground,
			color: theme.classes.palette.highlight,
			fontSize: '1.3rem'
		},
		'& [role=cell]': {
			color: theme.classes.palette.highlight,
		}
	},
	point: {
		[theme.muiTheme.breakpoints.down('sm')]: {
			textAlign: "center"
		}
	},
	helpCategoryHeader: {
		color: theme.classes.palette.highlight,
	},
	featurePoint: {
		marginBottom: 0
	}
}));

interface PointParams {
	title: JSX.Element | string;
	content: JSX.Element | string;
	icon: JSX.Element;
	mt?: number;
	mb?: number;
}

interface RenderProps {
	dispatch: React.Dispatch<any>;
	ecosystem: Ecosystem;
}

const Render: React.FC<RenderProps> = React.memo(({ ecosystem }) => {
	const classes = useStyles();

	const getPoint = ({ title, content, icon, mt, mb }: PointParams) => {
		return <Box mt={mt !== undefined ? mt : 4} mb={mb !== undefined ? mb : 4}>
			<Grid
				container
				spacing={3}
				justifyContent="center"
				className={classes.point}
			>
				<Grid>
					{icon}
				</Grid>
				<Grid size={{ md: 8, lg: 10 }}>
					<Box mb={1} mt={1}>
						<Typography variant="h4" color="textPrimary">
							{title}
						</Typography>
					</Box>
					<Typography variant="h6" color="textSecondary" paragraph className={classes.featurePoint}>
						{content}
					</Typography>
				</Grid>
			</Grid>
		</Box>
	}

	const getSocialPoints = () => {
		return <>
			<Link href="https://discord.gg/2dQ7XAB22u" target="_blank" rel="noopener noreferrer">
				<Card elevation={0}>
					<CardActionArea>
						{getPoint({
							icon: <img src={discordLogo} alt="Discord: Datamine Network" width="48" height="48" />,
							title: <>Discord: Datamine Network <Chip size="small" label="Most Popular🔥" variant="outlined" /></>,
							content: <>This Discord community is moderated by Datamine Ecosystem Smart Contact &amp; Analytics Architects. Here you can find regular development &amp; social updates for Datamine Network. <Typography variant="h6" color="textPrimary" display="inline">Currently this is the most active community.</Typography></>
						})}
					</CardActionArea>
				</Card>
			</Link>
			<Link href="https://twitter.com/dataminenetwork" target="_blank" rel="noopener noreferrer">
				<Card elevation={0}>
					<CardActionArea>
						{getPoint({
							icon: <TwitterIcon style={{ fontSize: theme.muiTheme.typography.h3.fontSize, color: theme.classes.palette.highlight }} />,
							title: 'Twitter: @dataminenetwork',
							content: `This Twitter community is moderated by Datamine Ecosystem Smart Contact &amp; Analytics Architects. Here you can find regular updates to Datamine Network & Analytics platform. Be sure to follow!`
						})}
					</CardActionArea>
				</Card>
			</Link>
			<Link href="https://medium.com/@dataminenetwork" target="_blank" rel="noopener noreferrer">
				<Card elevation={0}>
					<CardActionArea>
						{getPoint({
							icon: <img src={mediumLogo} alt="Medium: Datamine Network" width="48" height="48" />,
							title: 'Medium: Datamine Network',
							content: `Here you can find announcements of big releases and milestones for Datamine Network & Analytics platform.`
						})}
					</CardActionArea>
				</Card>
			</Link>
			<Link href="https://damalytics.web.app/" target="_blank" rel="noopener noreferrer">
				<Card elevation={0}>
					<CardActionArea>
						{getPoint({
							icon: <TimelineIcon style={{ fontSize: theme.muiTheme.typography.h3.fontSize, color: theme.classes.palette.highlight }} />,
							title: 'Analytics Tool: DAM Community Calculator',
							content: `An amazing APY calculator for DAM & FLUX. Created and hosted by the community.`
						})}
					</CardActionArea>
				</Card>
			</Link>
		</>
	}

	return <>
		<Box mt={8}>
			<Box mt={6} mb={6}>
				<Container>
					<Typography variant="h6" align="left" color="textSecondary" paragraph className={classes.titleSlogan}>
						<Typography component="h3" variant="h3" color="textPrimary" gutterBottom display="block">
							Datamine Decentralized Community
						</Typography>
						<Typography variant="h6" color="textPrimary" gutterBottom>
							Datamine is a truly decentralized cryptocurrency. <strong>There are no "Official Social Channels"</strong> and all marketing is done by different communities around the world.

							All of the links listed here are different Datamine communities ran by various groups.
						</Typography>
						<Typography variant="h6" color="textPrimary">
							Most popular communities &amp; websites are listed first. <strong>Please stay safe &amp; never share your private keys!</strong>
						</Typography>

					</Typography>
				</Container>
			</Box>

			<Box mb={6}>
				<Paper className={classes.paperBorders}>
					<Box py={3}>
						<Container>
							<Box mb={6}>
								{getSocialPoints()}
							</Box>
						</Container>
					</Box>
				</Paper>
			</Box>
			<Box my={6}>
				<Container>
					<Typography variant="h6" align="left" color="textSecondary" paragraph className={classes.titleSlogan}>
						<Typography display="inline" variant="h6" color="textPrimary">
							Want your community listed here? Reach out to one of the existing communities in the list and you can join our decentralization efforts.
						</Typography>
					</Typography>
				</Container>
			</Box>
		</Box>

		<FooterFragment ecosystem={ecosystem} />
	</>
})

interface Props { }

const CommunityPage: React.FC<Props> = ({ }) => {
	const { state: web3State, dispatch } = useContext(Web3Context)
	const { ecosystem } = web3State

	return <Render
		dispatch={dispatch}
		ecosystem={ecosystem}
	/>
}

export default CommunityPage