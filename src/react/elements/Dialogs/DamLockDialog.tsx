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
	FormLabel,
	Radio,
	RadioGroup,
	TextField,
	Typography,
} from '@mui/material';
import React from 'react';
import { Diamond, Mouse as MouseIcon } from '@mui/icons-material';
import { getEcosystemConfig } from '@/app/configs/config';

import { formatBigInt } from '@/utils/mathHelpers';
import { useAppStore } from '@/react/utils/appStore';

import { commonLanguage } from '@/app/state/commonLanguage';
import { useShallow } from 'zustand/react/shallow';
import { dispatch as appDispatch } from '@/react/utils/appStore';

enum MintingAddressType {
	SelfMinter = 'SelfMinter',
	DelegatedMinter = 'DelegatedMinter',
	GameHodlClicker = 'GameHodlClicker',
	GameDatamineGems = 'GameDatamineGems',
}

const DamLockDialog: React.FC = () => {
	const { balances, selectedAddress, error, ecosystem } = useAppStore(
		useShallow((state) => ({
			balances: state.balances,
			selectedAddress: state.selectedAddress,
			error: state.error,
			ecosystem: state.ecosystem,
		}))
	);

	const total = formatBigInt(balances?.damToken ?? null);

	const { lockableTokenShortName, mintableTokenShortName, marketAddress, gameHodlClickerAddress, batchMinterAddress } =
		getEcosystemConfig(ecosystem);

	const getDefaultMinterType = () => {
		if (gameHodlClickerAddress) {
			return MintingAddressType.GameHodlClicker;
		}
		if (marketAddress) {
			return MintingAddressType.GameDatamineGems;
		}
		return MintingAddressType.SelfMinter;
	};

	const [amount, setAmount] = React.useState(total);
	const [minterAddress, setMinterAddress] = React.useState(selectedAddress || '');
	const [minterType, setMinterType] = React.useState(getDefaultMinterType());

	// Update minterAddress when selectedAddress changes
	React.useEffect(() => {
		if (selectedAddress) {
			setMinterAddress(selectedAddress);
		}
	}, [selectedAddress]);

	if (!balances || !selectedAddress) {
		return null;
	}

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const getMinterAddress = () => {
			switch (minterType) {
				case MintingAddressType.GameHodlClicker:
					return gameHodlClickerAddress;
				case MintingAddressType.GameDatamineGems:
					return marketAddress;
				case MintingAddressType.SelfMinter: {
					if (batchMinterAddress) {
						// Use batch minting for self-minter (This new contract allows for Smart Accounts minting)
						return batchMinterAddress;
					}
					break;
				}
			}
			// Self-minter default
			return minterAddress;
		};
		const computedMinterAddress = getMinterAddress();
		appDispatch({
			type: commonLanguage.commands.Flux.LockInDamTokens,
			payload: {
				amount,
				minterAddress: computedMinterAddress,
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
	const getDelegatedMinterBox = () => {
		if (minterType !== MintingAddressType.DelegatedMinter) {
			return;
		}
		return (
			<Box
				sx={{
					my: 1,
				}}
			>
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
		);
	};
	const getMarketOption = () => {
		if (!marketAddress) {
			return null;
		}
		const getRecommendedText = () => {
			if (gameHodlClickerAddress) {
				return null;
			}
			return (
				<>
					<Typography
						component="div"
						color="secondary"
						variant="body2"
						sx={{
							display: 'inline',
						}}
					>
						(Recommended)
					</Typography>
				</>
			);
		};
		return (
			<FormControlLabel
				value={MintingAddressType.GameDatamineGems}
				control={<Radio color="secondary" />}
				label={
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<Diamond style={{ color: '#0FF' }} />
						<Box
							sx={{
								ml: 0.5,
							}}
						>
							Datamine Gems (V2): Legacy Recompounding {getRecommendedText()}
						</Box>
					</Box>
				}
			/>
		);
	};
	const getGameHodlClickerOption = () => {
		if (!gameHodlClickerAddress) {
			return null;
		}
		return (
			<FormControlLabel
				value={MintingAddressType.GameHodlClicker}
				control={<Radio color="secondary" />}
				label={
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<MouseIcon style={{ color: '#0FF' }} />
						<Box
							sx={{
								ml: 0.5,
							}}
						>
							HODL Clicker (V3): Automatic Recompounding{' '}
							<Typography
								component="div"
								color="secondary"
								variant="body2"
								sx={{
									display: 'inline',
								}}
							>
								(Recommended)
							</Typography>
						</Box>
					</Box>
				}
			/>
		);
	};
	const getSelfMinterOption = () => {
		return (
			<>
				<FormControlLabel
					value={MintingAddressType.SelfMinter}
					control={<Radio color="secondary" />}
					label={
						<>
							I want to mint my own {mintableTokenShortName} tokens{' '}
							<Typography
								component="div"
								color="textSecondary"
								variant="body2"
								sx={{
									display: 'inline',
								}}
							>
								(Or delegate other address)
							</Typography>
						</>
					}
				/>
			</>
		);
	};
	const getDelegatedMinterOption = () => {
		//@todo re-enable this for batch minting when new batch mint dialog is done
		if (batchMinterAddress) {
			return null;
		}
		return (
			<>
				<FormControlLabel
					value="delegated"
					control={<Radio color="secondary" />}
					label={
						<>
							Another address mints {mintableTokenShortName} on my behalf{' '}
							<Typography
								component="div"
								color="textSecondary"
								variant="body2"
								sx={{
									display: 'inline',
								}}
							>
								(Delegated Minter)
							</Typography>
						</>
					}
				/>
			</>
		);
	};
	return (
		<Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
			<form onSubmit={onSubmit}>
				<DialogTitle id="form-dialog-title">Start {mintableTokenShortName} Validator</DialogTitle>
				<DialogContent>
					<Box>
						From Address:{' '}
						<Box
							sx={{
								display: 'inline',
								fontWeight: 'fontWeightBold',
							}}
						>
							{selectedAddress}
						</Box>
					</Box>
					<Box
						sx={{
							my: 1,
						}}
					>
						Current Balance:{' '}
						<Box
							sx={{
								display: 'inline',
								fontWeight: 'fontWeightBold',
							}}
						>
							{formatBigInt(balances.damToken, true)} {lockableTokenShortName}
						</Box>
					</Box>
					<Box
						sx={{
							my: 2,
						}}
					>
						<Divider />
					</Box>
					<Box
						sx={{
							mb: 4,
						}}
					>
						<Typography component="div">
							To continue select how many {lockableTokenShortName} tokens you wish to start your validator with. You can
							stop your validator to get 100% of {lockableTokenShortName} tokens back at any time.
						</Typography>
					</Box>
					<Box
						sx={{
							my: 1,
						}}
					>
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
					<Box
						sx={{
							my: 3,
						}}
					>
						<FormControl component="fieldset">
							<FormLabel component="legend">Minting Address</FormLabel>
							<RadioGroup
								aria-label="gender"
								name="gender1"
								value={minterType}
								onChange={(event) => setMinterType(event.target.value as MintingAddressType)}
							>
								{getGameHodlClickerOption()}
								{getMarketOption()}
								{getSelfMinterOption()}
								{getDelegatedMinterOption()}
							</RadioGroup>
						</FormControl>
					</Box>
					{getDelegatedMinterBox()}
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
export default DamLockDialog;
