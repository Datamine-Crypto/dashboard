import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import React, { useContext } from 'react';

import Grid from '@mui/material/Grid';

import { Web3Context } from '../../../web3/Web3Context';
import { ClientSettings, commonLanguage } from '../../../web3/web3Reducer';

import { AccessTime, Settings } from '@mui/icons-material';
import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import { formatMoney } from '../../../utils/formatMoney';

interface RenderParams {
	clientSettings: ClientSettings;

	dispatch: React.Dispatch<any>;

	ecosystem: Ecosystem;
}

const currencyCodes = [
	'AED',
	'AFN',
	'ALL',
	'AMD',
	'ANG',
	'AOA',
	'ARS',
	'AUD',
	'AWG',
	'AZN',
	'BAM',
	'BBD',
	'BDT',
	'BGN',
	'BHD',
	'BIF',
	'BMD',
	'BND',
	'BOB',
	'BOV',
	'BRL',
	'BSD',
	'BTN',
	'BWP',
	'BYR',
	'BZD',
	'CAD',
	'CDF',
	'CHE',
	'CHF',
	'CHW',
	'CLF',
	'CLP',
	'CNY',
	'COP',
	'COU',
	'CRC',
	'CUC',
	'CUP',
	'CVE',
	'CZK',
	'DJF',
	'DKK',
	'DOP',
	'DZD',
	'EGP',
	'ERN',
	'ETB',
	'EUR',
	'FJD',
	'FKP',
	'GBP',
	'GEL',
	'GHS',
	'GIP',
	'GMD',
	'GNF',
	'GTQ',
	'GYD',
	'HKD',
	'HNL',
	'HRK',
	'HTG',
	'HUF',
	'IDR',
	'ILS',
	'INR',
	'IQD',
	'IRR',
	'ISK',
	'JMD',
	'JOD',
	'JPY',
	'KES',
	'KGS',
	'KHR',
	'KMF',
	'KPW',
	'KRW',
	'KWD',
	'KYD',
	'KZT',
	'LAK',
	'LBP',
	'LKR',
	'LRD',
	'LSL',
	'LTL',
	'LVL',
	'LYD',
	'MAD',
	'MDL',
	'MGA',
	'MKD',
	'MMK',
	'MNT',
	'MOP',
	'MRO',
	'MUR',
	'MVR',
	'MWK',
	'MXN',
	'MXV',
	'MYR',
	'MZN',
	'NAD',
	'NGN',
	'NIO',
	'NOK',
	'NPR',
	'NZD',
	'OMR',
	'PAB',
	'PEN',
	'PGK',
	'PHP',
	'PKR',
	'PLN',
	'PYG',
	'QAR',
	'RON',
	'RSD',
	'RUB',
	'RWF',
	'SAR',
	'SBD',
	'SCR',
	'SDG',
	'SEK',
	'SGD',
	'SHP',
	'SLL',
	'SOS',
	'SRD',
	'SSP',
	'STD',
	'SYP',
	'SZL',
	'THB',
	'TJS',
	'TMT',
	'TND',
	'TOP',
	'TRY',
	'TTD',
	'TWD',
	'TZS',
	'UAH',
	'UGX',
	'USD',
	'USN',
	'USS',
	'UYI',
	'UYU',
	'UZS',
	'VEF',
	'VND',
	'VUV',
	'WST',
	'XAF',
	'XAG',
	'XAU',
	'XBA',
	'XBB',
	'XBC',
	'XBD',
	'XCD',
	'XDR',
	'XFU',
	'XOF',
	'XPD',
	'XPF',
	'XPT',
	'YER',
	'ZAR',
	'ZMW',
];

const Render: React.FC<RenderParams> = React.memo(({ clientSettings, dispatch, ecosystem }) => {
	const { ecosystemName } = getEcosystemConfig(ecosystem);

	const onClose = () => {
		dispatch({ type: commonLanguage.commands.CloseDialog });
	};

	const getCurrencyDropdown = () => {
		const menuItems = currencyCodes.map((currency, currencyInded) => {
			return (
				<MenuItem value={currency} key={currencyInded}>
					{currency}
				</MenuItem>
			);
		});

		return (
			<FormControl variant="outlined" fullWidth>
				<InputLabel id="currency-label">Currency</InputLabel>
				<Select
					labelId="currency-label"
					id="tokenContext"
					label="Currency"
					value={clientSettings.currency}
					onChange={(e) =>
						dispatch({ type: commonLanguage.commands.ClientSettings.SetCurrency, payload: e.target.value })
					}
				>
					{menuItems}
				</Select>
			</FormControl>
		);
	};

	const getExchangeRateDetails = () => {
		const exchangedAmount = formatMoney({
			amount: clientSettings.priceMultiplier,
			currency: clientSettings.currency,
			includeCurrencySuffix: true,
		});

		return (
			<Box textAlign="center">
				<Typography component="div" variant="h6">
					1 USD = {exchangedAmount}
				</Typography>
			</Box>
		);
	};

	const getTransactionTypeToggle = () => {
		return (
			<FormControlLabel
				value="start"
				control={
					<Switch
						checked={clientSettings.useEip1559}
						color="secondary"
						onChange={(e) =>
							dispatch({ type: commonLanguage.commands.ClientSettings.SetUseEip1559, payload: e.target.checked })
						}
					/>
				}
				label={
					<>
						<Grid container alignItems="center">
							<Grid>
								{clientSettings.useEip1559 ? (
									<Typography component="div" color="secondary">
										L1: Use EIP1559 Transactions (Recommended)
									</Typography>
								) : (
									<Typography component="div">Use Legacy Transactions (NOT RECOMMENDED)</Typography>
								)}
							</Grid>
							<Grid>
								<Box ml={0.5} display="flex">
									<AccessTime color={clientSettings.useEip1559 ? 'secondary' : undefined} />
								</Box>
							</Grid>
						</Grid>
					</>
				}
				labelPlacement="end"
			/>
		);
	};

	return (
		<Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
			<DialogTitle id="form-dialog-title">
				<Box display="flex" alignItems="center" alignContent="center">
					Settings
					<Box display="flex" pl={1}>
						<Settings style={{ color: '#0ff' }} />
					</Box>
				</Box>
			</DialogTitle>
			<DialogContent>
				Customize the look and feel of the {ecosystemName} Decentralized Dashboard! Your settings are saved instantly on
				any change.
				<Box my={3}>
					<Divider />
				</Box>
				{getTransactionTypeToggle()}
				<Box my={2}>
					<Divider />
				</Box>
				<Box mt={3} mb={3}>
					<Grid container spacing={2}>
						<Grid size={{ xs: 12, md: 6 }}>{getCurrencyDropdown()}</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								autoFocus
								id="name"
								label="Currency Exchange Rate"
								type="text"
								variant="outlined"
								value={clientSettings.priceMultiplierAmount}
								onChange={(e) =>
									dispatch({ type: commonLanguage.commands.ClientSettings.SetPriceMultiplier, payload: e.target.value })
								}
								fullWidth
							/>
						</Grid>
					</Grid>
				</Box>
				{getExchangeRateDetails()}
				<Box mt={2}>
					<Divider />
				</Box>
			</DialogContent>
			<DialogActions>
				<Box mb={1} mr={2}>
					<Button type="submit" color="secondary" size="large" variant="outlined" onClick={onClose}>
						Close
					</Button>
				</Box>
			</DialogActions>
		</Dialog>
	);
});

const SettingsDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context);
	const { clientSettings, ecosystem } = web3State;

	return <Render clientSettings={clientSettings} dispatch={web3Dispatch} ecosystem={ecosystem} />;
};

export default SettingsDialog;
