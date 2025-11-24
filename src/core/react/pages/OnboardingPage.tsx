import React from 'react';
import { Ecosystem } from '@/core/app/configs/config.common';
import { useAppStore } from '@/core/react/appStore';
import OnboardingFragment from '@/core/react/elements/Onboarding/OnboardingFragment';
import { useShallow } from 'zustand/react/shallow';
import { ReducerDispatch } from '@/core/utils/reducer/sideEffectReducer';
interface RenderProps {
	dispatch: ReducerDispatch;
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
	const { ecosystem, dispatch } = useAppStore(
		useShallow((state) => ({ ecosystem: state.state.ecosystem, dispatch: state.dispatch }))
	);
	return <Render dispatch={dispatch} ecosystem={ecosystem} />;
};
export default OnboardingPage;
