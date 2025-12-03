import { AppState } from '@/app/state/initialState';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { HelpArticle } from '@/app/helpArticles';

export interface GetFullHelpArticle {
	helpArticle: HelpArticle;
}

export const getFullHelpArticle: QueryHandler<AppState> = async ({ query }) => {
	const { helpArticle } = query.payload as GetFullHelpArticle;

	if (!helpArticle.body) {
		const getHelpArticleMdPath = () => {
			return helpArticle.id;
		};
		const helpArticleMdPath = getHelpArticleMdPath();

		const helpArticlePath = `helpArticles/${helpArticleMdPath}.md`;
		const response = await fetch(helpArticlePath);

		if (response.ok) {
			const fileContent: string = await response.text();
			helpArticle.body = fileContent;
		}
	}

	return helpArticle;
};
