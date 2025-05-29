import { Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { withStyles } from '@mui/styles';


const LightTooltip = withStyles((theme: Theme) => {
	console.log('theme:', theme)
	return {
		tooltip: {
			backgroundColor: '#272936',
			color: '#fff',
			boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)', // theme.shadows[8] was giving errors in mui v7 upgrade
			padding: 16, // theme.spacing(2) was giving errors in mui v7 upgrade
			fontSize: 14,
			border: '1px solid #0ff'
		},
	}
}
)(Tooltip);

export default LightTooltip