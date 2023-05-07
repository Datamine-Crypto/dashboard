With every single block, you generate **0.00000001 FLUX per 1 DAM int mint**. This is your constant minting rate, and will show up as the real-time FLUX balance in your dashboard. As you would have read in the Minting Guide, you do not actually own the FLUX tokens until you press Mint FLUX. 

In your dashboard, you will see the number of blocks you can mint called "unminted blocks." In this example below, there are 150 unminted blocks. This number, along with the bonuses, will be used to calculate the total amount of FLUX you can mint in the example at the bottom. 

**Minting bonuses are applied to the total amount of unminted blocks at the time of MINTING your FLUX tokens. Bonuses do not affect your constant rate of generating:**

0.00000001 FLUX / DAM. In other words, bonuses will affect your final FLUX token mintable sum at the time of pressing MINT. 

**Now let's learn about specific FLUX minting rate bonuses**

_Mint Time Bonus:_

The maximum Mint bonus you can achieve for starting a validator is 3x.  Once you have reached 3x Time Bonus, every time you Mint FLUX, you generate 3x the amount.

**3x Time Bonus**: After you leave a validator started for at least 24 hours, you will start receiving a small mint multiplier every 15 seconds. This lasts for 28 days after which you gain a **permanent** (until you stop your validator) 3x bonus to your FLUX validator.

_FLUX Burn Multiplier:_

The value of FLUX originates from borrowing a portion of the worldwide FLUX mint rate when burning FLUX.

**10x Burn Bonus**: If you burn 9x the global average of burned FLUX,  you will get 10x the mint rate. This is a global number that is based on how much DAM is currently powring mints and how much FLUX these addresses have burned. **In other words: (All the FLUX I've ever burned / my DAM validator size) must be 9 times greater than (global burned FLUX of active mints / DAM powering active mints).**

FLUX burned to an address is permanent for that address. 

As more people burn FLUX, the amount of FLUX tokens you need to burn increases, and as mints stop the amount of FLUX you need to burn decreases (keep in mind the formula is based on ratios, so by starting a validator with 10 DAM you would need 10x the burn amount compared to someone doing the same with only 1 DAM).

After you BURN some FLUX, you will see an updated BURN bonus in your dashboard.

The two bonuses (Started Mint Time Bonus and FLUX Burn Multiplier) are multiplicative. So you can get up to **30x FLUX minting rate at the time of pressing MINT**. It is suggested to get max 30x mint rate at time of minting FLUX, so this means you will most likely buy some FLUX first and burn it to your address if you are not at max multiplier yet before minting your FLUX. 

**The most efficient way to mint FLUX at any time is:**

1. Get to 3x time bonus (28 days after starting a validator). 
2. Before pressing mint, make sure you have 10x burn bonus, if not buy some FLUX and burn to get to 10x.

**Remember, your dashboard bonuses are applied at the time of minting FLUX tokens. You will see an estimate of how much your FLUX (with applied bonuses) is worth based on real, on-chain USD multi-route Uniswap data.**

See an example calculation below:

- Mint started with 30.0 DAM
- For 150 blocks
- 2.5000x time bonus multiplier
- 6.3400x FLUX burn multiplier

```
((30 * 10^18) * 150)      // amount.mul(blocksMinted) = blocksMintedByAmount
.mul(63400)               // .mul(burnMultiplier)
.div(10000)               // .div(_percentMultiplier)
.mul(25000)               // .mul(timeMultipler)
.div(10000)               // .div(_percentMultiplier)
.div(10^8)                // .div(_mintPerBlockDivisor)

= 713250000000000         //(0.00071325 FLUX as 1 FLUX = 10^18)
```