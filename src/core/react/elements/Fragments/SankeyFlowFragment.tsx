
import React from 'react';

import { Box } from "@material-ui/core";

import { Sankey, makeVisFlexible } from 'react-vis';
import { getPriceToggle, getBNPercent } from '../../../web3/helpers';
import { Token, FluxAddressDetails } from '../../../interfaces';
import { Balances } from '../../../web3/web3Reducer';
import BN from 'bn.js'
import { getConfig } from '../../../../config';

enum SankeyNodeType {
	KnownMoney,
	CirculatingSupply,
	Burned,
	UniswapSupply,
	RemainingSupply,


	FixedDamSupply,
	RemainingDamSupply,
	DamUniswapSupply,
	RemainingSupplyBridge
}

interface SankeyProps {
	balances: Balances;
	addressDetails: FluxAddressDetails;
	isArbitrumMainnet: boolean;
}
const SankeyFlowFragment: React.FC<SankeyProps> = React.memo(({ balances, addressDetails, isArbitrumMainnet }) => {
	const { mintableTokenShortName, lockableTokenShortName } = getConfig()

	const mainHeadingStyle = { fill: 'rgba(255, 255, 255, 0.7)' }

	const getFormattedAmount = (value: BN, token: Token) => {
		const balanceInUsdc = `$ ${getPriceToggle({ value, inputToken: token, outputToken: Token.USDC, balances, round: 2 })}`;
		//{BNToDecimal(value, true,18,2)} FLUX / 
		return <>{balanceInUsdc}</>
	}

	const lockedPercent = getBNPercent(addressDetails.globalLockedAmount, balances.damTotalSupply, false)
	const remainingPercent = (100 - parseFloat(lockedPercent)).toFixed(2)
	const damUniswapPercent = getBNPercent(balances.uniswapDamTokenReserves.dam, balances.damTotalSupply, false)

	const originalSupply = balances.fluxTotalSupply.add(addressDetails.globalBurnedAmount)

	if (addressDetails.globalBurnedAmount.isZero()) {
		return null;
	}
	const fluxBurnedPercent = balances.fluxTotalSupply.mul(new BN(10000)).div(addressDetails.globalBurnedAmount)

	const circulatingSupply = balances.fluxTotalSupply
	const m0Supply = balances.uniswapFluxTokenReserves.flux
	const remainingSupply = balances.fluxTotalSupply.sub(balances.uniswapFluxTokenReserves.flux)

	const originalDamSupply = balances.damTotalSupply
	const lockedDamSupply = addressDetails.globalLockedAmount
	const remainingDamSupply = originalDamSupply.sub(lockedDamSupply).sub(balances.uniswapDamTokenReserves.dam)

	const daysMinting = Math.floor((Date.now() - ((isArbitrumMainnet ? 1634936388000 : 1591626738000) - 60 * 60 * 4 * 1000)) / (60 * 60 * 24 * 1000))
	const burnedFluxDays = Math.floor(daysMinting / (100 / (fluxBurnedPercent.toNumber() / 100)))

	const getRemainingSupply = () => {
		if (!isArbitrumMainnet) {
			return [

				{ title: `${mintableTokenShortName}Arbitrum Bridge (L2)`, subtitle: <>{getFormattedAmount(balances.arbitrumBridgeBalance, Token.Mintable)}</> },
			]
		}

		return [
		]
	}

	const lines = [
		{ title: `${lockableTokenShortName} Powering Validators (${lockedPercent}%)`, subtitle: <>{getFormattedAmount(lockedDamSupply, Token.DAM)}</> },
		{ title: null, subtitle: <>{getFormattedAmount(originalSupply, Token.Mintable)}</> },
		{ title: `${mintableTokenShortName} Destroyed (${burnedFluxDays} Days of Labor)`, subtitle: <>{getFormattedAmount(addressDetails.globalBurnedAmount, Token.Mintable)}</> },
		{ title: `${mintableTokenShortName} / ETH Uniswap (M0)`, subtitle: <>{getFormattedAmount(balances.uniswapFluxTokenReserves.flux, Token.Mintable)}</> },
		{ title: `${mintableTokenShortName} Remaining (${daysMinting - burnedFluxDays} Days of Labor)`, subtitle: <>{getFormattedAmount(remainingSupply.sub(balances.arbitrumBridgeBalance), Token.Mintable)}</> },

		{ title: `${lockableTokenShortName} Fixed Supply`, subtitle: <>{getFormattedAmount(originalDamSupply, Token.DAM)}</> },
		{ title: `${lockableTokenShortName} Remaining Supply (${remainingPercent}%)`, subtitle: <>{getFormattedAmount(remainingDamSupply, Token.DAM)}</> },
		{ title: `${lockableTokenShortName} / ETH Uniswap (${damUniswapPercent}%)`, subtitle: <>{getFormattedAmount(balances.uniswapDamTokenReserves.dam, Token.DAM)}</> },
		...getRemainingSupply(),
	]

	const getLine = (nodeType: SankeyNodeType, dx: string) => {
		if (!lines[nodeType].title) {
			return <tspan></tspan>
		}
		return <tspan><tspan style={mainHeadingStyle}>{lines[nodeType].title}:</tspan> <tspan dx={'5px'}>{lines[nodeType].subtitle}</tspan></tspan>
	}

	const getRemainingSupplyNodes = () => {
		if (!isArbitrumMainnet) {
			return [
				{ name: getLine(SankeyNodeType.RemainingSupplyBridge, '-0px') },
			]
		}

		return [
		]
	}

	const nodes = [
		{ name: getLine(SankeyNodeType.KnownMoney, '-0px') },
		{ name: getLine(SankeyNodeType.CirculatingSupply, '-0px') },
		{ name: getLine(SankeyNodeType.Burned, '-0px') },
		{ name: getLine(SankeyNodeType.UniswapSupply, '-0px') },
		{ name: getLine(SankeyNodeType.RemainingSupply, '-0px') },

		{ name: getLine(SankeyNodeType.FixedDamSupply, '0px') },
		{ name: getLine(SankeyNodeType.RemainingDamSupply, '0px') },
		{ name: getLine(SankeyNodeType.DamUniswapSupply, '0px') },

		...getRemainingSupplyNodes(),
	];

	const getNodeValue = (value: BN, token: Token) => {
		const usdcPrice = getPriceToggle({ value, inputToken: token, outputToken: Token.USDC, balances, round: 2 }).replace(/\,/g, '')
		return parseFloat(usdcPrice)
	}

	const getRemainingSupplyLinks = () => {
		if (!isArbitrumMainnet) {
			return [
				{ source: SankeyNodeType.CirculatingSupply, target: SankeyNodeType.RemainingSupply, value: getNodeValue(remainingSupply.div(new BN(2)), Token.Mintable), color: '#ffffff1a' },
				{ source: SankeyNodeType.CirculatingSupply, target: SankeyNodeType.RemainingSupplyBridge, value: getNodeValue(remainingSupply.div(new BN(2)), Token.Mintable), color: '#2698e41a' },
			]
		}

		return [
			{ source: SankeyNodeType.CirculatingSupply, target: SankeyNodeType.RemainingSupply, value: getNodeValue(remainingSupply, Token.Mintable), color: '#ffffff1a' },
		]
	}

	const links = [
		{ source: SankeyNodeType.CirculatingSupply, target: SankeyNodeType.Burned, value: getNodeValue(addressDetails.globalBurnedAmount, Token.Mintable), color: '#ffb5001a' },
		{ source: SankeyNodeType.KnownMoney, target: SankeyNodeType.CirculatingSupply, value: getNodeValue(lockedDamSupply, Token.DAM), color: '#00ffff1a' },
		{ source: SankeyNodeType.CirculatingSupply, target: SankeyNodeType.UniswapSupply, value: getNodeValue(m0Supply, Token.Mintable), color: '#f200751a' },

		{ source: SankeyNodeType.FixedDamSupply, target: SankeyNodeType.KnownMoney, value: getNodeValue(lockedDamSupply, Token.DAM), color: '#00ffff1a' },
		{ source: SankeyNodeType.FixedDamSupply, target: SankeyNodeType.RemainingDamSupply, value: getNodeValue(remainingDamSupply, Token.DAM), color: '#ffffff1a' },
		{ source: SankeyNodeType.FixedDamSupply, target: SankeyNodeType.DamUniswapSupply, value: getNodeValue(balances.uniswapDamTokenReserves.dam, Token.DAM), color: '#f200751a' },
		...getRemainingSupplyLinks(),
	];
	if (links.some(link => link.value === 0)) {
		return null
	}

	const FlexibleSankey = makeVisFlexible(Sankey);
	return <Box style={{ overflow: 'auto', overflowY: 'hidden' }}><Box style={{ minWidth: 1024 }}>
		<FlexibleSankey
			nodes={nodes}
			links={links}
			align='left'
			height={400}
			nodePadding={16}
			nodeWidth={4}
			margin={16}
			style={{
				labels: {
					fill: '#fff'
				},
				links: {
				},
				rects: {
					fill: 'rgb(0, 127, 127)',
					stroke: 'rgb(0, 127, 127)',
				}
			}}
		/>
	</Box></Box>

})

export default SankeyFlowFragment;