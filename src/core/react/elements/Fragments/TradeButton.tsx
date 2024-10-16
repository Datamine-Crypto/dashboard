import React from 'react';
import { Token } from '../../../interfaces';

import { Button, Box, Link, MenuItem, Menu, Typography, Divider } from '@material-ui/core';
import LightTooltip from '../../../react/elements/LightTooltip';

import { getEcosystemConfig as getConfig } from '../../../../configs/config';

import uniswapLogo from '../../../../svgs/uniswap.svg';
import sushiSwapLogo from '../../../../svgs/sushiSwap.svg';
import oneInchLogo from '../../../../svgs/oneInch.svg';
import { Ecosystem, Layer } from '../../../../configs/config.common';

interface TradeRenderParams {
	token: Token;
	showBuyTokens?: boolean;
	ecosystem: Ecosystem;
	isBuy?: boolean;
}
const TradeRender: React.FC<TradeRenderParams> = React.memo(({ token, ecosystem, isBuy = true, showBuyTokens = false }) => {
	const ecosystemConfig = getConfig(ecosystem);
	const { isLiquidityPoolsEnabled, mintableTokenShortName, lockableTokenShortName, isLiquidityPoolAdditionalButtonsEnabled, layer } = ecosystemConfig

	if (!isLiquidityPoolsEnabled || !isLiquidityPoolAdditionalButtonsEnabled) {
		return <></>
	}

	const [tradeAnchorEl, setTradeAnchorEl] = React.useState<null | HTMLElement>(null);
	const handleCloseTrade = () => {
		setTradeAnchorEl(null);
	};


	const contractAddress = token === Token.Lockable ? ecosystemConfig.lockableTokenContractAddress : ecosystemConfig.mintableTokenContractAddress;
	const inputCurrency = isBuy ? 'eth' : contractAddress
	const outputCurrency = isBuy ? contractAddress : 'eth'

	const getTokenLabel = () => {
		return token === Token.Mintable ? mintableTokenShortName : lockableTokenShortName
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
			if (ecosystemConfig.layer !== Layer.Layer2) {
				return null;
			}
			return `(L2)`
		}

		const getSushiSwapMenuItem = () => {
			if (layer === Layer.Layer1) {
				return null;
			}
			const getLink = () => {
				return `https://app.sushi.com/swap?inputCurrency=${inputCurrency}&outputCurrency=${outputCurrency}`;
			}
			return <MenuItem component={Link} href={getLink()} target="_blank" rel="noopener noreferrer" color="textPrimary">
				<img src={sushiSwapLogo} width={32} height={32} />&nbsp;&nbsp;{isBuy ? 'Buy' : 'Sell'} {getTokenLabel()} on SushiSwap {getLayerLabel()}
			</MenuItem>
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
		</Menu>
	}

	return <Box mx={1} display="inline-block">
		{getButton()}
		{getTadeMenu()}
	</Box>
})

export const getTradeButton = ({ token, isBuy = true, showBuyTokens = false, ecosystem }: TradeRenderParams) => {
	return <TradeRender
		token={token}
		showBuyTokens={showBuyTokens}
		ecosystem={ecosystem}
		isBuy={isBuy}
	/>
}
