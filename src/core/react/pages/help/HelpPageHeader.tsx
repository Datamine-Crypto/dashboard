import { Box, Container, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';

import { Ecosystem, NetworkType } from '../../../../configs/config.common';
import { getEcosystemConfig } from '../../../../configs/config';
import ArbitrumLogo from '../../../../svgs/arbitrum.svg';
import EthereumPurpleLogo from '../../../../svgs/ethereumPurple.svg';

import { tss } from 'tss-react/mui';
import { commonLanguage } from '../../../web3/web3Reducer';
const useStyles = tss.create(({ theme }) => ({
	titleSlogan: {
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
		},
	},
}));

interface HelpPageHeaderProps {
	dispatch: React.Dispatch<any>;
	helpArticlesNetworkType: NetworkType;
	ecosystem: Ecosystem;
}

const HelpPageHeader: React.FC<HelpPageHeaderProps> = ({ dispatch, helpArticlesNetworkType, ecosystem }) => {
	const { classes } = useStyles();
	const { isArbitrumOnlyToken } = getEcosystemConfig(ecosystem);
	const isArbitrumMainnet = helpArticlesNetworkType === NetworkType.Arbitrum;

	const getHelpArticlesNetworkTypeDropdown = () => {
		if (isArbitrumOnlyToken) {
			return null;
		}

		return (
			<>
				<FormControl size="medium" variant="outlined" fullWidth>
					<InputLabel id="network-type">Select Your Ecosystem</InputLabel>
					<Select
						labelId="network-type"
						value={!isArbitrumMainnet ? NetworkType.Mainnet : NetworkType.Arbitrum}
						onChange={(e) => {
							dispatch({ type: commonLanguage.commands.SetHelpArticlesNetworkType, payload: e.target.value });
						}}
						label="Select Your Ecosystem"
					>
						<MenuItem value={NetworkType.Mainnet}>
							<Grid container direction="row" justifyContent="flex-start" alignItems="center">
								<Grid style={{ lineHeight: 0 }}>
									<Box mr={1}>
										<img src={EthereumPurpleLogo} width="24" height="24" />
									</Box>
								</Grid>
								<Grid>FLUX - Ethereum (L1)</Grid>
							</Grid>
						</MenuItem>
						<MenuItem value={NetworkType.Arbitrum}>
							<Grid container direction="row" justifyContent="flex-start" alignItems="center">
								<Grid style={{ lineHeight: 0 }}>
									<Box mr={1}>
										<img src={ArbitrumLogo} width="24" height="24" />
									</Box>
								</Grid>
								<Grid>ArbiFLUX - Arbitrum (L2)</Grid>
							</Grid>
						</MenuItem>
					</Select>
				</FormControl>
			</>
		);
	};

	return (
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
							Datamine Instant &amp; Decentralized Helpdesk
						</Typography>
						<Typography component="div" display="inline" variant="h6" color="textPrimary">
							Gain access to entire Datamine Ecosystem knowledgebase in an instant. All help articles are self-contained
							in our decentralized builds and do not require any external server requests. Quickly Search through the
							entire knowledgebase or browse all articles below:
						</Typography>
						<Box mt={6}>{getHelpArticlesNetworkTypeDropdown()}</Box>
					</Typography>
				</Container>
			</Box>
		</Box>
	);
};

export default HelpPageHeader;
