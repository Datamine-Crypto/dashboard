import { Box, Button, Card, CardContent, Divider, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useAppStore } from '@/react/utils/appStore';

import { getEcosystemConfig } from '@/app/configs/config';
import { Layer, LiquidityPoolType } from '@/app/configs/config.common';
import sushiSwapLogo from '@/react/svgs/sushiSwap.svg';
import uniswap from '@/react/svgs/uniswap.svg';
import { Token } from '@/app/interfaces';
import { formatBigInt, formatBigIntPercent, getPriceToggle } from '@/utils/mathHelpers';
import DetailedListItem from '@/react/elements/Fragments/DetailedListItem';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from '@/react/elements/Fragments/ExploreLiquidityPools';
import LightTooltip from '@/react/elements/LightTooltip';
import { useShallow } from 'zustand/react/shallow';

const RealtimeLiqudityCard: React.FC = () => {
	const { balances, addressTokenDetails, addressDetails, ecosystem } = useAppStore(
		useShallow((state) => ({
			balances: state.balances,
			addressTokenDetails: state.addressTokenDetails,
			addressDetails: state.addressDetails,
			ecosystem: state.ecosystem,
		}))
	);

	if (!balances || !addressTokenDetails || !addressDetails) {
		return null;
	}

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
				const damSupply = formatBigIntPercent(balances.uniswapDamTokenReserves.dam, balances.damTotalSupply, false);
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
				const fluxSupply = formatBigIntPercent(balances.uniswapFluxTokenReserves.flux, balances.fluxTotalSupply, false);
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

	const shortDamPrice = `${getPriceToggle({ value: 1n * 10n ** 18n, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 4 })}`;
	const actualDamMarketCap = `$ ${getPriceToggle({ value: balances.damTotalSupply, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;
	const circulatingDamMarketCap = `$ ${getPriceToggle({ value: balances.damTotalSupply - addressDetails.globalLockedAmount, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;
	const shortFluxPrice = `${getPriceToggle({ value: 1n * 10n ** 18n, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: config.mintableTokenPriceDecimals })}`;
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
						{formatBigInt(uniswapDamTokenReserves.dam, true, 18, 2)} {lockableTokenShortName}
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
				main={<>{formatBigInt(uniswapDamTokenReserves.eth, true, 18, 2)} ETH</>}
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
						{formatBigInt(uniswapFluxTokenReserves.flux, true, 18, 2)} {mintableTokenShortName}
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
				main={<>{formatBigInt(uniswapFluxTokenReserves.eth, true, 18, 2)} ETH</>}
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
};

export default RealtimeLiqudityCard;
