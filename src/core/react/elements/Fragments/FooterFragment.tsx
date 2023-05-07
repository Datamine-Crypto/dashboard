import React from 'react';
import { Box, Container, Grid, makeStyles, Paper, Link } from '@material-ui/core';

import { theme } from '../../../styles'
import { getConfig } from '../../../../config';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from './ExploreLiquidityPools';

const useStyles = makeStyles(() => ({
	paperBottom: {
		borderTop: `1px solid ${theme.classes.palette.highlight}`,
	},
}));

const FooterFragment: React.FC = React.memo(() => {
	const classes = useStyles();
	const { navigation, isLiquidityPoolsEnabled } = getConfig()
	const { isHelpPageEnabled } = navigation

	const getGridItem = () => {
		if (!isHelpPageEnabled) {
			return null;
		}
		return (
			<Grid item>
				<Link href="#help" color="textSecondary">
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
			<Grid item>
				<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.SmallText} />
			</Grid>
		)
	}

	return <>
		<Paper className={classes.paperBottom}>
			<Box py={3}>
				<Container>
					<Box>
						<Grid container spacing={3} justify="space-between">
							<Grid item>
								<Grid container spacing={3} justify="center" direction="column">
									{getGridItem()}
									<Grid item>
										<Link href="https://github.com/DatamineGlobal/whitepaper/blob/d8b1e007f229878cba0a617398f3e1d40a3ea79a/Datamine.pdf" rel="noopener noreferrer" target="_blank" color="textSecondary">
											Economic Whitepaper
										</Link>
									</Grid>
									<Grid item>
										<Link href="https://github.com/Datamine-Crypto/white-paper/blob/master/docs/datamine-smart-contracts.md" rel="noopener noreferrer" target="_blank" color="textSecondary">
											Technical Whitepaper
										</Link>
									</Grid>
								</Grid>
							</Grid>
							<Grid item>
								<Grid container spacing={3} justify="center" direction="column">
									<Grid item>
										<Link href="#dashboard" color="textSecondary">
											Validator Dashboard
										</Link>
									</Grid>
								</Grid>
							</Grid>
							<Grid item>
								<Grid container spacing={3} justify="center" direction="column">
									{getLiquidityPoolsGrimItem()}
									<Grid item>
										<Link href="https://github.com/Datamine-Crypto/white-paper/blob/master/audits/SlowMist%20-%20Smart%20Contract%20Security%20Audit%20Report%20-%20FluxToken.pdf" rel="noopener noreferrer" target="_blank" color="textSecondary">
											View Security Audit
										</Link>
									</Grid>
									<Grid item>
										<Link href={`#terms`} color="textSecondary">
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