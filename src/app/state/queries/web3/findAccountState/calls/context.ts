import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';

/**
 * The resolved ecosystem configuration, derived from `getEcosystemConfig` rather than restated.
 *
 * That function composes several config layers and returns an inferred shape, so deriving the
 * type here keeps this in step automatically if a layer gains a field.
 */
export type ResolvedEcosystemConfig = ReturnType<typeof getEcosystemConfig>;

/**
 * The dependencies every multicall builder needs.
 *
 * These values were previously captured from the enclosing `findAccountState` closure. Passing
 * them explicitly is what allows the builders to live in their own module and be exercised in
 * isolation, rather than only through a live chain read.
 */
export interface FindAccountStateContext {
	/** Resolved configuration for the ecosystem being read. */
	config: ResolvedEcosystemConfig;
	/** The ecosystem being read. */
	ecosystem: Ecosystem;
	/** True when reading Arbitrum (Layer 2) rather than Ethereum mainnet. */
	isArbitrumMainnet: boolean;
	/** The address whose on-chain state is being fetched. */
	addressToFetch: string;
}
