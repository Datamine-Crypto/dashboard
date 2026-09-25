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
	const { uniswapDamTokenReserves, uniswapFluxTokenReserves, uniswapDamFluxTokenReserves } = balances;
	const poolName = liquidityPoolType === LiquidityPoolType.SushiSwap ? 'SushiSwap' : 'Uniswap';

	// Available liquidity is the token side of the token / ETH pool plus the token side of the DAM / FLUX pool (L1 only)
	const availableDamLiquidity = uniswapDamTokenReserves.dam + uniswapDamFluxTokenReserves.dam;
	const availableFluxLiquidity = uniswapFluxTokenReserves.flux + uniswapDamFluxTokenReserves.flux;

	const getAvailableLiquidityPercent = (token: Token) => {
		const getSupplyText = () => {
			switch (token) {
				case Token.Lockable: {
					const damSupply = formatBigIntPercent(availableDamLiquidity, balances.damTotalSupply, false);
					return `(${damSupply}% of ${layer === Layer.Layer2 ? 'L2' : 'lifetime'} supply)`;
				}
				case Token.Mintable: {
					const fluxSupply = formatBigIntPercent(availableFluxLiquidity, balances.fluxTotalSupply, false);
					return `(${fluxSupply}% of current supply)`;
				}
			}
		};
		return (
			<>
				{' '}
				<Typography
					component="div"
					variant="body2"
					color="textSecondary"
					sx={{
						display: 'inline',
					}}
				>
					{getSupplyText()}
				</Typography>
			</>
		);
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
						<Box
							sx={{
								display: 'inline',
							}}
						>
							{lockableTokenShortName} Realtime Market Cap{layer === Layer.Layer2 ? ' (on L2)' : ''}:
						</Box>
					</>
				}
				main={
					<>
						<Box
							sx={{
								display: 'inline',
							}}
						>
							{circulatingDamMarketCap}{' '}
							<Typography
								component="div"
								variant="body2"
								color="textSecondary"
								sx={{
									display: 'inline',
								}}
							>
								(Circulating)
							</Typography>
						</Box>
					</>
				}
				sub={
					<>
						<Box
							sx={{
								display: 'inline',
							}}
						>
							{actualDamMarketCap}{' '}
							<Typography
								component="div"
								variant="body2"
								color="textSecondary"
								sx={{
									display: 'inline',
								}}
							>
								(Total)
							</Typography>
						</Box>
					</>
				}
			/>
		);
	};

	const getFluxMarketCap = () => {
		return (
			<DetailedListItem
				title={
					<>
						<Box
							sx={{
								display: 'inline',
							}}
						>
							{mintableTokenShortName} Realtime Market Cap:{' '}
						</Box>
					</>
				}
				main={
					<>
						<Box
							sx={{
								display: 'inline',
							}}
						>
							{actualFluxMarketCap}
						</Box>
					</>
				}
			/>
		);
	};

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
			<Box
				sx={{
					mx: 1,
					display: 'inline-block',
				}}
			>
				{getButton()}
			</Box>
		);
	};

	const getAvailableLiquidity = (token: Token.Lockable | Token.Mintable) => {
		const isLockable = token === Token.Lockable;
		const tokenShortName = isLockable ? lockableTokenShortName : mintableTokenShortName;
		const availableLiquidity = isLockable ? availableDamLiquidity : availableFluxLiquidity;
		const availableLiquidityUsd = `$ ${getPriceToggle({ value: availableLiquidity, inputToken: token, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return (
			<DetailedListItem
				title={`${tokenShortName} Available Liquidity (${poolName}):`}
				main={<>{availableLiquidityUsd}</>}
				sub={
					<>
						{formatBigInt(availableLiquidity, true, 18, 2)} {tokenShortName}
					</>
				}
				description={<>{getAvailableLiquidityPercent(token)}</>}
				buttons={isLockable ? [] : [getPoolButton()]}
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
				<Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
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
				<Box
					sx={{
						mt: 1,
						mb: 1,
					}}
				>
					<Divider />
				</Box>
				<Grid container>
					<Grid size={{ xs: 12, md: 6 }}>
						{getAvailableLiquidity(Token.Mintable)}
						{getFluxMarketCap()}
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						{getAvailableLiquidity(Token.Lockable)}
						{getDamMarketCap()}
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};

export default RealtimeLiqudityCard;
