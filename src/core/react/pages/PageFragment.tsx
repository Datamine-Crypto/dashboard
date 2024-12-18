import { Box } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { tss } from 'tss-react/mui';
import { getEcosystemConfig } from '../../../configs/config';
import { Ecosystem, NetworkType } from '../../../configs/config.common';
import { HelpArticle, helpArticles } from '../../helpArticles';
import { Web3Context } from '../../web3/Web3Context';
import { commonLanguage } from '../../web3/web3Reducer';
import HelpDialog from '../elements/Dialogs/HelpDialog';
import MainAppBar from '../elements/Fragments/AppBar';
import { MainDrawer } from '../elements/Fragments/Drawer';
import CommunityPage from './CommunityPage';
import DashboardPage from './DashboardPage';
import HelpPage from './HelpPage';
import HomePage from './HomePage';
import Terms from './Terms';
import TokenPage from './TokenPage';

interface RenderParams {
	dispatch: React.Dispatch<any>;
	helpArticle: HelpArticle | null;
	helpArticlesNetworkType: NetworkType;
	ecosystem: Ecosystem;
}

enum Page {
	Dashboard,
	Terms,
	HomePage,
	Help,
	Community,
	TokenPage
}
const useStyles = tss.create(({ theme }) => ({
	pageContainer: {
		display: 'flex',
		//height: '100vh',
	},
	contentContainer: {
		flex: 1,
		/*overflow: 'auto',*/
		width: '100vw',
		minHeight: '100vh',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between'
	}
}));

const getPageDetails = () => {
	const path = window.location.hash.toLowerCase().replace('#', '');
	//const path = window.location.pathname.toLowerCase().replace(/^\//, '');

	if (path === 'dashboard' || path.indexOf('dashboard/') === 0) {
		const getAddress = () => {
			const route = path.split('/')
			if (route.length === 2 && !!route[1]) {
				return route[1];
			}

			return null;
		}
		const address = getAddress();

		return {
			page: Page.Dashboard,
			address
		}
	}
	if (path === 'terms' || path.indexOf('terms/') === 0) {
		return {
			page: Page.Terms
		}
	}
	if (path === 'token/flux') {
		return {
			page: Page.TokenPage,
			isArbitrumMainnet: false
		}
	}
	if (path === 'token/arbiflux') {
		return {
			page: Page.TokenPage,
			isArbitrumMainnet: true
		}
	}



	if (path === 'help' || path.indexOf('help/') === 0) {
		const getHelpArticleId = () => {
			if (path.indexOf('help/') === 0) {
				const helpPath = path.split('/');
				helpPath.shift();

				return helpPath.join('/');
			}

			return null;
		}
		const helpArticleId = getHelpArticleId();

		return {
			page: Page.Help,
			helpArticleId
		}
	}
	if (path === 'community' || path.indexOf('community/') === 0) {
		return {
			page: Page.Community
		}
	}

	return {
		page: Page.HomePage
	}
}

const Render: React.FC<RenderParams> = React.memo(({ dispatch, helpArticle, helpArticlesNetworkType, ecosystem }) => {
	const { classes } = useStyles();

	const { ecosystemName, mintableTokenShortName, ecosystemSlogan } = getEcosystemConfig(ecosystem)

	const [count, setCount] = useState(0);
	useEffect(() => {
		const onHashChanged = () => {
			window.scrollTo(0, 0)
			setCount(count => count + 1); // Allows to refresh element when hash changes

			const pageDetails = getPageDetails();

			switch (pageDetails.page) {
				case Page.Dashboard:
					dispatch({
						type: commonLanguage.commands.UpdateAddress, payload: {
							address: pageDetails.address
						}
					});
					break;
				case Page.Help:
					const helpArticle = helpArticles.find(helpArticle => helpArticle.id.toLowerCase() === pageDetails.helpArticleId);

					if (helpArticle) {
						dispatch({
							type: commonLanguage.commands.ShowHelpArticle, payload: {
								helpArticle
							}
						});
					}
					break;
			}
		}

		window.addEventListener('hashchange', onHashChanged)
		return () => window.removeEventListener('hashchange', onHashChanged)
	}, [])

	const getPage = () => {
		const pageDetails = getPageDetails();

		switch (pageDetails.page) {
			case Page.Dashboard:
				document.title = `${pageDetails.address ? pageDetails.address : 'Dashboard'} - ${ecosystemSlogan} - ${ecosystemName}`;

				return <DashboardPage address={pageDetails.address as string | null} />
			case Page.Help:
				document.title = `Help & Knowledgebase - ${ecosystemName}`;
				return <HelpPage />
			case Page.Community:
				document.title = `Community - ${ecosystemName}`;
				return <CommunityPage />
			case Page.Terms:
				document.title = `MIT License - ${ecosystemSlogan} - ${ecosystemName}`;
				return <Terms ecosystem={ecosystem} />
			case Page.TokenPage:
				document.title = `${mintableTokenShortName} Ecosystem - ${ecosystemName}`;
				return <TokenPage />
		}

		document.title = `${ecosystemSlogan} - ${ecosystemName}`;
		return <HomePage ecosystem={ecosystem} />
	}

	const getAppBar = () => {
		return <Box>
			<MainAppBar sidebar={false} />
		</Box>
	}

	const getHelpDialog = () => {
		if (!helpArticle) {
			return null;
		}

		return <HelpDialog helpArticle={helpArticle} helpArticlesNetworkType={helpArticlesNetworkType} />
	}
	return <>
		<Box className={classes.pageContainer}>

			{getAppBar()}
			<MainDrawer />
			<Box className={classes.contentContainer}>
				{getHelpDialog()}

				{getPage()}
			</Box>
		</Box>

	</>
})
const PageFragment: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	useEffect(() => {

		const pageDetails = getPageDetails();
		// When the app starts initialize special pages
		switch (pageDetails.page) {
			case Page.Help:
				const helpArticle = helpArticles.find(helpArticle => helpArticle.id.toLowerCase() === pageDetails.helpArticleId);

				if (helpArticle) {
					web3Dispatch({
						type: commonLanguage.commands.ShowHelpArticle, payload: {
							helpArticle
						}
					});
				}
				break;
		}

	}, [web3Dispatch]);

	const { helpArticle, helpArticlesNetworkType, ecosystem } = web3State;

	return <Render
		helpArticle={helpArticle}
		helpArticlesNetworkType={helpArticlesNetworkType}
		dispatch={web3Dispatch}
		ecosystem={ecosystem}
	/>
}

export default PageFragment;