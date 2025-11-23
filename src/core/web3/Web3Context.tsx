import { EventEmitter } from 'events';
import { Web3State } from './web3Reducer';
import { useWeb3Store } from './web3Store';

export interface Web3ContextValue {
	state: Web3State;
	dispatch: any;
	emitter: EventEmitter;
}

const emitter = new EventEmitter();

const useWeb3Context = () => {
	const { state, dispatch } = useWeb3Store();
	return { state, dispatch, emitter };
};

export { useWeb3Context };
