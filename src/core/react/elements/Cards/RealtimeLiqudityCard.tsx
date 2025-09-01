import { Box, Button, Card, CardContent, Divider, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useContext } from 'react';

import { useWeb3Context } from '../../../web3/Web3Context';

import BN from 'bn.js';
import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem, Layer, LiquidityPoolType } from '../../../../configs/config.common';
import sushiSwapLogo from '../../../../svgs/sushiSwap.svg';
import uniswap from '../../../../svgs/uniswap.svg';
import { FluxAddressDetails, FluxAddressTokenDetails, Token } from '../../../interfaces';
import { BNToDecimal, getBNPercent, getPriceToggle } from '../../../web3/helpers';
import { Balances } from '../../../web3/web3Reducer';
import DetailedListItem from '../Fragments/DetailedListItem';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from '../Fragments/ExploreLiquidityPools';
import LightTooltip from '../LightTooltip';

/**
 * Props for the Render component within RealtimeLiqudityCard.
 */
interface RenderParams {
	/** The balances of various tokens. */
	balances: Balances;
	/** Token-related details for the Flux address. */
	addressTokenDetails: FluxAddressTokenDetails;
	/** Detailed information about the Flux address. */
	addressDetails: FluxAddressDetails;
	/** The current ecosystem. */
	ecosystem: Ecosystem;
}

/**
 * A memoized functional component that renders the Realtime Liquidity Card.
 * It displays real-time information about the liquidity of various tokens in Uniswap/SushiSwap pools,
 * including market caps and available liquidity.
 * @param params - Object containing balances, addressTokenDetails, addressDetails, and ecosystem.
 */
const Render: React.FC<RenderParams> = React.memo(({ balances, addressDetails, ecosystem }) => {
	const config = getEcosystemConfig(ecosystem);
	const {
		layer,
		mintableTokenShortName,
		lockableTokenShortName,
		isLiquidityPoolAdditionalButtonsEnabled,
		liquidityPoolType,
	} = config;

	const commaRegex = /(\d)(?=(\d{3})+(?!\d))/g;

	const { uniswapDamTokenReserves, uniswapFluxTokenReserves } = balances;

	const getAvailableLiquidity = (token: Token) => {
		switch (token) {
			case Token.Lockable: {
				const damSupply = getBNPercent(balances.uniswapDamTokenReserves.dam, balances.damTotalSupply, false);
				return (
					<>
						{' '}
						<Typography component="div" variant="body2" color="textSecondary" display="inline">
							({damSupply}% of {layer === Layer.Layer2 ? 'L2' : 'lifetime'} supply)
						</Typography>
					</>
				);
			}
			case Token.Mintable: {
				const fluxSupply = getBNPercent(balances.uniswapFluxTokenReserves.flux, balances.fluxTotalSupply, false);
				return (
					<>
						{' '}
						<Typography component="div" variant="body2" color="textSecondary" display="inline">
							({fluxSupply}% of current supply)
						</Typography>
					</>
				);
			}
		}
	};

	const lockedPercent = getBNPercent(addressDetails.globalLockedAmount, balances.damTotalSupply, false);

	const shortDamPrice = `${getPriceToggle({ value: new BN(1).mul(new BN(10).pow(new BN(18))), inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 4 })}`;

	const actualDamMarketCap = `$ ${getPriceToggle({ value: balances.damTotalSupply, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;
	const circulatingDamMarketCap = `$ ${getPriceToggle({ value: balances.damTotalSupply.sub(addressDetails.globalLockedAmount), inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;

	const shortFluxPrice = `${getPriceToggle({ value: new BN(1).mul(new BN(10).pow(new BN(18))), inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: config.mintableTokenPriceDecimals })}`;
	const actualFluxPrice = `$ ${shortFluxPrice} USD`;
	const actualFluxMarketCap = `$ ${getPriceToggle({ value: balances.fluxTotalSupply, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;

	document.title = `${mintableTokenShortName}: $${shortFluxPrice} ${lockableTokenShortName}: $${shortDamPrice}`;

	const getDamMarketCap = () => {
		return (
			<DetailedListItem
				title={
					<>
						<Box display="inline">
							{lockableTokenShortName} Realtime Market Cap{layer === Layer.Layer2 ? ' (on L2)' : ''}:
						</Box>
					</>
				}
				main={
					<>
						<Box display="inline">
							{circulatingDamMarketCap}{' '}
							<Typography component="div" variant="body2" color="textSecondary" display="inline">
								(Circulating)
							</Typography>
						</Box>
					</>
				}
				sub={
					<>
						<Box display="inline">
							{actualDamMarketCap}{' '}
							<Typography component="div" variant="body2" color="textSecondary" display="inline">
								(Total)
							</Typography>
						</Box>
					</>
				}
			/>
		);
	};

	const getDamEthAvailableLiquidity = () => {
		const ethLiquidity = parseFloat(
			getPriceToggle({
				value: uniswapDamTokenReserves.eth,
				inputToken: Token.ETH,
				outputToken: Token.USDC,
				balances,
				round: 2,
				removeCommas: true,
			})
		);
		const damLiquidity = parseFloat(
			getPriceToggle({
				value: uniswapDamTokenReserves.dam,
				inputToken: Token.Lockable,
				outputToken: Token.USDC,
				balances,
				round: 2,
				removeCommas: true,
			})
		);
		const totalLiquidity = (damLiquidity + ethLiquidity).toFixed(2).replace(commaRegex, '$1,');

		const damEthUsdcLiquidity = `$ ${totalLiquidity} USD`;

		return (
			<DetailedListItem title={`${lockableTokenShortName} / ETH Total Liquidity:`} main={<>{damEthUsdcLiquidity}</>} />
		);
	};

	const getDamAvailableLiquidity = () => {
		const damEthUsdcLiquidity = `$ ${getPriceToggle({ value: uniswapDamTokenReserves.dam, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return (
			<DetailedListItem
				title={`${lockableTokenShortName} Available ${liquidityPoolType === LiquidityPoolType.SushiSwap ? 'SushiSwap' : 'Uniswap'} Liquidity :`}
				main={
					<>
						{BNToDecimal(uniswapDamTokenReserves.dam, true, 18, 2)} {lockableTokenShortName}
					</>
				}
				sub={<>{damEthUsdcLiquidity}</>}
				description={<>{getAvailableLiquidity(Token.Lockable)}</>}
				buttons={[]}
			/>
		);
	};
	const getDamAvailableLiquidityEth = () => {
		const damEthUsdcLiquidity = `$ ${getPriceToggle({ value: uniswapDamTokenReserves.eth, inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return (
			<DetailedListItem
				title={`${lockableTokenShortName} ${liquidityPoolType === LiquidityPoolType.SushiSwap ? 'SushiSwap' : 'Uniswap'} Available ETH:`}
				main={<>{BNToDecimal(uniswapDamTokenReserves.eth, true, 18, 2)} ETH</>}
				sub={<>{damEthUsdcLiquidity}</>}
			/>
		);
	};

	const getFluxMarketCap = () => {
		return (
			<DetailedListItem
				title={
					<>
						<Box display="inline">{mintableTokenShortName} Realtime Market Cap: </Box>
					</>
				}
				main={
					<>
						<Box display="inline">{actualFluxMarketCap}</Box>
					</>
				}
			/>
		);
	};

	const getFluxEthAvailableLiquidity = () => {
		const ethLiquidity = parseFloat(
			getPriceToggle({
				value: uniswapFluxTokenReserves.eth,
				inputToken: Token.ETH,
				outputToken: Token.USDC,
				balances,
				round: 2,
				removeCommas: true,
			})
		);
		const fluxLiquidity = parseFloat(
			getPriceToggle({
				value: uniswapFluxTokenReserves.flux,
				inputToken: Token.Mintable,
				outputToken: Token.USDC,
				balances,
				round: 2,
				removeCommas: true,
			})
		);
		const totalLiquidity = (fluxLiquidity + ethLiquidity).toFixed(2).replace(commaRegex, '$1,');

		const fluxEthUsdcLiquidity = `$ ${totalLiquidity} USD`;

		return (
			<DetailedListItem title={`${mintableTokenShortName} / ETH Total Liquidity:`} main={<>{fluxEthUsdcLiquidity}</>} />
		);
	};

	const getFluxAvailableLiquidity = () => {
		const fluxEthUsdcLiquidity = `$ ${getPriceToggle({ value: uniswapFluxTokenReserves.flux, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return (
			<DetailedListItem
				title={`${mintableTokenShortName} Available ${liquidityPoolType === LiquidityPoolType.SushiSwap ? 'SushiSwap' : 'Uniswap'} Liquidity:`}
				main={
					<>
						{BNToDecimal(uniswapFluxTokenReserves.flux, true, 18, 2)} {mintableTokenShortName}
					</>
				}
				sub={<>{fluxEthUsdcLiquidity}</>}
				description={<>{getAvailableLiquidity(Token.Mintable)}</>}
				buttons={[]}
			/>
		);
	};

	const getFluxAvailableLiquidityEth = () => {
		const getPoolButton = () => {
			if (!isLiquidityPoolAdditionalButtonsEnabled) {
				return <></>;
			}

			const getButton = () => {
				const getAddToPoolLink = () => {
					if (liquidityPoolType === LiquidityPoolType.SushiSwap) {
						return `https://app.sushi.com/add/${config.mintableTokenContractAddress}/ETH`;
					}
					return `https://uniswap.exchange/add/${config.mintableTokenContractAddress}/ETH/10000`;
				};
				const button = (
					<Link href={getAddToPoolLink()} target="_blank" rel="noopener noreferrer">
						<Button size="small" variant="outlined" color="secondary">
							<img
								src={liquidityPoolType === LiquidityPoolType.SushiSwap ? sushiSwapLogo : uniswap}
								width={24}
								height={24}
								style={{ verticalAlign: 'middle', marginRight: 8 }}
							/>{' '}
							Add To Pool
						</Button>
					</Link>
				);

				const getAddToPoolTooltip = () => {
					if (liquidityPoolType === LiquidityPoolType.SushiSwap) {
						return `Add to ${mintableTokenShortName} / ETH SushiSwap Pool. Liquidity pool participants share 0.25% from each ${mintableTokenShortName} <-> ETH SushiSwap transaction! `;
					}

					return `Add to ${mintableTokenShortName} / ETH Uniswap Pool. Liquidity pool participants share 1.00% from each ${mintableTokenShortName} <-> ETH Uniswap transaction! `;
				};
				return <LightTooltip title={getAddToPoolTooltip()}>{button}</LightTooltip>;
			};

			return (
				<Box mx={1} display="inline-block">
					{getButton()}
				</Box>
			);
		};
		const fluxEthUsdcLiquidity = `$ ${getPriceToggle({ value: uniswapFluxTokenReserves.eth, inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2 })} USD`;

		return (
			<DetailedListItem
				title={`${mintableTokenShortName} / ETH ${liquidityPoolType === LiquidityPoolType.SushiSwap ? 'SushiSwap' : 'Uniswap'} Available ETH:`}
				main={<>{BNToDecimal(uniswapFluxTokenReserves.eth, true, 18, 2)} ETH</>}
				sub={<>{fluxEthUsdcLiquidity}</>}
				buttons={[getPoolButton()]}
			/>
		);
	};

	const getCardTitle = () => {
		if (liquidityPoolType === LiquidityPoolType.SushiSwap) {
			return 'Realtime Available SushiSwap (L2) Liquidity';
		}
		return 'Realtime Available Uniswap Liquidity';
	};

	return (
		<Card>
			<CardContent>
				<Grid container justifyContent="space-between" alignItems="center">
					<Grid>
						<LightTooltip title="Our realtime global liquidity is fetched from Uniswap on-chain data through a smart contract">
							<Typography variant="h5" component="h2">
								{getCardTitle()}
							</Typography>
						</LightTooltip>
					</Grid>
					<Grid>
						<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.SmallButton} ecosystem={ecosystem} />
					</Grid>
				</Grid>
				<Box mt={1} mb={1}>
					<Divider />
				</Box>
				<Grid container>
					<Grid size={{ xs: 12, md: 6 }}>
						{getFluxAvailableLiquidity()}
						{getFluxAvailableLiquidityEth()}
						{getFluxEthAvailableLiquidity()}
						{getFluxMarketCap()}
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						{getDamAvailableLiquidity()}
						{getDamAvailableLiquidityEth()}
						{getDamEthAvailableLiquidity()}
						{getDamMarketCap()}
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
});

const RealtimeLiqudityCard: React.FC = () => {
	const { state: web3State } = useWeb3Context();

	const { balances, addressTokenDetails, addressDetails, ecosystem } = web3State;
	if (!balances || !addressTokenDetails || !addressDetails) {
		return null;
	}

	return (
		<Render
			balances={balances}
			addressTokenDetails={addressTokenDetails}
			addressDetails={addressDetails}
			ecosystem={ecosystem}
		/>
	);
};

export default RealtimeLiqudityCard;
