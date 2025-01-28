import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import React, { useContext } from 'react';

import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import { BNToDecimal } from '../../../web3/helpers';
import { Web3Context } from '../../../web3/Web3Context';
import { Balances, commonLanguage } from '../../../web3/web3Reducer';

interface RenderParams {
	selectedAddress: string;
	balances: Balances;
	dispatch: React.Dispatch<any>;
	ecosystem: Ecosystem;

	error: string | null;
	total: string | null;
}

const Render: React.FC<RenderParams> = React.memo(({ selectedAddress, balances, dispatch, error, total, ecosystem }) => {
	const { lockableTokenShortName, mintableTokenShortName } = getEcosystemConfig(ecosystem)

	const [amount, setAmount] = React.useState(total);
	const [minterAddress, setMinterAddress] = React.useState(selectedAddress);
	const [minterType, setMinterType] = React.useState('self');

	const onSubmit = async (e: any) => {
		e.preventDefault();

		dispatch({
			type: commonLanguage.commands.LockInDamTokens,
			payload: {
				amount,
				minterAddress
			}
		});
	}
	const onClose = (event: any = undefined, reason: any = undefined) => {
		// Prevent closing by clicking outside dialog
		if (reason === 'backdropClick') {
			return;
		}
		dispatch({ type: commonLanguage.commands.CloseDialog });
	}

	const getDelegatedMinterBox = () => {
		if (minterType !== 'delegated') {
			return;
		}
		return <Box my={1}>
			<TextField
				autoFocus
				id="name"
				label={`Ethereum Address (Who can mint your ${mintableTokenShortName} tokens?)`}
				type="text"
				variant="outlined"
				value={minterAddress}
				onChange={(e) => setMinterAddress(e.target.value)}
				helperText={error}
				fullWidth
			/>
		</Box>

	}

	return <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
		<form onSubmit={onSubmit}>
			<DialogTitle id="form-dialog-title">Start {mintableTokenShortName} Validator</DialogTitle>
			<DialogContent>

				<Box>From Address: <Box display="inline" fontWeight="fontWeightBold">{selectedAddress}</Box></Box>
				<Box my={1}>Current Balance: <Box display="inline" fontWeight="fontWeightBold">{BNToDecimal(balances.damToken, true)} {lockableTokenShortName}</Box></Box>
				<Box my={2}><Divider /></Box>
				<Box mb={4}>
					<Typography component="div">To continue select how many {lockableTokenShortName} tokens you wish to start your validator with. You can stop your validator to get 100% of {lockableTokenShortName} tokens back at any time.</Typography>
				</Box>

				<Box my={1}>
					<TextField
						autoFocus
						id="name"
						label={`Validator Size (${lockableTokenShortName}) Tokens)`}
						type="text"
						variant="outlined"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						error={!!error}
						helperText={error}
						fullWidth
					/>
				</Box>

				<Box my={3}>
					<FormControl component="fieldset">
						<FormLabel component="legend">Minting Address</FormLabel>
						<RadioGroup aria-label="gender" name="gender1" value={minterType} onChange={event => setMinterType((event.target as HTMLInputElement).value)}>
							<FormControlLabel value="self" control={<Radio color="secondary" />} label={`I want to mint my own ${mintableTokenShortName} tokens`} />
							<FormControlLabel value="delegated" control={<Radio color="secondary" />} label={<>Another address mints {mintableTokenShortName} on my behalf <Typography component="div" color="textSecondary" display="inline" variant="body2">(Delegated Minter)</Typography></>} />
						</RadioGroup>
					</FormControl>
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

const DamLockDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const total = BNToDecimal(web3State.balances?.damToken ?? null);

	const { balances, selectedAddress, error, ecosystem } = web3State;
	if (!balances || !selectedAddress) {
		return null;
	}

	return <Render
		balances={balances}
		selectedAddress={selectedAddress}
		error={error}
		total={total}
		dispatch={web3Dispatch}
		ecosystem={ecosystem}
	/>
}

export default DamLockDialog;