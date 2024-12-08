import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Link, TextField, Typography } from '@mui/material';
import React, { useContext } from 'react';

import WhatshotIcon from '@mui/icons-material/Whatshot';
import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import { BNToDecimal } from '../../../web3/helpers';
import { Web3Context } from '../../../web3/Web3Context';
import { Balances, commonLanguage } from '../../../web3/web3Reducer';

interface RenderParams {
	selectedAddress: string;
	balances: Balances;
	dispatch: React.Dispatch<any>;

	error: string | null;
	amount: string | null;
	setAmount: React.Dispatch<any>;

	ecosystem: Ecosystem;
}

const Render: React.FC<RenderParams> = React.memo(({ selectedAddress, balances, dispatch, error, amount, setAmount, ecosystem }) => {
	const { mintableTokenShortName, navigation, ecosystemName } = getEcosystemConfig(ecosystem)
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
			<Link color="textSecondary" href="#help/dashboard/burningFluxTokens" rel="noopener noreferrer" target="_blank">Click here</Link> to learn more about {mintableTokenShortName} burning.
		</>
	}

	return <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
		<form onSubmit={onSubmit}>
			<DialogTitle id="form-dialog-title">
				<Box display="flex" alignItems="center" alignContent="center">
					Burn {mintableTokenShortName} tokens
					<Box display="flex" pl={1} ><WhatshotIcon style={{ color: '#ff9b00' }} /></Box>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Box>From Address: <Box display="inline" fontWeight="fontWeightBold">{selectedAddress}</Box></Box>
				<Box my={1}>Current Balance: <Box display="inline" fontWeight="fontWeightBold">{BNToDecimal(balances.fluxToken, true)} {mintableTokenShortName}</Box></Box>
				<Box my={3}><Divider /></Box>

				<Typography gutterBottom={true}>To continue select how many {mintableTokenShortName} tokens you wish to burn. You can target any Ethereum based address that current is an active {ecosystemName} Validator.</Typography>
				<Box my={4}>
					<Typography>Burning {mintableTokenShortName} permanently increases your {mintableTokenShortName} minting rate on the destination address. {getLearnMoreBurningLink()}</Typography>
				</Box>
				<Box mt={3} mb={3}>
					<TextField
						autoFocus
						id="name"
						label={`Total ${mintableTokenShortName} Tokens to burn`}
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

	const { balances, selectedAddress, error, ecosystem } = web3State;
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
		ecosystem={ecosystem}
	/>
}

export default BurnDialog;