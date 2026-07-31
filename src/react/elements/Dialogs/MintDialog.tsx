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
import { useAppStore } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';
import { Redeem } from '@mui/icons-material';
import { getEcosystemConfig } from '@/app/configs/config';
import { formatBigInt } from '@/utils/mathHelpers';
import { useShallow } from 'zustand/react/shallow';
import { dispatch as appDispatch } from '@/react/utils/appStore';
import Web3ErrorDialog from '@/react/elements/Dialogs/Web3ErrorDialog';
import { parseWeb3Error } from '@/errors/parseWeb3Error';
import { appPalette } from '@/theme/appTheme';

const MintDialog: React.FC = () => {
	const {
		selectedAddress,
		address: initialAddress,
		addressDetails,
		error,
		ecosystem,
	} = useAppStore(
		useShallow((state) => ({
			selectedAddress: state.selectedAddress,
			address: state.address,
			addressDetails: state.addressDetails,
			error: state.error,
			ecosystem: state.ecosystem,
		}))
	);

	const [address, setAddress] = React.useState(selectedAddress);

	if (!selectedAddress || !addressDetails) {
		return null;
	}

	const displayedAddress = initialAddress ?? selectedAddress;
	const { mintableTokenShortName } = getEcosystemConfig(ecosystem);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		appDispatch({
			type: commonLanguage.commands.Flux.Mint,
			payload: {
				sourceAddress: displayedAddress,
				targetAddress: address,
				blockNumber: addressDetails.blockNumber,
			},
		});
	};

	const onClose = (_event: object, reason?: string) => {
		// Prevent closing by clicking outside dialog
		if (reason === 'backdropClick') {
			return;
		}
		appDispatch({ type: commonLanguage.commands.Dialog.Close });
	};

	const onCloseError = () => {
		appDispatch({ type: commonLanguage.commands.Dialog.DismissError });
	};

	return (
		<Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
			{error ? <Web3ErrorDialog open={true} error={error} onClose={onCloseError} /> : null}
			<form onSubmit={onSubmit}>
				<DialogTitle id="form-dialog-title">
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							alignContent: 'center',
						}}
					>
						Collect {mintableTokenShortName} Yield
						<Box
							sx={{
								display: 'flex',
								pl: 1,
							}}
						>
							<Redeem style={{ color: appPalette.highlight }} />
						</Box>
					</Box>
				</DialogTitle>
				<DialogContent>
					<Box>
						From Address:{' '}
						<Box
							sx={{
								display: 'inline',
								fontWeight: 'fontWeightBold',
							}}
						>
							{displayedAddress}
						</Box>
					</Box>
					<Box
						sx={{
							my: 1,
						}}
					>
						Total Yield: ~
						<Box
							sx={{
								display: 'inline',
								fontWeight: 'fontWeightBold',
							}}
						>
							{formatBigInt(addressDetails.mintAmount, true)} {mintableTokenShortName}
						</Box>
					</Box>
					<Box
						sx={{
							my: 3,
						}}
					>
						<Divider />
					</Box>
					<Typography component="div" gutterBottom={true}>
						To continue specify where you want to collect these {mintableTokenShortName} tokens. You can specify any
						Ethereum-based address.
					</Typography>
					<Box
						sx={{
							my: 3,
						}}
					>
						<Typography component="div">
							Your generated {mintableTokenShortName} yield will be sent to the following address:
						</Typography>
					</Box>
					<Box
						sx={{
							mt: 3,
							mb: 6,
						}}
					>
						<TextField
							autoFocus
							id="name"
							label="Destination Ethereum Address"
							type="text"
							variant="outlined"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							error={!!error}
							// Show the parsed summary rather than the raw error: an unmodified viem
							// failure runs to several hundred characters of calldata under the field.
							helperText={error ? parseWeb3Error(error).message : undefined}
							fullWidth
						/>
					</Box>
					<Box
						sx={{
							mt: 2,
						}}
					>
						<Divider />
					</Box>
				</DialogContent>
				<DialogActions>
					<Box
						sx={{
							mb: 1,
							mr: 2,
						}}
					>
						<Box
							sx={{
								mr: 2,
								display: 'inline-block',
							}}
						>
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

export default MintDialog;
