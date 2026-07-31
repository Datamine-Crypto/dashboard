import CircularProgress from '@mui/material/CircularProgress';
import { appPalette } from '@/theme/appTheme';

const CenteredLoading = () => (
	<div
		style={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			height: '100vh', // Full viewport height
			width: '100%', // Full viewport width
		}}
	>
		<CircularProgress style={{ color: appPalette.highlight }} />
	</div>
);

export default CenteredLoading;
