import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	TextField,
	Typography,
} from '@mui/material';
import React from 'react';
import { Settings } from '@mui/icons-material';
import { getEcosystemConfig } from '@/app/configs/config';

import { formatBigInt } from '@/utils/mathHelpers';
import { useAppStore } from '@/react/utils/appStore';

import { commonLanguage } from '@/app/state/commonLanguage';
import { useShallow } from 'zustand/react/shallow';
import { dispatch as appDispatch } from '@/react/utils/appStore';

/**
 * BurnDialog component for burning Flux tokens.
 * This dialog allows users to specify an amount of Flux tokens to burn and a target Ethereum address.
 * Burning tokens permanently increases the minting rate on the destination address.
 */
const MintSettingsDialog: React.FC = () => {
	const { balances, selectedAddress, error, ecosystem } = useAppStore(
		useShallow((state) => ({
			balances: state.balances,
			selectedAddress: state.selectedAddress,
			error: state.error,
			ecosystem: state.ecosystem,
		}))
	);

	const [targetAddress, setTargetAddress] = React.useState(selectedAddress || '');

	// Update targetAddress when selectedAddress changes
	React.useEffect(() => {
		if (selectedAddress) {
			setTargetAddress(selectedAddress);
		}
	}, [selectedAddress]);

	if (!balances || !selectedAddress) {
		return null;
	}

	const { mintableTokenShortName } = getEcosystemConfig(ecosystem);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		appDispatch({
			type: commonLanguage.commands.SetMinterSettings,
			payload: { address: targetAddress },
		});
	};
	const onClose = () => {
		appDispatch({ type: commonLanguage.commands.Dialog.Close });
	};
	const getDelegatedMinterBox = () => {
		return (
			<Box mt={1} mb={3}>
				<TextField
					id="name"
					label="Minter Address (Which address can mint from this validator)"
					type="text"
					variant="outlined"
					value={targetAddress}
					onChange={(e) => setTargetAddress(e.target.value)}
					helperText={error}
					fullWidth
				/>
			</Box>
		);
	};

	return (
		<Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
			<form onSubmit={onSubmit}>
				<DialogTitle id="form-dialog-title">
					<Box display="flex" alignItems="center" alignContent="center">
						Minter Settings
						<Box display="flex" pl={1}>
							<Settings style={{ color: '#00ffff' }} />
						</Box>
					</Box>
				</DialogTitle>
				<DialogContent>
					<Box>
						Minter Address:{' '}
						<Box display="inline" fontWeight="fontWeightBold">
							{selectedAddress}
						</Box>
					</Box>
					<Box my={1}>
						Current Balance:{' '}
						<Box display="inline" fontWeight="fontWeightBold">
							{formatBigInt(balances.fluxToken, true)} {mintableTokenShortName}
						</Box>
					</Box>
					<Box my={3}>
						<Divider />
					</Box>
					<Typography component="div" gutterBottom={true}>
						Below you can specify who can mint from your account. By default the address that locks-in the{' '}
						{mintableTokenShortName} gets to mint from that address.
					</Typography>
					<Box my={4}>
						<Typography component="div">
							You can pick any Ethereum address to mint for you instead (delegated minting). For example you can put
							your mobile phone wallet address to mint on the go!
						</Typography>
					</Box>
					{getDelegatedMinterBox()}
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
							Continue
						</Button>
					</Box>
				</DialogActions>
			</form>
		</Dialog>
	);
};
export default MintSettingsDialog;
