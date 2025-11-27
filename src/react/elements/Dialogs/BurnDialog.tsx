import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Link,
	TextField,
	Typography,
} from '@mui/material';
import React from 'react';
import { Whatshot } from '@mui/icons-material';
import { getEcosystemConfig } from '@/app/configs/config';

import { BNToDecimal } from '@/utils/mathHelpers';
import { useAppStore } from '@/react/utils/appStore';

import { commonLanguage } from '@/app/state/commonLanguage';
import { useShallow } from 'zustand/react/shallow';
import { dispatch as appDispatch } from '@/react/utils/appStore';
/**
 * Props for the Render component within BurnDialog.
 */

/**
 * BurnDialog component for burning Flux tokens for yield.
 * This dialog allows users to specify an amount of Flux tokens to burn and a target Ethereum address.
 * Burning tokens (as a secondary function of money) permanently increases the yield generation rate on the destination address.
 */
const BurnDialog: React.FC = () => {
	const { balances, selectedAddress, error, ecosystem } = useAppStore(
		useShallow((state) => ({
			balances: state.balances,
			selectedAddress: state.selectedAddress,
			error: state.error,
			ecosystem: state.ecosystem,
		}))
	);

	const total = BNToDecimal(balances?.fluxToken ?? null);
	const [amount, setAmount] = React.useState(total);
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

	const { mintableTokenShortName, navigation, ecosystemName } = getEcosystemConfig(ecosystem);
	const { isHelpPageEnabled } = navigation;

	const onSubmit = async (e: any) => {
		e.preventDefault();
		appDispatch({
			type: commonLanguage.commands.BurnFluxTokens,
			payload: { amount, address: targetAddress },
		});
	};
	const onClose = (event: any = undefined, reason: any = undefined) => {
		// Prevent closing by clicking outside dialog
		if (reason === 'backdropClick') {
			return;
		}
		appDispatch({ type: commonLanguage.commands.CloseDialog });
	};
	const getDelegatedMinterBox = () => {
		return (
			<Box mt={1} mb={3}>
				<TextField
					id="name"
					label="Ethereum Address (Target address of the burn for yield)"
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
	const getLearnMoreBurningLink = () => {
		if (!isHelpPageEnabled) {
			return null;
		}
		return (
			<>
				{' '}
				<Link color="textSecondary" href="#help/dashboard/fluxTokenYield" rel="noopener noreferrer" target="_blank">
					Click here
				</Link>{' '}
				to learn more about {mintableTokenShortName} burning for yield.
			</>
		);
	};
	return (
		<Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
			<form onSubmit={onSubmit}>
				<DialogTitle id="form-dialog-title">
					<Box display="flex" alignItems="center" alignContent="center">
						Burn {mintableTokenShortName} tokens for Yield
						<Box display="flex" pl={1}>
							<Whatshot style={{ color: '#ff9b00' }} />
						</Box>
					</Box>
				</DialogTitle>
				<DialogContent>
					<Box>
						From Address:{' '}
						<Box display="inline" fontWeight="fontWeightBold">
							{selectedAddress}
						</Box>
					</Box>
					<Box my={1}>
						Current Balance:{' '}
						<Box display="inline" fontWeight="fontWeightBold">
							{BNToDecimal(balances.fluxToken, true)} {mintableTokenShortName}
						</Box>
					</Box>
					<Box my={3}>
						<Divider />
					</Box>
					<Typography component="div" gutterBottom={true}>
						To continue select how many {mintableTokenShortName} tokens you wish to burn to generate yield. You can
						target any Ethereum based address that current is an active {ecosystemName} Validator.
					</Typography>
					<Box my={4}>
						<Typography component="div">
							Burning {mintableTokenShortName} (as a secondary function of money) permanently increases your{' '}
							{mintableTokenShortName} yield generation rate on the destination address. {getLearnMoreBurningLink()}
						</Typography>
					</Box>
					<Box mt={3} mb={3}>
						<TextField
							autoFocus
							id="name"
							label={`Total ${mintableTokenShortName} Tokens to burn for yield`}
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
export default BurnDialog;
