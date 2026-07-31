import {
	CheckCircleOutlined as CopiedIcon,
	ContentCopy as CopyIcon,
	ErrorOutlined as ErrorIcon,
	ExpandLess,
	ExpandMore,
	HighlightOff as CancelledIcon,
	WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { Box, Button, Collapse, Dialog, DialogActions, DialogContent, Divider, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { parseWeb3Error } from '@/errors/parseWeb3Error';
import { web3ErrorDialogText, type Web3ErrorSeverity } from '@/errors/config.web3Errors';
import { appPalette } from '@/theme/appTheme';
import copyToClipboard from '@/utils/copyToClipboard';

interface Params {
	open: boolean;
	/** The raw error. Anything throwable is accepted — it is parsed here. */
	error: unknown;
	onClose: () => void;
}

/**
 * Maps a severity onto its icon and accent color. Colors come from the shared theme
 * (Rule 9) so this component contains no literals of its own.
 */
const severityPresentation: Record<Web3ErrorSeverity, { color: string; Icon: typeof ErrorIcon }> = {
	cancelled: { color: appPalette.textMuted, Icon: CancelledIcon },
	warning: { color: appPalette.warning, Icon: WarningIcon },
	error: { color: appPalette.error, Icon: ErrorIcon },
};

/**
 * Presents wallet / viem errors in a readable form.
 *
 * Leads with a plain-English explanation of what happened and what to do about it,
 * and tucks the raw viem output behind a "Show technical details" toggle so it stays
 * available for debugging without being the first thing a user sees.
 */
const Web3ErrorDialog: React.FC<Params> = React.memo(function Web3ErrorDialog({ open, error, onClose }) {
	const [isShowingDetails, setIsShowingDetails] = useState(false);
	const [hasCopied, setHasCopied] = useState(false);

	// Parsing walks nested causes, so avoid repeating it on unrelated re-renders.
	const parsedError = useMemo(() => parseWeb3Error(error), [error]);
	const { color: accentColor, Icon: SeverityIcon } = severityPresentation[parsedError.severity];

	const handleCopyDetails = () => {
		copyToClipboard(parsedError.technicalDetails);
		setHasCopied(true);
	};

	const getRevertReason = () => {
		if (!parsedError.revertReason) {
			return null;
		}
		return (
			<Box
				sx={{
					mt: 2,
					p: 1.5,
					borderRadius: 1,
					borderLeft: `3px solid ${accentColor}`,
					bgcolor: appPalette.secondaryBackground,
				}}
			>
				<Typography variant="caption" sx={{ color: appPalette.textMuted, display: 'block', mb: 0.5 }}>
					Reported by the contract
				</Typography>
				<Typography variant="body2" sx={{ color: appPalette.textSecondary, fontFamily: 'monospace' }}>
					{parsedError.revertReason}
				</Typography>
			</Box>
		);
	};

	const getSuggestion = () => {
		if (!parsedError.suggestion) {
			return null;
		}
		return (
			<Typography variant="body2" sx={{ color: appPalette.textMuted, mt: 1.5 }}>
				{parsedError.suggestion}
			</Typography>
		);
	};

	const getTechnicalDetails = () => {
		if (!parsedError.technicalDetails) {
			return null;
		}
		return (
			<>
				<Divider sx={{ my: 2 }} />
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
					<Button
						size="small"
						onClick={() => setIsShowingDetails(!isShowingDetails)}
						endIcon={isShowingDetails ? <ExpandLess /> : <ExpandMore />}
						sx={{ color: appPalette.textMuted, textTransform: 'none' }}
					>
						{isShowingDetails ? web3ErrorDialogText.detailsToggleHide : web3ErrorDialogText.detailsToggleShow}
					</Button>
					<Collapse in={isShowingDetails} orientation="horizontal">
						<Button
							size="small"
							onClick={handleCopyDetails}
							startIcon={hasCopied ? <CopiedIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
							sx={{ color: hasCopied ? appPalette.success : appPalette.textMuted, textTransform: 'none' }}
						>
							{hasCopied ? web3ErrorDialogText.copiedButton : web3ErrorDialogText.copyButton}
						</Button>
					</Collapse>
				</Box>
				<Collapse in={isShowingDetails}>
					<Box
						sx={{
							mt: 1,
							p: 1.5,
							maxHeight: 220,
							overflow: 'auto',
							borderRadius: 1,
							bgcolor: appPalette.secondaryBackground,
							border: `1px solid ${appPalette.border}`,
						}}
					>
						<Typography
							variant="caption"
							component="pre"
							sx={{
								m: 0,
								color: appPalette.textMuted,
								fontFamily: 'monospace',
								fontSize: '0.72rem',
								whiteSpace: 'pre-wrap',
								wordBreak: 'break-word',
							}}
						>
							{parsedError.technicalDetails}
						</Typography>
					</Box>
				</Collapse>
			</>
		);
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="web3-error-dialog-title">
			<DialogContent sx={{ pt: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
					<SeverityIcon sx={{ color: accentColor, fontSize: 32, flexShrink: 0, mt: 0.25 }} />
					<Box sx={{ minWidth: 0 }}>
						<Typography id="web3-error-dialog-title" variant="h6" sx={{ color: appPalette.textPrimary }}>
							{parsedError.title}
						</Typography>
						<Typography variant="body1" sx={{ color: appPalette.textSecondary, mt: 0.5 }}>
							{parsedError.message}
						</Typography>
						{getSuggestion()}
					</Box>
				</Box>
				{getRevertReason()}
				{getTechnicalDetails()}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={onClose} color="secondary" size="large" variant="outlined">
					{web3ErrorDialogText.closeButton}
				</Button>
			</DialogActions>
		</Dialog>
	);
});

export default Web3ErrorDialog;
