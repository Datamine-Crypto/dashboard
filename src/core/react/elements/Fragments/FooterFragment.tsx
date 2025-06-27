import { Box, Container, Link, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';


import { tss } from 'tss-react/mui';
import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import { theme as datamineTheme } from '../../../styles';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from './ExploreLiquidityPools';

const useStyles = tss.create(({ theme }) => ({
	paperBottom: {
		borderTop: `1px solid ${datamineTheme.classes.palette.highlight}`,
	},
	gridContainer: {
		justifyContent: 'space-between',
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'center',
			textAlign: 'center',
			justifyContent: 'center',
		}
	}
}));

interface Props {
	ecosystem: Ecosystem;
}
const FooterFragment: React.FC<Props> = React.memo(({ ecosystem }) => {
	const { classes } = useStyles();
	const { navigation, isLiquidityPoolsEnabled } = getEcosystemConfig(ecosystem)
	const { isHelpPageEnabled } = navigation

	const getGridItem = () => {
		if (!isHelpPageEnabled) {
			return null;
		}
		return (
			<Grid>
				<Link underline="hover" href="#help" color="textSecondary">
					Help &amp; Knowledgebase
				</Link>
			</Grid>
		)
	}

	const getLiquidityPoolsGrimItem = () => {
		if (!isLiquidityPoolsEnabled) {
			return null
		}
		return (
			<Grid>
				<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.SmallText} ecosystem={ecosystem} />
			</Grid>
		)
	}

	return <>
		<Paper className={classes.paperBottom}>
			<Box py={3}>
				<Container>
					<Box>
						<Grid container spacing={3} className={classes.gridContainer}>
							<Grid>
								<Grid container spacing={3} justifyContent="center" direction="column">
									{getGridItem()}
									<Grid>
										<Link underline="hover" href="https://github.com/DatamineGlobal/whitepaper/blob/d8b1e007f229878cba0a617398f3e1d40a3ea79a/Datamine.pdf" rel="noopener noreferrer" target="_blank" color="textSecondary">
											Economic Whitepaper
										</Link>
									</Grid>
									<Grid>
										<Link underline="hover" href="https://github.com/Datamine-Crypto/white-paper/blob/master/docs/datamine-smart-contracts.md" rel="noopener noreferrer" target="_blank" color="textSecondary">
											Technical Whitepaper
										</Link>
									</Grid>
								</Grid>
							</Grid>
							<Grid>
								<Grid container spacing={3} justifyContent="center" direction="column">
									<Grid>
										<Link underline="hover" href="#dashboard" color="textSecondary">
											Liquidity Dashboard
										</Link>
									</Grid>
								</Grid>
							</Grid>
							<Grid>
								<Grid container spacing={3} justifyContent="center" direction="column">
									{getLiquidityPoolsGrimItem()}
									<Grid>
										<Link underline="hover" href="https://github.com/Datamine-Crypto/white-paper/blob/master/audits/SlowMist%20-%20Smart%20Contract%20Security%20Audit%20Report%20-%20FluxToken.pdf" rel="noopener noreferrer" target="_blank" color="textSecondary">
											View Security Audit
										</Link>
									</Grid>
									<Grid>
										<Link underline="hover" href={`#terms`} color="textSecondary">
											MIT License
										</Link>
									</Grid>
								</Grid>
							</Grid>
						</Grid></Box>
				</Container>
			</Box>
		</Paper>
	</>
})

export default FooterFragment;