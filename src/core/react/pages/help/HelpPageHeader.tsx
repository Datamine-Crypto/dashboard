import { Box, Container, Typography } from '@mui/material';
import React from 'react';

import { Ecosystem } from '@/configs/config.common';

import { tss } from 'tss-react/mui';
const useStyles = tss.create(({ theme }) => ({
	titleSlogan: {
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
		},
	},
}));

interface HelpPageHeaderProps {
	dispatch: ReducerDispatch;
	ecosystem: Ecosystem;
}

const HelpPageHeader: React.FC<HelpPageHeaderProps> = ({ dispatch, ecosystem }) => {
	const { classes } = useStyles();

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
					</Typography>
				</Container>
			</Box>
		</Box>
	);
};

export default HelpPageHeader;
