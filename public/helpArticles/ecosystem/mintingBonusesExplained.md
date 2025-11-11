# Understanding Yield Generation Bonuses

This article explains the various bonuses that affect your FLUX token yield generation rate. While your base yield rate is constant, these bonuses are applied to the total amount of ungenerated yield at the time of collecting your FLUX tokens.

In your dashboard, you will see the amount of yield you can collect called "uncollected yield." In this example below, there is yield from 150 blocks. This number, along with the bonuses, will be used to calculate the total amount of FLUX you can collect in the example at the bottom.

**Yield bonuses are applied to the total amount of uncollected yield at the time of COLLECTING your FLUX tokens. Bonuses do not affect your constant rate of generating:**

0.00000001 FLUX / DAM. In other words, bonuses will affect your final FLUX token collectible sum at the time of pressing COLLECT.

**Now let's learn about specific FLUX yield rate bonuses**

## Yield Time Bonus

The maximum Yield bonus you can achieve for starting a validator is 3x. Once you have reached 3x Time Bonus, every time you Collect FLUX, you generate 3x the amount.

**3x Time Bonus**: After you leave a validator started for at least 24 hours, you will start receiving a small yield multiplier every 12 seconds. This lasts for 28 days after which you gain a **permanent** (until you stop your validator) 3x bonus to your FLUX validator.

## Yield Multiplier from Destroyed Tokens

The value of FLUX originates from participating in the market for yield. By destroying FLUX, you are acquiring a larger share of the total yield generation.

**10x Yield Bonus**: If you destroy 9x the global average of destroyed FLUX, you will get 10x the yield rate. This is a global number that is based on how much DAM is currently powering validators and how much FLUX these addresses have destroyed. **In other words: (All the FLUX I've ever destroyed / my DAM validator size) must be 9 times greater than (global destroyed FLUX of active validators / DAM powering active validators).**

FLUX destroyed for an address is permanent for that address.

As more people destroy FLUX to gain yield, the amount of FLUX tokens you need to destroy increases, and as validators stop, the amount of FLUX you need to destroy decreases (keep in mind the formula is based on ratios, so by starting a validator with 10 DAM you would need 10x the amount to destroy compared to someone doing the same with only 1 DAM).

After you DESTROY some FLUX, you will see an updated YIELD bonus in your dashboard.

The two bonuses (Yield Time Bonus and Yield Multiplier from Destroyed Tokens) are multiplicative. So you can get up to **30x FLUX yield rate at the time of pressing COLLECT**. It is suggested to get max 30x yield rate at time of collecting FLUX, so this means you will most likely buy some FLUX first and destroy it for your address if you are not at max multiplier yet before collecting your FLUX.

**The most efficient way to generate FLUX yield at any time is:**

1. Get to 3x time bonus (28 days after starting a validator).
2. Before pressing collect, make sure you have 10x yield bonus, if not buy some FLUX and destroy it to get to 10x.

**Remember, your dashboard bonuses are applied at the time of collecting FLUX tokens. You will see an estimate of how much your FLUX (with applied bonuses) is worth based on real, on-chain USD multi-route Uniswap data.**

See an example calculation below:

- Validator started with 30.0 DAM
- For 150 blocks
- 2.5000x time bonus multiplier
- 6.3400x FLUX yield multiplier

```
((30 * 10^18) * 150)      // amount.mul(blocksCollected) = blocksCollectedByAmount
.mul(63400)               // .mul(yieldMultiplier)
.div(10000)               // .div(_percentMultiplier)
.mul(25000)               // .mul(timeMultipler)
.div(10000)               // .div(_percentMultiplier)
.div(10^8)                // .div(_yieldPerBlockDivisor)

= 713250000000000         //(0.00071325 FLUX as 1 FLUX = 10^18)
```
