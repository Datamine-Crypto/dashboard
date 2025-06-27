import { Box, MobileStepper } from '@mui/material';
import React from 'react';

interface ProgressStepperProps {
	activeStep: number;
	totalSteps: number;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ activeStep, totalSteps }) => {
	return (
		<Box sx={{ width: '100%', mb: 2 }}>
			<MobileStepper
				variant="dots"
				steps={totalSteps}
				position="static"
				activeStep={activeStep}
				sx={{
					bgcolor: 'transparent',
					'& .MuiMobileStepper-dot': {
						bgcolor: 'rgba(0, 255, 255, 0.3)',
					},
					'& .MuiMobileStepper-dotActive': {
						bgcolor: '#0FF',
					},
				}}
				nextButton={<div />}
				backButton={<div />}
			/>
		</Box>
	);
};

export default ProgressStepper;
