import { Box, Container, FormControl, InputLabel, Link, List, ListItemButton, ListSubheader, MenuItem, Paper, Select, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useContext } from 'react';

import { theme as datamineTheme } from '../../styles';

import { Ecosystem, NetworkType } from '../../../configs/config.common';
import { helpArticles, SearchCategory, SearchCategoryText, SearchCategoryTextL2 } from '../../helpArticles';
import { Web3Context } from '../../web3/Web3Context';
import { commonLanguage } from '../../web3/web3Reducer';
import FooterFragment from '../elements/Fragments/FooterFragment';
import HelpComboboxFragment from '../elements/Fragments/HelpComboboxFragment';

import { getEcosystemConfig } from '../../../configs/config';
import ArbitrumLogo from '../../../svgs/arbitrum.svg';
import EthereumPurpleLogo from '../../../svgs/ethereumPurple.svg';

import { tss } from 'tss-react/mui';
const useStyles = tss.create(({ theme }) => ({
	logoContainer: {
		[theme.breakpoints.down('sm')]: {
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

		[theme.breakpoints.down('md')]: {
			fontSize: '2rem',
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.5rem',
			textAlign: 'center',
			'& .MuiGrid-container': {
				justifyContent: 'center'
			},
			marginBottom: theme.spacing(3)
		},
	},
	titleSlogan: {
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
		}
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
	heroContent: {
	},
	cardHeader: {
		border: `1px solid ${datamineTheme.classes.palette.highlight}`,
		color: datamineTheme.muiTheme.palette.secondary.contrastText
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
			fontSize: '1.3rem'
		},
		'& [role=cell]': {
			color: datamineTheme.classes.palette.highlight,
		}
	},
	point: {
		[datamineTheme.muiTheme.breakpoints.down('sm')]: {
			textAlign: "center"
		}
	},
	helpCategoryHeader: {
		color: datamineTheme.classes.palette.highlight,
		background: 'none'
	}
}));

interface RenderProps {
	dispatch: React.Dispatch<any>;
	helpArticlesNetworkType: NetworkType;
	ecosystem: Ecosystem;
}

const Render: React.FC<RenderProps> = React.memo(({ dispatch, helpArticlesNetworkType, ecosystem }) => {
	const { classes } = useStyles();

	const { navigation, isArbitrumOnlyToken } = getEcosystemConfig(ecosystem)
	const { discordInviteLink } = navigation

	const isArbitrumMainnet = helpArticlesNetworkType === NetworkType.Arbitrum;

	const getContainerItems = () => {
		return Object.keys(SearchCategory).map((categoryKey, index) => {
			const getHelpListItems = () => {

				const matchingHelpArticles = helpArticles.filter(helpArticle => helpArticle.category === categoryKey);

				return matchingHelpArticles.map((helpArticle, index) => {

					const getTitle = () => {
						if (isArbitrumMainnet && !!helpArticle.titleL2) {
							return helpArticle.titleL2
						}

						return helpArticle.title
					}
					const title = getTitle()

					return <ListItemButton component="a" key={index} onClick={() => dispatch({ type: commonLanguage.commands.ShowHelpArticle, payload: { helpArticle } })}>
						<Box pl={1}>• {title}</Box>
					</ListItemButton>
				})
			}

			const getCategoryHeader = () => {
				if (isArbitrumMainnet) {
					return SearchCategoryTextL2[categoryKey as keyof typeof SearchCategoryTextL2]
				}
				return SearchCategoryText[categoryKey as keyof typeof SearchCategoryText]
			}
			const categoryHeader = getCategoryHeader()

			return <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
				<List subheader={<ListSubheader className={classes.helpCategoryHeader}>{categoryHeader}</ListSubheader>} >
					{getHelpListItems()}
				</List>
			</Grid>
		})
	}

	const getHelpArticlesNetworkTypeDropdown = () => {
		if (isArbitrumOnlyToken) {
			return null
		}

		return <>
			<FormControl size="medium" variant="outlined" fullWidth  >
				<InputLabel id="network-type">Select Your Ecosystem</InputLabel>
				<Select
					labelId="network-type"
					value={!isArbitrumMainnet ? NetworkType.Mainnet : NetworkType.Arbitrum}
					onChange={(e) => {
						dispatch({ type: commonLanguage.commands.SetHelpArticlesNetworkType, payload: e.target.value })
						//switchNetwork(e.target.value === NetworkType.Arbitrum ? '0xa4b1' : '0x1')
					}}
					label="Select Your Ecosystem"
				>
					<MenuItem value={NetworkType.Mainnet}>
						<Grid
							container
							direction="row"
							justifyContent="flex-start"
							alignItems="center"
						>
							<Grid style={{ lineHeight: 0 }}>
								<Box mr={1}><img src={EthereumPurpleLogo} width="24" height="24" /></Box>
							</Grid>
							<Grid>
								FLUX - Ethereum (L1)
							</Grid>
						</Grid>
					</MenuItem>
					<MenuItem value={NetworkType.Arbitrum}>

						<Grid
							container
							direction="row"
							justifyContent="flex-start"
							alignItems="center"
						>
							<Grid style={{ lineHeight: 0 }}>
								<Box mr={1}><img src={ArbitrumLogo} width="24" height="24" /></Box>
							</Grid>
							<Grid>
								ArbiFLUX - Arbitrum (L2)
							</Grid>
						</Grid>
					</MenuItem>
				</Select>
			</FormControl>
		</>
	}

	const getAdditionalHelpText = () => {
		if (!discordInviteLink) {
			return <>If you need to chat with someone please reach out to our community for assistance.</>

		}
		return <>If you need to chat with someone check out our <Link href={discordInviteLink} target="_blank" rel="noopener noreferrer" color="textSecondary">Discord</Link> for community assistance.</>
	}

	return <>
		<Box mt={8}>
			<Box mt={6} mb={6}>
				<Container>
					<Typography component="div" variant="h6" align="left" color="textSecondary" paragraph className={classes.titleSlogan}>
						<Typography component="h3" variant="h3" color="textPrimary" gutterBottom display="block">
							Datamine Instant &amp; Decentralized Helpdesk
						</Typography>
						<Typography component="div" display="inline" variant="h6" color="textPrimary">
							Gain access to entire Datamine Ecosystem knowledgebase in an instant. All help articles are self-contained in our decentralized builds and do not require any external server requests.
							Quickly Search through the entire knowledgebase or browse all articles below:
						</Typography>

						<Box mt={6}>
							{getHelpArticlesNetworkTypeDropdown()}
						</Box>
					</Typography>
				</Container>
			</Box>

			<Paper className={classes.paperBorders}>
				<Box py={6}>
					<Container>

						<Box mb={3}>
							<HelpComboboxFragment id="main-search" isBigSearch={true} />
						</Box>
						<Grid container>
							{getContainerItems()}
						</Grid>
					</Container>
				</Box>
			</Paper>
			<Box my={6}>
				<Container>
					<Typography component="div" variant="h6" align="left" color="textSecondary" paragraph className={classes.titleSlogan}>
						<Typography component="div" display="inline" variant="h6" color="textPrimary">
							Still can't find what you are looking for?
							{' '}
							{getAdditionalHelpText()}
						</Typography>
					</Typography>
				</Container>
			</Box>
		</Box>


		<FooterFragment ecosystem={ecosystem} />
	</>
})

interface Props { }

const HelpPage: React.FC<Props> = ({ }) => {
	const { state: web3State, dispatch } = useContext(Web3Context)

	const { helpArticlesNetworkType, ecosystem } = web3State;

	return <Render
		helpArticlesNetworkType={helpArticlesNetworkType}
		dispatch={dispatch}
		ecosystem={ecosystem}
	/>
}

export default HelpPage