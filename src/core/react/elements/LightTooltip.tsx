import { withStyles, Theme } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

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