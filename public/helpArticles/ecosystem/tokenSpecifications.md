- Datamine (DAM) is a standard ERC-777 smart contract deployed on Ethereum with a **FIXED** supply of 16,876,778 tokens

- FLUX is a **NON-FIXED** supply token which forms the base currency of DeFi. FLUX has linear and predictable deflation through Burning

- **Mint Start/Stop**: To generate FLUX tokens you need to start a validator. Mints are powered by Datamine (DAM) tokens. A validator generates 0.00000001 FLUX per 1 DAM each ETH block (every ~13 sec)

- **Delegated Minting**: When you start your validator you can specify ANOTHER Ethereum address to mint on behalf of your address. This is a core security feature of Datamine Ecosystem

- **Remote Minting**: This feature enables you to Mint FLUX from your phone to any Ethereum address, even though the DAM may stored on your hardware wallet (e.g. Ledger)

- **Remote Burning**: You can Burn your FLUX to any other address that has an active Mint

- **Partial Minting**: You can specify a percentage of Minting (0-100%). This allows you to Mint smaller amounts of FLUX, including partial Minting to other addresses

- **Mint Age Multiplier**: Once your validator is active for at least 24 hours, this multiplier will begin to increase every 15 seconds for 28 days, after which you receive a permanent 3x multiplier. You will lose this Multiplier each time you stop your validator 

- **Burn Multiplier**: This is a variable multiplier, capped at 10x. If you burn 9x the global average of burned FLUX, you receive the maximal 10x multiplier. The ratio is described as follows 

- `(My Burned FLUX divided by DAM powering Validator)` must be 9 times greater than `(Total Burned FLUX of active Mints divided total DAM powering Validator)`

- **The most efficient way to Mint at any time is**: Get the 3x Mint Age Multiplier (28 days after starting your validator). Before Minting, make sure you Burned FLUX to get the max 10x Burn Multiplier


- DAM smart contract: [https://etherscan.io/token/0xF80D589b3Dbe130c270a69F1a69D050f268786Df](https://etherscan.io/token/0xF80D589b3Dbe130c270a69F1a69D050f268786Df)

- FLUX smart contract: [https://etherscan.io/address/0x469eda64aed3a3ad6f868c44564291aa415cb1d9](https://etherscan.io/address/0x469eda64aed3a3ad6f868c44564291aa415cb1d9)