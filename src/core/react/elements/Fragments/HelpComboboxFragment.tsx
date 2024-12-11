import { Autocomplete, TextField } from '@mui/material';
import React, { useContext } from "react";
import { NetworkType } from "../../../../configs/config.common";
import { HelpArticle, SearchCategoryText, SearchCategoryTextL2 } from "../../../helpArticles";
import { Web3Context } from "../../../web3/Web3Context";
import { commonLanguage } from "../../../web3/web3Reducer";

import { makeStyles } from '@mui/styles';
import { DatamineTheme } from "../../../styles";

const useStyles = makeStyles<DatamineTheme>((theme: any) => ({
	big: {
		width: '100%'
	},
	small: {
		width: '100%'
	}
}));

interface RenderProps {
	isBigSearch?: boolean;
	id: string;
	searchQuery: string;
	dispatch: React.Dispatch<any>;
	helpArticles: HelpArticle[];
	helpArticlesNetworkType: NetworkType;
}

const Render: React.FC<RenderProps> = React.memo(({ id, isBigSearch, searchQuery, dispatch, helpArticles, helpArticlesNetworkType }) => {

	const classes = useStyles();

	const filterOptions = (options: any, { inputValue }: any) => options
	const onChange = (event: any, helpArticle: HelpArticle) => {
		dispatch({ type: commonLanguage.commands.ShowHelpArticle, payload: { helpArticle } })
	}

	return <Autocomplete
		id={id}
		size={isBigSearch ? 'medium' : 'small'}
		className={isBigSearch ? classes.big : classes.small}
		options={helpArticles}

		getOptionLabel={(option) => {
			switch (helpArticlesNetworkType) {
				case NetworkType.Arbitrum:
					if (option.titleL2) {
						return option.titleL2
					}
			}

			return option.title

		}}
		filterOptions={filterOptions}
		groupBy={option => {
			switch (helpArticlesNetworkType) {
				case NetworkType.Arbitrum:
					return SearchCategoryTextL2[option.category]
			}

			return SearchCategoryText[option.category]
		}}
		onChange={onChange as any}
		inputValue={searchQuery}
		renderInput={(params) => <TextField {...params}
			//label="Search Help Articles (ex: How To Mint FLUX) ..."
			placeholder={isBigSearch ? 'Search Help Articles ...' : 'Search Help Articles ...'}
			//value={searchQuery}
			onChange={e => dispatch({ type: commonLanguage.commands.SetSearch, payload: (e.target as any).value })}
			autoComplete="off"
			autoFocus={isBigSearch}
			variant="outlined" />}
	/>
})




interface Props {
	id: string;
	isBigSearch?: boolean;
}
const HelpComboboxFragment: React.FC<Props> = ({ id, isBigSearch }) => {
	const { state: web3State, dispatch } = useContext(Web3Context)

	const { searchQuery, helpArticles, helpArticlesNetworkType } = web3State;

	return <Render
		id={id}
		searchQuery={searchQuery}
		dispatch={dispatch}
		helpArticles={helpArticles}
		isBigSearch={isBigSearch}
		helpArticlesNetworkType={helpArticlesNetworkType}
	/>
}

export default HelpComboboxFragment