import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Typography,
} from '@mui/material';
import React from 'react';

import { useAppStore } from '@/core/web3/appStore';
import { Balances, ClientSettings } from '@/core/web3/reducer/interfaces';
import { commonLanguage } from '@/core/web3/reducer/common';

import { getEcosystemConfig as getConfig } from '@/configs/config';
import { Ecosystem } from '@/configs/config.common';
import { FluxAddressDetails, Token } from '@/core/interfaces';
import { theme } from '@/core/styles';
import { formatMoney } from '@/core/utils/formatMoney';
import { BNToDecimal, getFormattedMultiplier, getPriceToggle } from '@/core/web3/helpers';
import MessageDialog from '@/core/react/elements/Dialogs/MessageDialog';

interface RenderParams {
	addressDetails: FluxAddressDetails;
	dispatch: React.Dispatch<any>;

	error: string | null;
	amount: string | null;
	balances: Balances | null;
	clientSettings: ClientSettings;
	ecosystem: Ecosystem;
}
const localConfig = {
	/**
	 * IF a person will lose at least $5, show a warning message
	 */
	amountToLoseWarningThreshold: 5,
};

const Render: React.FC<RenderParams> = React.memo(
	({ addressDetails, dispatch, error, amount, ecosystem, balances, clientSettings }) => {
		const { mintableTokenShortName, lockableTokenShortName } = getConfig(ecosystem);

		const onSubmit = async (e: any) => {
			e.preventDefault();

			dispatch({
				type: commonLanguage.commands.UnlockDamTokens,
			});
		};

		const onClose = () => {
			dispatch({ type: commonLanguage.commands.CloseDialog });
		};

		const onCloseError = () => {
			dispatch({ type: commonLanguage.commands.DismissError });
		};

		const getAmountLostAlert = () => {
			if (!balances) {
				return null;
			}
			const getMintAmount = () => {
				return addressDetails.mintAmount;
			};
			const mintAmount = getMintAmount();

			const balanceInUsdc = getPriceToggle({
				value: mintAmount,
				inputToken: Token.Mintable,
				outputToken: Token.USDC,
				balances,
				round: 6,
				removeCommas: true,
			});

			const unmintedUsdAmount = parseFloat(balanceInUsdc);
			if (unmintedUsdAmount < localConfig.amountToLoseWarningThreshold) {
				return null;
			}
			const amount = unmintedUsdAmount * clientSettings.priceMultiplier;
			const moneyAmount = formatMoney({ amount, currency: clientSettings.currency });

			return (
				<Box mt={3}>
					<Alert severity="error">
						<Box mb={1} fontWeight="bold">
							WARNING: YOU ARE ABOUT TO LOSE{' '}
							<Box style={{ color: '#0FF' }} fontSize="1.1rem" display="inline">
								{moneyAmount} {clientSettings.currency}
							</Box>{' '}
							IN UNMINTED {mintableTokenShortName}. IF YOU CONTINUE THIS UNMINTED AMOUNT WILL BE LOST!
						</Box>
						If you are seeing this warning it means you have at least $5.00 in unminted {mintableTokenShortName}! Please
						mint your {mintableTokenShortName} first before continuing.
					</Alert>
				</Box>
			);
		};

		return (
			<Dialog open={true} onClose={onClose} aria-labelledby="alert-dialog-title">
				{error ? <MessageDialog open={true} title="Error" message={error} onClose={onCloseError} /> : null}
				<form onSubmit={onSubmit}>
					<DialogTitle id="alert-dialog-title">{'Stop Mint?'}</DialogTitle>
					<DialogContent>
						<Box>
							Tokens To Return:{' '}
							<Box display="inline" fontWeight="fontWeightBold">
								{amount} {lockableTokenShortName}
							</Box>
						</Box>
						<Box my={2}>
							<Divider />
						</Box>
						<Box mb={6}>
							<Typography component="div" gutterBottom={true}>
								You can stop your validator at any time to get 100% of your {lockableTokenShortName} tokens back.
							</Typography>
							<Box my={3}>
								<Typography component="div" gutterBottom={true}>
									Please note that stopping a validator will cause you to lose your current{' '}
									<Box fontWeight="fontWeightBold" display="inline" style={{ whiteSpace: 'nowrap' }}>
										{getFormattedMultiplier(addressDetails.addressTimeMultiplier)}
									</Box>{' '}
									time bonus. Restarting a validator will reset the time bonus.
								</Typography>
							</Box>
							<Typography component="div" style={{ color: theme.classes.palette.highlight }}>
								Important Note:{' '}
								<Box fontWeight="bold" display="inline">
									Any unminted {mintableTokenShortName} tokens will be lost.
								</Box>
							</Typography>

							{getAmountLostAlert()}
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
	}
);

const UnlockDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useAppStore();

	const amount = BNToDecimal(web3State.addressLock?.amount ?? null);

	const { addressDetails, error, ecosystem, balances, clientSettings } = web3State;
	if (!addressDetails) {
		return null;
	}

	return (
		<Render
			addressDetails={addressDetails}
			error={error}
			amount={amount}
			dispatch={web3Dispatch}
			ecosystem={ecosystem}
			balances={balances}
			clientSettings={clientSettings}
		/>
	);
};

export default UnlockDialog;
