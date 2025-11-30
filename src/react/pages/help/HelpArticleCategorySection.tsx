import { Box, List, ListItemButton } from '@mui/material';
import React from 'react';

import { HelpArticle } from '@/app/helpArticles';
import { commonLanguage } from '@/app/state/commonLanguage';
import { ReducerDispatch } from '@/utils/reducer/sideEffectReducer';

interface HelpArticleCategorySectionProps {
	dispatch: ReducerDispatch;
	categoryKey: string;
	filteredArticles: HelpArticle[];
}

const HelpArticleCategorySection: React.FC<HelpArticleCategorySectionProps> = ({ dispatch, filteredArticles }) => {
	const getHelpListItems = () => {
		return filteredArticles.map((helpArticle: HelpArticle, index: number) => {
			return (
				<ListItemButton
					component="a"
					key={index}
					onClick={() => dispatch({ type: commonLanguage.commands.Help.ShowArticle, payload: { helpArticle } })}
				>
					<Box pl={1}>• {helpArticle.title}</Box>
				</ListItemButton>
			);
		});
	};

	return <List>{getHelpListItems()}</List>;
};

export default HelpArticleCategorySection;
