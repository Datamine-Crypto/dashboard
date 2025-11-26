import { Box, Card, CardContent, Divider, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useAppStore } from '@/react/utils/appStore';
import { OpenInNew } from '@mui/icons-material';
import BN from 'bn.js';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem, Layer } from '@/app/configs/config.common';
import { Token } from '@/app/interfaces';
import { BNToDecimal, getBNPercent, getPriceToggle } from '@/utils/mathHelpers';
import { Balances } from '@/app/interfaces';
import DetailedListItem from '@/react/elements/Fragments/DetailedListItem';
import LightTooltip from '@/react/elements/LightTooltip';
import { tss } from 'tss-react/mui';
import { useShallow } from 'zustand/react/shallow';
/**
 * Props for the Render component within LockedLiquidityCard.
 */
interface RenderParams {
	/** The balances of various tokens. */
	balances: Balances;
	/** The current ecosystem. */
	ecosystem: Ecosystem;
}
const useStyles = tss.create(({ theme }) => ({
	address: {
		fontSize: '0.7rem',
		letterSpacing: 0,
	},
}));
/**
 * A memoized functional component that renders the Locked Liquidity Card.
 * It displays information about the permanently locked liquidity in Uniswap pools.
 * @param params - Object containing balances and ecosystem.
 */
const Render: React.FC<RenderParams> = React.memo(({ balances, ecosystem }) => {
	const { classes } = useStyles();
	const { mintableTokenShortName, layer, mintableSushiSwapL2EthPair } = getEcosystemConfig(ecosystem) as any; // temp for mintableSushiSwapL2EthPair
	const { lockedLiquidityUniAmount, lockedLiquidtyUniTotalSupply, uniswapFluxTokenReserves } = balances;
	const percentLockedLiquidity =
		lockedLiquidityUniAmount.mul(new BN(1000000)).div(lockedLiquidtyUniTotalSupply).toNumber() / 10000;
	/**
	 * Calculates and displays the percentage of the mintable token's liquidity that is permanently locked.
	 * @returns A DetailedListItem component showing the locked percentage.
	 */
	const getLockedPercentage = () => {
		return (
			<DetailedListItem
				title={`Percentage of ${mintableTokenShortName} Locked Liquidity:`}
				main={<>{percentLockedLiquidity.toFixed(2)}%</>}
			/>
		);
	};
	/**
	 * Calculates and returns the percentage of a token's supply that is available in Uniswap liquidity pools.
	 * @param token The token (Lockable or Mintable) for which to calculate the available liquidity.
	 * @returns A React element displaying the percentage of supply in liquidity.
	 */
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
	/**
	 * Renders a DetailedListItem component for the permanently locked mintable token liquidity.
	 * @returns A DetailedListItem component.
	 */
	const getFluxAvailableLiquidity = () => {
		const permaLockedMintableToken = uniswapFluxTokenReserves.flux
			.mul(new BN(percentLockedLiquidity * 100))
			.div(new BN(10000));
		const fluxEthUsdcLiquidity = `$ ${getPriceToggle({ value: permaLockedMintableToken, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return (
			<DetailedListItem
				title={`Perma-Locked Liquidity:`}
				main={
					<>
						{BNToDecimal(permaLockedMintableToken, true, 18, 2)} {mintableTokenShortName}
					</>
				}
				sub={<>{fluxEthUsdcLiquidity}</>}
				description={<>{getAvailableLiquidity(Token.Mintable)}</>}
				buttons={[]}
			/>
		);
	};
	/**
	 * Renders a DetailedListItem component for the permanently locked ETH liquidity.
	 * @returns A DetailedListItem component.
	 */
	const getFluxAvailableLiquidityEth = () => {
		const permaLockedEth = uniswapFluxTokenReserves.eth.mul(new BN(percentLockedLiquidity * 100)).div(new BN(10000));
		const fluxEthUsdcLiquidity = `$ ${getPriceToggle({ value: permaLockedEth, inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return (
			<DetailedListItem
				title={`Perma-Locked ETH:`}
				main={<>{BNToDecimal(permaLockedEth, true, 18, 2)} ETH</>}
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
});
/**
 * LockedLiquidityCard component that displays information about the permanently locked liquidity
 * in Uniswap pools for the current ecosystem.
 * It fetches liquidity data from the Web3Context and renders it using the Render component.
 */
const LockedLiquidityCard: React.FC = () => {
	const { balances, ecosystem } = useAppStore(
		useShallow((state) => ({
			balances: state.balances,
			ecosystem: state.ecosystem,
		}))
	);

	if (!balances || !balances.lockedLiquidityUniAmount || !balances.lockedLiquidtyUniTotalSupply) {
		return null;
	}
	return <Render balances={balances} ecosystem={ecosystem} />;
};
export default LockedLiquidityCard;
