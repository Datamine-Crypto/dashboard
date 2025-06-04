import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Link, Typography } from '@mui/material';
import React, { useContext, useEffect } from 'react';

import DiamondIcon from '@mui/icons-material/Diamond';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import BN from 'bn.js';
import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import { DialogType, FluxAddressDetails, MarketAddressLock, Token } from '../../../interfaces';
import { BNToDecimal, getPriceToggle } from '../../../web3/helpers';
import { Web3Context } from '../../../web3/Web3Context';
import { Balances, commonLanguage, ConnectionMethod, MarketAddresses, MarketDetails } from '../../../web3/web3Reducer';
import DatamineGemsGame, { Gem } from '../Fragments/DatamineGemsGame';
import { getNetworkDropdown } from '../Fragments/EcosystemDropdown';

interface RenderParams {
	selectedAddress: string;
	balances: Balances | null;
	dispatch: React.Dispatch<any>;

	error: string | null;

	ecosystem: Ecosystem;
	marketAddressLock: MarketAddressLock | null;

	currentAddresMintableBalance: BN | null;
	currentAddressMarketAddressLock: MarketAddressLock | null;
	connectionMethod: ConnectionMethod;
	addressDetails: FluxAddressDetails | null;

	marketAddresses: MarketAddresses | null;
	hasWeb3: boolean | null;
	market: MarketDetails;
}
interface AddressEligibility {
	address: string;
	isEligible: boolean;
	blockReason?: BlockReason;
}
enum BlockReason {
	IsPaused,
	MinBlockNotMet,
	NoBlocksToMint,
	MinAmountNotMet
}
const Render: React.FC<RenderParams> = React.memo(({ selectedAddress, balances, dispatch, error, ecosystem, marketAddressLock, currentAddresMintableBalance, currentAddressMarketAddressLock, connectionMethod, addressDetails, marketAddresses, hasWeb3, market }) => {

	const { mintableTokenShortName, navigation, ecosystemName, marketAddress } = getEcosystemConfig(ecosystem)
	const { isHelpPageEnabled } = navigation



	const onSubmit = async (e: any) => {
		e.preventDefault();

		if (!selectedAddress) {
			if (hasWeb3 === null) {
				dispatch({ type: commonLanguage.commands.Initialize, payload: { address: null } });
			} else {
				dispatch({ type: commonLanguage.commands.ConnectToWallet })
			}
			return
		}

		if (!currentAddressMarketAddressLock) {
			console.log('currentAddressMarketAddressLock is null')
			return
		}

		if (currentAddressMarketAddressLock.rewardsAmount.eq(new BN(0))) {
			dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.MarketDepositWithdraw } })

		}
	}
	const showDepositWithdrawDialog = () => {
		dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.MarketDepositWithdraw } })
	}
	const onClose = (event: any = undefined, reason: any = undefined) => {
		// Prevent closing by clicking outside dialog
		if (reason === 'backdropClick') {
			return;
		}
		dispatch({ type: commonLanguage.commands.CloseDialog });
	}

	const getLearnMoreBurningLink = () => {
		if (!isHelpPageEnabled) {
			return null;
		}

		return <>
			{' '}
			<Link color="textSecondary" href="#help/dashboard/burningFluxTokens" rel="noopener noreferrer" target="_blank">Click here</Link> to learn more about {mintableTokenShortName} market.
		</>
	}

	const getDepositWithdrawButton = () => {

		if (!currentAddressMarketAddressLock || currentAddressMarketAddressLock.rewardsAmount.eq(new BN(0))) {
			return
		}
		return <Button color="secondary" size="small" variant="outlined" onClick={() => showDepositWithdrawDialog()} startIcon={<Box display="flex" style={{ color: '#0ff' }}><ImportExportIcon style={{ color: '#00ffff' }} /></Box>}>
			Deposit/Withdraw
		</Button>
	}

	const refreshAddresses = () => {
		dispatch({ type: commonLanguage.commands.Market.RefreshMarketAddresses, payload: {} })
	}

	const getGems = (): Gem[] => {
		const gems: Gem[] = []

		if (!marketAddresses || !balances) {
			return gems
		}

		for (const address of marketAddresses.addresses) {
			const getError = () => {
				if (address.isPaused) {
					return 'Error: Address is paused for gem minting (by the address). Please check back later!'
				}
				if (address.minterAddress !== marketAddress) {
					return 'Error: This address is not paricipating in public minting.'
				}
			}
			const amountBN = address.mintAmount


			const getAmountReceived = (): BN => {
				const rewardsPercent = address.rewardsPercent === 0 ? 500 : address.rewardsPercent
				const rewardsAmount = amountBN.add(amountBN.mul(new BN(rewardsPercent)).div(new BN(10000)))
				return rewardsAmount
			}
			const amountReceived = getAmountReceived()
			const balanceInUsdc = getPriceToggle({ value: amountReceived.sub(amountBN), inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 6, removeCommas: true });


			gems.push({
				ethereumAddress: address.currentAddress,
				error: getError(),
				dollarAmount: parseFloat(balanceInUsdc),
				id: address.currentAddress,
			})
		}

		return gems
	}

	const gems: Gem[] = getGems()

	console.log('marketAddresses:', marketAddresses)

	const onAttemptCollectGem = (gems: Gem[]) => {
		if (!currentAddressMarketAddressLock) {
			console.log('currentAddressMarketAddressLock is null')

			return false
		}

		if (currentAddressMarketAddressLock.rewardsAmount.eq(new BN(0))) {
			dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.MarketDepositWithdraw } })
			return false
		}


		dispatch({
			type: commonLanguage.commands.Market.MarketBurnFluxTokens,
			payload: {
				amountToBurn: new BN(0),
				gems
			}
		})



		return true
	}
	const onAddNewGem = (ethereumAddress: string) => {
		const stripNonEthereumChars = (addressString: string) => {
			// Ensure the string is lowercase first, as Ethereum addresses are case-insensitive
			// but typically represented in lowercase or mixed case with a checksum.
			// This regex specifically targets lowercase valid characters.
			const lowercasedString = addressString.toLowerCase();

			// The regex [^a-f0-9x] matches any character that is NOT:
			// - a lowercase letter from 'a' to 'f'
			// - a digit from '0' to '9'
			// - the lowercase letter 'x' (for the "0x" prefix)
			// The 'g' flag ensures all occurrences are replaced, not just the first.
			const strippedString = lowercasedString.replace(/[^a-f0-9x]/g, '');

			return strippedString;
		}
		if (!ethereumAddress) {
			return;
		}
		ethereumAddress = stripNonEthereumChars(ethereumAddress.toLowerCase());
		if (!ethereumAddress) {
			return;
		}
		if (ethereumAddress.length !== 42) {
			return;
		}

		// ensure ethereumAddress starts with 0x
		if (!ethereumAddress.startsWith('0x')) {
			return
		}

		dispatch({
			type: commonLanguage.commands.Market.AddGemAddress,
			payload: {
				address: ethereumAddress,
			}
		})

		return true
	}

	const getError = () => {
		if (!error) {
			return
		}
		return <Alert variant="filled" severity="warning">
			{error}
		</Alert>
	}

	const getBalances = () => {
		if (!currentAddressMarketAddressLock) {
			return <></>
		}
		return <>
			<Box>My Ethereum Address:{' '}
				<Typography variant="body2" display="inline" color="textSecondary">{selectedAddress}</Typography>
			</Box>

			<Box my={1}>
				Gem Game Balance ({mintableTokenShortName}):{' '}
				<Typography variant="body2" display="inline" color="textSecondary">{BNToDecimal(currentAddressMarketAddressLock.rewardsAmount, true)} {mintableTokenShortName}</Typography>
			</Box>
		</>
	}

	const getEthereumBlockNumber = () => {
		if (!addressDetails) {
			return
		}
		return <>Ethereum Block #{addressDetails.blockNumber.toLocaleString()}</>
	}

	const getSubmitButtonText = () => {
		if (!currentAddressMarketAddressLock) {
			return 'Connect'
		}
		return <>{currentAddressMarketAddressLock.rewardsAmount.eq(new BN(0)) ? 'Deposit' : 'Continue'}</>
	}

	const getGameElement = () => {
		if (!hasWeb3 || !selectedAddress) {
			return
		}
		if (!marketAddress) {

			return <Alert severity="info">Datamine Gems is coming to this ecosystem soon! Please select another ecosystem to continue.</Alert>
		}
		return <DatamineGemsGame
			initialGems={gems}
			onAttemptCollectGem={onAttemptCollectGem}
			onAddGem={onAddNewGem}
			gemsCollected={market.gemsCollected.count}
			totalCollectedBalance={market.gemsCollected.sumDollarAmount}
		/>
	}

	const getInfoAlertElement = () => {
		const getInfoText = () => {

			if (!selectedAddress) {
				return hasWeb3 === null ? 'Web3 connection required, click Connect button below' : 'Ethereum based wallet required, click Continue button below.'
			}

			if (currentAddressMarketAddressLock && currentAddressMarketAddressLock.rewardsAmount.eq(new BN(0))) {
				return <>Your {mintableTokenShortName} Gem Game Balance is 0. Click Deposit button below to continue.</>
			}

		}
		const infoText = getInfoText()
		if (!infoText) {
			return
		}

		return <Box mb={3}><Alert severity="info">{infoText}</Alert></Box>
	}

	const getSubmitButton = () => {
		if (currentAddressMarketAddressLock && selectedAddress && currentAddressMarketAddressLock.rewardsAmount.gt(new BN(0))) {
			return

		}
		return <Button type="submit" color="secondary" size="large" variant="outlined"  >
			{getSubmitButtonText()}
		</Button>
	}

	return <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
		<form onSubmit={onSubmit}>
			<DialogTitle id="form-dialog-title">
				<Box display="flex" alignItems="center" alignContent="center">
					<Box display="flex" pr={1} ><DiamondIcon style={{ color: '#00ffff' }} /></Box>

					Datamine Gems
					<Chip size="small" label="#GameFi" />
				</Box>
			</DialogTitle>
			<DialogContent>

				<Box display="flex" justifyContent={'space-between'} alignItems="center" mt={1}>
					<Box display="flex" alignItems="center" mr={2}>
						{getNetworkDropdown({
							ecosystem, connectionMethod, dispatch
						})}
					</Box>
					{getDepositWithdrawButton()}
				</Box>
				<Box my={2}></Box>
				{getBalances()}

				<Box my={3}><Divider /></Box>

				{getError()}
				{getInfoAlertElement()}

				{getGameElement()}


				<Box mt={2}><Divider /></Box>
			</DialogContent>
			<DialogActions sx={{ justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1.5 }}>
				<Typography variant="caption" color="textSecondary">
					{/* Add your desired text for the bottom-left here */}
					{getEthereumBlockNumber()}
				</Typography>
				<Box> {/* This Box groups the buttons to keep them together on the right */}
					<Box display="inline-block" mr={1}> {/* Margin between buttons */}
						{/*<Button onClick={refreshAddresses}  >
							Refresh
						</Button>*/}
						<Button onClick={onClose}  >
							Cancel
						</Button>
					</Box>
					{getSubmitButton()}
				</Box>
			</DialogActions>
		</form>
	</Dialog >
});



const MarketCollectRewardsDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	useEffect(() => {

		web3Dispatch({ type: commonLanguage.commands.Market.RefreshMarketAddresses, payload: {} })
	}, [])

	const { balances, address, ecosystem, marketAddressLock, currentAddresMintableBalance, currentAddressMarketAddressLock, selectedAddress, connectionMethod, addressDetails, marketAddresses, error, hasWeb3, market } = web3State;


	return <Render
		balances={balances}
		selectedAddress={(address ?? selectedAddress) as string}
		error={error}
		dispatch={web3Dispatch}
		ecosystem={ecosystem}
		marketAddressLock={marketAddressLock}
		currentAddresMintableBalance={currentAddresMintableBalance}
		currentAddressMarketAddressLock={currentAddressMarketAddressLock}
		connectionMethod={connectionMethod}
		addressDetails={addressDetails}
		marketAddresses={marketAddresses}
		hasWeb3={hasWeb3}
		market={market}
	/>
}

export default MarketCollectRewardsDialog;