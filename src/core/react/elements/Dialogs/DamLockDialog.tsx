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
import { getEcosystemConfig } from '@/core/app/configs/config';
import { Ecosystem } from '@/core/app/configs/config.common';
import { BNToDecimal } from '@/core/utils/mathHelpers';
import { useAppStore } from '@/core/react/appStore';
import { ReducerDispatch, Balances } from '@/core/app/state/stateInterfaces';
import { commonLanguage } from '@/core/app/state/commonLanguage';
import { useShallow } from 'zustand/react/shallow';
/**
 * Props for the Render component within DamLockDialog.
 */
interface RenderParams {
	/** The currently selected address in the wallet. */
	selectedAddress: string;
	/** Balances of various tokens. */
	balances: Balances;
	/** The dispatch function from the Web3Context. */
	dispatch: ReducerDispatch;
	/** The current ecosystem. */
	ecosystem: Ecosystem;
	/** Any error message to display. */
	error: string | null;
	/** The total amount of tokens available. */
	total: string | null;
}
enum MintingAddressType {
	SelfMinter = 'SelfMinter',
	DelegatedMinter = 'DelegatedMinter',
	GameHodlClicker = 'GameHodlClicker',
	GameDatamineGems = 'GameDatamineGems',
}
/**
 * A memoized functional component that renders the DamLockDialog.
 * This dialog allows users to lock in DAM tokens to start a validator and choose a minter address.
 * @param params - Object containing selectedAddress, balances, dispatch, error, total, and ecosystem.
 */
const Render: React.FC<RenderParams> = React.memo(
	({ selectedAddress, balances, dispatch, error, total, ecosystem }) => {
		const {
			lockableTokenShortName,
			mintableTokenShortName,
			marketAddress,
			gameHodlClickerAddress,
			batchMinterAddress,
		} = getEcosystemConfig(ecosystem);
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
		const [minterAddress, setMinterAddress] = React.useState(selectedAddress);
		const [minterType, setMinterType] = React.useState(getDefaultMinterType());
		const onSubmit = async (e: any) => {
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
			dispatch({
				type: commonLanguage.commands.LockInDamTokens,
				payload: {
					amount,
					minterAddress: computedMinterAddress,
				},
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
			if (minterType !== MintingAddressType.DelegatedMinter) {
				return;
			}
			return (
				<Box my={1}>
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
						<Typography component="div" color="secondary" display="inline" variant="body2">
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
						<Box display="flex" alignItems="center">
							<Diamond style={{ color: '#0FF' }} />
							<Box ml={0.5}>Datamine Gems (V2): Legacy Recompounding {getRecommendedText()}</Box>
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
						<Box display="flex" alignItems="center">
							<MouseIcon style={{ color: '#0FF' }} />
							<Box ml={0.5}>
								HODL Clicker (V3): Automatic Recompounding{' '}
								<Typography component="div" color="secondary" display="inline" variant="body2">
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
								I want to mint my own ${mintableTokenShortName} tokens{' '}
								<Typography component="div" color="textSecondary" display="inline" variant="body2">
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
								<Typography component="div" color="textSecondary" display="inline" variant="body2">
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
							<Box display="inline" fontWeight="fontWeightBold">
								{selectedAddress}
							</Box>
						</Box>
						<Box my={1}>
							Current Balance:{' '}
							<Box display="inline" fontWeight="fontWeightBold">
								{BNToDecimal(balances.damToken, true)} {lockableTokenShortName}
							</Box>
						</Box>
						<Box my={2}>
							<Divider />
						</Box>
						<Box mb={4}>
							<Typography component="div">
								To continue select how many {lockableTokenShortName} tokens you wish to start your validator with. You
								can stop your validator to get 100% of {lockableTokenShortName} tokens back at any time.
							</Typography>
						</Box>
						<Box my={1}>
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
						<Box my={3}>
							<FormControl component="fieldset">
								<FormLabel component="legend">Minting Address</FormLabel>
								<RadioGroup
									aria-label="gender"
									name="gender1"
									value={minterType}
									onChange={(event) => setMinterType((event.target as any).value)}
								>
									{getGameHodlClickerOption()}
									{getMarketOption()}
									{getSelfMinterOption()}
									{getDelegatedMinterOption()}
								</RadioGroup>
							</FormControl>
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
	}
);
const DamLockDialog: React.FC = () => {
	const {
		balances,
		selectedAddress,
		error,
		ecosystem,
		state: appState,
		dispatch: appDispatch,
	} = useAppStore(
		useShallow((state) => ({
			balances: state.state.balances,
			selectedAddress: state.state.selectedAddress,
			error: state.state.error,
			ecosystem: state.state.ecosystem,
			state: state.state,
			dispatch: state.dispatch,
		}))
	);
	const total = BNToDecimal(appState.balances?.damToken ?? null);
	if (!balances || !selectedAddress) {
		return null;
	}
	return (
		<Render
			balances={balances}
			selectedAddress={selectedAddress}
			error={error}
			total={total}
			dispatch={appDispatch}
			ecosystem={ecosystem}
		/>
	);
};
export default DamLockDialog;
