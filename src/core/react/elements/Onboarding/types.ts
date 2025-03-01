
export interface OnboardingProps {
	activeStep: number;
	handleNext: () => void;
	handleBack: () => void;
	handleSelectOption: (option: string) => void;
	handleSelectSizeOption: (option: number) => void;
	selectedOption: string;
}