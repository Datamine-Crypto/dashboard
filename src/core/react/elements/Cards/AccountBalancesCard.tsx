import React, { useContext } from 'react';
import { Box, Button, Typography, Grid, Card, CardContent, Divider, Link, makeStyles } from '@material-ui/core';

import { Web3Context } from '../../../web3/Web3Context'
import { commonLanguage, Balances } from '../../../web3/web3Reducer'

import LockOpenIcon from '@material-ui/icons/Stop';
import { BNToDecimal, getBurnRatio, getPriceToggle } from '../../../web3/helpers';
import { DialogType, FluxAddressDetails, FluxAddressLock, FluxAddressTokenDetails, Token } from '../../../interfaces';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import BN from 'bn.js'
import LightTooltip from '../LightTooltip';
import uniswap from '../../../../svgs/uniswap.svg';
import sushiSwapLogo from '../../../../svgs/sushiSwap.svg';
import DetailedListItem from '../Fragments/DetailedListItem';
import { getConfig } from '../../../../config';
import { getTradeButton } from '../Fragments/TradeButton';

const useStyles = makeStyles(() => {
	return {
		address: {
			fontSize: '0.7rem',
			letterSpacing: 0
		},
		detailedListItemsContainer: {
			width: '100%'
		}
	}
});

interface RenderParams {
	addressLock: FluxAddressLock;
	displayedAddress: string;
	selectedAddress: string
	addressDetails: FluxAddressDetails;
	addressTokenDetails: FluxAddressTokenDetails;
	balances: Balances;
	dispatch: React.Dispatch<any>;
	isArbitrumMainnet: boolean;
}

const Render: React.FC<RenderParams> = React.memo(({ addressLock, selectedAddress, addressTokenDetails, displayedAddress, addressDetails, balances, dispatch, isArbitrumMainnet }) => {

	const config = getConfig(isArbitrumMainnet);

	const classes = useStyles();

	const { myRatio } = addressTokenDetails;
	const { minterAddress } = addressLock;

	const isDelegatedMinter = selectedAddress?.toLowerCase() === minterAddress?.toLowerCase(); // Lowercase for WalletConnect
	const isCurrentAddress = selectedAddress === displayedAddress;

	const showMintDialog = () => {
		dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Mint } })
	}


	/**
	 * This helps show you how much FLUX was burned if DAM isn't locked-in yet
	 */
	/*const getFluxBurned = () => {
		// No longer used because FLUX burned now shows
		return null;

		if (!addressLock.amount.isZero() && !addressLock.burnedAmount.isZero()) {
			return null;
		}

		return <ListItem>
			<ListItemText primary={'Total Burned FLUX'} secondary={`${BNToDecimal(addressLock.burnedAmount, true)} FLUX`} />
		</ListItem>
	}*/

	const getDelegatedMinterAddress = () => {
		if (new BN(addressLock.amount).isZero()) {
			return null
		}

		const isSelfMinter = addressLock.minterAddress === displayedAddress;
		const getSuffix = () => {
			return <LightTooltip title={isSelfMinter ? `The same address that locked-in ${isArbitrumMainnet ? 'FLUX (L2)' : 'Datamine (DAM)'} tokens will mint it's own ${isArbitrumMainnet ? 'Arbi' : ''}FLUX tokens` : `The address that locked-in ${isArbitrumMainnet ? 'FLUX (L2)' : 'Datamine (DAM)'} tokens delegated this address to mint ${isArbitrumMainnet ? 'Arbi' : ''}FLUX tokens.`}>
				<Typography color="textSecondary" component="span" display="inline" variant="body2">{isSelfMinter ? ' (Self Minter)' : ' (Delegated Minter)'}</Typography>
			</LightTooltip>
		}

		return <DetailedListItem
			title={`Minter Address:`}
			main={<Box className={classes.address} display="inline-block">{addressLock.minterAddress}</Box>}
			description={getSuffix()}
		/>
	}

	const getFluxBalance = () => {

		const getBurnButton = () => {
			const showBurnDialog = () => {
				dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Burn } })
			}

			const getButton = () => {
				const isDisabled = !isCurrentAddress || addressDetails.fluxBalance.isZero()
				const button = <Button disabled={isDisabled} size="small" variant="outlined" color="secondary" onClick={() => showBurnDialog()} startIcon={<WhatshotIcon style={{ color: '#ff9b00' }} />}>Burn {isArbitrumMainnet ? 'Arbi' : ''}FLUX</Button>

				if (addressDetails.fluxBalance.isZero()) {
					return <LightTooltip title={`This address must have ${isArbitrumMainnet ? 'Arbi' : ''}FLUX tokens to burn.`}><Box display="inline-block">{button}</Box></LightTooltip>
				}
				if (!isCurrentAddress) {
					return <LightTooltip title={`You must select this account in your wallet to Burn ${isArbitrumMainnet ? 'Arbi' : ''}FLUX for this address.`}><Box display="inline-block">{button}</Box></LightTooltip>
				}

				return button;
			}

			return <Box mx={1} display="inline-block">{getButton()}</Box>
		}
		const getPoolButton = () => {

			const getButton = () => {

				const getAddToPoolLink = () => {
					if (isArbitrumMainnet) {
						return `https://app.sushi.com/add/${config.fluxTokenContractAddress}/ETH`
					}
					return `https://uniswap.exchange/add/${config.fluxTokenContractAddress}/ETH/10000`
				}
				const button = <Link href={getAddToPoolLink()} target="_blank" rel="noopener noreferrer">
					<Button size="small" variant="outlined" color="secondary">
						<img src={isArbitrumMainnet ? sushiSwapLogo : uniswap} width={24} height={24} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Add To Pool
					</Button>
				</Link>


				const getAddToPoolTooltip = () => {
					if (isArbitrumMainnet) {
						return `Add to ArbiFLUX / ETH SushiSwap Pool. Liquidity pool participants share 0.25% from each ArbiFLUX <-> ETH SushiSwap transaction! `
					}

					return `Add to FLUX / ETH Uniswap Pool. Liquidity pool participants share 1.00% from each FLUX <-> ETH Uniswap transaction! `
				}
				return <LightTooltip title={getAddToPoolTooltip()}>
					{button}
				</LightTooltip>;
			}

			return <Box mx={1} display="inline-block">{getButton()}</Box>
		}

		const getFluxAmount = () => {
			return <>{BNToDecimal(balances.fluxToken, true, 18, 2)} {isArbitrumMainnet ? 'Arbi' : ''}FLUX</>
		}
		const getFluxAmountUSD = () => {
			const balanceInUsdc = `$ ${getPriceToggle({ value: balances.fluxToken, inputToken: Token.FLUX, outputToken: Token.USDC, balances, round: 2 })} USD`;
			return <>{balanceInUsdc}</>
		}

		return <DetailedListItem
			title={`${isArbitrumMainnet ? 'Arbi' : ''}FLUX Balance:`}
			main={getFluxAmount()}
			sub={getFluxAmountUSD()}
			buttons={
				[
					getBurnButton(),
					getTradeButton({ token: Token.FLUX, isArbitrumMainnet }),
					getPoolButton()
				]
			}
		/>
	}

	const getDamBalance = () => {
		const getDamBalance = () => {
			return <>{BNToDecimal(balances.damToken, true, 18, 2)} {isArbitrumMainnet ? 'FLUX' : 'DAM'}</>
		}
		const getDamBalanceUSD = () => {
			const balanceInUsdc = `$ ${getPriceToggle({ value: balances.damToken, inputToken: Token.DAM, outputToken: Token.USDC, balances, round: 2 })} USD`;
			return <>{balanceInUsdc}</>
		}
		return <DetailedListItem
			title={`${isArbitrumMainnet ? 'FLUX (L2)' : 'DAM'} Balance:`}
			main={getDamBalance()}
			sub={getDamBalanceUSD()}
			buttons={
				[<>{getTradeButton({ token: Token.DAM, isArbitrumMainnet })}</>]
			}
		/>
	}

	const getDamLockedIn = () => {

		const getUnlockButton = () => {
			const showUnlockDialog = () => {
				dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Unlock } })
			}

			if (new BN(addressLock.amount).isZero()) {
				return;
			}

			const getButton = () => {
				const button = <Button disabled={!isCurrentAddress} size="small" variant="outlined" onClick={() => showUnlockDialog()} startIcon={<LockOpenIcon style={{ color: '#0FF' }} />}>Stop Mint</Button>

				if (!isCurrentAddress) {
					return <LightTooltip title="You must select this account in your wallet to stop a validator for this address."><Box display="inline-block">{button}</Box></LightTooltip>
				}

				return button;
			}

			return <Box mx={1} display="inline-block">{getButton()}</Box>
		}

		const getLockedInAmount = () => {
			return <>
				{BNToDecimal(addressLock.amount, true, 18, 4)} {isArbitrumMainnet ? 'FLUX' : 'DAM'}
			</>
		}
		const getLockedInAmountUSD = () => {
			const lockedInUsdc = `$ ${getPriceToggle({ value: addressLock.amount, inputToken: Token.DAM, outputToken: Token.USDC, balances, round: 2 })} USD`;
			return <>
				{lockedInUsdc}
			</>
		}

		return <DetailedListItem
			title={`${isArbitrumMainnet ? 'FLUX (L2)' : 'DAM'} Powering Validators:`}
			main={getLockedInAmount()}
			sub={getLockedInAmountUSD()}
			buttons={
				[<>{getUnlockButton()}</>]
			}
		/>
	}

	const getFluxBurnRatio = () => {
		return <DetailedListItem
			title={`${isArbitrumMainnet ? 'Arbi' : ''}FLUX Burn Ratio:`}
			main={getBurnRatio(myRatio, isArbitrumMainnet)}
		/>
	}

	const getFluxBurned = () => {

		const getFluxBurnedBalance = () => {
			return <>{BNToDecimal(addressLock.burnedAmount, true, 18, 2)} {isArbitrumMainnet ? 'Arbi' : ''}FLUX</>
		}

		const getFluxBurnedBalanceUSD = () => {
			const balanceInUsdc = `$ ${getPriceToggle({ value: addressLock.burnedAmount, inputToken: Token.FLUX, outputToken: Token.USDC, balances, round: 2 })} USD`;
			return <>{balanceInUsdc}</>
		}

		return <DetailedListItem
			title={`${isArbitrumMainnet ? 'Arbi' : ''}FLUX Burned:`}
			main={getFluxBurnedBalance()}
			sub={getFluxBurnedBalanceUSD()}
		/>
	}

	return <Card >
		<CardContent>
			<Grid container justify="space-between" alignItems="center">
				<Grid item>
					<Typography variant="h5" component="h2">
						Address Balances
					</Typography>
				</Grid>
				<Grid item>
					<Typography variant="body2" color="textSecondary">
						<LightTooltip title="Click to open address-specific dashboard link">
							<Link href={`#dashboard/${displayedAddress}`} color="textSecondary" target="_blank" className={classes.address} >
								<Grid
									container
									direction="row"
									justify="center"
									alignItems="center"
								>
									<Grid item>
										{displayedAddress}
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
			<Box mt={1} mb={1}>
				<Divider />
			</Box>
			<Grid container>
				<Grid item md={6} className={classes.detailedListItemsContainer}>
					<Box>
						{getFluxBalance()}
						{getFluxBurned()}
						{getFluxBurnRatio()}
					</Box>
				</Grid>
				<Grid item md={6} className={classes.detailedListItemsContainer}>
					{getDamBalance()}
					{getDamLockedIn()}
					{getDelegatedMinterAddress()}
				</Grid>
			</Grid>
		</CardContent>
	</Card>
});

const AccountBalancesCard: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const { addressLock, selectedAddress, address, addressDetails, balances, addressTokenDetails, isArbitrumMainnet } = web3State;
	if (!addressLock || !selectedAddress || !addressDetails || !balances || !addressTokenDetails) {
		return null;
	}

	return <Render
		addressLock={addressLock}
		selectedAddress={selectedAddress}
		displayedAddress={address ?? selectedAddress}
		addressDetails={addressDetails}
		addressTokenDetails={addressTokenDetails}
		balances={balances}
		dispatch={web3Dispatch}
		isArbitrumMainnet={isArbitrumMainnet}
	/>
}

export default AccountBalancesCard;