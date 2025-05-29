
import CircularProgress from '@mui/material/CircularProgress';

const CenteredLoading = () => (
	<div
		style={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			height: '100vh', // Full viewport height
			width: '100vw', // Full viewport width
		}}
	>
		<CircularProgress style={{ color: '#0ff' }} />
	</div>
);

export default CenteredLoading;