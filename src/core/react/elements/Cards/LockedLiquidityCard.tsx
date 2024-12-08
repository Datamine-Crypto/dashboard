import React, { useContext } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, Link } from '@mui/material';

import { makeStyles } from '@mui/styles';
import { Web3Context } from '../../../web3/Web3Context'

import { BNToDecimal, getBNPercent, getPriceToggle } from '../../../web3/helpers';
import { Token } from '../../../interfaces';
import { Balances } from '../../../web3/web3Reducer';
import DetailedListItem from '../Fragments/DetailedListItem';
import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem, Layer, LiquidityPoolType } from '../../../../configs/config.common';
import BN from 'bn.js';
import LightTooltip from '../LightTooltip';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';


interface RenderParams {
	balances: Balances;
	ecosystem: Ecosystem;
}

const useStyles = makeStyles(() => {
	return {
		address: {
			fontSize: '0.7rem',
			letterSpacing: 0
		},
	}
});
const Render: React.FC<RenderParams> = React.memo(({ balances, ecosystem }) => {
	const classes = useStyles();

	const {
		mintableTokenShortName,
		layer,
		mintableSushiSwapL2EthPair,
	} = getEcosystemConfig(ecosystem)

	const { lockedLiquidityUniAmount, lockedLiquidtyUniTotalSupply, uniswapFluxTokenReserves } = balances

	const percentLockedLiquidity = (lockedLiquidityUniAmount.mul(new BN(1000000)).div(lockedLiquidtyUniTotalSupply).toNumber() / 10000)

	const getLockedPercentage = () => {
		return <DetailedListItem
			title={`Percentage of ${mintableTokenShortName} Locked Liquidity:`}
			main={<>
				{percentLockedLiquidity.toFixed(2)}%
			</>}
		/>
	}

	const getAvailableLiquidity = (token: Token) => {
		switch (token) {
			case Token.Lockable:
				const damSupply = getBNPercent(balances.uniswapDamTokenReserves.dam, balances.damTotalSupply, false)
				return <> <Typography variant="body2" color="textSecondary" display="inline">({damSupply}% of {layer === Layer.Layer2 ? 'L2' : 'lifetime'} supply)</Typography></>
			case Token.Mintable:
				const fluxSupply = getBNPercent(balances.uniswapFluxTokenReserves.flux, balances.fluxTotalSupply, false)
				return <> <Typography variant="body2" color="textSecondary" display="inline">({fluxSupply}% of current supply)</Typography></>
		}
	}
	const getFluxAvailableLiquidity = () => {
		const permaLockedMintableToken = uniswapFluxTokenReserves.flux.mul(new BN(percentLockedLiquidity * 100)).div(new BN(10000))

		const fluxEthUsdcLiquidity = `$ ${getPriceToggle({ value: permaLockedMintableToken, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return <DetailedListItem
			title={`Perma-Locked Liquidity:`}
			main={<>{BNToDecimal(permaLockedMintableToken, true, 18, 2)} {mintableTokenShortName}</>}
			sub={<>{fluxEthUsdcLiquidity}</>}
			description={<>{getAvailableLiquidity(Token.Mintable)}</>}
			buttons={[
			]}
		/>
	}

	const getFluxAvailableLiquidityEth = () => {
		const permaLockedEth = uniswapFluxTokenReserves.eth.mul(new BN(percentLockedLiquidity * 100)).div(new BN(10000))

		const fluxEthUsdcLiquidity = `$ ${getPriceToggle({ value: permaLockedEth, inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2 })} USD`;

		return <DetailedListItem
			title={`Perma-Locked ETH:`}
			main={<>{BNToDecimal(permaLockedEth, true, 18, 2)} ETH</>}
			sub={<>{fluxEthUsdcLiquidity}</>}
			buttons={[
			]}
		/>
	}

	return <Card >
		<CardContent>
			<Grid container justify="space-between" alignItems="center">
				<Grid item>
					<Typography variant="h5" component="h2">

						<LightTooltip title="This liquidity is permanently locked in the Uniswap v2 pool. This form of liquidity is locked-in to the ecosystem and can not be removed.">
							<Box>Perma-Locked Uniswap Liquidity</Box>
						</LightTooltip>
					</Typography>
				</Grid>
				<Grid item>
					<Typography variant="body2" color="textSecondary">
						<LightTooltip title="Click to view this information on Arbiscan">
							<Link href={`https://arbiscan.io/token/${mintableSushiSwapL2EthPair}#balances`} color="textSecondary" target="_blank" className={classes.address} >
								<Grid
									container
									direction="row"
									justify="center"
									alignItems="center"
								>
									<Grid item>
										View On Arbiscan
									</Grid>
									<Grid item>
										<Box ml={0.5}>
											<OpenInNewIcon fontSize="small" />
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
				<Grid item xs={12} md={6}>
					{getFluxAvailableLiquidity()}
					{getFluxAvailableLiquidityEth()}
				</Grid>
				<Grid item xs={12} md={6}>
					{getLockedPercentage()}
				</Grid>
			</Grid>
		</CardContent>
	</Card>
});

const LockedLiquidityCard: React.FC = () => {
	const { state: web3State } = useContext(Web3Context)

	const { balances, ecosystem } = web3State;
	if (!balances || !balances.lockedLiquidityUniAmount || !balances.lockedLiquidtyUniTotalSupply) {
		return null;
	}

	return <Render
		balances={balances}
		ecosystem={ecosystem}
	/>
}

export default LockedLiquidityCard;