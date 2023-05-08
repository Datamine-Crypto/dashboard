import React from 'react';
import { Token } from '../../../interfaces';

import { Button, Box, Link, MenuItem, Menu, Typography, Divider } from '@material-ui/core';
import LightTooltip from '../../../react/elements/LightTooltip';

import { getConfig } from '../../../../config';

import uniswapLogo from '../../../../svgs/uniswap.svg';
import sushiSwapLogo from '../../../../svgs/sushiSwap.svg';
import oneInchLogo from '../../../../svgs/oneInch.svg';

interface TradeRenderParams {
	token: Token;
	showBuyTokens?: boolean;
	isArbitrumMainnet?: boolean;
	isBuy?: boolean;
}
const TradeRender: React.FC<TradeRenderParams> = React.memo(({ token, isBuy = true, showBuyTokens = false, isArbitrumMainnet = false }) => {
	const config = getConfig(isArbitrumMainnet);
	const { isLiquidityPoolsEnabled, mintableTokenShortName, lockableTokenShortName } = config

	if (!isLiquidityPoolsEnabled) {
		return <></>
	}

	const [tradeAnchorEl, setTradeAnchorEl] = React.useState<null | HTMLElement>(null);
	const handleCloseTrade = () => {
		setTradeAnchorEl(null);
	};


	const contractAddress = token === Token.DAM ? config.lockableTokenContractAddress : config.mintableTokenContractAddress;
	const inputCurrency = isBuy ? 'eth' : contractAddress
	const outputCurrency = isBuy ? contractAddress : 'eth'

	const getTokenLabel = () => {
		return token === Token.FLUX ? mintableTokenShortName : lockableTokenShortName
	}

	const getButton = () => {

		const handleTradeClick = (event: React.MouseEvent<any>) => {
			event.preventDefault();

			setTradeAnchorEl(event.currentTarget);
		};

		const button = <Link onClick={handleTradeClick}>
			<Button size="small" variant="outlined" color="secondary">{showBuyTokens ? 'Buy Tokens' : (isBuy ? 'Buy' : 'Sell')}</Button>
		</Link>

		return <LightTooltip title={`${isBuy ? 'Buy' : 'Sell'} ${getTokenLabel()}`}>
			{button}
		</LightTooltip>;
	}

	const getTadeMenu = () => {

		const getLayerLabel = () => {
			if (!isArbitrumMainnet) {
				return null;
			}
			return `(L2)`
		}

		const getSushiSwapMenuItem = () => {
			if (!isArbitrumMainnet) {
				return null;
			}
			const getLink = () => {
				return `https://app.sushi.com/swap?inputCurrency=${inputCurrency}&outputCurrency=${outputCurrency}`;
			}
			return <MenuItem component={Link} href={getLink()} target="_blank" rel="noopener noreferrer" color="textPrimary">
				<img src={sushiSwapLogo} width={32} height={32} />&nbsp;&nbsp;{isBuy ? 'Buy' : 'Sell'} {getTokenLabel()} on SushiSwap {getLayerLabel()}
			</MenuItem>
		}

		const getOneInchMenuItem = () => {
			if (!isArbitrumMainnet) {
				return null;
			}
			const getLink = () => {
				//@todo ETH mainnet will not be 42161
				return `https://app.1inch.io/#/42161/swap/${inputCurrency}/${outputCurrency}`;
			}
			return <>
				<Box my={1}>
					<Divider />
				</Box>
				<MenuItem component={Link} href={getLink()} target="_blank" rel="noopener noreferrer" color="textPrimary">
					<img src={oneInchLogo} width={32} height={32} />&nbsp;&nbsp;{isBuy ? 'Buy' : 'Sell'} {getTokenLabel()} on 1inch {getLayerLabel()}&nbsp;&nbsp;
					<Typography variant="body2" color="textSecondary" display="inline">(DEX Aggregator)</Typography>
				</MenuItem>
			</>
		}
		const getUniswapMenuItem = () => {
			const getLink = () => {
				//@todo ETH mainnet will not be 42161
				return `https://app.uniswap.org/#/swap?inputCurrency=${inputCurrency}&outputCurrency=${outputCurrency}`;
			}
			return <MenuItem component={Link} href={getLink()} target="_blank" rel="noopener noreferrer" color="textPrimary">
				<img src={uniswapLogo} width={32} height={32} />&nbsp;&nbsp;{isBuy ? 'Buy' : 'Sell'} {getTokenLabel()} on Uniswap {getLayerLabel()}
			</MenuItem>
		}

		return <Menu
			id="trade-menu"
			anchorEl={tradeAnchorEl}
			keepMounted
			open={Boolean(tradeAnchorEl)}
			onClose={handleCloseTrade}
			anchorOrigin={{ vertical: 0, horizontal: "left" }}
			transformOrigin={{ vertical: -50, horizontal: "left" }}
		>
			{getSushiSwapMenuItem()}
			{getUniswapMenuItem()}
			{getOneInchMenuItem()}
		</Menu>
	}

	return <Box mx={1} display="inline-block">
		{getButton()}
		{getTadeMenu()}
	</Box>
})

export const getTradeButton = ({ token, isBuy = true, showBuyTokens = false, isArbitrumMainnet = false }: TradeRenderParams) => {
	return <TradeRender
		token={token}
		showBuyTokens={showBuyTokens}
		isArbitrumMainnet={isArbitrumMainnet}
		isBuy={isBuy}
	/>
}
