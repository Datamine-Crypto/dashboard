import React, { useContext } from 'react';
import { Ecosystem } from '../../../configs/config.common';
import { Web3Context } from '../../web3/Web3Context';
import OnboardingFragment from '../elements/Onboarding/OnboardingFragment';

interface RenderProps {
	dispatch: React.Dispatch<any>;
	ecosystem: Ecosystem;
}

const Render: React.FC<RenderProps> = React.memo(({ dispatch, ecosystem }) => {

	return <>
		<OnboardingFragment />
	</>

})

interface Props {
}
const OnboardingPage: React.FC<Props> = ({ }) => {
	const { state: web3State, dispatch } = useContext(Web3Context)
	const { ecosystem } = web3State

	return <Render
		dispatch={dispatch}
		ecosystem={ecosystem}
	/>
}

export default OnboardingPage
