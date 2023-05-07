
import BN from 'bn.js'

export interface FluxAddressLock {
	amount: BN;
	blockNumber: number;
	burnedAmount: BN;
	lastMintBlockNumber: number;
	minterAddress: string;
}

export interface FluxAddressDetails {
	blockNumber: number;
	fluxBalance: BN,
	mintAmount: BN,
	addressTimeMultiplier: number,
	addressBurnMultiplier: number,
	addressTimeMultiplierRaw: BN,
	addressBurnMultiplierRaw: BN,
	globalLockedAmount: BN,
	globalBurnedAmount: BN
}

export interface FluxAddressTokenDetails {
	blockNumber: number;
	isFluxOperator: boolean;
	damBalance: BN;
	myRatio: BN;
	globalRatio: BN;
}

export enum DialogType {
	LockIn = 'LOCK_IN',
	Mint = 'MINT',
	Burn = 'BURN',
	Unlock = 'UNLOCK',
	ZeroEth = 'ZERO_ETH',
	ZeroDam = 'ZERO_DAM',
	Trade = 'TRADE',
	TitleMessage = 'TITLE_MESSAGE',
	WalletConnectRpc = 'WALLET_CONNECT_RPC',
	ClientSettings = 'CLIENT_SETTINGS',
}

export enum Token {
	FLUX = 'FLUX',
	DAM = 'DAM',
	ETH = 'ETH',
	USDC = 'USDC'
}