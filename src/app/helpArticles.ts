export enum SearchCategory {
	GettingStarted = 'GettingStarted',
	DashboardFeatures = 'DashboardFeatures',
	EcosystemConcepts = 'EcosystemConcepts',
	AdvancedOperations = 'AdvancedOperations',
	TokenSwapping = 'TokenSwapping',
}

export enum UserTypeFilter {
	All = 'All',
	NewUser = 'NewUser',
	ExistingUser = 'ExistingUser',
}

export enum SearchCategoryText {
	GettingStarted = '🚀 Getting Started',
	TokenSwapping = '🦄 Token Swapping & Liquidity',
	DashboardFeatures = '📊 Using The Dashboard',
	EcosystemConcepts = '📚 Understanding The Ecosystem',
	AdvancedOperations = '🧠 Advanced Operations',
}

/**
 * Defines various tags that can be associated with help articles for filtering and categorization.
 */
export enum SearchTag {
	MetaMask = 'MetaMask',
	Validator = 'Validator',
	L1 = 'L1',
	L2 = 'L2',
	Token = 'Token',
	Minting = 'Minting',
	Burning = 'Burning',
	Uniswap = 'Uniswap',
	LOCK = 'LOCK',
	DAM = 'DAM',
	FLUX = 'FLUX',
	ArbiFLUX = 'ArbiFLUX',
	GameFi = 'GameFi',
	Security = 'Security',
	Troubleshooting = 'Troubleshooting',
	Wallet = 'Wallet',
	Bridge = 'Bridge',
	Analytics = 'Analytics',
	GasFees = 'Gas Fees',
	DelegatedMinting = 'Delegated Minting',
	Market = 'Market',
	Ecosystem = 'Ecosystem',
}

/**
 * Interface for a help article, defining its metadata and content structure.
 */
export interface HelpArticle {
	/**
	 * Unique identifier for the help article. This often corresponds to the markdown file name.
	 */
	id: string;
	/**
	 * The title of the help article.
	 */
	title: string;
	/**
	 * The category the help article belongs to.
	 */
	category: SearchCategory;
	/**
	 * Optional: Specifies if the article is for new users, existing users, or both.
	 */
	userType?: UserTypeFilter;
	/**
	 * Optional: An array of tags associated with the article.
	 */
	tags: SearchTag[];

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
	// Getting Started
	{
		id: 'onboarding/installingUsingMetamask',
		title: '🦊 MetaMask: Installing & Using',
		category: SearchCategory.GettingStarted,
		userType: UserTypeFilter.NewUser,
		tags: [SearchTag.MetaMask, SearchTag.Wallet],
	},
	{
		id: 'onboarding/addTokensToMetamask',
		title: '🦊 MetaMask: Adding DAM, FLUX, ArbiFLUX, & LOCK Tokens',
		category: SearchCategory.GettingStarted,
		userType: UserTypeFilter.NewUser,
		tags: [SearchTag.MetaMask, SearchTag.Token, SearchTag.DAM, SearchTag.FLUX, SearchTag.ArbiFLUX, SearchTag.LOCK],
	},
	{
		id: 'onboarding/connectingMetamask',
		title: '🔗 MetaMask: Connecting To Dashboard',
		category: SearchCategory.GettingStarted,
		userType: UserTypeFilter.NewUser,
		tags: [SearchTag.MetaMask, SearchTag.Wallet],
	},
	{
		id: 'onboarding/hardwareWalletLedger',
		title: '🔐 Hardware Wallet: Connecting to Ledger Nano S',
		category: SearchCategory.GettingStarted,
		userType: UserTypeFilter.NewUser,
		tags: [SearchTag.Wallet, SearchTag.Security],
	},
	{
		id: 'ecosystem/understanding_datamine_ecosystems',
		title: '🌐 Understanding Datamine Ecosystems',
		category: SearchCategory.EcosystemConcepts,
		userType: UserTypeFilter.All,
		tags: [
			SearchTag.Ecosystem,
			SearchTag.DAM,
			SearchTag.FLUX,
			SearchTag.ArbiFLUX,
			SearchTag.LOCK,
			SearchTag.L1,
			SearchTag.L2,
			SearchTag.Bridge,
		],
	},

	// Dashboard Features
	{
		id: 'dashboard/startingDecentralizedMint',
		title: '🚀 Starting Validator (All Ecosystems)',
		category: SearchCategory.DashboardFeatures,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.Validator, SearchTag.Minting, SearchTag.L1, SearchTag.L2],
	},
	{
		id: 'dashboard/mintFluxTokens',
		title: '⛏️ Minting FLUX, ArbiFLUX & LOCK Tokens',
		category: SearchCategory.DashboardFeatures,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.Minting, SearchTag.FLUX, SearchTag.ArbiFLUX, SearchTag.L1, SearchTag.L2],
	},
	{
		id: 'dashboard/burningFluxTokens',
		title: '🔥 Burning FLUX, ArbiFLUX & LOCK Tokens',
		category: SearchCategory.DashboardFeatures,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.Burning, SearchTag.FLUX, SearchTag.ArbiFLUX, SearchTag.L1, SearchTag.L2],
	},
	{
		id: 'ecosystem/datamineDashboardOverview',
		title: '📊 Datamine Dashboard Overview',
		category: SearchCategory.DashboardFeatures,
		userType: UserTypeFilter.All,
		tags: [SearchTag.Analytics],
	},

	// Understanding the Ecosystem
	{
		id: 'core_values',
		title: '💡 Datamine Core Values',
		className: 'rightImages',
		category: SearchCategory.EcosystemConcepts,
		userType: UserTypeFilter.All,
		tags: [SearchTag.Ecosystem],
	},
	{
		id: 'ecosystem/tokenSpecifications',
		title: '📝 Token Specifications',
		category: SearchCategory.EcosystemConcepts,
		userType: UserTypeFilter.All,
		tags: [SearchTag.Token, SearchTag.DAM, SearchTag.FLUX, SearchTag.ArbiFLUX, SearchTag.LOCK],
	},
	{
		id: 'ecosystem/useCases',
		title: '💡 Use Cases',
		category: SearchCategory.EcosystemConcepts,
		userType: UserTypeFilter.All,
		tags: [SearchTag.Ecosystem],
	},
	{
		id: 'ecosystem/mintingBonusesExplained',
		title: '💰 Minting Bonuses Explained',
		category: SearchCategory.EcosystemConcepts,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.Minting, SearchTag.Validator],
	},

	// Advanced Operations
	{
		id: 'whitepaper/whitepaper_technical',
		title: '📄 Technical Whitepaper',
		category: SearchCategory.AdvancedOperations,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.Ecosystem],
	},
	{
		id: 'ecosystem/lockquidity_token',
		title: '💎 Understanding the LOCK (Lockquidity) Token',
		category: SearchCategory.AdvancedOperations,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.LOCK, SearchTag.Token, SearchTag.L2],
	},
	{
		id: 'advanced/datamine_market',
		title: '🛒 Datamine Market: Decentralized "Time-in-Market" Solution',
		category: SearchCategory.AdvancedOperations,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.Market, SearchTag.GameFi],
	},
	{
		id: 'advanced/datamine_gems_gamefi',
		title: '🎮 Datamine Gems #GameFi: The Ultimate Real-Time Game',
		category: SearchCategory.AdvancedOperations,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.GameFi],
	},
	{
		id: 'advanced/delegatedMinting',
		title: '🤝 Delegated Minting Guide',
		category: SearchCategory.AdvancedOperations,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.DelegatedMinting, SearchTag.Minting],
	},
	{
		id: 'advanced/lockinMoreDatamineTokens',
		title: '📈 How to grow your validator (Add more tokens)',
		category: SearchCategory.AdvancedOperations,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.Validator, SearchTag.DAM, SearchTag.FLUX, SearchTag.ArbiFLUX],
	},
	{
		id: 'advanced/metamaskGas',
		title: '⛽ MetaMask: Transaction Speed & GAS fees',
		category: SearchCategory.AdvancedOperations,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.MetaMask, SearchTag.GasFees, SearchTag.Troubleshooting],
	},

	// Token Swapping & Liquidity
	{
		id: 'uniswap/buyingDatamineTokens',
		title: '📈 Uniswap: Buying Datamine (DAM), FLUX, ArbiFLUX, LOCK',
		category: SearchCategory.TokenSwapping,
		userType: UserTypeFilter.All,
		tags: [SearchTag.Uniswap, SearchTag.Token, SearchTag.DAM, SearchTag.FLUX, SearchTag.ArbiFLUX],
	},
	{
		id: 'uniswap/addingLiquidity',
		title: '💧 Uniswap: Adding Liquidity',
		category: SearchCategory.TokenSwapping,
		userType: UserTypeFilter.ExistingUser,
		tags: [SearchTag.Uniswap, SearchTag.Token],
	},
];

export { helpArticles };
