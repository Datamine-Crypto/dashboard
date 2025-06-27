import { Box, List, ListItemButton, ListSubheader, Typography } from '@mui/material';
import React from 'react';

import { theme as datamineTheme } from '../../../styles';
import { NetworkType } from '../../../../configs/config.common';
import {
	HelpArticle,
	helpArticles,
	SearchCategory,
	SearchCategoryText,
	SearchCategoryTextL2,
} from '../../../helpArticles';
import { tss } from 'tss-react/mui';
import { commonLanguage } from '../../../web3/web3Reducer';

const useStyles = tss.create(() => ({
	helpCategoryHeader: {
		color: datamineTheme.classes.palette.highlight,
		background: 'none',
	},
}));

interface HelpArticleCategorySectionProps {
	dispatch: React.Dispatch<any>;
	helpArticlesNetworkType: NetworkType;
	categoryKey: string;
}

const HelpArticleCategorySection: React.FC<HelpArticleCategorySectionProps> = ({
	dispatch,
	helpArticlesNetworkType,
	categoryKey,
}) => {
	const { classes } = useStyles();
	const isArbitrumMainnet = helpArticlesNetworkType === NetworkType.Arbitrum;

	const getHelpListItems = () => {
		const matchingHelpArticles = helpArticles.filter((helpArticle) => helpArticle.category === categoryKey);

		return matchingHelpArticles.map((helpArticle: HelpArticle, index: number) => {
			const getTitle = () => {
				if (isArbitrumMainnet && !!helpArticle.titleL2) {
					return helpArticle.titleL2;
				}
				return helpArticle.title;
			};
			const title = getTitle();

			return (
				<ListItemButton
					component="a"
					key={index}
					onClick={() => dispatch({ type: commonLanguage.commands.ShowHelpArticle, payload: { helpArticle } })}
				>
					<Box pl={1}>• {title}</Box>
				</ListItemButton>
			);
		});
	};

	return <List>{getHelpListItems()}</List>;
};

export default HelpArticleCategorySection;
