import { Box, CircularProgress, Dialog, DialogContent } from '@mui/material';
import React from 'react';

const LoadingDialog: React.FC = React.memo(() => {
	return (
		<Dialog
			open={true}
			aria-labelledby="loading-dialog-title"
			transitionDuration={0}
			slots={{
				transition: React.Fragment,
			}}
		>
			<DialogContent>
				<Box my={3}>
					<CircularProgress style={{ color: '#0ff' }} />
				</Box>
			</DialogContent>
		</Dialog>
	);
});

export default LoadingDialog;
