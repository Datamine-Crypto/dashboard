export enum SearchCategory {
	Onboarding = 'Onboarding',
	//Use = 'Use',
	Dashboard = 'Dashboard',
	Learn = 'Learn',
	Advanced = 'Advanced',
	Uniswap = 'Uniswap',
}
export enum SearchCategoryText {
	Learn = '📚 Learning The Ecosystem (L1)',
	Onboarding = '🚀 Getting Started',
	//Use = 'Using The Ecosystem',
	Dashboard = '📊 Using The Dashboard',
	Advanced = '🧠 Ecosystem In-Depth (Advanced Topics)',
	Uniswap = '🦄 Uniswap & Automated Liquidity',
}
export enum SearchCategoryTextL2 {
	Learn = '📚 Learning The Ecosystem (L2)',
	Onboarding = '🚀 Getting Started',
	//Use = 'Using The Ecosystem',
	Dashboard = '📊 Using The Dashboard (Arbitrum L2)',
	Advanced = '🧠 Ecosystem In-Depth (Advanced Topics)',
	Uniswap = '🦄 Uniswap & Automated Liquidity',
}
/**
 * Interface for a help article.
 */
export interface HelpArticle {
	/**
	 * Unique identifier for the help article. This often corresponds to the markdown file name.
	 */
	id: string;
	/**
	 * The primary title of the help article (for L1 ecosystem).
	 */
	title: string;
	/**
	 * Optional: The title of the help article for the L2 ecosystem, if different from L1.
	 */
	titleL2?: string;
	/**
	 * Optional: The path to the L2 specific markdown article, if different from L1.
	 */
	articleL2Path?: string;
	/**
	 * The category the help article belongs to.
	 */
	category: SearchCategory;

	/**
	 * This is filled out after loading help article markdown
	 */
	body?: string;

	/**
	 * Optional css classes to apply (for extra styles)
	 */
	className?: string;
}

/**
 * Array of help articles, defining their metadata and categorization.
 * The content of these articles is loaded from markdown files based on their 'id'.
 */
const helpArticles: HelpArticle[] = [
	// Learning Ecosystem
	{
		id: 'core_values',
		title: '💡 Datamine Core Values',
		className: 'rightImages',
		category: SearchCategory.Learn,
	},
	{
		id: 'whitepaper/whitepaper_technical',
		title: '📄 Technical Whitepaper',
		category: SearchCategory.Learn,
	},

	{
		id: 'ecosystem/tokenSpecifications',
		title: '📝 Token Specifications',
		category: SearchCategory.Learn,
	},
	{
		id: 'ecosystem/useCases',
		title: '💡 Use Cases',
		category: SearchCategory.Learn,
	},
	{
		id: 'ecosystem/mintingBonusesExplained',
		title: '💰 Minting Bonuses Explained',
		category: SearchCategory.Learn,
	},
	{
		id: 'ecosystem/datamineDashboardOverview',
		title: '📊 Datamine Dashboard Overview',
		category: SearchCategory.Learn,
	},

	// Onboarding
	{
		id: 'onboarding/installingUsingMetamask',
		title: '🦊 MetaMask: Installing & Using',
		category: SearchCategory.Onboarding,
	},
	{
		id: 'onboarding/addTokensToMetamask',
		title: '🦊 MetaMask: Adding DAM / FLUX Tokens',
		titleL2: '🦊 MetaMask: Adding FLUX / ArbiFLUX Tokens',
		category: SearchCategory.Onboarding,
	},
	{
		id: 'onboarding/connectingMetamask',
		title: '🔗 MetaMask: Connecting To Dashboard',
		category: SearchCategory.Onboarding,
	},
	{
		id: 'onboarding/hardwareWalletLedger',
		title: '🔐 Hardware Wallet: Connecting to Ledger Nano S',
		category: SearchCategory.Onboarding,
	},

	// Uniswap
	{
			id: 'uniswap/buyingDatamineTokens',
		title: '📈 Uniswap: Buying Datamine (DAM)',
		titleL2: '📈 Uniswap: Buying FLUX (L2)',
		category: SearchCategory.Uniswap,
	},
	{
		id: 'uniswap/addingLiquidity',
		title: '💧 Uniswap: Adding Liquidity',
		category: SearchCategory.Uniswap,
	},

	// Advanced / Ecosystem In-Depth
	{
		id: 'advanced/delegatedMinting',
		title: '🤝 Delegated Minting Guide',
		category: SearchCategory.Advanced,
	},
	{
		id: 'advanced/lockinMoreDatamineTokens',
		title: '📈 How to grow your validator (Add more DAM)',
		titleL2: '📈 How to grow your validator ( Add more FLUX (L2) )',
		category: SearchCategory.Advanced,
	},
	{
		id: 'advanced/metamaskGas',
		title: '⛽ MetaMask: Transaction Speed & GAS fees',
		category: SearchCategory.Advanced,
	},

	// Dashboard
	{
		id: 'dashboard/startingDecentralizedMint',
		title: '🚀 Starting Validator',
		titleL2: '🚀 Starting Validator',
		category: SearchCategory.Dashboard,
		articleL2Path: 'dashboard/startingDecentralizedMintL2',
	},
	{
		id: 'dashboard/mintFluxTokens',
		title: '⛏️ Minting FLUX Tokens',
		titleL2: '⛏️ Minting ArbiFLUX Tokens',
		category: SearchCategory.Dashboard,
		articleL2Path: 'dashboard/mintArbiFluxTokensL2',
	},
	{
		id: 'dashboard/burningFluxTokens',
		title: '🔥 Burning FLUX Tokens',
		titleL2: '🔥 Burning ArbiFLUX Tokens',
		category: SearchCategory.Dashboard,
		articleL2Path: 'dashboard/burningArbiFluxTokensL2',
	},

	/*
	{
		id: 'minting_flux',
		title: 'Minting FLUX Tokens',
		category: SearchCategory.Use
	},
	{
		id: 'burning_tokens',
		title: 'Burning Tokens',
		category: SearchCategory.Use
	},
	*/
];

export { helpArticles };
