import { Box, Container, Paper, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid';
import React, { useContext } from 'react';

import { theme as datamineTheme } from '../../../styles';

import { SearchCategory, SearchCategoryText, SearchCategoryTextL2 } from '../../../helpArticles';
import { Web3Context } from '../../../web3/Web3Context';
import FooterFragment from '../../elements/Fragments/FooterFragment';
import HelpComboboxFragment from '../../elements/Fragments/HelpComboboxFragment';

import { tss } from 'tss-react/mui';
import HelpArticleCategorySection from './HelpArticleCategorySection';
import HelpPageFooterSection from './HelpPageFooterSection';
import HelpPageHeader from './HelpPageHeader';
import { NetworkType } from '../../../../configs/config.common';

const useStyles = tss.create(() => ({
	paperBorders: {
		borderTop: `1px solid ${datamineTheme.classes.palette.highlight}`,
		borderBottom: `1px solid ${datamineTheme.classes.palette.highlight}`,
	},
}));

interface Props {}

/**
 * HelpPage component that displays a knowledge base of help articles.
 * It allows users to browse articles by category and switch between network-specific content.
 * @param props - Component props (currently empty).
 */
const HelpPage: React.FC<Props> = () => {
	const { classes } = useStyles();
	const { state: web3State, dispatch } = useContext(Web3Context);
	const { helpArticlesNetworkType, ecosystem } = web3State;

	return (
		<>
			<HelpPageHeader dispatch={dispatch} helpArticlesNetworkType={helpArticlesNetworkType} ecosystem={ecosystem} />

			<Paper className={classes.paperBorders}>
				<Box py={6}>
					<Container>
						<Box mb={3}>
							<HelpComboboxFragment id="main-search" isBigSearch={true} />
						</Box>
						{Object.keys(SearchCategory).map((categoryKey, index) => (
							<Accordion key={index} defaultExpanded={true}>
								<AccordionSummary expandIcon={<ExpandMoreIcon />}>
									<Typography variant="h6">
										{helpArticlesNetworkType === NetworkType.Arbitrum
											? SearchCategoryTextL2[categoryKey as keyof typeof SearchCategoryTextL2]
											: SearchCategoryText[categoryKey as keyof typeof SearchCategoryText]}
									</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<HelpArticleCategorySection
										dispatch={dispatch}
										helpArticlesNetworkType={helpArticlesNetworkType}
										categoryKey={categoryKey}
									/>
								</AccordionDetails>
							</Accordion>
						))}
					</Container>
				</Box>
			</Paper>

			<HelpPageFooterSection ecosystem={ecosystem} />

			<FooterFragment ecosystem={ecosystem} />
		</>
	);
};

export default HelpPage;
