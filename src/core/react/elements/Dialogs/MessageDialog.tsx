import React from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface Params {
	open: boolean;
	title: string;
	message: string;
	onClose: () => void;
}

const MessageDialog: React.FC<Params> = React.memo(({ open, title, message, onClose }) => {
	return <Dialog
		open={open}
		onClose={onClose}
		aria-labelledby="alert-dialog-title"
	>
		<DialogTitle id="alert-dialog-title">{title}</DialogTitle>
		<DialogContent>
			<Box mb={4}>
				{message}
			</Box>
		</DialogContent>
		<DialogActions>
			<Box mb={1} mr={2}>
				<Button onClick={onClose} color="secondary" size="large" variant="outlined" >
					Close
				</Button>
			</Box>
		</DialogActions>
	</Dialog>
});

export default MessageDialog;