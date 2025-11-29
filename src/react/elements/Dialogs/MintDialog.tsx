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
import MessageDialog from '@/react/elements/Dialogs/MessageDialog';

const MintDialog: React.FC = () => {
	const { selectedAddress, addressDetails, error, ecosystem } = useAppStore(
		useShallow((state) => ({
			selectedAddress: state.selectedAddress,
			addressDetails: state.addressDetails,
			error: state.error,
			ecosystem: state.ecosystem,
		}))
	);

	const [address, setAddress] = React.useState(selectedAddress);

	if (!selectedAddress || !addressDetails) {
		return null;
	}

	const displayedAddress = address ?? selectedAddress;
	const { mintableTokenShortName } = getEcosystemConfig(ecosystem);

	const onSubmit = async (e: any) => {
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

	const onClose = (event: any = undefined, reason: any = undefined) => {
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
			{error ? <MessageDialog open={true} title="Error" message={error} onClose={onCloseError} /> : null}
			<form onSubmit={onSubmit}>
				<DialogTitle id="form-dialog-title">
					<Box display="flex" alignItems="center" alignContent="center">
						Collect {mintableTokenShortName} Yield
						<Box display="flex" pl={1}>
							<Redeem style={{ color: '#0ff' }} />
						</Box>
					</Box>
				</DialogTitle>
				<DialogContent>
					<Box>
						From Address:{' '}
						<Box display="inline" fontWeight="fontWeightBold">
							{displayedAddress}
						</Box>
					</Box>
					<Box my={1}>
						Total Yield: ~
						<Box display="inline" fontWeight="fontWeightBold">
							{formatBigInt(addressDetails.mintAmount, true)} {mintableTokenShortName}
						</Box>
					</Box>
					<Box my={3}>
						<Divider />
					</Box>
					<Typography component="div" gutterBottom={true}>
						To continue specify where you want to collect these {mintableTokenShortName} tokens. You can specify any
						Ethereum-based address.
					</Typography>
					<Box my={3}>
						<Typography component="div">
							Your generated {mintableTokenShortName} yield will be sent to the following address:
						</Typography>
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

export default MintDialog;
