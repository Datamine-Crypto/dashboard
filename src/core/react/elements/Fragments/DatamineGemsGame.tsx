import { Add, Diamond, MoreVert } from '@mui/icons-material';
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	IconButton,
	InputAdornment,
	keyframes,
	Paper,
	TextField,
	Typography,
} from '@mui/material';
import { grey, red } from '@mui/material/colors';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LightTooltip from '../LightTooltip';

// --- Types and Game Data ---
export enum GemColor {
	Bronze = '#CD7F32',
	Silver = '#C0C0C0',
	Gold = '#FFD700',
	Epic = '#E040FB',
}

// --- Configuration Object ---
const localConfig = {
	gridSize: 4,
	totalCells: 4 * 3,
	numParticles: 20,
	particleBaseSizeXs: '10px',
	particleBaseSizeSm: '14px',
	collectionAnimationDuration: 700 * 2,
	particleEffectDuration: 1500 * 2,
	dollarDecimalPlaces: 4,
	ethAddressDisplayLength: 10,
	gemTiers: [
		{ name: 'Bronze', color: GemColor.Bronze, dollarAmount: 0.01, iconSize: { xs: 28, sm: 35, md: 40 } },
		{ name: 'Silver', color: GemColor.Silver, dollarAmount: 0.05, iconSize: { xs: 34, sm: 42, md: 50 } },
		{ name: 'Gold', color: GemColor.Gold, dollarAmount: 0.1, iconSize: { xs: 40, sm: 50, md: 60 } },
		{ name: 'Epic', color: GemColor.Epic, dollarAmount: 0.25, iconSize: { xs: 48, sm: 60, md: 75 } },
	] as const,
	localStorageKey: 'datamineGemsConfig',
};

interface GemTier {
	name: string;
	color: GemColor;
	dollarAmount: number;
	iconSize: { xs: number; sm: number; md: number };
}

const DEFAULT_GEM_VALUES: Record<string, number> = localConfig.gemTiers.reduce(
	(acc, tier) => {
		acc[tier.name] = tier.dollarAmount;
		return acc;
	},
	{} as Record<string, number>
);

export interface Gem {
	id: string;
	dollarAmount: number;
	ethereumAddress: string;
	isCollecting?: boolean;
	error?: string;
}

type GridCell = Gem | null;
type GridState = GridCell[];

// --- Helper Functions ---
const getTierInfoByDollarAmount = (
	gemDollarAmount: number,
	currentTierValues: Record<string, number>
): GemTier | undefined => {
	let bestMatchTier: GemTier | undefined = undefined;
	const configuredTiers = localConfig.gemTiers
		.map((tier) => ({
			...tier,
			configuredDollarAmount: currentTierValues[tier.name] ?? tier.dollarAmount,
		}))
		.sort((a, b) => a.configuredDollarAmount - b.configuredDollarAmount);

	for (const tier of configuredTiers) {
		if (gemDollarAmount >= tier.configuredDollarAmount) {
			bestMatchTier = tier;
		} else {
			break;
		}
	}
	if (!bestMatchTier && configuredTiers.length > 0) {
		return configuredTiers[0];
	}
	return bestMatchTier;
};

// --- Animation Keyframes ---
const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0) rotate(0); }
  10%, 50%, 90% { transform: translateX(-1px) rotate(-1deg); }
  30%, 70% { transform: translateX(1px) rotate(1deg); }
`;

const idleShineAnimation = keyframes`
  0%, 100% { filter: brightness(100%) drop-shadow(1px 1px 2px rgba(0,0,0,0.3)); transform: scale(1); }
  50% { filter: brightness(170%) drop-shadow(2px 2px 5px rgba(255,255,255,0.7)); transform: scale(1.05); }
`;

const particleFlyOut = keyframes`
  0% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
  100% { transform: translate(var(--target-x), var(--target-y)) scale(0); opacity: 0; }
`;

// --- Particle Component (Memoized) ---
interface ParticleProps {
	color: GemColor;
	delay: number;
	duration: number;
	targetX: string;
	targetY: string;
}

const Particle: React.FC<ParticleProps> = React.memo(({ color, delay, duration, targetX, targetY }) => (
	<Box
		sx={{
			position: 'absolute',
			top: '50%',
			left: '50%',
			width: { xs: localConfig.particleBaseSizeXs, sm: localConfig.particleBaseSizeSm },
			height: { xs: localConfig.particleBaseSizeXs, sm: localConfig.particleBaseSizeSm },
			backgroundColor: color,
			borderRadius: '50%',
			boxShadow: `0 0 7px ${color}, 0 0 12px ${color}`,
			'--target-x': targetX,
			'--target-y': targetY,
			animation: `${particleFlyOut} ${duration}s cubic-bezier(0.1, 0.7, 0.3, 1) ${delay}s forwards`,
			pointerEvents: 'none',
		}}
	/>
));

// --- GemItem Component (Memoized) ---
interface GemItemProps {
	gemContent: Gem | null;
	itemIndex: number;
	onAttemptCollect: (gem: Gem) => void;
	currentGemValues: Record<string, number>;
}

const GemItem: React.FC<GemItemProps> = React.memo(({ gemContent, itemIndex, onAttemptCollect, currentGemValues }) => {
	const commonPaperStyles = useMemo(
		() => ({
			width: { xs: 60, sm: 80, md: 100 },
			height: { xs: 60, sm: 80, md: 100 },
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 2,
			boxSizing: 'border-box',
			position: 'relative',
		}),
		[]
	);

	const { displayTier, computedProgress, showProgressBar, progressTargetTierConfiguredValue, progressTargetTierName } =
		useMemo(() => {
			if (!gemContent)
				return {
					displayTier: undefined,
					computedProgress: 0,
					showProgressBar: false,
					progressTargetTierConfiguredValue: 0,
					progressTargetTierName: null,
				};

			const firstTierDefinition = localConfig.gemTiers[0];
			const firstTierConfiguredValue = currentGemValues[firstTierDefinition.name] ?? firstTierDefinition.dollarAmount;

			let progress = 0;
			let shouldShowProgressBar = false;
			let targetTierName: string | null = null;
			let targetValue = 0;

			const currentActualTier = getTierInfoByDollarAmount(gemContent.dollarAmount, currentGemValues);

			if (gemContent.dollarAmount < firstTierConfiguredValue && firstTierConfiguredValue > 0) {
				progress = (gemContent.dollarAmount / firstTierConfiguredValue) * 100;
				shouldShowProgressBar = true;
				targetTierName = firstTierDefinition.name;
				targetValue = firstTierConfiguredValue;
			} else {
				shouldShowProgressBar = false;
			}

			return {
				displayTier: currentActualTier || firstTierDefinition,
				computedProgress: Math.min(100, progress),
				showProgressBar: shouldShowProgressBar,
				progressTargetTierConfiguredValue: targetValue,
				progressTargetTierName: targetTierName,
			};
		}, [gemContent, currentGemValues]);

	const isClickable = useMemo(() => {
		return gemContent && !gemContent.isCollecting && !gemContent.error && gemContent.dollarAmount > 0;
	}, [gemContent]);

	const handleClick = useCallback(() => {
		if (isClickable && gemContent) {
			onAttemptCollect(gemContent);
		}
	}, [gemContent, onAttemptCollect, isClickable]);

	const tooltipTitle = useMemo(() => {
		if (gemContent) {
			const trimmedAddress = gemContent.ethereumAddress.substring(0, localConfig.ethAddressDisplayLength) + '...';

			if (gemContent.error) {
				return (
					<React.Fragment>
						<Typography variant="caption" display="block" color="error">
							{gemContent.error}
						</Typography>
						<Typography variant="caption" display="block" color="error">
							Address: {trimmedAddress}
						</Typography>
					</React.Fragment>
				);
			}

			if (isClickable) {
				return (
					<React.Fragment>
						<Typography variant="caption" display="block">
							Click to Collect Reward: ${gemContent.dollarAmount.toFixed(localConfig.dollarDecimalPlaces)}
						</Typography>
						<Typography variant="caption" display="block">
							Address: {trimmedAddress}
						</Typography>
					</React.Fragment>
				);
			}

			if (showProgressBar && progressTargetTierName) {
				return (
					<React.Fragment>
						<Typography variant="caption" display="block">
							Progress to ${progressTargetTierConfiguredValue.toFixed(localConfig.dollarDecimalPlaces)} reward:{' '}
							{Math.floor(computedProgress)}%
						</Typography>
						<Typography variant="caption" display="block">
							Address: {trimmedAddress}
						</Typography>
					</React.Fragment>
				);
			}

			if (displayTier) {
				return (
					<React.Fragment>
						<Typography variant="caption" display="block">
							{displayTier.name} Gem
						</Typography>
						<Typography variant="caption" display="block">
							Value: ${gemContent.dollarAmount.toFixed(localConfig.dollarDecimalPlaces)}
						</Typography>
						<Typography variant="caption" display="block">
							Address: {trimmedAddress}
						</Typography>
						<Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
							(Cannot collect)
						</Typography>
					</React.Fragment>
				);
			}
		}
		return 'Empty Slot';
	}, [
		gemContent,
		displayTier,
		showProgressBar,
		computedProgress,
		progressTargetTierConfiguredValue,
		progressTargetTierName,
		isClickable,
	]);

	if (!gemContent) {
		return (
			<LightTooltip title="Empty Slot" placement="top" arrow>
				<Paper sx={{ ...commonPaperStyles, backgroundColor: 'transparent', opacity: 0.6 }} />
			</LightTooltip>
		);
	}

	if (gemContent.error) {
		return (
			<LightTooltip title={tooltipTitle} placement="top" arrow>
				<Paper
					sx={{ ...commonPaperStyles, backgroundColor: 'transparent', cursor: isClickable ? 'pointer' : 'default' }}
					onClick={handleClick}
				>
					<CircularProgress
						variant="determinate"
						value={100}
						size={typeof commonPaperStyles.width === 'object' ? commonPaperStyles.width.xs : commonPaperStyles.width}
						sx={{ color: red[500], position: 'absolute' }}
					/>
					<Typography
						variant="caption"
						component="div"
						color="error"
						sx={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							fontSize: '0.7rem',
							zIndex: 1,
							fontWeight: 'bold',
						}}
					>
						?
					</Typography>
				</Paper>
			</LightTooltip>
		);
	}

	if (!displayTier) {
		console.warn('Could not determine tier for gem:', gemContent);
		return (
			<LightTooltip title="Error: Unknown Gem Type" placement="top" arrow>
				<Paper sx={{ ...commonPaperStyles, backgroundColor: 'transparent', opacity: 0.6 }} />
			</LightTooltip>
		);
	}

	if (showProgressBar) {
		return (
			<LightTooltip title={tooltipTitle} placement="top" arrow>
				<Paper
					sx={{ ...commonPaperStyles, backgroundColor: 'transparent', cursor: isClickable ? 'pointer' : 'default' }}
					onClick={handleClick}
				>
					<CircularProgress
						variant="determinate"
						value={computedProgress}
						size={typeof commonPaperStyles.width === 'object' ? commonPaperStyles.width.xs : commonPaperStyles.width}
						sx={{ color: grey[700], position: 'absolute' }}
					/>
					<Typography
						variant="caption"
						component="div"
						color="text.secondary"
						sx={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							fontSize: '0.7rem',
							zIndex: 1,
						}}
					>{`${Math.floor(computedProgress)}%`}</Typography>
				</Paper>
			</LightTooltip>
		);
	}

	const isIdleAndNotCollecting = !gemContent.isCollecting;

	return (
		<LightTooltip title={tooltipTitle} placement="top" arrow>
			<IconButton
				aria-label={`${displayTier.name} Gem ($${gemContent.dollarAmount.toFixed(localConfig.dollarDecimalPlaces)})`}
				onClick={handleClick}
				disabled={!isClickable || gemContent.isCollecting}
				sx={{
					...commonPaperStyles,
					padding: 0,
					overflow: 'visible',
					animation: isClickable && isIdleAndNotCollecting ? `${shakeAnimation} 2s ease-in-out infinite` : 'none',
					'&:hover': { backgroundColor: isClickable && isIdleAndNotCollecting ? 'action.hover' : 'transparent' },
				}}
			>
				<Diamond
					sx={{
						fontSize: displayTier.iconSize,
						color: displayTier.color,
						transition: 'transform 0.2s ease-in-out, filter 0.3s ease-in-out',
						animation:
							isClickable && isIdleAndNotCollecting ? `${idleShineAnimation} 2.2s ease-in-out infinite 0.3s` : 'none',
						'&:hover': {
							transform: isClickable && isIdleAndNotCollecting ? 'scale(1.15)' : 'none',
							filter:
								isClickable && isIdleAndNotCollecting
									? 'brightness(120%) drop-shadow(1px 1px 3px rgba(0,0,0,0.4))'
									: undefined,
						},
					}}
				/>
				{gemContent.isCollecting &&
					Array.from({ length: localConfig.numParticles }).map((_, i) => (
						<Particle
							key={i}
							color={displayTier.color}
							delay={Math.random() * 0.25}
							duration={0.8 + Math.random() * 0.7}
							targetX={`${(Math.random() - 0.5) * (Math.random() * 150 + 70)}px`}
							targetY={`${(Math.random() - 0.5) * (Math.random() * 150 + 70)}px`}
						/>
					))}
			</IconButton>
		</LightTooltip>
	);
});

// --- DatamineGemsGame Component ---
interface DatamineGemsGameProps {
	initialGems: GridState;
	onAttemptCollectGem: (gem: Gem[]) => boolean;
	onAddGem?: (ethereumAddress: string) => void;
	gemsCollected: number; // New prop
	totalCollectedBalance: number; // New prop
}

const DatamineGemsGame: React.FC<DatamineGemsGameProps> = ({
	initialGems,
	onAttemptCollectGem,
	onAddGem,
	gemsCollected, // Destructure new prop
	totalCollectedBalance, // Destructure new prop
}) => {
	const [gemValuesConfig, setGemValuesConfig] = useState<Record<string, number>>(() => {
		try {
			const storedConfig = localStorage.getItem(localConfig.localStorageKey);
			if (storedConfig) {
				const parsedConfig = JSON.parse(storedConfig);
				let isValidStoredConfig = true;
				for (const tier of localConfig.gemTiers) {
					if (typeof parsedConfig[tier.name] !== 'number') {
						isValidStoredConfig = false;
						break;
					}
				}
				if (isValidStoredConfig) return parsedConfig;
			}
		} catch (error) {
			console.error('Error loading gem values from localStorage:', error);
		}
		return DEFAULT_GEM_VALUES;
	});

	const [grid, setGrid] = useState<GridState>(initialGems);
	// collectedCount and totalBalance states removed

	const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
	const [isAddGemDialogOpen, setIsAddGemDialogOpen] = useState(false);
	const [newGemEthereum, setNewGemEthereum] = useState('');

	const [editableGemValues, setEditableGemValues] = useState<Record<string, string>>(
		Object.entries(gemValuesConfig).reduce(
			(acc, [tierName, value]) => {
				acc[tierName] = String(value);
				return acc;
			},
			{} as Record<string, string>
		)
	);

	useEffect(() => {
		try {
			localStorage.setItem(localConfig.localStorageKey, JSON.stringify(gemValuesConfig));
		} catch (error) {
			console.error('Error saving gem values to localStorage:', error);
		}
	}, [gemValuesConfig]);

	useEffect(() => {
		setEditableGemValues(
			Object.entries(gemValuesConfig).reduce(
				(acc, [tierName, value]) => {
					acc[tierName] = String(value);
					return acc;
				},
				{} as Record<string, string>
			)
		);
	}, [gemValuesConfig]);

	useEffect(() => {
		setGrid(initialGems);
		// No longer setting collectedCount and totalBalance here, as they are props
	}, [initialGems]);

	const handleActualGemCollection = useCallback((gemToCollect: Gem, index: number) => {
		setGrid((prevGrid) =>
			prevGrid.map((cell, i) =>
				i === index && cell && cell.id === gemToCollect.id ? { ...cell, isCollecting: true } : cell
			)
		);
		// No longer setting totalBalance or collectedCount here

		setTimeout(() => {
			setGrid((prevGrid) => {
				const newGrid = [...prevGrid];
				if (newGrid[index] && newGrid[index]?.id === gemToCollect.id) {
					newGrid[index] = { ...newGrid[index]!, isCollecting: false };
					// The parent is responsible for updating initialGems to remove or change this gem
				}
				return newGrid;
			});
		}, localConfig.particleEffectDuration);
	}, []);

	const handleGemInteractionAttempt = useCallback(
		(gem: Gem) => {
			const index = grid.findIndex((g) => g?.id === gem.id);
			if (index === -1) {
				console.error('Clicked gem not found in grid:', gem);
				return;
			}

			if (gem.error) {
				if (onAttemptCollectGem) {
					onAttemptCollectGem([gem]);
				}
				return;
			}

			const isGemItemClickable = !gem.isCollecting && !gem.error && gem.dollarAmount > 0;

			if (!isGemItemClickable) return;

			const canCollect = onAttemptCollectGem([gem]);
			if (canCollect) {
				handleActualGemCollection(gem, index);
			}
		},
		[onAttemptCollectGem, handleActualGemCollection, grid, gemValuesConfig]
	);

	const handleResetSettingsToDefault = useCallback(() => {
		setGemValuesConfig(DEFAULT_GEM_VALUES);
	}, []);

	const handleOpenSettingsDialog = () => {
		setEditableGemValues(
			Object.entries(gemValuesConfig).reduce(
				(acc, [tierName, value]) => {
					acc[tierName] = String(value);
					return acc;
				},
				{} as Record<string, string>
			)
		);
		setIsSettingsDialogOpen(true);
	};

	const handleCloseSettingsDialog = () => {
		setIsSettingsDialogOpen(false);
	};

	const handleSaveSettings = () => {
		const newGemValues: Record<string, number> = {};
		let isValid = true;
		for (const tier of localConfig.gemTiers) {
			const valueStr = editableGemValues[tier.name];
			let value = parseFloat(valueStr);
			if (isNaN(value) || value < 0) {
				isValid = false;
				console.error(`Invalid value for ${tier.name}: ${valueStr}`);
				break;
			}
			if (value > 100) {
				value = 100;
			}
			newGemValues[tier.name] = value;
		}

		if (isValid) {
			setGemValuesConfig(newGemValues);
		}
		setIsSettingsDialogOpen(false);
	};

	const handleEditableGemValueChange = (tierName: string, value: string) => {
		setEditableGemValues((prev) => ({ ...prev, [tierName]: value }));
	};

	// --- Add Gem Dialog Logic ---
	const handleOpenAddGemDialog = () => {
		setNewGemEthereum('');
		setIsAddGemDialogOpen(true);
	};

	const handleCloseAddGemDialog = () => {
		setIsAddGemDialogOpen(false);
	};

	const handleConfirmAddGem = () => {
		if (onAddGem && newGemEthereum.trim()) {
			onAddGem(newGemEthereum.trim());
		}
		handleCloseAddGemDialog();
	};

	const getBatchGemsToCollect = () => {
		const bronzeTier = gemValuesConfig['Bronze'];

		const visibleGems = grid.filter((gem) => gem && gem?.dollarAmount > bronzeTier && !gem.error) as Gem[];

		return visibleGems;
	};
	const batchOfGemsToCollect = getBatchGemsToCollect();

	const handleCollectAllGems = () => {
		onAttemptCollectGem(batchOfGemsToCollect);
	};
	const getBatchCollectButton = () => {
		if (batchOfGemsToCollect.length === 0) {
			return;
		}

		const totalDollarAmount = batchOfGemsToCollect.reduce((total, gem) => total + gem.dollarAmount, 0);
		return (
			<Button onClick={handleCollectAllGems} color="secondary" variant="outlined">
				Collect All Gems ($ {totalDollarAmount.toFixed(localConfig.dollarDecimalPlaces)})
			</Button>
		);
	};

	return (
		<Paper
			elevation={3}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				p: { xs: 2, sm: 3 },
				borderRadius: 3,
				backgroundColor: 'background.default',
				margin: 'auto',
				minWidth: { xs: '95%', sm: 380 },
			}}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					alignItems: 'center',
					mb: 2,
					width: '100%',
					justifyContent: 'space-between',
				}}
			>
				<Box>{getBatchCollectButton()}</Box>
				<Box sx={{ display: 'flex' }}>
					{onAddGem && (
						<LightTooltip title="Add custom Datamine Gem Ethereum address" placement="top">
							<IconButton aria-label="add gem" onClick={handleOpenAddGemDialog} size="small" sx={{ mr: 0.5 }}>
								<Add />
							</IconButton>
						</LightTooltip>
					)}
					<IconButton aria-label="settings" onClick={handleOpenSettingsDialog} size="small">
						<MoreVert />
					</IconButton>
				</Box>
			</Box>

			<Grid
				container
				spacing={{ xs: 1, sm: 1.5 }}
				sx={{ width: { xs: 190, sm: 330 }, justifyContent: 'center', mb: 3 }}
			>
				{grid.map((gemInCell, index) => (
					<Grid
						size={{ xs: 3 }}
						key={gemInCell?.id || `empty-slot-${index}`}
						sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
					>
						<GemItem
							gemContent={gemInCell}
							itemIndex={index}
							onAttemptCollect={handleGemInteractionAttempt}
							currentGemValues={gemValuesConfig}
						/>
					</Grid>
				))}
			</Grid>

			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					alignItems: 'center',
					flexGrow: 1,
					justifyContent: { xs: 'center', sm: 'flex-start' },
				}}
			>
				<Typography variant="body1" sx={{ mr: { sm: 2 }, mb: { xs: 1, sm: 0 }, fontWeight: 'medium' }}>
					Gems Collected: {gemsCollected} {/* Use prop */}
				</Typography>
				<Typography variant="body1" color="success.main" sx={{ fontWeight: 'medium' }}>
					Total Collected: ${totalCollectedBalance.toFixed(localConfig.dollarDecimalPlaces)} {/* Use prop */}
				</Typography>
			</Box>

			{/* Settings Dialog */}
			<Dialog open={isSettingsDialogOpen} onClose={handleCloseSettingsDialog} fullWidth maxWidth="xs">
				<DialogTitle>Gem Value Settings</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>Modify the dollar amount for each gem color.</DialogContentText>
					{localConfig.gemTiers.map((tier) => {
						return (
							<Box key={tier.name} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<Diamond sx={{ color: tier.color, mr: 1.5, fontSize: '24px' }} />
								<TextField
									margin="none"
									label={`${tier.name} Value`}
									type="number"
									fullWidth
									variant="outlined"
									value={editableGemValues[tier.name] || ''}
									onChange={(e) => handleEditableGemValueChange(tier.name, e.target.value)}
									InputProps={{
										startAdornment: <InputAdornment position="start">$</InputAdornment>,
									}}
									inputProps={{ step: '0.0001' }}
								/>
							</Box>
						);
					})}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseSettingsDialog}>Cancel</Button>
					<Button onClick={handleSaveSettings} color="secondary" variant="outlined">
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Add Gem by Address Dialog */}
			<Dialog open={isAddGemDialogOpen} onClose={handleCloseAddGemDialog} fullWidth maxWidth="sm">
				<DialogTitle>Add Gem by Address</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Add another Gem by entering Ethereum Address. This gem will be added as your playfield and the address must
						be participating in the game.
					</DialogContentText>
					<TextField
						autoFocus
						margin="dense"
						id="new-gem-ethereum"
						label={
							<>
								Ethereum Add
								<Box component="span" sx={{ position: 'absolute', left: '-9999px' }}>
									{' '}
								</Box>
								ress
							</>
						}
						type="text"
						fullWidth
						variant="outlined"
						value={newGemEthereum}
						onChange={(e) => setNewGemEthereum(e.target.value)}
						autoComplete="off"
						inputProps={{
							autoComplete: 'off',
						}}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseAddGemDialog}>Cancel</Button>
					<Button onClick={handleConfirmAddGem} color="secondary" variant="outlined">
						Add Gem
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
};

export default DatamineGemsGame;
