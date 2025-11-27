import React from 'react';

import { Box, Button, Chip, Divider, Link, Menu, MenuItem, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

import sushiSwapLogo from '@/react/svgs/sushiSwap.svg';
import uniswapLogo from '@/react/svgs/uniswap.svg';

import { tss } from 'tss-react/mui';
import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import { dispatch as appDispatch } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';

const useStyles = tss.create(({ theme }) => ({
	chip: {
		cursor: 'pointer',
	},
	buttonsContainer: {
		[theme.breakpoints.down('md')]: {},
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'center',
		},
	},
	buttonsGroup: {
		[theme.breakpoints.down('md')]: {},
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(3),
			flexDirection: 'column',
			alignItems: 'center',
		},
	},
	buttonGridItem: {
		[theme.breakpoints.down('sm')]: {
			padding: 0,
			'& .MuiButton-root': {
				minWidth: 200,
			},
			'& .MuiBox-root': {
				margin: 0,
			},
		},
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
			height: 32,
		},
	},
	menuItem: {
		display: 'block',
	},
}));

export enum LiquidityPoolButtonType {
	SmallText = 'SmallText',

	SmallButton = 'SmallButton',
	MediumButton = 'MediumButton',
	LargeButton = 'LargeButton',
	ExtraLargeButton = 'ExtraLargeButton',
	TextLink = 'TextLink',
}
interface TradePool {
	name: string;
	links: {
		info: string;
		buy: string;
		addLiquidity: string;
	};
	layer: number;
}

interface Params {
	buttonType: LiquidityPoolButtonType;
	hideIcon?: boolean;

	contents?: React.ReactElement;
	ecosystem: Ecosystem;
}
const ExploreLiquidityPools: React.FC<Params> = ({ buttonType, hideIcon, contents, ecosystem }) => {
	const { liquidityPoolGroups } = getEcosystemConfig(ecosystem);

	const { classes } = useStyles();

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
			return 'large';
		};
		const size = getSize();
		switch (buttonType) {
			case LiquidityPoolButtonType.SmallText:
				return (
					<Link underline="hover" color="secondary" href="#" onClick={handleClick}>
						<Grid container alignItems="center" justifyContent="center">
							<Grid>
								<Box mr={0.5} className={classes.logoContainer}>
									<img src={uniswapLogo} style={{ left: 14 }} />
									<img src={sushiSwapLogo} style={{ left: -9 }} />
								</Box>
							</Grid>
							<Grid>Explore Liquidity Pools</Grid>
						</Grid>
					</Link>
				);
			case LiquidityPoolButtonType.SmallButton:
			case LiquidityPoolButtonType.MediumButton:
			case LiquidityPoolButtonType.LargeButton:
			case LiquidityPoolButtonType.ExtraLargeButton:
				return (
					<Button
						variant="outlined"
						color="secondary"
						size={size}
						style={{ fontSize: buttonType === LiquidityPoolButtonType.ExtraLargeButton ? '1.1rem' : undefined }}
						aria-controls="simple-menu"
						aria-haspopup="true"
						onClick={handleClick}
					>
						<Grid container alignItems="center" justifyContent="center">
							<Grid>
								<Box mr={1} className={classes.logoContainer}>
									<img
										src={uniswapLogo}
										style={{ left: buttonType == LiquidityPoolButtonType.SmallButton ? 18 : 14 }}
									/>
									<img
										src={sushiSwapLogo}
										style={{ left: buttonType == LiquidityPoolButtonType.SmallButton ? -3 : -9 }}
									/>
								</Box>
							</Grid>
							<Grid>Explore Liquidity Pools</Grid>
						</Grid>
					</Button>
				);
			case LiquidityPoolButtonType.TextLink:
				return (
					<Link underline="hover" onClick={handleClick} color="textSecondary">
						{contents}
					</Link>
				);
		}
	};
	const getMenuItems = () => {
		return liquidityPoolGroups.map((group, index) => {
			const getGroupMenuItems = () => {
				return group.map((pool, index) => {
					const getHotLabel = () => {
						if (!pool.isHot) {
							return null;
						}

						return (
							<Box ml={1} display="inline-block">
								<Chip size="small" label="HOT🔥" variant="outlined" />
							</Box>
						);
					};

					const handleTradeClick = (event: React.MouseEvent<any>) => {
						event.preventDefault();

						setTradePool(pool);
						setTradeAnchorEl(event.currentTarget);
					};

					const getTradeButton = () => {
						// Tokens below are all tokens that support built-in swaps
						if (pool.isBuiltinSwapEnabled) {
							const showTradeDialog = () => {
								appDispatch({
									type: commonLanguage.commands.Swap.ShowTradeDialog,
									payload: {
										input: {
											swapToken: pool.swapToken,
										},
									},
								});
								handleClose();
							};

							return (
								<Button size="large" variant="outlined" color="secondary" onClick={showTradeDialog}>
									Trade
								</Button>
							);
						}

						return (
							<Button
								size="large"
								variant="outlined"
								href={pool.links.buy}
								color="secondary"
								target="_blank"
								rel="noopener noreferrer"
							>
								Trade
							</Button>
						);
					};

					return (
						<MenuItem key={index} style={{ cursor: 'default' }} className={classes.menuItem}>
							<Grid
								container
								alignItems="center"
								justifyContent="space-between"
								spacing={2}
								className={classes.buttonsGroup}
							>
								<Grid>
									<Grid container>
										<Grid>
											<Box pl={1} pr={2} display="inline">
												<img src={pool.image} width={32} height={32} style={{ verticalAlign: 'middle' }} />
											</Box>
										</Grid>
										<Grid>
											{pool.name}
											{getHotLabel()}
										</Grid>
									</Grid>
								</Grid>
								<Grid>
									<Grid container spacing={2} className={classes.buttonsContainer}>
										<Grid className={classes.buttonGridItem}>
											<Box ml={3}>{getTradeButton()}</Box>
										</Grid>
										<Grid className={classes.buttonGridItem}>
											<Box ml={1}>
												<Button
													size="large"
													variant="outlined"
													href={pool.links.info}
													target="_blank"
													rel="noopener noreferrer"
												>
													Analytics
												</Button>
											</Box>
										</Grid>

										{/*
									<Grid className={classes.buttonGridItem}>
										<Box mx={1}>
											<Button size="large" variant="outlined" color="secondary" href={pool.links.addLiquidity} target="_blank" rel="noopener noreferrer">+ Add Liquidity</Button>
										</Box>
									</Grid>
									*/}
									</Grid>
								</Grid>
							</Grid>
						</MenuItem>
					);
				});
			};

			const getDivider = () => {
				if (index === liquidityPoolGroups.length - 1) {
					return null;
				}

				return (
					<Box my={1}>
						<Divider />
					</Box>
				);
			};

			return (
				<Box key={index}>
					<Box ml={2} mt={2} mb={1}>
						<Typography component="div" variant="body2" color="textSecondary">
							{index === 0 ? `Ethereum L1:` : `Arbitrum L2:`}
						</Typography>
					</Box>
					{getGroupMenuItems()}
					{getDivider()}
				</Box>
			);
		});
	};

	return (
		<>
			{getButton()}
			<Menu
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}
				anchorOrigin={{ vertical: 0, horizontal: 'left' }}
				transformOrigin={{ vertical: -50, horizontal: 'left' }}
			>
				<Box mx={2} my={2}>
					Our Liquidity Pools{' '}
					<Typography component="div" variant="body2" color="textSecondary" display="inline">
						(Liquidity Providers earn on every trade)
					</Typography>
				</Box>
				<Box my={1}>
					<Divider />
				</Box>
				{getMenuItems()}
			</Menu>
		</>
	);
};

export default ExploreLiquidityPools;
