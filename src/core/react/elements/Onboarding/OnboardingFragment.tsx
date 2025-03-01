
import { Box, Paper } from '@mui/material';
import React, { useState } from 'react';
import ProgressStepper from './ProgressStepper';
import StepFour from './StepFour';
import StepOne from './StepOne';
import StepThree from './StepThree';
import StepTwo from './StepTwo';

const OnboardingFragment: React.FC = () => {
	const [activeStep, setActiveStep] = useState(0);
	const [selectedOption, setSelectedOption] = useState('lockquidity');
	const [selectedSizeOption, setSelectedSizeOption] = useState(10);
	const totalSteps = 4;

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep >= totalSteps - 1 ? 0 : prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => {
			//@todo this can navigate to dashboard
			if (prevActiveStep <= 0) {
				return prevActiveStep;
			}

			return prevActiveStep - 1;
		});
	};

	const handleSelectOption = (option: string) => {
		setSelectedOption(option);
	};
	const handleSelectSizeOption = (option: number) => {
		setSelectedSizeOption(option);
	};

	const renderStep = () => {
		const stepProps = {
			activeStep,
			handleNext,
			handleBack,
			handleSelectOption,
			handleSelectSizeOption,
			selectedOption,
		};

		switch (activeStep) {
			case 0:
				return <StepOne {...stepProps} />;
			case 1:
				return <StepTwo {...stepProps} />;
			case 2:
				return <StepThree {...stepProps} />;
			case 3:
				return <StepFour {...stepProps} />;
			default:
				return <StepOne {...stepProps} />;
		}
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				p: 3,
			}}
		>
			<Paper
				elevation={6}
				sx={{
					width: '100%',
					maxWidth: 1000,
					minHeight: 560,
					borderRadius: 2,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
					<ProgressStepper activeStep={activeStep} totalSteps={totalSteps} />
				</Box>
				{renderStep()}
			</Paper>
		</Box>
	);
};

export default OnboardingFragment;