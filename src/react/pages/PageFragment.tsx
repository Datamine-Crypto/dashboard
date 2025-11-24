import { Box } from '@mui/material';
import React, { lazy, Suspense, useEffect } from 'react';
import { tss } from 'tss-react/mui';

import { Ecosystem, NetworkType } from '@/app/configs/config.common';
import { HelpArticle, helpArticles } from '@/app/helpArticles';
import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';
import LoadingDialog from '@/react/elements/Dialogs/LoadingDialog';
import CenteredLoading from '@/react/elements/Fragments/CenteredLoading';
import DialogsFragment from '@/react/elements/Fragments/DialogsFragment';
import PendingQueryFragment from '@/react/elements/Fragments/PendingQueryFragment';
import RealtimeRewardsGameFiPage from '@/react/pages/RealtimeRewardsGameFiPage';
import HodlClickerRushGameFiPage from '@/react/pages/HodlClickerRushGameFiPage';
import { useShallow } from 'zustand/react/shallow';
import { ReducerDispatch } from '@/utils/reducer/sideEffectReducer';
import { Page, getPageDetails, useRouter } from '@/react/utils/router';
const MainAppBar = lazy(() => import('@/react/elements/Fragments/AppBar'));
const HelpDialog = lazy(() => import('@/react/elements/Dialogs/HelpDialog'));
const CommunityPage = lazy(() => import('@/react/pages/CommunityPage'));
const HelpPage = lazy(() => import('@/react/pages/help/HelpPage'));
const OnboardingPage = lazy(() => import('@/react/pages/OnboardingPage'));
const Terms = lazy(() => import('@/react/pages/Terms'));
const TokenPage = lazy(() => import('@/react/pages/TokenPage'));
const MainDrawer = lazy(() =>
	import('@/react/elements/Fragments/Drawer').then((module) => ({ default: module.MainDrawer }))
);
const DashboardPage = lazy(() => import('@/react/pages/DashboardPage'));
const HomePage = lazy(() => import('@/react/pages/HomePage'));
interface RenderParams {
	dispatch: ReducerDispatch;
	helpArticle: HelpArticle | null;
	helpArticlesNetworkType: NetworkType;
	ecosystem: Ecosystem;
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
		justifyContent: 'space-between',
	},
}));

/**
 * A memoized functional component that renders the main page content based on the current route.
 * It also manages global dialogs and pending queries.
 * @param params - Object containing dispatch function, helpArticle, helpArticlesNetworkType, and ecosystem.
 */
const Render: React.FC<RenderParams> = React.memo(({ dispatch, helpArticle, helpArticlesNetworkType, ecosystem }) => {
	const { classes } = useStyles();

	const count = useRouter(dispatch, ecosystem);
	/**
	 * Renders the appropriate page component based on the current route.
	 * @returns The React component for the current page.
	 */
	const getPage = () => {
		const pageDetails = getPageDetails();
		switch (pageDetails.page) {
			case Page.Dashboard:
				return <DashboardPage address={pageDetails.address as string | null} />;
			case Page.Help:
				return <HelpPage />;
			case Page.Community:
				return <CommunityPage />;
			case Page.Terms:
				return <Terms ecosystem={ecosystem} />;
			case Page.TokenPage:
				return <TokenPage />;
			case Page.Onboarding:
				return <OnboardingPage />;
			case Page.RealtimeRewardsGameFi:
				return <RealtimeRewardsGameFiPage />;
			case Page.HodlClickerRushGameFiPage:
				return <HodlClickerRushGameFiPage />;
		}
		return <HomePage ecosystem={ecosystem} />;
	};
	/**
	 * Renders the main application bar.
	 * @returns The MainAppBar component.
	 */
	const getAppBar = () => {
		return (
			<Box>
				<MainAppBar sidebar={false} />
			</Box>
		);
	};
	/**
	 * Conditionally renders the HelpDialog component if a help article is selected.
	 * @returns The HelpDialog component or null.
	 */
	const getHelpDialog = () => {
		if (!helpArticle) {
			return null;
		}
		//@todo helpArticle/helpArticlesNetworkType should be contained inside HelpDialog and get it's own state (instead of doing it here)
		//Check out TradeDialog for an example
		return <HelpDialog helpArticle={helpArticle} />;
	};
	/**
	 * Renders the DialogsFragment component, which manages various application dialogs.
	 * @returns The DialogsFragment component.
	 */
	const getDialog = () => {
		return <DialogsFragment />;
	};
	/**
	 * Renders the PendingQueryFragment component, which displays pending blockchain transactions.
	 * @returns The PendingQueryFragment component.
	 */
	const getPendingQueries = () => {
		return <PendingQueryFragment />;
	};
	return (
		<>
			<Box className={classes.pageContainer}>
				{getAppBar()}
				<MainDrawer />
				<Box className={classes.contentContainer}>
					<Suspense fallback={<CenteredLoading />}>
						<Suspense fallback={<LoadingDialog />}>
							{getHelpDialog()}
							{getDialog()}
							{getPendingQueries()}
						</Suspense>
						{getPage()}
					</Suspense>
				</Box>
			</Box>
		</>
	);
});
/**
 * This fragment contains all the pages (such as dashboard, help, homepage)
 * It is always rendered at <App /> level
 * Please note that this also contains
 * - Help dialog
 * - Dialogs
 * - Pending queries fragment
 */
const PageFragment: React.FC = () => {
	const { helpArticle, helpArticlesNetworkType, ecosystem } = useAppStore(
		useShallow((state) => ({
			helpArticle: state.helpArticle,
			helpArticlesNetworkType: state.helpArticlesNetworkType,
			ecosystem: state.ecosystem,
		}))
	);
	/**
	 * Effect hook to initialize special pages based on the URL hash when the component mounts.
	 * It dispatches actions to update the application state for pages like Dashboard and Help.
	 */
	useEffect(() => {
		const pageDetails = getPageDetails();
		// When the app starts initialize special pages
		switch (pageDetails.page) {
			case Page.Help: {
				const helpArticle = helpArticles.find(
					(helpArticle) => helpArticle.id.toLowerCase() === pageDetails.helpArticleId
				);
				if (helpArticle) {
					appDispatch({
						type: commonLanguage.commands.ShowHelpArticle,
						payload: {
							helpArticle,
						},
					});
				}
				break;
			}
		}
	}, [appDispatch]);
	return (
		<Render
			helpArticle={helpArticle}
			helpArticlesNetworkType={helpArticlesNetworkType}
			dispatch={appDispatch}
			ecosystem={ecosystem}
		/>
	);
};
export default PageFragment;
