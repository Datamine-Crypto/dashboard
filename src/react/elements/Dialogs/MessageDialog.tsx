import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React from 'react';

interface Params {
	open: boolean;
	/** Accepts nodes, not just strings — callers pass rich JSX (images, links, layout). */
	title?: React.ReactNode;
	message?: React.ReactNode;
	onClose: () => void;
}

const MessageDialog: React.FC<Params> = React.memo(function MessageDialog({ open, title, message, onClose }) {
	return (
		<Dialog open={open} onClose={onClose} aria-labelledby="alert-dialog-title">
			<DialogTitle id="alert-dialog-title">{title}</DialogTitle>
			<DialogContent>
				<Box
					sx={{
						mb: 4,
					}}
				>
					{message}
				</Box>
			</DialogContent>
			<DialogActions>
				<Box
					sx={{
						mb: 1,
						mr: 2,
					}}
				>
					<Button onClick={onClose} color="secondary" size="large" variant="outlined">
						Close
					</Button>
				</Box>
			</DialogActions>
		</Dialog>
	);
});

export default MessageDialog;
