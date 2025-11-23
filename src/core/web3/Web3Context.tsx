import { useWeb3Store } from './web3Store';
import { Web3State } from './reducer/interfaces';

export interface Web3ContextValue {
	state: Web3State;
	dispatch: any;
}

const useWeb3Context = () => {
	const { state, dispatch } = useWeb3Store();
	return { state, dispatch };
};

export { useWeb3Context };
