import React, { useContext } from 'react';
import { Ecosystem } from '../../../configs/config.common';
import { useWeb3Context } from '../../web3/Web3Context';
import OnboardingFragment from '../elements/Onboarding/OnboardingFragment';

interface RenderProps {
	dispatch: React.Dispatch<any>;
	ecosystem: Ecosystem;
}

/**
 * A memoized functional component that renders the OnboardingFragment.
 * @param params - Object containing dispatch function and ecosystem.
 */
const Render: React.FC<RenderProps> = React.memo(({ dispatch, ecosystem }) => {
	return (
		<>
			<OnboardingFragment />
		</>
	);
});

interface Props {}
/**
 * OnboardingPage component that serves as a container for the OnboardingFragment.
 * It provides the necessary Web3 context (dispatch and ecosystem) to its child components.
 * @param props - Component props (currently empty).
 */
const OnboardingPage: React.FC<Props> = () => {
	const { state: web3State, dispatch } = useWeb3Context();
	const { ecosystem } = web3State;

	return <Render dispatch={dispatch} ecosystem={ecosystem} />;
};

export default OnboardingPage;
