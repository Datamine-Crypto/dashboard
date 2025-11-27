import { Autocomplete, TextField } from '@mui/material';
import React from 'react';
import { HelpArticle, SearchCategoryText } from '@/app/helpArticles';
import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';
import { tss } from 'tss-react/mui';
import { useShallow } from 'zustand/react/shallow';

const useStyles = tss.create(({ theme }) => ({
	big: {
		width: '100%',
	},
	small: {
		width: '100%',
	},
}));

interface Props {
	id: string;
	isBigSearch?: boolean;
}
const HelpComboboxFragment: React.FC<Props> = ({ id, isBigSearch }) => {
	const { classes } = useStyles();
	const { searchQuery, helpArticles } = useAppStore(
		useShallow((state) => ({
			searchQuery: state.searchQuery,
			helpArticles: state.helpArticles,
		}))
	);

	const filterOptions = (options: any, { inputValue }: any) => options;
	const onChange = (event: any, helpArticle: HelpArticle) => {
		appDispatch({ type: commonLanguage.commands.ShowHelpArticle, payload: { helpArticle } });
	};

	return (
		<Autocomplete
			id={id}
			size={isBigSearch ? 'medium' : 'small'}
			className={isBigSearch ? classes.big : classes.small}
			options={helpArticles}
			noOptionsText="Type to search help articles..."
			getOptionLabel={(option) => {
				return option.title;
			}}
			filterOptions={filterOptions}
			groupBy={(option) => {
				return SearchCategoryText[option.category];
			}}
			onChange={onChange as any}
			inputValue={searchQuery}
			renderInput={(params) => (
				<TextField
					{...params}
					//label="Search Help Articles (ex: How To Mint FLUX) ..."
					placeholder={isBigSearch ? 'Search Help Articles ...' : 'Search Help Articles ...'}
					//value={searchQuery}
					onChange={(e) => appDispatch({ type: commonLanguage.commands.SetSearch, payload: (e.target as any).value })}
					autoComplete="off"
					autoFocus={isBigSearch}
					variant="outlined"
				/>
			)}
		/>
	);
};
export default HelpComboboxFragment;
