import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

/**
 * Defines the props for the custom LightTooltip component.
 * Extends Material-UI's TooltipProps to inherit standard tooltip properties.
 */
interface CustomTooltipProps extends TooltipProps {}

// Create the styled Tooltip component
/**
 * A custom styled Material-UI Tooltip component with a light theme.
 * It features a dark background, white text, a highlight border, and custom padding and font size.
 * @param props - Props passed to the Material-UI Tooltip component.
 */
const LightTooltip = styled(({ className, ...props }: CustomTooltipProps) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: '#272936',
		color: '#fff',
		boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
		padding: 16, // Equivalent to theme.spacing(2) if your base spacing unit is 8px
		fontSize: 14,
		border: '1px solid #0ff',
	},
	// If you also want to style the arrow, you can add it here
	[`& .${tooltipClasses.arrow}`]: {
		color: '#272936', // Match the tooltip background
		'&:before': {
			border: '1px solid #0ff', // Match the tooltip border
		},
	},
}));
export default LightTooltip;
