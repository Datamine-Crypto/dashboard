import { Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { withStyles } from '@mui/styles';


const LightTooltip = withStyles((theme: Theme) => ({
	tooltip: {
		backgroundColor: '#272936',
		color: '#fff',
		boxShadow: theme.shadows[8],
		padding: theme.spacing(2),
		fontSize: 14,
		border: '1px solid #0ff'
	},
}))(Tooltip);

export default LightTooltip