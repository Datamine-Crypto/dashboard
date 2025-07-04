import { Box, Container, Paper, Accordion, AccordionSummary, AccordionDetails, Typography, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useContext } from 'react';

import { theme as datamineTheme } from '../../../styles';

import { SearchCategory, SearchCategoryText, SearchCategoryTextL2 } from '../../../helpArticles';
import { useWeb3Context } from '../../../web3/Web3Context';
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
	const { state: web3State, dispatch } = useWeb3Context();
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
						{/* Two-column layout for larger screens */}
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, md: 6 }}>
								{Object.keys(SearchCategory)
									.slice(0, Math.ceil(Object.keys(SearchCategory).length / 2))
									.map((categoryKey, index) => (
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
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								{Object.keys(SearchCategory)
									.slice(Math.ceil(Object.keys(SearchCategory).length / 2))
									.map((categoryKey, index) => (
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
							</Grid>
						</Grid>
					</Container>
				</Box>
			</Paper>

			<HelpPageFooterSection ecosystem={ecosystem} />

			<FooterFragment ecosystem={ecosystem} />
		</>
	);
};

export default HelpPage;
