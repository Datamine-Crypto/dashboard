import { useEffect, useState } from 'react';
import { commonLanguage } from '@/core/app/state/commonLanguage';
import { helpArticles } from '@/core/app/helpArticles';
import { ReducerDispatch } from '@/core/utils/reducer/sideEffectReducer';
import { getEcosystemConfig } from '@/core/app/configs/config';
import { Ecosystem } from '@/core/app/configs/config.common';

export enum Page {
	Dashboard,
	Terms,
	HomePage,
	Help,
	Community,
	TokenPage,
	Onboarding,
	RealtimeRewardsGameFi,
	HodlClickerRushGameFiPage,
}

/**
 * Determines the current page and any associated parameters based on the URL hash.
 * @returns An object containing the current page enum and any relevant parameters (e.g., address, helpArticleId).
 */
export const getPageDetails = () => {
	const path = window.location.hash.toLowerCase().replace('#', '');
	//const path = window.location.pathname.toLowerCase().replace(/^\//, '');

	if (path === 'dashboard' || path.indexOf('dashboard/') === 0) {
		const getAddress = () => {
			const route = path.split('/');
			if (route.length === 2 && !!route[1]) {
				return route[1];
			}
			return null;
		};
		const address = getAddress();
		return {
			page: Page.Dashboard,
			address,
		};
	}

	if (path === 'terms' || path.indexOf('terms/') === 0) {
		return {
			page: Page.Terms,
		};
	}

	if (path === 'token/flux' || path === 'about') {
		return {
			page: Page.TokenPage,
			isArbitrumMainnet: false,
		};
	}

	if (path === 'token/arbiflux') {
		return {
			page: Page.TokenPage,
			isArbitrumMainnet: true,
		};
	}

	if (path === 'onboarding') {
		return {
			page: Page.Onboarding,
		};
	}

	if (path === 'gamefi') {
		return {
			page: Page.RealtimeRewardsGameFi,
		};
	}

	if (path === 'gamefi-hodlclicker') {
		return {
			page: Page.HodlClickerRushGameFiPage,
		};
	}

	if (path === 'help' || path.indexOf('help/') === 0) {
		const getHelpArticleId = () => {
			if (path.indexOf('help/') === 0) {
				const helpPath = path.split('/');
				helpPath.shift();
				return helpPath.join('/');
			}
			return null;
		};
		const helpArticleId = getHelpArticleId();
		return {
			page: Page.Help,
			helpArticleId,
		};
	}

	if (path === 'community' || path.indexOf('community/') === 0) {
		return {
			page: Page.Community,
		};
	}

	return {
		page: Page.HomePage,
	};
};

/**
 * Custom hook to handle routing based on URL hash changes.
 * @param dispatch - The reducer dispatch function to update application state.
 * @param ecosystem - The current ecosystem to determine title settings.
 */
export const useRouter = (dispatch: ReducerDispatch, ecosystem: Ecosystem) => {
	const [count, setCount] = useState(0);
	const { ecosystemName, mintableTokenShortName, ecosystemSlogan } = getEcosystemConfig(ecosystem);

	useEffect(() => {
		const onHashChanged = () => {
			window.scrollTo(0, 0);
			setCount((count) => count + 1); // Allows to refresh element when hash changes
			const pageDetails = getPageDetails();

			// Set document title
			switch (pageDetails.page) {
				case Page.Dashboard:
					document.title = `${pageDetails.address ? pageDetails.address : 'Dashboard'} - ${ecosystemSlogan} - ${ecosystemName}`;
					break;
				case Page.Help:
					document.title = `Help & Knowledgebase - ${ecosystemName}`;
					break;
				case Page.Community:
					document.title = `Community - ${ecosystemName}`;
					break;
				case Page.Terms:
					document.title = `MIT License - ${ecosystemSlogan} - ${ecosystemName}`;
					break;
				case Page.TokenPage:
					document.title = `${mintableTokenShortName} Ecosystem - ${ecosystemName}`;
					break;
				case Page.Onboarding:
					document.title = `Get Started - ${ecosystemName}`;
					break;
				case Page.RealtimeRewardsGameFi:
					document.title = `Get Started - ${ecosystemName}`;
					break;
				case Page.HodlClickerRushGameFiPage:
					document.title = `Get Started - ${ecosystemName}`;
					break;
				default:
					document.title = `${ecosystemSlogan} - ${ecosystemName}`;
					break;
			}

			switch (pageDetails.page) {
				case Page.Dashboard:
					dispatch({
						type: commonLanguage.commands.UpdateAddress,
						payload: {
							address: pageDetails.address,
						},
					});
					break;
				case Page.Help: {
					const helpArticle = helpArticles.find(
						(helpArticle) => helpArticle.id.toLowerCase() === pageDetails.helpArticleId
					);
					if (helpArticle) {
						dispatch({
							type: commonLanguage.commands.ShowHelpArticle,
							payload: {
								helpArticle,
							},
						});
					}
					break;
				}
			}
		};
		window.addEventListener('hashchange', onHashChanged);

		// Trigger initial hash change handling
		onHashChanged();

		return () => window.removeEventListener('hashchange', onHashChanged);
	}, [dispatch, ecosystem, ecosystemName, mintableTokenShortName, ecosystemSlogan]);

	return count;
};
