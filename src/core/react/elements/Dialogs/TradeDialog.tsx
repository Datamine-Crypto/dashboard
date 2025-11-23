import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Link,
	MenuItem,
	TextField,
	Typography,
} from '@mui/material';
import React from 'react';
import { KeyboardArrowDown } from '@mui/icons-material';
import { Grid } from '@mui/system';
import BN from 'bn.js';
import { tss } from 'tss-react/mui';
import { getEcosystemConfig } from '@/configs/config';
import { Ecosystem, Layer } from '@/configs/config.common';
import arbiFluxLogo from '@/svgs/arbiFluxLogo.svg';
import EthereumPurpleLogo from '@/svgs/ethereumPurple.svg';
import fluxLogo from '@/svgs/fluxLogo.svg';
import lockquidityLogo from '@/svgs/lockquidity.svg';
import damLogo from '@/svgs/logo.svg';
import uniswap from '@/svgs/uniswap.svg';
import { Token } from '@/core/interfaces';
import { availableSwapTokens } from '@/core/utils/swap/performSwap';
import { SwapOperation, SwapToken, SwapTokenDetails, SwapTokenWithAmount } from '@/core/utils/swap/swapOptions';
import { BNToDecimal, getPriceToggle, parseBN, switchNetwork } from '@/core/web3/helpers';
import { useAppStore } from '@/core/web3/appStore';
import { Balances, ConnectionMethod, SwapState, SwapTokenBalances } from '@/core/web3/reducer/interfaces';
import { commonLanguage } from '@/core/web3/reducer/common';
import { useShallow } from 'zustand/react/shallow';
interface RenderParams {
	balances: Balances | null;
	swapTokenBalances: SwapTokenBalances | null;
	dispatch: ReducerDispatch;
	error: string | null;
	ecosystem: Ecosystem;
	selectedAddress: string | null;
	hasWeb3: boolean | null;
	swapState: SwapState;
	connectionMethod: ConnectionMethod;
	lastSwapThrottle: number | null;
}
interface ComboBoxProps {
	value: any;
	label: React.ReactNode;
	swapToken: SwapToken | null;
	swapTokenDetails: SwapTokenDetails[];
	swapOperation: SwapOperation;
}
const useStyles = tss.create(({ theme }) => ({
	topLeftPrices: {
		color: '#FFF',
	},
	topLeftPricesContainer: {
		flexDirection: 'column',
	},
}));
const Render: React.FC<RenderParams> = React.memo(
	({
		swapTokenBalances,
		balances,
		dispatch,
		error,
		hasWeb3,
		ecosystem,
		selectedAddress,
		swapState,
		connectionMethod,
		lastSwapThrottle,
	}) => {
		const { classes } = useStyles();
		const { mintableTokenShortName, navigation, mintableTokenPriceDecimals, lockableTokenShortName, layer } =
			getEcosystemConfig(ecosystem);
		const { isHelpPageEnabled } = navigation;
		const inputTokenDetails = availableSwapTokens.find(
			(token) => token.shortName === swapState.input.swapToken
		) as SwapTokenDetails;
		const outputTokenDetails = availableSwapTokens.find(
			(token) => token.shortName === swapState.output.swapToken
		) as SwapTokenDetails;
		const isLayerMismatch =
			(inputTokenDetails.layer !== null && inputTokenDetails.layer !== layer) ||
			(outputTokenDetails.layer !== null && outputTokenDetails.layer !== layer);
		const onClose = (event: any = undefined, reason: any = undefined) => {
			// Prevent closing by clicking outside dialog
			if (reason === 'backdropClick') {
				return;
			}
			dispatch({ type: commonLanguage.commands.CloseDialog });
		};
		const onFlipSwap = () => {
			dispatch({ type: commonLanguage.commands.Swap.FlipSwap });
		};
		const onSubmit = async (e: any) => {
			e.preventDefault();
			if (isLayerMismatch) {
				// Clear the input amount (since the tokens will change)
				dispatch({
					type: commonLanguage.commands.Swap.SetAmount,
					payload: {
						amount: '',
					},
				});
				const targetEcosystem = inputTokenDetails.ecosystem ?? (outputTokenDetails.ecosystem as Ecosystem);
				const targetEcosystemConfig = getEcosystemConfig(targetEcosystem);
				await switchNetwork(
					targetEcosystem,
					connectionMethod,
					targetEcosystemConfig.layer === Layer.Layer2 ? '0xa4b1' : '0x1'
				);
				dispatch({ type: commonLanguage.commands.ReinitializeWeb3, payload: { targetEcosystem } });
				return;
			}
			if (!selectedAddress) {
				if (hasWeb3 === null) {
					dispatch({ type: commonLanguage.commands.Initialize, payload: { address: null } });
				} else {
					window.location.href = '#dashboard';
					onClose();
				}
				return;
			}
			dispatch({
				type: commonLanguage.commands.Swap.Trade,
				payload: {},
			});
		};
		const getLearnMoreBurningLink = () => {
			if (!isHelpPageEnabled) {
				return null;
			}
			return (
				<>
					{' '}
					<Link
						color="textSecondary"
						href="#help/uniswap/buyingDatamineTokens"
						rel="noopener noreferrer"
						target="_blank"
					>
						Click here
					</Link>{' '}
					to learn more.
				</>
			);
		};
		const getCombobox = ({ value, label, swapToken, swapTokenDetails, swapOperation }: ComboBoxProps) => {
			const handleChangeAmount = (e: any) => {
				//@todo add logic for output amount edit
				if (swapOperation !== SwapOperation.Input) {
					return;
				}
				dispatch({
					type: commonLanguage.commands.Swap.SetAmount,
					payload: {
						amount: e.target.value.trim(),
					},
				});
			};
			const handleTokenChange = (e: any) => {
				dispatch({
					type: commonLanguage.commands.Swap.SetToken,
					payload: {
						swapToken: e.target.value,
						swapOperation,
					},
				});
			};
			const isDisabled = !selectedAddress || swapOperation === SwapOperation.Output || isLayerMismatch;
			return (
				<Grid container alignItems="center">
					<Grid size="grow">
						<TextField
							type="text"
							value={value}
							label={label}
							variant="outlined"
							id="outlined-start-adornment"
							fullWidth
							disabled={isDisabled}
							onChange={handleChangeAmount}
							slotProps={{
								inputLabel: { shrink: true },
							}}
							autoFocus={!isDisabled}
						/>
					</Grid>
					<Grid size={6} spacing={2}>
						{' '}
						{/* No 'item' prop */}
						<TextField id="outlined-select-currency" select value={swapToken} fullWidth onChange={handleTokenChange}>
							{swapTokenDetails.map((token: SwapTokenDetails) => (
								<MenuItem key={token.shortName} value={token.shortName}>
									<img src={token.logo} width={24} height={24} style={{ verticalAlign: 'middle' }} /> {token.longName} (
									{token.shortName})
								</MenuItem>
							))}
						</TextField>
					</Grid>
				</Grid>
			);
		};
		const outputTokens = availableSwapTokens;
		const inputTokens = availableSwapTokens;
		const getErrorMesage = () => {
			const getErrorText = () => {
				if (!selectedAddress) {
					return hasWeb3 === null
						? 'Web3 connection required, click Connect button below'
						: 'Ethereum based wallet required, click Continue button below.';
				}
				if (isLayerMismatch) {
					return `You are currently on ${layer === Layer.Layer1 ? 'Ethereum (L1)' : 'Arbitrum (L2)'} Layer and need to switch before trading. Please click the "Switch To ${layer === Layer.Layer1 ? 'L2' : 'L1'}" button below.`;
				}
				return error;
			};
			const errorText = getErrorText();
			if (!errorText) {
				return;
			}
			return (
				<Box my={2}>
					<Alert severity={!hasWeb3 || !selectedAddress ? 'info' : 'warning'}>{errorText}</Alert>
				</Box>
			);
		};
		const getBalances = () => {
			if (!swapTokenBalances) {
				return;
			}
			const getIcon = (swapToken: SwapToken) => {
				const getIconPath = () => {
					switch (swapToken) {
						case SwapToken.ArbiFLUX:
							return arbiFluxLogo;
						case SwapToken.DAM:
							return damLogo;
						case SwapToken.FLUX:
							return fluxLogo;
						case SwapToken.LOCK:
							return lockquidityLogo;
						case SwapToken.ETH:
							return EthereumPurpleLogo;
					}
				};
				return <img src={getIconPath()} width={24} height={24} style={{ verticalAlign: 'middle' }} />;
			};
			const layerBalances = swapTokenBalances[layer];
			const getPrices = () => {
				const getFluxPrice = (token: Token) => {
					if (ecosystem != Ecosystem.Flux && ecosystem != Ecosystem.ArbiFlux) {
						return;
					}
					const balance = layerBalances[SwapToken.FLUX];
					if (balance.isZero() || !balances) {
						return;
					}
					return (
						<Grid>
							{getIcon(SwapToken.FLUX)}{' '}
							<>
								{BNToDecimal(balance, true, 18, 18)} {mintableTokenShortName}
							</>
							{' / '}${' '}
							{getPriceToggle({ value: balance, inputToken: token, outputToken: Token.USDC, balances, round: 2 })} USD
						</Grid>
					);
				};
				const getArbiFluxPrice = (token: Token) => {
					if (ecosystem != Ecosystem.ArbiFlux && ecosystem != Ecosystem.Lockquidity) {
						return;
					}
					if (layer !== Layer.Layer2) {
						return;
					}
					const balance = swapTokenBalances[Layer.Layer2][SwapToken.ArbiFLUX];
					if (balance.isZero() || !balances) {
						return;
					}
					return (
						<Grid>
							{getIcon(SwapToken.ArbiFLUX)}{' '}
							<>
								{BNToDecimal(balance, true, 18, 18)} {SwapToken.ArbiFLUX}
							</>
							{' / '}${' '}
							{getPriceToggle({ value: balance, inputToken: token, outputToken: Token.USDC, balances, round: 2 })} USD
						</Grid>
					);
				};
				const getLockPrice = () => {
					if (ecosystem != Ecosystem.Lockquidity) {
						return;
					}
					if (layer !== Layer.Layer2) {
						return;
					}
					const balance = swapTokenBalances[Layer.Layer2][SwapToken.LOCK];
					if (balance.isZero() || !balances) {
						return;
					}
					return (
						<Grid>
							{getIcon(SwapToken.LOCK)}{' '}
							<>
								{BNToDecimal(balance, true, 18, 18)} {SwapToken.LOCK}
							</>
							{' / '}${' '}
							{getPriceToggle({
								value: balance,
								inputToken: Token.Mintable,
								outputToken: Token.USDC,
								balances,
								round: 2,
							})}{' '}
							USD
						</Grid>
					);
				};
				const getDamPrice = () => {
					if (layer !== Layer.Layer1) {
						return;
					}
					const balance = swapTokenBalances[Layer.Layer1][SwapToken.DAM];
					if (balance.isZero() || !balances) {
						return;
					}
					return (
						<Grid>
							{getIcon(SwapToken.DAM)}{' '}
							<>
								{BNToDecimal(balance, true, 18, 18)} {lockableTokenShortName}
							</>
							{' / '}${' '}
							{getPriceToggle({
								value: balance,
								inputToken: Token.Lockable,
								outputToken: Token.USDC,
								balances,
								round: 2,
							})}{' '}
							USD
						</Grid>
					);
				};
				const getEthPrice = () => {
					const balance = layerBalances[SwapToken.ETH];
					if (!balances) {
						return;
					}
					return (
						<Grid>
							{getIcon(SwapToken.ETH)} <>{BNToDecimal(balance, true, 18, 18)} ETH</>
							{' / '}${' '}
							{getPriceToggle({
								value: balance ?? new BN(0),
								inputToken: Token.ETH,
								outputToken: Token.USDC,
								balances,
								round: 2,
							})}{' '}
							USD
						</Grid>
					);
				};
				return (
					<>
						{getEthPrice()}
						{getFluxPrice(ecosystem == Ecosystem.ArbiFlux ? Token.Lockable : Token.Mintable)}
						{getDamPrice()}
						{getArbiFluxPrice(ecosystem == Ecosystem.ArbiFlux ? Token.Lockable : Token.Mintable)}
						{getLockPrice()}
					</>
				);
			};
			return (
				<>
					<Box mb={3}>
						<Typography component="div" gutterBottom={true}>
							Your tradable account balances
							<Typography variant="body2" color="textSecondary">
								({selectedAddress}):
							</Typography>
						</Typography>
					</Box>
					<Grid
						container
						justifyContent="space-between"
						alignItems="left"
						spacing={3}
						className={classes.topLeftPricesContainer}
					>
						{getPrices()}
					</Grid>
				</>
			);
		};
		const getButtonText = () => {
			if (isLayerMismatch) {
				return `Switch To L${layer === Layer.Layer1 ? '2' : '1'}`;
			}
			return hasWeb3 === null ? 'Connect' : 'Continue';
		};
		const getComboboxLabel = (swapTokenWithAmount: SwapTokenWithAmount, baseLabel: string, isDisabled: boolean) => {
			const getLoadingIndicator = () => {
				if (!lastSwapThrottle || !isDisabled) {
					return;
				}
				return (
					<Box display={'inline-block'} ml={1}>
						<CircularProgress size={14} />
					</Box>
				);
			};
			const getLabelWithPrice = () => {
				const getToken = (swapToken: SwapToken | null) => {
					switch (swapToken) {
						case SwapToken.LOCK:
							return Token.Mintable;
						case SwapToken.FLUX:
							return Token.Lockable; // Lockable because we're on L2 (Lockable: FLUX, Mintable: ArbiFLUX)
						case SwapToken.ArbiFLUX:
							return ecosystem === Ecosystem.ArbiFlux ? Token.Mintable : Token.Lockable;
					}
					return Token.ETH;
				};
				if (!balances) {
					return baseLabel;
				}
				// We'll be trying to parse BN so try/catch to default back to a non-USD number on error
				try {
					const parsedAmount = parseBN(swapTokenWithAmount.amount);
					const usdPrice = getPriceToggle({
						value: parsedAmount,
						inputToken: getToken(swapTokenWithAmount.swapToken),
						outputToken: Token.USDC,
						balances,
						round: 2,
					});
					return (
						<>
							{baseLabel}{' '}
							<Typography component="span" color="warning">
								($ {usdPrice} USD)
							</Typography>
						</>
					);
				} catch (err) {
					return baseLabel;
				}
			};
			return (
				<>
					{getLabelWithPrice()}
					{getLoadingIndicator()}
				</>
			);
		};
		return (
			<Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
				<form onSubmit={onSubmit}>
					<DialogTitle id="form-dialog-title">
						<Box display="flex" alignItems="center" alignContent="center">
							Trade Datamine Ecosystem tokens
							<Box display="flex" pl={1}>
								<img
									src={uniswap}
									width={24}
									height={24}
									style={{ verticalAlign: 'middle', marginRight: 8 }}
									alt="Add To Pool"
								/>{' '}
							</Box>
						</Box>
					</DialogTitle>
					<DialogContent>
						{getBalances()}
						<Box my={3}>
							<Divider />
						</Box>
						<Typography component="div" gutterBottom={true}>
							{selectedAddress
								? 'Please confirm your trade instructions below:'
								: 'You will be able to trade after connecting to Web3:'}
						</Typography>
						<Box mt={3} mb={3}>
							<Box>
								{getCombobox({
									value: swapState.input.amount,
									label: getComboboxLabel(swapState.input, 'You trade', false),
									swapToken: swapState.input.swapToken,
									swapTokenDetails: inputTokens,
									swapOperation: SwapOperation.Input,
								})}
							</Box>
							<Box display="flex" justifyContent="center">
								<IconButton onClick={onFlipSwap}>
									<KeyboardArrowDown />
								</IconButton>
							</Box>
							{getCombobox({
								value: `~${swapState.output.amount}`,
								label: getComboboxLabel(swapState.output, 'You receive', true),
								swapToken: swapState.output.swapToken,
								swapTokenDetails: outputTokens,
								swapOperation: SwapOperation.Output,
							})}
							{getErrorMesage()}
							<Box mt={1} mb={4}>
								<Typography component="div" variant="caption">
									* Trading is powered by a decentralized Uniswap protocol. {getLearnMoreBurningLink()}
								</Typography>
							</Box>
						</Box>
						<Box mt={2}>
							<Divider />
						</Box>
					</DialogContent>
					<DialogActions>
						<Box mb={1} mr={2}>
							<Box mr={2} display="inline-block">
								<Button onClick={onClose}>Cancel</Button>
							</Box>
							<Button type="submit" color="secondary" size="large" variant="outlined">
								{getButtonText()}
							</Button>
						</Box>
					</DialogActions>
				</form>
			</Dialog>
		);
	}
);
interface Params {}
const TradeDialog: React.FC<Params> = () => {
	const {
		balances,
		swapTokenBalances,
		error,
		ecosystem,
		selectedAddress,
		hasWeb3,
		swapState,
		connectionMethod,
		lastSwapThrottle,
		dispatch: appDispatch,
	} = useAppStore(
		useShallow((state) => ({
			balances: state.state.balances,
			swapTokenBalances: state.state.swapTokenBalances,
			error: state.state.error,
			ecosystem: state.state.ecosystem,
			selectedAddress: state.state.selectedAddress,
			hasWeb3: state.state.hasWeb3,
			swapState: state.state.swapState,
			connectionMethod: state.state.connectionMethod,
			lastSwapThrottle: state.state.lastSwapThrottle,
			dispatch: state.dispatch,
		}))
	);
	return (
		<Render
			balances={balances}
			swapTokenBalances={swapTokenBalances}
			error={error}
			dispatch={appDispatch}
			ecosystem={ecosystem}
			selectedAddress={selectedAddress}
			hasWeb3={hasWeb3}
			swapState={swapState}
			connectionMethod={connectionMethod}
			lastSwapThrottle={lastSwapThrottle}
		/>
	);
};
export default TradeDialog;
