
import React from 'react';

import { Typography, Box, Button, Link, Grid, Menu, MenuItem, Divider, Chip, makeStyles } from "@material-ui/core";

import uniswapLogo from '../../../../svgs/uniswap.svg';
import sushiSwapLogo from '../../../../svgs/sushiSwap.svg';

import oneInchLogo from '../../../../svgs/oneInch.svg';
import { getConfig } from '../../../../config';




const useStyles = makeStyles((theme) => ({
	chip: {
		cursor: 'pointer'
	},
	buttonsContainer: {

		[theme.breakpoints.down('md')]: {

		},
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'center'
		},
	},
	buttonsGroup: {

		[theme.breakpoints.down('md')]: {

		},
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(3),
			flexDirection: 'column',
			alignItems: 'center'
		},
	},
	buttonGridItem: {
		[theme.breakpoints.down('sm')]: {
			padding: 0,
			'& .MuiButton-root': {
				minWidth: 200
			},
			'& .MuiBox-root': {
				margin: 0
			}
		}
	},
	logoContainer: {
		position: 'relative',
		width: 47,
		height: 32,
		'& img': {
			verticalAlign: 'middle',
			position: 'absolute',
			top: 0,
			width: 32,
			height: 32
		}
	}
}));

interface Props {
	//isArbitrumMainnet: boolean;
	//isSmall?: boolean;
	//isMedium?: boolean;
	//isStandaloneButton?: boolean;
	buttonType: LiquidityPoolButtonType;
	hideIcon?: boolean;

	contents?: React.ReactElement;
}
export enum LiquidityPoolButtonType {
	SmallText = 'SmallText',

	SmallButton = 'SmallButton',
	MediumButton = 'MediumButton',
	LargeButton = 'LargeButton',
	ExtraLargeButton = 'ExtraLargeButton',
	TextLink = 'TextLink'

}
interface TradePool {
	name: string;
	links: {
		info: string;
		buy: string;
		addLiquidity: string;
	}
	layer: number;
}
const ExploreLiquidityPools: React.FC<Props> = React.memo(({ buttonType, contents }) => {

	const { liquidityPoolGroups } = getConfig(false)

	const classes = useStyles();

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const [tradeAnchorEl, setTradeAnchorEl] = React.useState<null | HTMLElement>(null);

	const [tradePool, setTradePool] = React.useState<TradePool | null>(null);

	const handleClick = (event: React.MouseEvent<any>) => {
		event.preventDefault();
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
		setTradeAnchorEl(null);
	};
	const handleCloseTrade = () => {
		setTradeAnchorEl(null);
	};
	const getButton = () => {
		const getSize = () => {
			switch (buttonType) {

				case LiquidityPoolButtonType.SmallButton:

					return 'small';
			}
			return 'large'

		}
		const size = getSize();
		switch (buttonType) {
			case LiquidityPoolButtonType.SmallText:
				return <Link color="secondary" href="#" onClick={handleClick}>
					<Grid container alignItems="center" justify="center">
						<Grid item>
							<Box mr={0.5} className={classes.logoContainer}>
								<img src={uniswapLogo} style={{ left: 14 }} />
								<img src={sushiSwapLogo} style={{ left: -9 }} />
							</Box>
						</Grid>
						<Grid item>
							Explore Liquidity Pools
						</Grid>
					</Grid>
				</Link>
			case LiquidityPoolButtonType.SmallButton:
			case LiquidityPoolButtonType.MediumButton:
			case LiquidityPoolButtonType.LargeButton:
			case LiquidityPoolButtonType.ExtraLargeButton:
				return <Button variant="outlined" color="secondary" size={size} style={{ fontSize: buttonType === LiquidityPoolButtonType.ExtraLargeButton ? '1.1rem' : undefined }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
					<Grid container alignItems="center" justify="center">
						<Grid item>
							<Box mr={1} className={classes.logoContainer}>
								<img src={uniswapLogo} style={{ left: buttonType == LiquidityPoolButtonType.SmallButton ? 18 : 14 }} />
								<img src={sushiSwapLogo} style={{ left: buttonType == LiquidityPoolButtonType.SmallButton ? -3 : -9 }} />
							</Box>
						</Grid>
						<Grid item>
							Explore Liquidity Pools
						</Grid>

					</Grid>
				</Button>
			case LiquidityPoolButtonType.TextLink:
				return <Link onClick={handleClick} color="textSecondary">{contents}</Link>
		}
	}
	const getMenuItems = () => {
		return liquidityPoolGroups.map((group, index) => {

			const getGroupMenuItems = () => {
				return group.map((pool, index) => {

					const getHotLabel = () => {
						if (!pool.isHot) {
							return null;
						}

						return <Box ml={1} display="inline-block"><Chip size="small" label="HOT🔥" variant="outlined" /></Box>
					}

					const handleTradeClick = (event: React.MouseEvent<any>) => {
						event.preventDefault();

						setTradePool(pool);
						setTradeAnchorEl(event.currentTarget);

					};


					return <MenuItem key={index} style={{ cursor: 'default' }}>
						<Grid container alignItems="center" justify="space-between" spacing={2} className={classes.buttonsGroup}>
							<Grid item>
								<Grid container>
									<Grid item>
										<Box pl={1} pr={2} display="inline">
											<img src={pool.image} width={32} height={32} style={{ verticalAlign: 'middle' }} />
										</Box>
									</Grid>
									<Grid item>
										{pool.name}
										{getHotLabel()}
									</Grid>
								</Grid>
							</Grid>
							<Grid item>
								<Grid container spacing={2} className={classes.buttonsContainer}>
									<Grid item className={classes.buttonGridItem}>
										<Box ml={3}>
											<Button size="large" variant="outlined" href={pool.links.buy} color="secondary" target="_blank" rel="noopener noreferrer">Trade</Button>
										</Box>

									</Grid>
									<Grid item className={classes.buttonGridItem}>
										<Box ml={1}>
											<Button size="large" variant="outlined" href={pool.links.info} target="_blank" rel="noopener noreferrer">Analytics</Button>
										</Box>
									</Grid>
									<Grid item className={classes.buttonGridItem}>
										<Box mx={1}>
											<Button size="large" variant="outlined" color="secondary" href={pool.links.addLiquidity} target="_blank" rel="noopener noreferrer">+ Add Liquidity</Button>
										</Box>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</MenuItem>
				})
			}

			const getDivider = () => {
				if (index === liquidityPoolGroups.length - 1) {
					return null;
				}

				return <Box my={1}>
					<Divider />
				</Box>
			}

			return <Box key={index}>
				<Box ml={2} mt={2} mb={1}>
					<Typography variant="body2" color="textSecondary">{index === 0 ? `Ethereum L1:` : `Arbitrum L2:`}</Typography>
				</Box>
				{getGroupMenuItems()}
				{getDivider()}
			</Box>
		})
	}

	// This was the old dropdown alternative (if we end up going with multiple liquidity providers again)
	/*
	const getTadeMenu = () => {
		if (!tradePool) {
			return null;
		}

		const getLayerLabel = () => {
			if (tradePool.layer === 1) {
				return null;
			}

			return `(L${tradePool.layer})`
		}

		const getSushiSwapMenuItem = () => {
			if (tradePool.layer === 1) {
				return null;
			}
			return <MenuItem component={Link} href={tradePool.links.buy.sushiSwap} target="_blank" rel="noopener noreferrer" color="textPrimary">
				<img src={sushiSwapLogo} width={32} height={32} />&nbsp;&nbsp;Trade {tradePool.name} on SushiSwap {getLayerLabel()}
			</MenuItem>
		}

		const getOneInchMenuItem = () => {
			if (!tradePool.links.buy.oneInch || tradePool.layer === 1) {
				return null;
			}
			return <>
				<Box my={1}>
					<Divider />
				</Box>
				<MenuItem component={Link} href={tradePool.links.buy.oneInch} target="_blank" rel="noopener noreferrer" color="textPrimary">
					<img src={oneInchLogo} width={32} height={32} />&nbsp;&nbsp;Trade {tradePool.name} on 1inch {getLayerLabel()}&nbsp;&nbsp;
					<Typography variant="body2" color="textSecondary" display="inline">(DEX Aggregator)</Typography>
				</MenuItem>
			</>
		}

		const getSolidLizardMenuItem = () => {
			if (tradePool.layer === 1) {
				return null;
			}
			return <>
				<Box my={1}>
					<Divider />
				</Box>
				<MenuItem component={Link} href={tradePool.links.buy.solidLizard} target="_blank" rel="noopener noreferrer" color="textPrimary">
					<img src="./images/solidLizard.png" width={32} height={32} />&nbsp;&nbsp;Trade {tradePool.name} on SolidLizard {getLayerLabel()}&nbsp;&nbsp;
					<Typography variant="body2" color="textSecondary" display="inline">(ve(3,3) DEX)</Typography>
				</MenuItem>
			</>
		}
		const getUniswapMenuItem = () => {
			if (tradePool.layer === 2) {
				return null;
			}
			return (
				<MenuItem component={Link} href={tradePool.links.buy.uniswap} target="_blank" rel="noopener noreferrer" color="textPrimary">
					<img src={uniswapLogo} width={32} height={32} />&nbsp;&nbsp;Trade {tradePool.name} on Uniswap {getLayerLabel()}
				</MenuItem>
			)
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
			{getSolidLizardMenuItem()}
			{getOneInchMenuItem()}
		</Menu>
	}
	*/

	return <>
		{getButton()}
		<Menu
			id="liquidity-pools-menu"
			anchorEl={anchorEl}
			keepMounted
			open={Boolean(anchorEl)}
			onClose={handleClose}
			anchorOrigin={{ vertical: 0, horizontal: "left" }}
			transformOrigin={{ vertical: -50, horizontal: "left" }}
		>
			<Box mx={2} my={2}>
				Our Liquidity Pools <Typography variant="body2" color="textSecondary" display="inline">(Liquidity Providers earn on every trade)</Typography>
			</Box>
			<Box my={1}>
				<Divider />
			</Box>
			{getMenuItems()}
		</Menu>

		{/*getTadeMenu()*/}
	</>
})

export default ExploreLiquidityPools;