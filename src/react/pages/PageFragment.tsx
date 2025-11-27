import { Box } from '@mui/material';
import React, { lazy, Suspense } from 'react';
import { tss } from 'tss-react/mui';

import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import LoadingDialog from '@/react/elements/Dialogs/LoadingDialog';
import CenteredLoading from '@/react/elements/Fragments/CenteredLoading';
import DialogsFragment from '@/react/elements/Fragments/DialogsFragment';
import PendingQueryFragment from '@/react/elements/Fragments/PendingQueryFragment';

import { useShallow } from 'zustand/react/shallow';
import { Page, getPageDetails, useRouter } from '@/react/utils/router';
const MainAppBar = lazy(() => import('@/react/elements/Fragments/AppBar'));
const HelpDialog = lazy(() => import('@/react/elements/Dialogs/HelpDialog'));
const CommunityPage = lazy(() => import('@/react/pages/CommunityPage'));
const HelpPage = lazy(() => import('@/react/pages/help/HelpPage'));

const Terms = lazy(() => import('@/react/pages/Terms'));
const TokenPage = lazy(() => import('@/react/pages/TokenPage'));
const MainDrawer = lazy(() =>
	import('@/react/elements/Fragments/Drawer').then((module) => ({ default: module.MainDrawer }))
);
const DashboardPage = lazy(() => import('@/react/pages/DashboardPage'));
const HodlClickerPage = lazy(() => import('@/react/pages/HodlClickerPage'));
const HomePage = lazy(() => import('@/react/pages/HomePage'));
const RealtimeRewardsGameFiPage = lazy(() => import('@/react/pages/gamefi/RealtimeRewardsGameFiPage'));
const HodlClickerRushGameFiPage = lazy(() => import('@/react/pages/gamefi/HodlClickerRushGameFiPage'));

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
/**
 * This fragment contains all the pages (such as dashboard, help, homepage)
 * It is always rendered at <App /> level
 * Please note that this also contains
 * - Help dialog
 * - Dialogs
 * - Pending queries fragment
 */
const PageFragment: React.FC = () => {
	const { classes } = useStyles();
	const { helpArticle, helpArticlesNetworkType, ecosystem } = useAppStore(
		useShallow((state) => ({
			helpArticle: state.helpArticle,
			helpArticlesNetworkType: state.helpArticlesNetworkType,
			ecosystem: state.ecosystem,
		}))
	);

	const count = useRouter(appDispatch, ecosystem);
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

			case Page.RealtimeRewardsGameFi:
				return <RealtimeRewardsGameFiPage />;
			case Page.HodlClickerRushGameFiPage:
				return <HodlClickerRushGameFiPage />;
			case Page.HodlClicker:
				return <HodlClickerPage />;
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
};
export default PageFragment;
