import { Box, Card, CardContent, Divider, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useAppStore } from '@/react/utils/appStore';
import { OpenInNew } from '@mui/icons-material';

import { getEcosystemConfig } from '@/app/configs/config';
import { Layer } from '@/app/configs/config.common';
import { Token } from '@/app/interfaces';
import { formatBigInt, formatBigIntPercent, getPriceToggle } from '@/utils/mathHelpers';
import DetailedListItem from '@/react/elements/Fragments/DetailedListItem';
import LightTooltip from '@/react/elements/LightTooltip';
import { tss } from 'tss-react/mui';
import { useShallow } from 'zustand/react/shallow';

const useStyles = tss.create(() => ({
	address: {
		fontSize: '0.7rem',
		letterSpacing: 0,
	},
}));

const LockedLiquidityCard: React.FC = () => {
	const { balances, ecosystem } = useAppStore(
		useShallow((state) => ({
			balances: state.balances,
			ecosystem: state.ecosystem,
		}))
	);
	const { classes } = useStyles();

	if (!balances || !balances.lockedLiquidityUniAmount || !balances.lockedLiquidtyUniTotalSupply) {
		return null;
	}

	const { mintableTokenShortName, layer, mintableSushiSwapL2EthPair } = getEcosystemConfig(ecosystem);
	const { lockedLiquidityUniAmount, lockedLiquidtyUniTotalSupply, uniswapFluxTokenReserves } = balances;
	const percentLockedLiquidity = Number((lockedLiquidityUniAmount * 1000000n) / lockedLiquidtyUniTotalSupply) / 10000;

	const getLockedPercentage = () => {
		return (
			<DetailedListItem
				title={`Percentage of ${mintableTokenShortName} Locked Liquidity:`}
				main={<>{percentLockedLiquidity.toFixed(2)}%</>}
			/>
		);
	};

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

	const getFluxAvailableLiquidity = () => {
		const permaLockedMintableToken =
			(uniswapFluxTokenReserves.flux * BigInt(Math.floor(percentLockedLiquidity * 100))) / 10000n;
		const fluxEthUsdcLiquidity = `$ ${getPriceToggle({ value: permaLockedMintableToken, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return (
			<DetailedListItem
				title={`Perma-Locked Liquidity:`}
				main={
					<>
						{formatBigInt(permaLockedMintableToken, true, 18, 2)} {mintableTokenShortName}
					</>
				}
				sub={<>{fluxEthUsdcLiquidity}</>}
				description={<>{getAvailableLiquidity(Token.Mintable)}</>}
				buttons={[]}
			/>
		);
	};

	const getFluxAvailableLiquidityEth = () => {
		const permaLockedEth = (uniswapFluxTokenReserves.eth * BigInt(Math.floor(percentLockedLiquidity * 100))) / 10000n;
		const fluxEthUsdcLiquidity = `$ ${getPriceToggle({ value: permaLockedEth, inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return (
			<DetailedListItem
				title={`Perma-Locked ETH:`}
				main={<>{formatBigInt(permaLockedEth, true, 18, 2)} ETH</>}
				sub={<>{fluxEthUsdcLiquidity}</>}
				buttons={[]}
			/>
		);
	};

	return (
		<Card>
			<CardContent>
				<Grid container justifyContent="space-between" alignItems="center">
					<Grid>
						<Typography component="div" variant="h5">
							<LightTooltip title="This liquidity is permanently locked in the Uniswap v2 pool. This form of liquidity is locked-in to the ecosystem and can not be removed.">
								<Box>Perma-Locked Uniswap Liquidity</Box>
							</LightTooltip>
						</Typography>
					</Grid>
					<Grid>
						<Typography component="div" variant="body2" color="textSecondary">
							<LightTooltip title="Click to view this information on Arbiscan">
								<Link
									href={`https://arbiscan.io/token/${mintableSushiSwapL2EthPair}#balances`}
									color="textSecondary"
									target="_blank"
									className={classes.address}
								>
									<Grid container direction="row" justifyContent="center" alignItems="center">
										<Grid>View On Arbiscan</Grid>
										<Grid>
											<Box ml={0.5}>
												<OpenInNew fontSize="small" />
											</Box>
										</Grid>
									</Grid>
								</Link>
							</LightTooltip>
						</Typography>
					</Grid>
				</Grid>
				<Box mt={1} mb={2}>
					<Divider />
				</Box>
				<Grid container>
					<Grid size={{ xs: 12, md: 6 }}>
						{getFluxAvailableLiquidity()}
						{getFluxAvailableLiquidityEth()}
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>{getLockedPercentage()}</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};

export default LockedLiquidityCard;
