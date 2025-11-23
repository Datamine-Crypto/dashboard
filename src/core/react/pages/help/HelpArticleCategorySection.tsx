import { Box, List, ListItemButton } from '@mui/material';
import React from 'react';

import { theme as datamineTheme } from '@/core/styles';
import { HelpArticle } from '@/core/helpArticles';
import { tss } from 'tss-react/mui';
import { commonLanguage } from '@/core/web3/reducer/common';

const useStyles = tss.create(() => ({
	helpCategoryHeader: {
		color: datamineTheme.classes.palette.highlight,
		background: 'none',
	},
}));

interface HelpArticleCategorySectionProps {
	dispatch: React.Dispatch<any>;
	categoryKey: string;
	filteredArticles: HelpArticle[];
}

const HelpArticleCategorySection: React.FC<HelpArticleCategorySectionProps> = ({ dispatch, filteredArticles }) => {
	const { classes } = useStyles();

	const getHelpListItems = () => {
		return filteredArticles.map((helpArticle: HelpArticle, index: number) => {
			return (
				<ListItemButton
					component="a"
					key={index}
					onClick={() => dispatch({ type: commonLanguage.commands.ShowHelpArticle, payload: { helpArticle } })}
				>
					<Box pl={1}>• {helpArticle.title}</Box>
				</ListItemButton>
			);
		});
	};

	return <List>{getHelpListItems()}</List>;
};

export default HelpArticleCategorySection;
