export const gameHodlClickerAbi = [
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_amountToBurnInput',
				type: 'uint256',
			},
			{
				internalType: 'address',
				name: 'burnToAddress',
				type: 'address',
			},
		],
		name: 'burnTokens',
		outputs: [
			{
				components: [
					{
						internalType: 'enum HodlClickerRush.BurnResultCode',
						name: 'resultCode',
						type: 'uint8',
					},
					{
						internalType: 'uint256',
						name: 'actualAmountBurned',
						type: 'uint256',
					},
					{
						internalType: 'address',
						name: 'burnToAddress',
						type: 'address',
					},
					{
						internalType: 'uint256',
						name: 'totalTipAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'jackpotAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'totalTipToAddAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'amountToMintAfterBurn',
						type: 'uint256',
					},
				],
				internalType: 'struct HodlClickerRush.BurnOperationResult',
				name: '',
				type: 'tuple',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'amountToBurn',
						type: 'uint256',
					},
					{
						internalType: 'address',
						name: 'burnToAddress',
						type: 'address',
					},
				],
				internalType: 'struct HodlClickerRush.BurnRequest[]',
				name: 'requests',
				type: 'tuple[]',
			},
		],
		name: 'burnTokensFromAddresses',
		outputs: [
			{
				components: [
					{
						internalType: 'enum HodlClickerRush.BurnResultCode',
						name: 'resultCode',
						type: 'uint8',
					},
					{
						internalType: 'uint256',
						name: 'actualAmountBurned',
						type: 'uint256',
					},
					{
						internalType: 'address',
						name: 'burnToAddress',
						type: 'address',
					},
					{
						internalType: 'uint256',
						name: 'totalTipAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'jackpotAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'totalTipToAddAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'amountToMintAfterBurn',
						type: 'uint256',
					},
				],
				internalType: 'struct HodlClickerRush.BurnOperationResult[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'amountToDeposit',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'rewardsPercent',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minBlockNumber',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minBurnAmount',
				type: 'uint256',
			},
		],
		name: 'deposit',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'targetAddress',
				type: 'address',
			},
		],
		name: 'normalMintToAddress',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_fluxTokenAddress',
				type: 'address',
			},
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		inputs: [],
		name: 'ReentrancyGuardReentrantCall',
		type: 'error',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amountDeposited',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'rewardsPercent',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'totalRewardsAmount',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'minBlockNumber',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'minBurnAmount',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'actualAmountDeposited',
				type: 'uint256',
			},
		],
		name: 'Deposited',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'caller',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'targetAddress',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'currentBlock',
				type: 'uint256',
			},
		],
		name: 'NormalMint',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'bool',
				name: 'isPaused',
				type: 'bool',
			},
		],
		name: 'PausedChanged',
		type: 'event',
	},
	{
		inputs: [
			{
				internalType: 'bool',
				name: 'isPaused',
				type: 'bool',
			},
		],
		name: 'setPaused',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'burnToAddress',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'caller',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'currentBlock',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amountActuallyBurned',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'totalTipAmount',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'jackpotAmount',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'totalTipToAddAmount',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amountToMintAfterBurn',
				type: 'uint256',
			},
		],
		name: 'TokensBurned',
		type: 'event',
	},
	{
		inputs: [],
		name: 'withdrawAll',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'originalRewardsAmount',
				type: 'uint256',
			},
		],
		name: 'Withdrawn',
		type: 'event',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'addressLocks',
		outputs: [
			{
				internalType: 'uint256',
				name: 'rewardsAmount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'rewardsPercent',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minBlockNumber',
				type: 'uint256',
			},
			{
				internalType: 'bool',
				name: 'isPaused',
				type: 'bool',
			},
			{
				internalType: 'uint256',
				name: 'minBurnAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'defaultRewardsPercent',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'fluxToken',
		outputs: [
			{
				internalType: 'contract IFluxToken',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address[]',
				name: 'addressesToQuery',
				type: 'address[]',
			},
		],
		name: 'getAddressLockDetailsBatch',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'targetAddress',
						type: 'address',
					},
					{
						internalType: 'uint256',
						name: 'amountToMint',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'rewardsAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'rewardsPercent',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'minBlockNumber',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'minBurnAmount',
						type: 'uint256',
					},
					{
						internalType: 'bool',
						name: 'isPaused',
						type: 'bool',
					},
					{
						internalType: 'address',
						name: 'minterAddressFromFluxToken',
						type: 'address',
					},
				],
				internalType: 'struct HodlClickerRush.AddressLockDetailsViewModel[]',
				name: 'details',
				type: 'tuple[]',
			},
			{
				internalType: 'uint256',
				name: 'currentBlockNumber',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_address',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '_amountToMintBeforeBurn',
				type: 'uint256',
			},
		],
		name: 'getTipAndJackpotAmount',
		outputs: [
			{
				internalType: 'uint256',
				name: 'totalTipAmount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'jackpotAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'operator',
				type: 'address',
			},
			{
				internalType: 'address',
				name: 'from',
				type: 'address',
			},
			{
				internalType: 'address',
				name: 'to',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'bytes',
				name: 'userData',
				type: 'bytes',
			},
			{
				internalType: 'bytes',
				name: 'operatorData',
				type: 'bytes',
			},
		],
		name: 'tokensReceived',
		outputs: [],
		stateMutability: 'pure',
		type: 'function',
	},
	{
		inputs: [],
		name: 'totalContractLockedAmount',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'totalContractRewardsAmount',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const;
