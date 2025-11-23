import { Box, Card, CardActionArea, Chip, Container, Link, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { ReactNode } from 'react';
import { LinkedIn, Timeline, Twitter } from '@mui/icons-material';
import discordLogo from '@/svgs/discord.svg';
import mediumLogo from '@/svgs/medium.svg';
import { theme as datamineTheme } from '@/core/styles';
import { Ecosystem } from '@/configs/config.common';
import { useAppStore } from '@/core/web3/appStore';
import FooterFragment from '@/core/react/elements/Fragments/FooterFragment';
import { tss } from 'tss-react/mui';
import { useShallow } from 'zustand/react/shallow';
import { ReducerDispatch } from '@/core/web3/reducer/interfaces';
const useStyles = tss.create(({ theme }) => ({
	logoContainer: {
		[theme.breakpoints.down('sm')]: {
			flexGrow: '1',
			textAlign: 'center',
		},
	},
	title: {
		fontSize: '2.8rem',
		'& .MuiGrid-item': {
			display: 'flex',
			alignItems: 'center',
		},
		[theme.breakpoints.down('md')]: {
			fontSize: '2rem',
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.5rem',
			textAlign: 'center',
			'& .MuiGrid-container': {
				justifyContent: 'center',
			},
			marginBottom: theme.spacing(3),
		},
	},
	titleSlogan: {
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
		},
	},
	arrow: {
		color: '#0ff',
		fontSize: '2rem',
		verticalAlign: 'middle',
		[theme.breakpoints.down('md')]: {
			fontSize: '1.5rem',
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1rem',
		},
	},
	heroContent: {},
	cardHeader: {
		border: `1px solid ${datamineTheme.classes.palette.highlight}`,
		color: datamineTheme.muiTheme.palette.secondary.contrastText,
	},
	cardPricing: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'baseline',
		marginBottom: theme.spacing(2),
	},
	paperBorders: {
		borderTop: `1px solid ${datamineTheme.classes.palette.highlight}`,
		borderBottom: `1px solid ${datamineTheme.classes.palette.highlight}`,
	},
	paperBottom: {
		borderTop: `1px solid ${datamineTheme.classes.palette.highlight}`,
	},
	comparisonTable: {
		'& .MuiTableCell-head': {
			background: datamineTheme.classes.palette.secondaryBackground,
			color: datamineTheme.classes.palette.highlight,
			fontSize: '1.3rem',
		},
		'& [role=cell]': {
			color: datamineTheme.classes.palette.highlight,
		},
	},
	point: {
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
		},
	},
	helpCategoryHeader: {
		color: datamineTheme.classes.palette.highlight,
	},
	featurePoint: {
		marginBottom: 0,
	},
}));
interface PointParams {
	title: ReactNode;
	content: ReactNode;
	icon: ReactNode;
	mt?: number;
	mb?: number;
}
interface RenderProps {
	dispatch: ReducerDispatch;
	ecosystem: Ecosystem;
}
/**
 * A memoized functional component that renders the main content of the Community Page.
 * It displays various social and community links for the Datamine Network.
 * @param props - Object containing the ecosystem.
 */
const Render: React.FC<RenderProps> = React.memo(({ ecosystem }) => {
	const { classes } = useStyles();
	/**
	 * Generates a styled point element for displaying information with an icon, title, and content.
	 * @param params - Object containing title, content, icon, and optional margin top/bottom.
	 * @returns A React Box component containing the styled point.
	 */
	const getPoint = ({ title, content, icon, mt, mb }: PointParams) => {
		return (
			<Box mt={mt !== undefined ? mt : 4} mb={mb !== undefined ? mb : 4}>
				<Grid container spacing={3} justifyContent="center" className={classes.point}>
					<Grid>{icon}</Grid>
					<Grid size={{ md: 8, lg: 10 }}>
						<Box mb={1} mt={1}>
							<Typography component="div" variant="h4" color="textPrimary">
								{title}
							</Typography>
						</Box>
						<Typography component="div" variant="h6" color="textSecondary" paragraph className={classes.featurePoint}>
							{content}
						</Typography>
					</Grid>
				</Grid>
			</Box>
		);
	};
	/**
	 * Renders a collection of social media and community links as styled points.
	 * Each link is wrapped in a CardActionArea for interactive behavior.
	 * @returns A React Fragment containing the social points.
	 */
	const getSocialPoints = () => {
		return (
			<>
				<Link href="https://discord.gg/2dQ7XAB22u" target="_blank" rel="noopener noreferrer">
					<Card elevation={0}>
						<CardActionArea>
							{getPoint({
								icon: <img src={discordLogo} alt="Discord: Datamine Network" width="48" height="48" />,
								title: (
									<>
										Discord: Datamine Network <Chip size="small" label="Most Popular🔥" variant="outlined" />
									</>
								),
								content: (
									<>
										This Discord community is moderated by Datamine Ecosystem Smart Contact &amp; Analytics Architects.
										Here you can find regular development &amp; social updates for Datamine Network.{' '}
										<Typography component="div" variant="h6" color="textPrimary" display="inline">
											Currently this is the most active community.
										</Typography>
									</>
								),
							})}
						</CardActionArea>
					</Card>
				</Link>
				<Link href="https://twitter.com/dataminenetwork" target="_blank" rel="noopener noreferrer">
					<Card elevation={0}>
						<CardActionArea>
							{getPoint({
								icon: (
									<Twitter
										style={{
											fontSize: datamineTheme.muiTheme.typography.h3.fontSize,
											color: datamineTheme.classes.palette.highlight,
										}}
									/>
								),
								title: 'Twitter: @dataminenetwork',
								content: `This Twitter community is moderated by Datamine Ecosystem Smart Contact &amp; Analytics Architects. Here you can find regular updates to Datamine Network & Analytics platform. Be sure to follow!`,
							})}
						</CardActionArea>
					</Card>
				</Link>
				<Link href="https://linkedin.com/company/datamine-network" target="_blank" rel="noopener noreferrer">
					<Card elevation={0}>
						<CardActionArea>
							{getPoint({
								icon: (
									<LinkedIn
										style={{
											fontSize: datamineTheme.muiTheme.typography.h3.fontSize,
											color: datamineTheme.classes.palette.highlight,
										}}
									/>
								),
								title: 'LinkedIn: Datamine Network',
								content: `Follow us on LinkedIn for company updates, news, and articles about the Datamine Network.`,
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
								content: `Here you can find announcements of big releases and milestones for Datamine Network & Analytics platform.`,
							})}
						</CardActionArea>
					</Card>
				</Link>
				<Link href="https://damalytics.web.app/" target="_blank" rel="noopener noreferrer">
					<Card elevation={0}>
						<CardActionArea>
							{getPoint({
								icon: (
									<Timeline
										style={{
											fontSize: datamineTheme.muiTheme.typography.h3.fontSize,
											color: datamineTheme.classes.palette.highlight,
										}}
									/>
								),
								title: 'Analytics Tool: DAM Community Calculator',
								content: `An amazing APY calculator for DAM & FLUX. Created and hosted by the community.`,
							})}
						</CardActionArea>
					</Card>
				</Link>
			</>
		);
	};
	return (
		<>
			<Box mt={8}>
				<Box mt={6} mb={6}>
					<Container>
						<Typography
							component="div"
							variant="h6"
							align="left"
							color="textSecondary"
							paragraph
							className={classes.titleSlogan}
						>
							<Typography component="h3" variant="h3" color="textPrimary" gutterBottom display="block">
								Datamine Decentralized Community
							</Typography>
							<Typography variant="h6" color="textPrimary" gutterBottom>
								Datamine is a truly decentralized cryptocurrency.{' '}
								<strong>There are no &quot;Official Social Channels&quot;</strong> and all marketing is done by
								different communities around the world. All of the links listed here are different Datamine communities
								ran by various groups.
							</Typography>
							<Typography variant="h6" color="textPrimary">
								Most popular communities &amp; websites are listed first.{' '}
								<strong>Please stay safe &amp; never share your private keys!</strong>
							</Typography>
						</Typography>
					</Container>
				</Box>
				<Box mb={6}>
					<Paper className={classes.paperBorders}>
						<Box py={3}>
							<Container>
								<Box mb={6}>{getSocialPoints()}</Box>
							</Container>
						</Box>
					</Paper>
				</Box>
				<Box my={6}>
					<Container>
						<Typography
							component="div"
							variant="h6"
							align="left"
							color="textSecondary"
							paragraph
							className={classes.titleSlogan}
						>
							<Typography component="div" display="inline" variant="h6" color="textPrimary">
								Want your community listed here? Reach out to one of the existing communities in the list and you can
								join our decentralization efforts.
							</Typography>
						</Typography>
					</Container>
				</Box>
			</Box>
			<FooterFragment ecosystem={ecosystem} />
		</>
	);
});
interface Props {}
/**
 * CommunityPage component that displays information about the Datamine Network community.
 * It fetches the current ecosystem from Web3Context and passes it to the Render component.
 * @param props - Component props (currently empty).
 */
const CommunityPage: React.FC<Props> = () => {
	const { ecosystem, dispatch } = useAppStore(
		useShallow((state) => ({ ecosystem: state.state.ecosystem, dispatch: state.dispatch }))
	);
	return <Render dispatch={dispatch} ecosystem={ecosystem} />;
};
export default CommunityPage;
