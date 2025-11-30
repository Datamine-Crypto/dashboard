import { Game, MarketAddresses } from '@/app/interfaces';
import { commonLanguage } from '@/app/state/commonLanguage';
import { AppState } from '@/app/state/initialState';
import { withWeb3 } from '@/web3/utils/web3Helpers';
import { QueryHandler } from '@/utils/reducer/sideEffectReducer';
import { getEcosystemConfig } from '@/app/configs/config';
import { Gem } from '@/react/elements/Fragments/DatamineGemsGame';
import { devLog } from '@/utils/devLog';
import { decodeMulticall, encodeMulticall, EncodedMulticallResults, MultiCallParams } from '@/web3/utils/web3multicall';
import { getContracts, getSelectedAddress, getPublicClient } from '@/web3/utils/web3ProviderUtils';

/**
 * Burns tokens through the Datamine Market to collect rewards from other validators.
 */
export interface GetMarketBurnFluxResponseQuery {
	gems: Gem[];
	amountToBurn: bigint;
}

/**
 * Burns tokens through the Datamine Market to collect rewards from other validators.
 */
export const getMarketBurnFluxResponse: QueryHandler<AppState> = async ({ state, query }) => {
	const { ecosystem, game } = state;
	const publicClient = getPublicClient();
	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}
	const selectedAddress = await getSelectedAddress();

	const { gems, amountToBurn } = query.payload as GetMarketBurnFluxResponseQuery;

	const contracts = getContracts(publicClient, state.ecosystem);

	const config = getEcosystemConfig(ecosystem);

	if (!config.marketAddress) {
		return;
	}

	const marketContract = withWeb3(game == Game.DatamineGems ? contracts.market! : contracts.gameHodlClicker!);

	if (gems.length === 1) {
		const gem = gems[0];
		const burnResponse = await marketContract.marketBurnTokens({
			amountToBurn,
			burnToAddress: gem.ethereumAddress,

			from: selectedAddress as string,
		});
		devLog(burnResponse);
		return { gems };
	} else {
		const addresses = gems.map((gem) => gem.ethereumAddress);
		const burnBatchResponse = await marketContract.marketBatchBurnTokens({
			amountToBurn,
			addresses,
			from: selectedAddress as string,
		});
		devLog(burnBatchResponse);
		return { gems };
	}
};

/**
 * Deposits tokens into the Datamine Market to be available for public burning.
 */
export interface GetDepositMarketResponseQuery {
	address: string;
	amount: bigint;
}

/**
 * Deposits tokens into the Datamine Market to be available for public burning.
 */
export const getDepositMarketResponse: QueryHandler<AppState> = async ({ state, query }) => {
	const { ecosystem, game } = state;
	const publicClient = getPublicClient();
	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}
	const selectedAddress = await getSelectedAddress();

	const { amount } = query.payload as GetDepositMarketResponseQuery;

	const contracts = getContracts(publicClient, state.ecosystem);

	const config = getEcosystemConfig(ecosystem);

	const gameAddress = game === Game.DatamineGems ? config.marketAddress : config.gameHodlClickerAddress;

	if (!gameAddress) {
		return;
	}

	const marketContract = withWeb3(game == Game.DatamineGems ? contracts.market! : contracts.gameHodlClicker!);

	const fluxToken = withWeb3(contracts.fluxToken!);

	const rewardsPercent = 500; // 5.00%, @todo customize via UI

	//@todo check if already authorized

	const isOperatorFor = await fluxToken.isOperatorFor(gameAddress, selectedAddress as string);
	devLog('isOperatorFor:', isOperatorFor);

	if (!isOperatorFor) {
		const authorizeOperatorResponse = await fluxToken.authorizeOperator({
			operator: gameAddress,
			from: selectedAddress as string,
		});
		devLog('authorizeOperatorResponse:', authorizeOperatorResponse);
	}

	await marketContract.marketDeposit({
		amountToDeposit: amount,
		rewardsPercent,
		from: selectedAddress as string,
		minBlockNumber: 0n, //@todo customize via UI
		minBurnAmount: 0n, //@todo customize via UI
	});
};

/**
 * Refreshes market addresses and other game-related data.
 */
export interface GetRefreshMarketAddressesResponse {
	marketAddresses: MarketAddresses;
	currentAddressMintableBalance: bigint;
	game: Game;
	totalContractRewardsAmount: bigint;
	totalContractLockedAmount: bigint;
}

/**
 * Refreshes market addresses and other game-related data.
 */
export const getRefreshMarketAddressesResponse: QueryHandler<AppState> = async ({ state }) => {
	const { ecosystem, game } = state;
	const publicClient = getPublicClient();
	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}
	const selectedAddress = await getSelectedAddress();

	const contracts = getContracts(publicClient, state.ecosystem);
	const config = getEcosystemConfig(state.ecosystem);

	const gameAddress = game === Game.DatamineGems ? config.marketAddress : config.gameHodlClickerAddress;

	if (!gameAddress) {
		return;
	}

	devLog('selectedAddress:', selectedAddress);
	if (!selectedAddress) {
		return;
	}

	const marketAddressesToFetch = config.marketTopBurningaddresses[game];

	const customGemAddresses = state.market.gemAddresses[ecosystem];

	// Always fetch selectedAddress so we can get details for it in UI (ex: total game balance)
	const allAddressesToFetch = [selectedAddress, ...marketAddressesToFetch, ...customGemAddresses]
		.filter((address) => address !== null)
		.map((address) => address.toLowerCase());

	// We'll add selectedAddress to fetch the current address too (so we don't have to do an extra call)
	const uniqueAddressesToFetch = [...new Set(allAddressesToFetch)];

	/**
	 * Some games might return more data that is required
	 */
	const getExtraData = () => {
		switch (game) {
			case Game.HodlClicker:
				return {
					totalContractRewardsAmount: {
						address: gameAddress,
						function: {
							signature: {
								name: 'totalContractRewardsAmount',
								type: 'function',
								inputs: [],
								outputs: [{ type: 'uint256', name: '' }],
								stateMutability: 'view',
							} as const,
							parameters: [],
						},

						returns: {
							params: ['uint256'],
							callback: (amount: bigint) => {
								return amount;
							},
						},
					},
					totalContractLockedAmount: {
						address: gameAddress,
						function: {
							signature: {
								name: 'totalContractLockedAmount',
								type: 'function',
								inputs: [],
								outputs: [{ type: 'uint256', name: '' }],
								stateMutability: 'view',
							} as const,
							parameters: [],
						},

						returns: {
							params: ['uint256'],
							callback: (amount: bigint) => {
								return amount;
							},
						},
					},
				};
			default:
				return {};
		}
	};

	const multicallData = {
		//@todoX current address details

		currentAddressMintableBalance: {
			address: config.mintableTokenContractAddress,
			function: {
				signature: {
					name: 'balanceOf',
					type: 'function',
					inputs: [
						{
							type: 'address',
							name: 'targetAddress',
						},
					],
					outputs: [{ type: 'uint256', name: '' }],
					stateMutability: 'view',
				} as const,
				parameters: [selectedAddress],
			},

			returns: {
				params: ['uint256'],
				callback: (positions: bigint) => {
					return positions;
				},
			},
		},

		// ETH Balance
		marketAddresses: {
			address: gameAddress,
			function: {
				signature: {
					name: 'getAddressLockDetailsBatch',
					type: 'function',
					inputs: [
						{
							type: 'address[]',
							name: 'addressesToQuery',
						},
					],
					outputs: [
						{
							type: 'tuple[]',
							name: 'addressData',
							components: [
								{ type: 'address', name: 'currentAddress' },
								{ type: 'uint256', name: 'mintAmount' },
								{ type: 'uint256', name: 'rewardsAmount' },
								{ type: 'uint256', name: 'rewardsPercent' },
								{ type: 'uint256', name: 'minBlockNumber' },
								{ type: 'uint256', name: 'minBurnAmount' },
								{ type: 'bool', name: 'isPaused' },
								{ type: 'address', name: 'minterAddress' },
							],
						},
						{ type: 'uint256', name: 'targetBlock' },
					],
					stateMutability: 'view',
				} as const,
				parameters: [uniqueAddressesToFetch],
			},

			returns: {
				params: ['(address, uint256, uint256, uint256, uint256, uint256, bool, address)[]', 'uint256'],
				callback: (
					addressData: [string, bigint, bigint, bigint, bigint, bigint, boolean, string][],
					targetBlock: bigint
				) => {
					return {
						targetBlock: Number(targetBlock),
						addresses: addressData.map((address) => ({
							currentAddress: address[0],
							mintAmount: address[1],
							rewardsAmount: address[2],
							rewardsPercent: Number(address[3]),
							minBlockNumber: Number(address[4]),
							minBurnAmount: address[5],
							isPaused: address[6],

							minterAddress: address[7],
						})),
					};
				},
			},
		},
		...getExtraData(),
	} as Record<string, MultiCallParams>;

	// Call multicall aggregate and parse the results
	const calls = encodeMulticall(multicallData);
	if (!contracts.multicall) throw new Error('Multicall contract not initialized');
	const [blockNumber, returnData] = (await contracts.multicall.read.aggregate([calls])) as [bigint, `0x${string}`[]];

	const multicallEncodedResults: EncodedMulticallResults = {
		blockNumber: blockNumber.toString(),
		returnData,
	};

	const { marketAddresses, currentAddressMintableBalance, totalContractRewardsAmount, totalContractLockedAmount } =
		decodeMulticall(multicallEncodedResults, multicallData) as {
			marketAddresses: MarketAddresses;
			currentAddressMintableBalance: bigint;
			totalContractRewardsAmount: bigint;
			totalContractLockedAmount: bigint;
		};

	devLog(
		'GetRefreshMarketAddressesResponse:',
		marketAddresses,
		currentAddressMintableBalance,
		totalContractRewardsAmount,
		totalContractLockedAmount
	);

	return {
		marketAddresses,
		currentAddressMintableBalance,
		game,
		totalContractRewardsAmount,
		totalContractLockedAmount,
	};
};

/**
 * Withdraws all accumulated rewards from the Datamine Market.
 */
export const getWithdrawMarketResponse: QueryHandler<AppState> = async ({ state }) => {
	const { ecosystem, game } = state;
	const publicClient = getPublicClient();
	if (!publicClient) {
		throw commonLanguage.errors.Web3NotFound;
	}
	const selectedAddress = await getSelectedAddress();

	const contracts = getContracts(publicClient, state.ecosystem);

	const config = getEcosystemConfig(ecosystem);

	if (!config.marketAddress) {
		return;
	}

	const marketContract = withWeb3(game == Game.DatamineGems ? contracts.market! : contracts.gameHodlClicker!);

	const withdrawResponse = await marketContract.marketWithdrawAll({
		from: selectedAddress as string,
	});

	return withdrawResponse;
};
