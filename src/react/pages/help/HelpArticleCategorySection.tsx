import { Box, List, ListItemButton } from '@mui/material';
import React from 'react';

import { theme as datamineTheme } from '@/react/styles';
import { HelpArticle } from '@/app/helpArticles';
import { tss } from 'tss-react/mui';
import { commonLanguage } from '@/app/state/commonLanguage';
import { ReducerDispatch } from '@/utils/reducer/sideEffectReducer';

const useStyles = tss.create(() => ({
	helpCategoryHeader: {
		color: datamineTheme.classes.palette.highlight,
		background: 'none',
	},
}));

interface HelpArticleCategorySectionProps {
	dispatch: ReducerDispatch;
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
