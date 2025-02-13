import { Box, Button, Card, CardActionArea, Container, Link, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography } from '@mui/material';
import React, { ReactNode, useContext } from 'react';

import PeopleIcon from '@mui/icons-material/People';
import ArrowRightIcon from '@mui/icons-material/PlayArrow';
import Grid from '@mui/material/Grid2';

import arbiFluxLogo from '../../../svgs/arbiFluxLogo.svg';
import fluxLogo from '../../../svgs/fluxLogo.svg';
import logo from '../../../svgs/logo.svg';

import analyticsIcon from '../../../svgs/analytics.svg';
import communityIcon from '../../../svgs/community.svg';
import ecosystemIcon from '../../../svgs/ecosystem.svg';
import ecosystemL2Icon from '../../../svgs/ecosystemL2.svg';
import lockIcon from '../../../svgs/lock.svg';
import poolIcon from '../../../svgs/pool.svg';
import poolIconL2 from '../../../svgs/poolL2.svg';
import smartContractIcon from '../../../svgs/smartContract.svg';
import synergyIcon from '../../../svgs/synergy.svg';

import { theme as datamineTheme } from '../../styles';

import { getEcosystemConfig } from '../../../configs/config';
import { Ecosystem, Layer } from '../../../configs/config.common';
import { helpArticles } from '../../helpArticles';
import { Web3Context } from '../../web3/Web3Context';
import { commonLanguage } from '../../web3/web3Reducer';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from '../elements/Fragments/ExploreLiquidityPools';
import FooterFragment from '../elements/Fragments/FooterFragment';

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
		color: theme.palette.secondary.contrastText
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
		[theme.breakpoints.down('sm')]: {
			textAlign: "center"
		}
	},
	poolDiagram: {
		maxWidth: 800,
		margin: '0 auto',
		display: 'block'
	},
	ecosystemDiagram: {
		maxWidth: 1000,
		margin: '0 auto',
		display: 'block'
	},
	featurePoint: {
		marginBottom: 0
	},
	points: {
		'& li': {
			marginBottom: 8
		},
		'& a': {
			display: 'block'
		},
		[theme.breakpoints.down('sm')]: {
			listStyle: 'none'
		}
	}
}));

interface PointParams {
	title: ReactNode;
	content: ReactNode;
	icon: ReactNode;
	mt?: number;
	mb?: number;
}

interface RenderProps {
	dispatch: React.Dispatch<any>;
	ecosystem: Ecosystem;
}

const Render: React.FC<RenderProps> = React.memo(({ dispatch, ecosystem }) => {

	const { classes } = useStyles();
	const { layer } = getEcosystemConfig(ecosystem);
	const isArbitrumMainnet = layer === Layer.Layer2;

	//@todo this page needs reworking, currently it only talks about DAM, FLUX and ArbiFLUX.

	const fluxTokenName = isArbitrumMainnet ? 'ArbiFLUX' : 'FLUX'
	const damTokenName = isArbitrumMainnet ? 'FLUX' : 'DAM'
	const damTokenNameLong = isArbitrumMainnet ? 'FLUX (L2)' : 'Datamine (DAM)'

	const getLogo = () => {
		return <img src={logo} alt="Logo" style={{ width: '128px' }} />
	}

	const getArrow = () => {
		return <Box display="inline"><ArrowRightIcon fontSize="large" className={classes.arrow} /></Box>
	}

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
	}

	const getFeaturePoints = () => {

		const getPoolDiagram = () => {
			return <img src={isArbitrumMainnet ? poolIconL2 : poolIcon} className={classes.poolDiagram} alt={`How ${fluxTokenName} Uniswap Works`} width="100%" />
		}

		const getEcosystemIcon = () => {
			return <img src={isArbitrumMainnet ? ecosystemL2Icon : ecosystemIcon} className={classes.ecosystemDiagram} alt={`How Datamine ${isArbitrumMainnet ? 'L2' : 'L1'} Ecosystem Works`} width="100%" />
		}


		const burningFluxTokensHelpArticle = helpArticles.find(helpArticle => helpArticle.id === 'dashboard/burningFluxTokens');


		return <>
			{getPoint({
				icon: <img src={smartContractIcon} alt={`Our Tokenomics: How Proof of Burn Works on ${!isArbitrumMainnet ? 'L1' : 'Arbitrum'}`} width="48" height="48" />,
				title: `Our Tokenomics: How Proof of Burn Works on ${!isArbitrumMainnet ? 'L1' : 'L2'}`,
				content: <>
					<>
						<ul className={classes.points}>
							<li>
								<Link underline="hover" href="#dashboard" color="textSecondary">Start your {isArbitrumMainnet ? 'ArbiFLUX' : 'FLUX'} validator by locking {isArbitrumMainnet ? 'FLUX (L2)' : 'Datamine (DAM)'} in a smart contract</Link>
							</li>
							<li>
								<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.TextLink} ecosystem={ecosystem} contents={<Box style={{ cursor: 'pointer' }}>Your validator generates {isArbitrumMainnet ? 'ArbiFLUX' : 'FLUX'} every 12 seconds <Typography component="div" variant="body2" color="textPrimary" display="inline">(Trade On Uniswap)</Typography></Box>} />
							</li>
							<li>
								<Link underline="hover" onClick={(e: any) => dispatch({ type: commonLanguage.commands.ShowHelpArticle, payload: { helpArticle: burningFluxTokensHelpArticle } })} color="textSecondary" style={{ cursor: 'pointer' }}>Burning {isArbitrumMainnet ? 'ArbiFLUX' : 'FLUX'} from circulation increases your minting speed <Typography component="div" variant="body2" color="textPrimary" display="inline">(Get rewards 30x faster)</Typography></Link>
							</li>
							<li>
								<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.TextLink} ecosystem={ecosystem} contents={<Box style={{ cursor: 'pointer' }}>Burning {isArbitrumMainnet ? 'ArbiFLUX' : 'FLUX'} creates <strong style={{ color: '#0FF' }}>monetary velocity</strong> which flows through 1% Uniswap Pool</Box>} />
							</li>
						</ul>
					</>

					{getPoolDiagram()}
				</>
			})}
			{getPoint({
				icon: <img src={synergyIcon} alt="Next-Gen Smart Contracts" width="72" height="72" />,
				title: `Our Use Case: Transaction-incentivized Liquidity Pools ${isArbitrumMainnet ? 'on L2' : ''}`,
				mb: 0,
				content: <>
					<Box mb={1}>{damTokenName} and {fluxTokenName} are dual interconnected tokens that offer unique incentives for providing liquidity on Uniswap &amp; Balancer pools. Our core on-chain use case ensures constant movement of tokens through any liquidity pool.</Box>
					<Box mb={1}>{damTokenNameLong} tokens have {isArbitrumMainnet ? 'linear and preditacble' : 'fixed'} supply to form high volatility pool. <strong>{!isArbitrumMainnet ? `Over 70% of lifetime ${damTokenName} supply is located` : 'FLUX (L2) can be locked-in'}</strong> in the {isArbitrumMainnet ? 'L2 ' : ''}{fluxTokenName} minting smart contract. Constant demand to start more validators creates on-chain velocity.</Box>
					<Box mb={1}>{fluxTokenName} tokens have infinite supply and deflation is automatically adjusted by "controlled on-chain burn" to create low volatility pool. <strong>{isArbitrumMainnet ? `${fluxTokenName} is constantly destroyed from circulation` : `Over 60% of all ${fluxTokenName} tokens have been destroyed from circulation`}</strong> creating on-chain velocity where {fluxTokenName} is used as a form of "fuel" for the controlled burn.</Box>
					{getEcosystemIcon()}
				</>
			})}
			{getPoint({
				icon: <img src={analyticsIcon} alt="Realtime Smart Contract Analytics" width="48" height="48" />,
				title: 'Realtime Multi-Smart Contract Analytics',
				content: <>
					<Box mb={1}>Datamine Network is an emerging DeFi dApp leader thanks to our robust, feature-rich decentralized user dashboard that allows anyone to interact with our audited smart contracts. </Box>
					<Box mb={1}>Get realtime on-chain market sentiment and see your balances in USD with our deep Uniswap integration. </Box>
					Realtime market cap, balances and instant worldwide {damTokenNameLong} / {fluxTokenName} token analytics at your fingertips.
				</>
			})}
			{getPoint({
				icon: <img src={lockIcon} alt="Secure By Design" width="48" height="48" />,
				title: 'Secure By Design & Professionally Audited',
				content: 'All business logic is executed via Audited Smart Contracts so your funds are safe and secure. No 3rd parties are involved in fund movement and transactions are performed on-chain.'
			})}
			{getPoint({
				icon: <img src={communityIcon} alt="Built For The Community" width="48" height="48" />,
				title: 'Built For The Community',
				content: `Utilizing the latest serverless, web3 and mobile technologies our Smart Contracts feel like the apps you use and love. Seamlessly switch your experience from desktop to mobile on the same secure and easy-to-use dashboard.`
			})}
		</>
	}
	const getSocialPoints = () => {
		return <>
			<Link underline="hover" href="#community">
				<Card elevation={0}>
					<CardActionArea>
						{getPoint({
							icon: <PeopleIcon style={{ fontSize: datamineTheme.muiTheme.typography.h3.fontSize, color: datamineTheme.classes.palette.highlight }} />,
							title: 'Check Out Our Decentralized Communities!',
							content: <>
								<Typography component="div" variant="h6" color="textPrimary" gutterBottom>
									Datamine is a truly decentralized cryptocurrency. <strong>There are no "Official Social Channels"</strong> and all marketing is done by different communities around the world.

									There are currently over 10 different active communities in the Datamine Ecosystem ran completely by the community.
								</Typography>
							</>
						})}
					</CardActionArea>
				</Card>
			</Link>
		</>
	}

	const getTokens = () => {
		const fluxAuditLink = <><Link underline="hover" href="https://github.com/Datamine-Crypto/white-paper/blob/master/audits/SlowMist%20-%20Smart%20Contract%20Security%20Audit%20Report%20-%20FluxToken.pdf" target="blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem' }} color="textSecondary">SlowMist Security (Click to View)</Link></>

		const getAddressLink = (link: string) => {
			return <><Link underline="hover" href={`https://${isArbitrumMainnet ? 'arbi' : 'ether'}scan.io/token/${link}`} target="blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem' }} color="textSecondary">{link}</Link></>
		}

		const tokens = [
			{
				text: 'Total Supply',
				dam: isArbitrumMainnet ? 'Unlimited' : 'Fixed',
				flux: 'Unlimited'
			},
			{
				text: 'Token Source',
				dam: isArbitrumMainnet ? 'Datamine (DAM) L1 Validators' : 'Bulwark & ENCO Coin Swap',
				flux: isArbitrumMainnet ? 'FLUX (L2) L2 Validators' : 'Datamine (DAM) Validators'
			},
			{
				text: 'Key Feature',
				dam: isArbitrumMainnet ? 'Using Custom Arbitrum Gateway' : 'Proof of Burn Smart Contract',
				flux: isArbitrumMainnet ? 'Global Burn Supply / Demand (L2)' : 'Global Burn Supply / Demand'
			},
			{
				text: 'Starting Supply',
				dam: isArbitrumMainnet ? '0 FLUX' : <>16,876,778 DAM {<Typography component="div" color="textSecondary" display="inline" variant="body2">(From BWK & ENCO Swaps)</Typography>}</>,
				flux: isArbitrumMainnet ? '0 ArbiFLUX' : '0 FLUX'
			},
			{
				text: 'Primary Utility',
				dam: isArbitrumMainnet ? 'Bridged From FLUX (L1)' : 'Incentivized Cold Storage',
				flux: isArbitrumMainnet ? 'On-Chain Mint & Burn Mechanism (L2)' : 'On-Chain Mint & Burn Mechanism'
			},
			{
				text: 'Technology',
				dam: isArbitrumMainnet ? 'Basic ERC-777' : 'Standard ERC-777',
				flux: 'Advanced ERC-777'
			},
			{
				text: 'Suggested Wallet Type',
				dam: 'Secure Hardware',
				flux: 'MetaMask / Brave Browser / WalletConnect'
			},
			{
				text: 'Professional Audits',
				dam: isArbitrumMainnet ? '-' : <><Link underline="hover" href="https://github.com/Datamine-Crypto/white-paper/blob/master/audits/SlowMist%20-%20Smart%20Contract%20Security%20Audit%20Report%20-%20DamToken.pdf" target="blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem' }} color="textSecondary">SlowMist Security (Click to View)</Link></>,
				flux: fluxAuditLink
			},
			{
				text: 'Smart Contract Address',
				dam: getAddressLink('0xF80D589b3Dbe130c270a69F1a69D050f268786Df'),
				flux: getAddressLink(isArbitrumMainnet ? '0x64081252c497fcfec247a664e9d10ca8ed71b276' : '0x469eDA64aEd3A3Ad6f868c44564291aA415cB1d9')
			},
		]

		return <Container maxWidth="md" component="main">
			<Grid container spacing={5} alignItems="flex-end">
				<TableContainer component={(props: any) => <Paper {...props} elevation={0} />}>
					<Table aria-label="simple table" className={classes.comparisonTable}>
						<TableHead>
							<TableRow>
								<TableCell></TableCell>
								<TableCell align="right">
									<Box mb={2}><img src={isArbitrumMainnet ? fluxLogo : logo} alt={`${damTokenName} Token`} style={{ width: '96px' }} /></Box>
									{damTokenName} Token{isArbitrumMainnet ? ' (on L2)' : ''}
								</TableCell>
								<TableCell align="right">
									<Box mb={2}><img src={isArbitrumMainnet ? arbiFluxLogo : fluxLogo} alt={`${fluxTokenName} Token`} style={{ width: '96px' }} /></Box>
									{fluxTokenName} Token{isArbitrumMainnet ? ' (on L2)' : ''}
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{tokens.map((token, index) => (
								<TableRow key={index}>
									<TableCell component="th" scope="row">
										{token.text}
									</TableCell>
									<TableCell align="right">{token.dam}</TableCell>
									<TableCell align="right">{token.flux}</TableCell>
								</TableRow>
							))}
						</TableBody>
						<TableFooter>
							<TableRow>
								<TableCell component="th" scope="row">
								</TableCell>
								<TableCell align="right">
									<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.SmallButton} ecosystem={ecosystem} />
								</TableCell>
								<TableCell align="right">
									<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.SmallButton} ecosystem={ecosystem} />
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</TableContainer>
			</Grid>
		</Container>
	}

	const getButtons = () => {
		const navigateDashboard = () => {
			window.location.href = '#dashboard' // @todo
		}

		return <Grid container spacing={4} justifyContent="center" alignItems="center">
			<Grid>
				<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.ExtraLargeButton} ecosystem={ecosystem} />
			</Grid>
			<Grid>
				<Button variant="outlined" color="secondary" size="large" style={{ fontSize: '1.1rem' }} onClick={navigateDashboard}>

					<Grid container alignItems="center">
						<Grid>
							Validator Dashboard
						</Grid>
					</Grid>
				</Button>
			</Grid>
		</Grid>
	}

	return <>
		<Box mt={8}>
			<Box py={6}>
				<Container>
					{getButtons()}
					{getFeaturePoints()}
				</Container>
			</Box>

			<Box mb={12}>
				<Box my={9}>
					<Typography component="div" variant="h4" color="textPrimary" align="center">
						Our On-Chain Utility Tokens {isArbitrumMainnet ? 'on L2' : ''}
					</Typography>
				</Box>

				<Box mx={3}>
					{getTokens()}
				</Box>
			</Box>

			<Box mb={12}>
				<Paper className={classes.paperBorders}>
					<Box py={3}>
						<Container>
							<Box my={6}>
								{getSocialPoints()}
							</Box>
						</Container>
					</Box>
				</Paper>
			</Box>

		</Box>
		<FooterFragment ecosystem={ecosystem} />
	</>

})

interface Props {
}
const TokenPage: React.FC<Props> = ({ }) => {
	const { state: web3State, dispatch } = useContext(Web3Context)
	const { ecosystem } = web3State

	return <Render
		dispatch={dispatch}
		ecosystem={ecosystem}
	/>
}

export default TokenPage
