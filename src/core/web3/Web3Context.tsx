import { useWeb3Store } from '@/core/web3/web3Store';

const useWeb3Context = () => {
	const { state, dispatch } = useWeb3Store();
	return { state, dispatch };
};

export { useWeb3Context };
