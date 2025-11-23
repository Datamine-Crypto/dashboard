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

import { Settings } from '@mui/icons-material';
import { getEcosystemConfig } from '@/configs/config';
import { Ecosystem } from '@/configs/config.common';
import { BNToDecimal } from '@/core/web3/helpers';
import { useAppStore } from '@/core/web3/appStore';
import { Balances, commonLanguage } from '@/core/web3/web3Reducer';

/**
 * Props for the Render component within BurnDialog.
 */
interface RenderParams {
	/** The currently selected address in the wallet. */
	selectedAddress: string;
	/** Balances of various tokens. */
	balances: Balances;
	/** The dispatch function from the Web3Context. */
	dispatch: React.Dispatch<any>;
	/** Any error message to display. */
	error: string | null;
	/** The current ecosystem. */
	ecosystem: Ecosystem;
}

const Render: React.FC<RenderParams> = React.memo(({ selectedAddress, balances, dispatch, error, ecosystem }) => {
	const { mintableTokenShortName, navigation, ecosystemName } = getEcosystemConfig(ecosystem);
	const { isHelpPageEnabled } = navigation;

	const [targetAddress, setTargetAddress] = React.useState(selectedAddress);

	const onSubmit = async (e: any) => {
		e.preventDefault();

		dispatch({
			type: commonLanguage.commands.SetMinterSettings,
			payload: { address: targetAddress },
		});
	};
	const onClose = (event: any = undefined, reason: any = undefined) => {
		// Prevent closing by clicking outside dialog
		if (reason === 'backdropClick') {
			return;
		}
		dispatch({ type: commonLanguage.commands.CloseDialog });
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

	const getLearnMoreBurningLink = () => {
		if (!isHelpPageEnabled) {
			return null;
		}

		return (
			<>
				{' '}
				<Link color="textSecondary" href="#help/dashboard/burningFluxTokens" rel="noopener noreferrer" target="_blank">
					Click here
				</Link>{' '}
				to learn more about {mintableTokenShortName} burning.
			</>
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
							{BNToDecimal(balances.fluxToken, true)} {mintableTokenShortName}
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
});

/**
 * BurnDialog component for burning Flux tokens.
 * This dialog allows users to specify an amount of Flux tokens to burn and a target Ethereum address.
 * Burning tokens permanently increases the minting rate on the destination address.
 */
const MintSettingsDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useAppStore();

	const total = BNToDecimal(web3State.balances?.fluxToken ?? null);

	const { balances, selectedAddress, error, ecosystem } = web3State;
	if (!balances || !selectedAddress) {
		return null;
	}

	return (
		<Render
			balances={balances}
			selectedAddress={selectedAddress}
			error={error}
			dispatch={web3Dispatch}
			ecosystem={ecosystem}
		/>
	);
};

export default MintSettingsDialog;
