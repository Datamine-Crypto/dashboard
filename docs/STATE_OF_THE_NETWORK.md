# State of the Network

**Datamine Network — verified on-chain metrics**
**Reporting date: 26 July 2026**

---

## 1. Purpose

This report states every headline metric the project publishes, together with its definition, its
source, and the method by which any third party can reproduce it without our involvement.

It exists for two reasons. First, our published figures have historically appeared without stated
definitions or measurement dates, which made them impossible to reconcile across sources. Second,
our own documentation contained no consolidated performance record between April 2022 and 2026,
even though the underlying data has been continuously available on-chain and rendered by our
dashboard throughout.

Both gaps are ours. This document closes them.

**Nothing here requires trusting us.** Every figure resolves to a public block explorer or to a
liquidity pool contract that anyone can query directly. Where a figure is derived rather than read
directly, the derivation is given in Section 3.

---

## 2. How to verify any figure in this report

### 2.1 Contract addresses

**Ethereum mainnet (L1)**

| Asset | Address |
|---|---|
| DAM token | `0xF80D589b3Dbe130c270a69F1a69D050f268786Df` |
| FLUX token | `0x469eDA64aEd3A3Ad6f868c44564291aA415cB1d9` |
| DAM / ETH pool (Uniswap V3) | `0xBd233D685eDE81E00faaEFEbD55150C76778a34e` |
| FLUX / ETH pool (Uniswap V3) | `0x07AA6584385cCA15C2c6e13A5599fFc2D177E33b` |

**Arbitrum (L2)**

| Asset | Address |
|---|---|
| FLUX token (bridged) | `0xF80D589b3Dbe130c270a69F1a69D050f268786Df` |
| ArbiFLUX token | `0x64081252c497FCfeC247a664e9D10Ca8eD71b276` |
| LOCK token | `0x454F676D44DF315EEf9B5425178d5a8B524CEa03` |
| LOCK / ETH pool (Uniswap V2) | `0x0C93A1D3F68a0554d37F3e7AF3a1442a94405E7A` |
| ArbiFLUX / ETH pool (SushiSwap) | `0xbF719D56c5f19ae0833ADC4080BEfC48A9B415b5` |
| FLUX / ETH pool (SushiSwap) | `0x088F6dCDe862781db7b01fEB67afd265aBbC6d90` |
| Locked liquidity holder | `0xE05E43eE517A6D2862f91Be27315318A8E991FCc` |
| Market — Time-in-Market Rewards v2 | `0xe948c8417DD2f8e7dfc88ac3F50b3F89Db7c29Dd` |
| HODL Clicker: Rush | `0x012C2a83f854Bd016074195d06611785eF8D27E0` |
| Batch Minter | `0x352c8A363eF1C9e730b8A2EE14Bab90545fd189C` |

> ⚠️ **Address collision — read this before querying.**
> `0xF80D589b3Dbe130c270a69F1a69D050f268786Df` is **DAM on Ethereum** and **FLUX on Arbitrum**.
> Same address, two different chains, two different assets. This is an artefact of deployment
> ordering, not an error. Always confirm which explorer you are on. This has caused at least one
> third-party analysis to attribute the wrong asset.

### 2.2 Sources used

- **Etherscan** — Ethereum token supply, holders, transfers, contract source
- **Arbiscan** — Arbitrum equivalents
- **Pool contracts** — reserves read directly via `getReserves()` (V2/Sushi) or `slot0()` (V3)
- **Datamine dashboard** — <https://datamine-crypto.github.io/dashboard/> — computes every derived
  figure below from the above, client-side, with no server or database in the path

The dashboard performs no off-chain aggregation. It reads the same public state you would, batches
the calls, and applies the formulas in Section 3. Its source is public.

---

## 3. Definitions

Ambiguity in these definitions is the reason our published numbers have not reconciled. They are
fixed here.

**Price.** Derived on-chain, never from a price API. The token/ETH ratio comes from the relevant
pool; ETH/USD comes from the USDC/ETH Uniswap V3 pool. No centralised exchange data is used.

**Market capitalisation.** `current total supply × price`. This includes tokens locked in validator
positions, because locked tokens remain owned by their holder and recoverable on demand — they are
staked, not burned.

> We flag this explicitly because it is a common source of discrepancy. Some explorers report a
> *circulating* market cap that excludes locked supply. For DAM, where **83.53%** is locked in
> validator contracts, the two measures differ by roughly a factor of six. **Comparisons against
> other protocols must use the same basis on both sides.**

**Available liquidity.** The total USD value of both sides of a token's primary liquidity pool
(token side + ETH side), read directly from pool reserves. This is not the same as DefiLlama TVL,
which applies its own methodology and coverage rules and will return a different figure.

**Percentage burned.** `cumulative burned ÷ cumulative minted`. For FLUX and ArbiFLUX, burned tokens
are destroyed. For LOCK, "burned" tokens are routed to the liquidity vault rather than destroyed —
which is why LOCK's figure can exceed 100% of current supply.

**Yearly supply inflation.** Annualised supply growth measured over a trailing 31-day window. This
can be **negative** when burning exceeds issuance.

**Active validator.** An address with a non-zero locked balance that has minted within the tracked
window. The *total* validator figure includes dormant positions, some inactive for years. We report
both, and consider the active figure the meaningful one.

**Base APY.** Return from locking alone, at the minimum burn multiplier — i.e. what a participant
earns without burning. Actual returns for burning participants are higher.

**Break-even years.** Time for accrued minting to repay the cost of the locked position at current
prices and multipliers.

**Monthly production.** USD value of new tokens issued across the ecosystem per month at current
prices. This is the ecosystem's gross new supply, and therefore its theoretical maximum sell
pressure.

**Transfers vs. transactions.** Block explorers count ERC-20 `Transfer` *events*. One transaction may
emit several. We report transfer events and label them as such. Where a transaction count is
required, it is stated separately.

---

## 4. Current position — 26 July 2026

### 4.1 Prices

| Asset | Price |
|---|---:|
| DAM | $0.0384 |
| FLUX | $0.0219 |
| ArbiFLUX | $0.0402 |
| LOCK | $2.4755 |
| ETH (reference) | $1,920.37 |

### 4.2 Market capitalisation

| Asset | Market cap |
|---|---:|
| DAM | $630,832 |
| FLUX | $119,797 |
| LOCK | $77,298 |
| ArbiFLUX | $16,151 |
| **Total** | **$844,078** |

Basis: total supply × price, per Section 3.

### 4.3 Available liquidity

| Pool | Liquidity |
|---|---:|
| LOCK / ETH | $71,166 |
| FLUX / ETH | $44,938 |
| DAM / ETH | $18,659 |
| ArbiFLUX / ETH | $2,669 |
| **Total** | **$137,432** |

Pool depth in native units: FLUX 2,064,827.14 (L1) and 24,425.94 (L2); ArbiFLUX 66,185.85 (L2).

### 4.4 Supply

| Asset | Supply | Cap |
|---|---:|---|
| DAM | 16,876,778.9 | **Fixed — the only capped asset** |
| FLUX | 5,572,427 remaining (844,328 unminted) | none |
| ArbiFLUX | 411,618.06 | none |
| LOCK | 31,361.67 | none |

FLUX, ArbiFLUX and LOCK are uncapped by design and are issued continuously against locked
collateral. Any "maximum total supply" field shown by a block explorer for these assets is a
current-supply reading, not a ceiling.

### 4.5 Cumulative destruction

| Asset | Burned | As % of minted |
|---|---:|---:|
| FLUX | 5,721,657 | **50.66%** |
| ArbiFLUX | 444,320 | **51.91%** |
| LOCK | — | **120.36%** of current supply, routed to vault |

More FLUX has been destroyed than currently exists. LOCK's figure exceeds 100% because LOCK burns
accumulate as permanent liquidity rather than being destroyed.

### 4.6 Supply inflation

| Asset | Current | At launch |
|---|---:|---:|
| FLUX | **40.63%** | ~1,200% |
| ArbiFLUX | **94.83%** | ~1,200% |
| LOCK | **67.74%** | ~700% |

Declining across all three since inception. FLUX recorded **−65.84%** during 2025 — a period of net
supply contraction. See `docs/images/yearlySupplyInflation.png`.

### 4.7 Where FLUX supply actually sits

| Allocation | Share |
|---|---:|
| Burned | 47.14% |
| Locked minting ArbiFLUX (L2) | 20.02% |
| Uniswap pool (L1) | 17.08% |
| Unminted | 6.96% |
| Circulating (L1) | 6.52% |
| Circulating (L2) | 2.08% |
| SushiSwap pool (L2) | 0.20% |

**Freely circulating supply is approximately 8.60%.** The remainder is destroyed, committed to
validator positions, or providing liquidity.

Share of each asset committed to validator positions: **DAM 83.53%**, **ArbiFLUX 64.19%**,
**FLUX (L2) 43.61%**. FLUX held on Arbitrum: **48.28%** of total supply.

### 4.8 Participation

| Metric | Value |
|---|---:|
| FLUX active validators | **128** |
| FLUX total validator addresses (incl. dormant) | 591 |
| ArbiFLUX active validators | **88** |
| **Total active validator positions** | **216** |
| LOCK holders | 55 |
| ArbiFLUX holders | 194 |

Of 194 ArbiFLUX holders, 88 run active validator positions — an activation rate of ~45%.

> **On LOCK holder count.** LOCK is designed so the large majority of supply resides in the
> permanent liquidity pool rather than in individual wallets. A low holder count reflects the design
> operating as intended and should not be read as an adoption measure for that token.

### 4.9 Yield

| Metric | FLUX (L1) | ArbiFLUX (L2) | LOCK |
|---|---:|---:|---:|
| Base APY (no burning) | 4.54% | 16.08% | — |
| Break-even (years) | 4.12 | 1.89 | 1.92 |

### 4.10 Production and unminted balances

| Asset | Monthly production | Global unminted |
|---|---:|---:|
| LOCK | $4,270 | $2,416 |
| FLUX | $3,806 | $18,572 |
| ArbiFLUX | $1,269 | $4,130 |
| **Total** | **$9,345** | **$25,118** |

**Production represents approximately 6.8% of total available liquidity per month.** We publish this
ratio deliberately. It is the clearest single measure of the structural pressure the ecosystem
operates under, and it is the reason liquidity depth — not marketing or headcount — is the priority
for deployed capital.

### 4.11 Decentralized Consumer Price Index

| Asset | DCPI |
|---|---:|
| LOCK | 675 |
| FLUX | 52 |
| ArbiFLUX | 11 |

Our internal index of purchasing power per token over time.

---

## 5. On-chain activity

Retrieved from Arbiscan, 26 July 2026.

| Contract | Transfer events |
|---|---:|
| LOCK token | **561,762** |
| ArbiFLUX token | **43,862** |
| **Combined** | **605,624** |

Filtered to the individual game contracts, Arbiscan returns *"More than 100,000 transactions
found"* for each — its display ceiling, so both figures are floors rather than totals:

| Contract | Records | Window covered by last 100k | LOCK held |
|---|---|---|---:|
| HODL Clicker: Rush | >100,000 | 174 days | 1,473.17 |
| Market (Time-in-Market Rewards v2) | >100,000 | 319 days | 28.44 |

The two game contracts together hold **1,501.61 LOCK — 4.79% of supply.**

HODL Clicker has generated comparable volume in roughly half the elapsed time of the Market
contract, consistent with its lower barrier to entry (participation requires no token balance).

**Prior reporting note.** We have previously published a figure of "400,000+ transactions" without
stating its scope or measurement date. The correct current statement is *605,624 combined LOCK and
ArbiFLUX transfer events as at 26 July 2026*. The earlier figure understated activity and was
imprecisely labelled. Future reporting will state asset, network, metric type and date.

---

## 6. Historical record, 2020–2026

Continuous series are published as chart exports in `docs/images/` of the public dashboard
repository, and are extended to the current block by the live dashboard.

| Series | File |
|---|---|
| Market capitalisation, all four tokens | `marketCap.png` |
| Prices | `prices.png` |
| Available liquidity | `availableLiquidity.png` |
| Percentage burned | `percentageBurned.png` |
| Yearly supply inflation | `yearlySupplyInflation.png` |
| Monthly production | `monthlyProduction.png` |
| Global unminted amounts | `globalUnmintedAmount.png` |
| Share powering validators | `percentagePoweringValidators.png` |
| FLUX / DAM supply and validators | `fluxData.png` |
| ETH / LOCK pool | `ethLockPool.png` |
| Active validators | `extra/activeValidators.png` |
| FLUX supply breakdown | `extra/fluxSupplyBreakdown.png` |
| FLUX on L2 | `extra/fluxOnL2.png` |
| Decentralized CPI | `extra/dcpi.png` |

**Coverage runs from July 2020 to the present**, without interruption, across the 2021 expansion,
the 2022–2024 contraction, the Ethereum Merge, and the Arbitrum deployment.

Observations from the record:

- DAM market capitalisation peaked above **$3.5M** in mid-2021 and has ranged between roughly
  **$370,000 and $3.5M** since. It has at no point approached the ~$101,000 figure that appears in
  some third-party analysis, which reflects free-float-only measurement.
- Supply inflation on all three issued tokens shows a monotonic long-run decline from launch highs
  near 1,200%, with intervals of net contraction.
- The LOCK liquidity pool has only ever grown. The vault has no withdrawal path.

---

## 7. Limitations

Stated plainly, because a report of this kind is worth less without them.

**The historical series are chart exports, not raw datasets.** They are visual records rendered from
on-chain data. A machine-readable export is in preparation. Until then, any figure can be
independently reconstructed from the block explorers and pool contracts in Section 2.

**Derived figures depend on our formulas.** Prices, market caps, APY, break-even and DCPI are
computed by the dashboard using the definitions in Section 3. The source is public and auditable;
the inputs are not ours.

**Liquidity figures are point-in-time.** Pool reserves move continuously. Every figure here carries
its retrieval date and will differ if you query later.

**The DCPI is an internal index.** It is our own construction, not an industry standard, and should
be read as such.

**Three contracts are unaudited.** The Market, HODL Clicker and Batch Minter contracts have not been
independently reviewed. They operate as delegated minters and cannot access validator principal, and
current deposits across them total 4.79% of LOCK supply — but the absence of review is a real gap
and we state it here rather than omit it.

---

## 8. Audit and verification status

| Scope | Auditor | Date |
|---|---|---|
| `arbiFlux.sol`, `fluxL2.sol`, `lockquidity.sol` | Hacken | July 2026 |
| DAM and FLUX (Ethereum L1) | SlowMist | October 2020 |
| Market, HODL Clicker, Batch Minter | *not yet reviewed* | — |

The July 2026 audit returned **0 Critical and 0 High-severity findings requiring remediation**. All
19 findings are recorded as *Accepted*, which is the only available status for contracts that are
immutable and have no upgrade path — every deployed contract in this ecosystem has no owner, no
admin key, no pause function and no proxy.

Contract behaviour is therefore permanent. This eliminates the possibility of administrative
interference, and equally eliminates the possibility of correction. Both follow from the same
property, and we regard stating the second as a condition of claiming the first.

---

*Prepared by Datamine Network Inc. All figures retrieved 26 July 2026 from Etherscan, Arbiscan, and
the Datamine real-time dashboard. Every figure is reproducible by any third party without
authentication, credentials, or our cooperation.*

*Questions: dev@datamine.network*
