import React, { useContext } from 'react';
import { Box, Button, Typography, Divider, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Link } from '@material-ui/core';

import { Web3Context } from '../../../web3/Web3Context'
import { commonLanguage } from '../../../web3/web3Reducer';

import RedeemIcon from '@material-ui/icons/Redeem';
import { FluxAddressDetails, Token } from '../../../interfaces';
import { getEcosystemConfig as getConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';

interface RenderParams {
	selectedAddress: string;
	addressDetails: FluxAddressDetails;
	dispatch: React.Dispatch<any>;

	error: string | null;
	address: string | null;
	displayedAddress: string;
	token: Token;
	setAddress: React.Dispatch<any>;
	ecosystem: Ecosystem;
}

const Render: React.FC<RenderParams> = React.memo(({ token, selectedAddress, addressDetails, error, dispatch, address, displayedAddress, setAddress, ecosystem }) => {
	const config = getConfig(ecosystem);
	const { mintableTokenShortName, lockableTokenShortName } = config

	const onSubmit = async (e: any) => {
		e.preventDefault();

		dispatch({
			type: commonLanguage.commands.Trade,
			payload: {
			}
		});
	}

	const onClose = () => {
		dispatch({ type: commonLanguage.commands.CloseDialog });
	}

	const inputCurrency = token === Token.Lockable ? config.lockableTokenContractAddress : config.mintableTokenContractAddress;


	return <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
		<form onSubmit={onSubmit}>
			<DialogTitle id="form-dialog-title">
				<Box display="flex" alignItems="center" alignContent="center">
					Instantly Buy/Sell FLUX Tokens
					<Box display="flex" pl={1} ><RedeemIcon style={{ color: '#0ff' }} /></Box>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Typography gutterBottom={true}>Welcome to Our Built-In Automated Liquidity Pool <Link href={`https://uniswap.exchange/swap?inputCurrency=eth&outputCurrency=${inputCurrency}`} target="_blank" rel="noopener noreferrer" color="secondary">(Powered By Uniswap)</Link></Typography>
				<Box my={3}><Divider /></Box>

				<Typography gutterBottom={true}>You can instantly Buy/Sell both {lockableTokenShortName} and {mintableTokenShortName} tokens for Ethereum (ETH).</Typography>

				<Box my={3}>
					<Typography gutterBottom={true}>For additional trading pairs please visit the Uniswap link above.</Typography>
				</Box>

				<Box my={3}>
					<Typography>Your unminted FLUX balance will be sent to the following address:</Typography>
				</Box>

				<Box mt={3} mb={6}>
					<TextField
						autoFocus
						id="name"
						label="Destination Ethereum Address"
						type="text"
						variant="outlined"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						error={!!error}
						helperText={error}
						fullWidth
					/>
				</Box>
				<Box mt={2}><Divider /></Box>
			</DialogContent>
			<DialogActions>
				<Box mb={1} mr={2}>
					<Box mr={2} display="inline-block">
						<Button onClick={onClose}  >
							Cancel
						</Button>
					</Box>
					<Button type="submit" color="secondary" size="large" variant="outlined"  >
						Continue
					</Button>
				</Box>
			</DialogActions>
		</form>
	</Dialog>
});

interface Params {
	token: Token;
}
const MintDialog: React.FC<Params> = ({ token }) => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)
	const [address, setAddress] = React.useState(web3State.selectedAddress);

	const { selectedAddress, addressDetails, error, ecosystem } = web3State;
	if (!selectedAddress || !addressDetails) {
		return null;
	}

	const displayedAddress = web3State.address ?? selectedAddress;

	return <Render
		selectedAddress={selectedAddress}
		addressDetails={addressDetails}
		error={error}
		address={address}
		displayedAddress={displayedAddress}
		token={token}
		setAddress={setAddress}
		dispatch={web3Dispatch}
		ecosystem={ecosystem}
	/>
}

export default MintDialog;