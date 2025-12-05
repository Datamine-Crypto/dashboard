import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from '@mui/material';
import React from 'react';
import { useAppStore } from '@/react/utils/appStore';

import { commonLanguage } from '@/app/state/commonLanguage';
import { getEcosystemConfig as getConfig } from '@/app/configs/config';

import { theme } from '@/react/utils/theme';
import MessageDialog from '@/react/elements/Dialogs/MessageDialog';
import { useShallow } from 'zustand/react/shallow';
import { dispatch as appDispatch } from '@/react/utils/appStore';

const GamePauseResumeDialog: React.FC = () => {
	const { addressDetails, error, ecosystem, currentAddressHodlClickerAddressLock } = useAppStore(
		useShallow((state) => ({
			addressDetails: state.addressDetails,
			error: state.error,
			ecosystem: state.ecosystem,
			currentAddressHodlClickerAddressLock: state.currentAddressHodlClickerAddressLock,
		}))
	);

	const isPaused = currentAddressHodlClickerAddressLock?.isPaused;

	if (!addressDetails) {
		return null;
	}

	const { mintableTokenShortName } = getConfig(ecosystem);
	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		appDispatch({
			type: commonLanguage.commands.Flux.UnlockDamTokens,
		});
	};
	const onClose = () => {
		appDispatch({ type: commonLanguage.commands.Dialog.Close });
	};
	const onCloseError = () => {
		appDispatch({ type: commonLanguage.commands.Dialog.DismissError });
	};
	return (
		<Dialog open={true} onClose={onClose} aria-labelledby="alert-dialog-title">
			{error ? <MessageDialog open={true} title="Error" message={error} onClose={onCloseError} /> : null}
			<form onSubmit={onSubmit}>
				<DialogTitle id="alert-dialog-title">
					{isPaused ? 'Resume GameFi Participation?' : 'Pause GameFi Participation?'}
				</DialogTitle>
				<DialogContent>
					<Box my={2}>
						<Divider />
					</Box>
					<Box mb={6}>
						<Typography component="div" gutterBottom={true}>
							You can pause/resume your game at any time <strong>without any penalties</strong>. Use this feature to
							mint {mintableTokenShortName} tokens to any Ethereum address.
						</Typography>
						<Box my={3}>
							<Typography component="div" gutterBottom={true}>
								You will not lose any time bonus for pause/resume toggling. You will most likely use this feature when
								you need a bit of extra liquidity (selling minted tokens) and resuming the game back.
							</Typography>
						</Box>
						<Typography component="div" style={{ color: theme.classes.palette.highlight }}>
							Important Note:{' '}
							<Box fontWeight="bold" display="inline">
								Your address will not show up in GameFi leaderboard while paused and only you can mint tokens while
								paused.
							</Box>
						</Typography>
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
export default GamePauseResumeDialog;
