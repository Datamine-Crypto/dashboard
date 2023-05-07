import React, { useContext } from 'react';
import { Box, Button, Typography, Divider, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Link } from '@material-ui/core';

import { Web3Context } from '../../../web3/Web3Context'
import { commonLanguage, Balances } from '../../../web3/web3Reducer';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import { BNToDecimal } from '../../../web3/helpers';
import { getConfig } from '../../../../config';

interface RenderParams {
	selectedAddress: string;
	balances: Balances;
	dispatch: React.Dispatch<any>;

	error: string | null;
	amount: string | null;
	setAmount: React.Dispatch<any>;

	isArbitrumMainnet: boolean;
}

const Render: React.FC<RenderParams> = React.memo(({ selectedAddress, balances, dispatch, error, amount, setAmount, isArbitrumMainnet }) => {

	const { navigation } = getConfig()
	const { isHelpPageEnabled } = navigation

	const [targetAddress, setTargetAddress] = React.useState(selectedAddress);

	const onSubmit = async (e: any) => {
		e.preventDefault();

		dispatch({
			type: commonLanguage.commands.BurnFluxTokens,
			payload: { amount, address: targetAddress }
		});
	}
	const onClose = () => {
		dispatch({ type: commonLanguage.commands.CloseDialog });
	}
	const getDelegatedMinterBox = () => {
		return <Box mt={1} mb={3}>
			<TextField
				id="name"
				label="Ethereum Address (Target address of the burn)"
				type="text"
				variant="outlined"
				value={targetAddress}
				onChange={(e) => setTargetAddress(e.target.value)}
				helperText={error}
				fullWidth
			/>
		</Box>

	}

	const getLearnMoreBurningLink = () => {
		if (!isHelpPageEnabled) {
			return null;
		}

		return <>
			{' '}
			<Link color="textSecondary" href="#help/dashboard/burningFluxTokens" rel="noopener noreferrer" target="_blank">Click here</Link> to learn more about {isArbitrumMainnet ? 'Arbi' : ''}FLUX burning.
		</>
	}

	return <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
		<form onSubmit={onSubmit}>
			<DialogTitle id="form-dialog-title">
				<Box display="flex" alignItems="center" alignContent="center">
					Burn {isArbitrumMainnet ? 'Arbi' : ''}FLUX tokens
					<Box display="flex" pl={1} ><WhatshotIcon style={{ color: '#ff9b00' }} /></Box>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Box>From Address: <Box display="inline" fontWeight="fontWeightBold">{selectedAddress}</Box></Box>
				<Box my={1}>Current Balance: <Box display="inline" fontWeight="fontWeightBold">{BNToDecimal(balances.fluxToken, true)} {isArbitrumMainnet ? 'Arbi' : ''}FLUX</Box></Box>
				<Box my={3}><Divider /></Box>

				<Typography gutterBottom={true}>To continue select how many {isArbitrumMainnet ? 'Arbi' : ''}FLUX tokens you wish to burn. You can target any Ethereum based address that current is an active Datamine Validator.</Typography>
				<Box my={4}>
					<Typography>Burning {isArbitrumMainnet ? 'Arbi' : ''}FLUX permanently increases your {isArbitrumMainnet ? 'Arbi' : ''}FLUX minting rate on the destination address. {getLearnMoreBurningLink()}</Typography>
				</Box>
				<Box mt={3} mb={3}>
					<TextField
						autoFocus
						id="name"
						label={`Total ${isArbitrumMainnet ? 'Arbi' : ''}FLUX Tokens to burn`}
						type="text"
						variant="outlined"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						error={!!error}
						helperText={error}
						fullWidth
					/>
				</Box>
				{getDelegatedMinterBox()}
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

const BurnDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const total = BNToDecimal(web3State.balances?.fluxToken ?? null);

	const [amount, setAmount] = React.useState(total);

	const { balances, selectedAddress, error, isArbitrumMainnet } = web3State;
	if (!balances || !selectedAddress) {
		return null;
	}

	return <Render
		balances={balances}
		selectedAddress={selectedAddress}
		error={error}
		amount={amount}
		setAmount={setAmount}
		dispatch={web3Dispatch}
		isArbitrumMainnet={isArbitrumMainnet}
	/>
}

export default BurnDialog;