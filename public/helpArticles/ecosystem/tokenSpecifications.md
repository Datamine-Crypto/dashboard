# Datamine Network Token Specifications

This article provides a detailed overview of the Datamine Network's core tokens, DAM and FLUX, and explains key concepts related to their functionality and interaction within the ecosystem.

Here are the key concepts and token specifications:

## Datamine (DAM)

A standard ERC-777 smart contract token deployed on Ethereum with a **FIXED** supply of 16,876,778 tokens. DAM tokens are primarily used for staking to power validators.

## FLUX

A **NON-FIXED** supply token that serves as the base currency of the Datamine DeFi ecosystem. FLUX features linear and predictable deflation through a burning mechanism.

## ArbiFLUX

Operating on Arbitrum (Layer 2), ArbiFLUX is created by locking FLUX. It offers lower transaction costs and faster processing, and can be burned to boost minting rewards on Layer 2, or locked to create LOCK.

## LOCK

Our newest token, LOCK enhances stability by contributing to a permanent liquidity pool. It is minted by locking ArbiFLUX. Burning LOCK redirects value to the liquidity pool, ensuring long-term stability.

## Validator (Mint Start/Stop)

To generate FLUX tokens, you must start a validator by locking your Datamine (DAM) tokens. A validator generates approximately 0.00000001 FLUX per 1 DAM per Ethereum block (roughly every 13 seconds).

## Delegated Minting

This feature allows you to designate another Ethereum address to mint FLUX tokens on behalf of your validator. This enhances security by enabling you to keep your DAM tokens in cold storage while minting with a separate, web-based wallet.

## Remote Minting

This feature enables you to Mint FLUX from your phone to any Ethereum address, even though the DAM may stored on your hardware wallet (e.g. Ledger)

## Remote Burning

You can Burn your FLUX to any other address that has an active Mint

## Partial Minting

You can specify a percentage of Minting (0-100%). This allows you to Mint smaller amounts of FLUX, including partial Minting to other addresses

## Mint Age Multiplier

Once your validator is active for at least 24 hours, this multiplier will begin to increase every 12 seconds for 28 days, after which you receive a permanent 3x multiplier. You will lose this Multiplier each time you stop your validator

## Burn Multiplier

This is a variable multiplier, capped at 10x. If you burn 9x the global average of burned FLUX, you receive the maximal 10x multiplier. The ratio is described as follows

- `(My Burned FLUX divided by DAM powering Validator)` must be 9 times greater than `(Total Burned FLUX of active Mints divided total DAM powering Validator)`

- **The most efficient way to Mint at any time is**: Get the 3x Mint Age Multiplier (28 days after starting your validator). Before Minting, make sure you Burned FLUX to get the max 10x Burn Multiplier

- DAM smart contract: [https://etherscan.io/token/0xF80D589b3Dbe130c270a69F1a69D050f268786Df](https://etherscan.io/token/0xF80D589b3Dbe130c270a69F1a69D050f268786Df)

- FLUX smart contract: [https://etherscan.io/address/0x469eda64aed3a3ad6f868c44564291aa415cb1d9](https://etherscan.io/address/0x469eda64aed3a3ad6f868c44564291aa415cb1d9)
