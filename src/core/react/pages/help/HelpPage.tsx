import {
	Box,
	Container,
	Paper,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
	Grid,
	Chip,
	RadioGroup,
	Radio,
	FormControlLabel,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useState } from 'react';

import { theme as datamineTheme } from '@/core/styles';

import { SearchCategory, SearchCategoryText, UserTypeFilter, helpArticles, SearchTag } from '@/core/helpArticles';
import { useAppStore } from '@/core/web3/appStore';
import FooterFragment from '@/core/react/elements/Fragments/FooterFragment';
import HelpComboboxFragment from '@/core/react/elements/Fragments/HelpComboboxFragment';

import { tss } from 'tss-react/mui';
import HelpArticleCategorySection from '@/core/react/pages/help/HelpArticleCategorySection';
import HelpPageFooterSection from '@/core/react/pages/help/HelpPageFooterSection';
import HelpPageHeader from '@/core/react/pages/help/HelpPageHeader';

const useStyles = tss.create(() => ({
	paperBorders: {
		borderTop: `1px solid ${datamineTheme.classes.palette.highlight}`,
		borderBottom: `1px solid ${datamineTheme.classes.palette.highlight}`,
	},
}));

interface Props {}

/**
 * HelpPage component that displays a knowledge base of help articles.
 * It allows users to browse articles by category and filter by user type and tags.
 * @param props - Component props (currently empty).
 */
const HelpPage: React.FC<Props> = () => {
	const { classes } = useStyles();
	const { state: appState, dispatch } = useAppStore();
	const { ecosystem } = appState;

	const [selectedUserType, setSelectedUserType] = useState<UserTypeFilter>(UserTypeFilter.All);
	const [selectedTags, setSelectedTags] = useState<string[]>(['All']); // Changed to array

	const filteredHelpArticles = helpArticles.filter((article) => {
		const matchesUserType =
			selectedUserType === UserTypeFilter.All ||
			article.userType === selectedUserType ||
			article.userType === UserTypeFilter.All;
		const matchesTag =
			selectedTags.includes('All') ||
			(article.tags && selectedTags.some((tag) => article.tags.includes(tag as SearchTag)));
		return matchesUserType && matchesTag;
	});

	const categories = Object.keys(SearchCategory).filter((key) =>
		filteredHelpArticles.some((article) => article.category === key)
	);

	const allTags = Array.from(new Set(helpArticles.flatMap((article) => article.tags || [])));

	const firstHalfCategories = categories.slice(0, Math.ceil(categories.length / 2));
	const secondHalfCategories = categories.slice(Math.ceil(categories.length / 2));

	return (
		<>
			<HelpPageHeader dispatch={dispatch} ecosystem={ecosystem} />

			<Paper className={classes.paperBorders}>
				<Box py={6}>
					<Container>
						<Box mb={3}>
							<HelpComboboxFragment id="main-search" isBigSearch={true} />
						</Box>
						<Box mb={3}>
							<Typography variant="subtitle1" gutterBottom>
								Filter by User Type:
							</Typography>
							<RadioGroup
								row
								aria-labelledby="user-type-filter-label"
								name="user-type-filter-group"
								value={selectedUserType}
								onChange={(event) => setSelectedUserType(event.target.value as UserTypeFilter)}
							>
								<FormControlLabel
									value={UserTypeFilter.All}
									control={<Radio />}
									label="All Articles"
									icon={<PublicIcon />}
								/>
								<FormControlLabel
									value={UserTypeFilter.NewUser}
									control={<Radio />}
									label="New User"
									icon={<RocketLaunchIcon />}
								/>
								<FormControlLabel
									value={UserTypeFilter.ExistingUser}
									control={<Radio />}
									label="Existing User"
									icon={<AccountCircleIcon />}
								/>
							</RadioGroup>
						</Box>
						<Box mb={3}>
							<Typography variant="subtitle1" gutterBottom>
								Filter by Tag:
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								<Chip
									label="All Tags"
									clickable
									color={selectedTags.length === 0 || selectedTags.includes('All') ? 'primary' : 'default'}
									onClick={() => setSelectedTags(['All'])}
								/>
								{allTags.map((tag) => (
									<Chip
										key={tag}
										label={tag}
										clickable
										color={selectedTags.includes(tag) ? 'primary' : 'default'}
										onClick={() => {
											const newSelectedTags = selectedTags.includes(tag)
												? selectedTags.filter((t) => t !== tag)
												: [...selectedTags.filter((t) => t !== 'All'), tag]; // Remove 'All' if a specific tag is selected

											if (newSelectedTags.length === 0) {
												setSelectedTags(['All']); // If no tags are selected, default to "All Tags"
											} else {
												setSelectedTags(newSelectedTags);
											}
										}}
									/>
								))}
							</Box>
						</Box>
						{/* Two-column layout for larger screens */}
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, md: 6 }}>
								{firstHalfCategories.map((categoryKey, index) => (
									<Accordion key={index} defaultExpanded={true}>
										<AccordionSummary expandIcon={<ExpandMoreIcon />}>
											<Typography variant="h6">
												{SearchCategoryText[categoryKey as keyof typeof SearchCategoryText]}
											</Typography>
										</AccordionSummary>
										<AccordionDetails>
											<HelpArticleCategorySection
												dispatch={dispatch}
												categoryKey={categoryKey}
												filteredArticles={filteredHelpArticles.filter((article) => article.category === categoryKey)}
											/>
										</AccordionDetails>
									</Accordion>
								))}
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								{secondHalfCategories.map((categoryKey, index) => (
									<Accordion key={index} defaultExpanded={true}>
										<AccordionSummary expandIcon={<ExpandMoreIcon />}>
											<Typography variant="h6">
												{SearchCategoryText[categoryKey as keyof typeof SearchCategoryText]}
											</Typography>
										</AccordionSummary>
										<AccordionDetails>
											<HelpArticleCategorySection
												dispatch={dispatch}
												categoryKey={categoryKey}
												filteredArticles={filteredHelpArticles.filter((article) => article.category === categoryKey)}
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
