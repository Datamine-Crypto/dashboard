import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Typography } from '@mui/material';
import React from 'react';

import { makeStyles } from '@mui/styles';
import { commonLanguage, ConnectionMethod } from '../../../web3/web3Reducer';

import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import { ReducerQuery } from '../../../sideEffectReducer';
import { DatamineTheme, theme } from '../../../styles';

interface Params {
	open: boolean;
	connectionMethod: ConnectionMethod;
	queries: ReducerQuery[];
	onClose: () => void;
	ecosystem: Ecosystem;
}

const useStyles = makeStyles<DatamineTheme>(() => ({
	highlightedText: {
		color: theme.classes.palette.highlight
	}
}));

const PendingActionDialog: React.FC<Params> = React.memo(({ open, queries, connectionMethod, onClose, ecosystem }) => {
	const { mintableTokenShortName } = getEcosystemConfig(ecosystem)
	const classes = useStyles();

	const getConnectionMethodName = () => {
		switch (connectionMethod) {
			case ConnectionMethod.MetaMask:
				return 'MetaMask window';
			default:
				return 'your wallet';
		}
	}

	const getDetails = () => {
		const getConfirmationMessage = (transactionType: string) => {
			return <>
				<Typography component="div" gutterBottom={true}>Your <Box fontWeight="bold" display="inline">{transactionType}</Box> transaction is pending. Please wait while it's broadcasted to Ethereum network.</Typography>
				<Box mt={3} mb={4}>
					<Typography component="div" gutterBottom={true}>This blockchain confirmation may take around 12 seconds or longer depending on your gas configuration.</Typography>
				</Box>
				<Typography component="div" className={classes.highlightedText}>Please follow directions in {getConnectionMethodName()} to continue.</Typography>
			</>
		}

		for (const query of queries) {
			switch (query.type) {
				case commonLanguage.queries.EnableWeb3:
					return {
						title: 'Awaiting Wallet Connection',
						message: `Before you can continue please select an account in ${getConnectionMethodName()}. If your wallet is locked please unlock it first.`,
						showHideButton: true
					}
				case commonLanguage.queries.GetAuthorizeFluxOperatorResponse:
					return {
						title: 'Awaiting Authorization Response',
						message: getConfirmationMessage(`Enabling of ${mintableTokenShortName} validator`)
					}
				case commonLanguage.queries.GetBurnFluxResponse:
					return {
						title: `Awaiting ${mintableTokenShortName} Burn Confirmation`,
						message: getConfirmationMessage(`${mintableTokenShortName} Burning`)
					}
				case commonLanguage.queries.GetLockInDamTokensResponse:
					return {
						title: 'Awaiting Validator Start Confirmation',
						message: getConfirmationMessage('Validator Starting')
					}
				case commonLanguage.queries.GetMintFluxResponse:
					return {
						title: 'Awaiting Minting Confirmation',
						message: getConfirmationMessage(`${mintableTokenShortName} Minting`)
					}
				case commonLanguage.queries.GetUnlockDamTokensResponse:
					return {
						title: 'Awaiting Validator Stop Confirmation',
						message: getConfirmationMessage('Validator Stopping')
					}
			}
		}

		return null;
	}

	const details = getDetails();
	if (!details) {
		return null;
	}
	const { title, message, showHideButton } = details

	const getDialogActions = () => {
		if (!showHideButton) {
			return;
		}

		return <DialogActions>

			<Box mr={2} display="inline-block">
				<Button onClick={onClose} color="secondary" size="large" variant="outlined"   >
					Dismiss
				</Button>
			</Box>
		</DialogActions>
	}

	return <Dialog open={open} aria-labelledby="alert-dialog-title">
		<DialogTitle id="alert-dialog-title">
			<Box display="flex" justifyContent="space-between">
				<Box display="flex" alignItems="center" alignContent="center">
					{title}
					<Box display="flex" pl={1} ><HourglassEmptyIcon style={{ color: '#0ff' }} /></Box>
				</Box>

				{/*<LightTooltip title="Click For Help &amp; Tips"><IconButton onClick={onClose} ><HelpOutlineIcon style={{ color: '#bfbfc3' }} /></IconButton></LightTooltip>*/}
			</Box>
		</DialogTitle>
		<DialogContent>
			{message}
			<Box my={3}>
				<LinearProgress color="secondary" />
			</Box>

		</DialogContent>
		{getDialogActions()}
	</Dialog >
})

export default PendingActionDialog;