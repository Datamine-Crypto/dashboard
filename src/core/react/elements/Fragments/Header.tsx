import { Box, Button, Card, CardActionArea, CardMedia, Container, ThemeProvider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React from 'react';

import ArrowRightIcon from '@mui/icons-material/PlayArrow';

import logo from '../../../../svgs/logo.svg';

import { tss } from 'tss-react/mui';
import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import { muiWhiteButtonsTheme } from '../../../styles';
import LightTooltip from '../../elements/LightTooltip';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from './ExploreLiquidityPools';


const useStyles = tss.create(({ theme }) => ({
	logoContainer: {
		[theme.breakpoints.down('sm')]: {
			flexGrow: '1',
			textAlign: 'center'
		},
	},
	title: {
		fontSize: '2.4rem !important',
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
		fontSize: '1.25rem !important',
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
	playIcon: {
		fontSize: 200,
		opacity: 0.2,
		marginLeft: -100,
		marginTop: -100
	},
	oldCoin: {
		width: 128,
		position: 'relative',
		left: 24
	},
	proofOfBurn: {
		color: '#0ff',
	},
}
));



interface Props {
	isSubPage: boolean;
	isVideoVisible?: boolean;
	ecosystem: Ecosystem;
}
const Header: React.FC<Props> = React.memo(({ isSubPage, isVideoVisible, ecosystem }) => {
	const { classes } = useStyles();

	const { isLiquidityPoolsEnabled, navigation, ecosystemName } = getEcosystemConfig(ecosystem)
	const { isHelpPageEnabled } = navigation

	const navigateDashboard = () => {
		window.location.href = '#dashboard' // @todo
	}

	const getLogo = () => {
		return <>
			<img src="./images/oldCoin.png" alt={ecosystemName} className={classes.oldCoin} />
			<img src={logo} alt={ecosystemName} style={{ width: '128px' }} />
		</>
	}

	const getArrow = () => {
		return <Box display="inline"><ArrowRightIcon fontSize="large" className={classes.arrow} /></Box>
	}
	const getTitle = () => {
		if (isSubPage) {
			return <Typography component="div" variant="h3" color="textPrimary" gutterBottom display="block" className={classes.title}>
				The MIT License {getArrow()}
			</Typography>
		}
		return <Typography component="div" variant="h3" color="textPrimary" gutterBottom display="block" className={classes.title}>
			Cryptocurrency backed by <span className={classes.proofOfBurn}>Proof of Burn</span> {/*getArrow()*/}
		</Typography>
	}

	const getSubHeader = () => {
		if (isSubPage) {
			return <Box mt={4}>

				<ThemeProvider theme={muiWhiteButtonsTheme}>
					<Box mt={3}>
						<Grid container spacing={3} justifyContent="center">
							<Grid>
								<Button variant="text" href="#" >
									Homepage
								</Button>
							</Grid>
							<Grid>
								<Button variant="text" href="#dashboard">
									Dashboard
								</Button>
							</Grid>
						</Grid>
					</Box>
				</ThemeProvider>
			</Box>
		}
		const getLiqudityPoolsButton = () => {
			if (!isLiquidityPoolsEnabled) {
				return null;
			}
			return <Grid>

				<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.ExtraLargeButton} ecosystem={ecosystem} />
			</Grid>
		}
		const getBottomButtons = () => {
			const getHelpButton = () => {
				if (!isHelpPageEnabled) {
					return null
				}
				return (<Grid>
					<Button variant="text" href="#help">
						Help &amp; Knowledgebase
					</Button>
				</Grid>)
			}
			return <Box mt={3}>
				<ThemeProvider theme={muiWhiteButtonsTheme}>
					<Grid container spacing={3} justifyContent="center">
						<Grid>
							<Button variant="text" href="https://github.com/DatamineGlobal/whitepaper/blob/d8b1e007f229878cba0a617398f3e1d40a3ea79a/Datamine.pdf" rel="noopener noreferrer" target="_blank">
								Economic Whitepaper
							</Button>
						</Grid>
						<Grid>
							<Button variant="text" href="https://github.com/Datamine-Crypto/white-paper/blob/master/docs/datamine-smart-contracts.md" rel="noopener noreferrer" target="_blank">
								Technical Whitepaper
							</Button>
						</Grid>
						{getHelpButton()}
						<Grid>
							<Button variant="text" href="https://github.com/Datamine-Crypto/white-paper/blob/master/audits/SlowMist%20-%20Smart%20Contract%20Security%20Audit%20Report%20-%20FluxToken.pdf" rel="noopener noreferrer" target="_blank">
								View Security Audit
							</Button>
						</Grid>
					</Grid>
				</ThemeProvider>
			</Box>
		}
		return <Box mt={4}>
			<Grid container spacing={4} justifyContent="center" alignItems="center">
				{getLiqudityPoolsButton()}
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
			{getVideo()}
			{getBottomButtons()}
		</Box>
	}

	const getVideo = () => {
		if (!isVideoVisible) {
			return null;
		}

		return <Box mt={5} mb={3}><Grid container justifyContent="center">
			<Grid>
				<Box display="inline-block">
					<Card elevation={3} >
						<LightTooltip title={`Watch How ${ecosystemName} Ecosystem Works`} placement="top">
							<CardActionArea href="https://youtu.be/dsqz3XGx7RY" target="_blank" rel="noopener noreferrer">
								<CardMedia component="img" image="./images/videoSplash.png" style={{ maxWidth: 600 }} />
							</CardActionArea>
						</LightTooltip>
					</Card>
				</Box>
			</Grid>
		</Grid>
		</Box>
	}

	const defiTitle = `DeFi is an abbreviation of the phrase decentralized finance which generally refers to the digital assets and financial smart contracts, protocols, and decentralized applications (DApps) built on Ethereum. In simpler terms, it's financial software built on the blockchain that can be pieced together like Money Legos.`
	const getHeader = () => {
		return <>
			<Grid
				container
				spacing={4}
				justifyContent="center"
				alignItems="center">
				<Grid className={classes.logoContainer}>
					{getLogo()}
				</Grid>
				<Grid size={{ md: 8, lg: 8 }}>
					<Box>
						{getTitle()}
						<Typography component="div" variant="h5" align="left" color="textSecondary" paragraph className={classes.titleSlogan}>
							<Typography component="div" display="inline" variant="h5" color="textPrimary">Datamine FLUX</Typography>  is <LightTooltip title={defiTitle}><Box display="inline-block">DeFi's</Box></LightTooltip> first inflation-resistant currency built on Ethereum. Market equilibrium is established using a variation of Proof-of-Burn algorithm.<br />
						</Typography>
					</Box>
				</Grid>
			</Grid>


			{getSubHeader()}
		</>
	}

	return <>
		<Box mt={6} mb={6}>
			<Container>
				{getHeader()}
			</Container>
		</Box>
	</>
})

export default Header;