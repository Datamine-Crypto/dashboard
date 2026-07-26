# Understanding Datamine — A Guide for People Who Think in Interest Rates

If you have ever opened a savings account, bought a bond, or rolled over a GIC, you already
understand most of what happens here. This document explains the Datamine ecosystem using
that vocabulary, and only introduces new terms when there is genuinely no equivalent.

No prior crypto knowledge assumed. Nothing here is investment advice.

---

## The one-paragraph version

You deposit an asset. While it sits on deposit, it pays you a yield — not once a month, but
continuously, every few seconds. You can increase your own rate by voluntarily destroying some
of what you have earned. You can withdraw your deposit in full, at any time, without asking
anyone. There is no bank, no manager and no committee: the rules were written into software
six years ago and cannot be changed by anyone, including the people who wrote them.

That last sentence is the whole proposition. Everything below explains how it works and what
it costs you.

---

## 1. The closest thing you already know

Think of a **term deposit that never actually locks you in**.

| Traditional finance | Datamine |
|---|---|
| You deposit cash with a bank | You deposit tokens with a contract |
| The bank pays interest | The contract pays a second token |
| Interest accrues daily, paid monthly | Yield accrues **every ~12 seconds**, claimed whenever you like |
| Breaking a term deposit costs you a penalty | Withdrawing early costs you your accumulated rate bonus |
| The bank sets the rate; it can change it | The rate formula is fixed and public; nobody can change it |
| Your deposit is on the bank's balance sheet | Your deposit stays in your name, visible to anyone |
| You trust the bank's solvency | There is no institution to be solvent or insolvent |

The important structural difference: **there is no borrower.** A bank pays you interest because
it lends your money to someone else at a higher rate. Datamine pays you because the software is
programmed to create new tokens and hand them to depositors. This is not a hidden detail — it is
the central thing to understand, and Section 5 deals with it directly.

---

## 2. What is actually being deposited

There are four assets. They form a chain, and each one is created by depositing the one before it.

```
  DAM  ──deposit──▶  FLUX  ──deposit──▶  ArbiFLUX  ──deposit──▶  LOCK
 (fixed)              (yield)              (yield)               (final)
```

**DAM** — the foundation. A fixed quantity was created once, in 2020, and no more can ever be
made. Nothing in the system can print additional DAM. Think of it as the gold in the vault: it
does nothing by itself, but it is what everything else is generated from.

**FLUX** — what your deposited DAM pays you. New FLUX is created continuously and paid to
depositors.

**ArbiFLUX** — what your deposited FLUX pays you. Exists for a mundane reason: it lives on a
cheaper network, so claiming your yield costs cents instead of dollars.

**LOCK** — what your deposited ArbiFLUX pays you. This is the end of the chain, and it behaves
differently from the other three in one important way (Section 4).

You do not have to use the whole chain. Most people participate at one level. Depositing FLUX
to earn ArbiFLUX is a complete, self-contained position — you are not obliged to go further.

> **A note on the ladder.** Each rung is a separate decision with its own risk. Going deeper
> means more yield-bearing exposure, not diversification. Four related assets in one ecosystem
> is a concentrated position, not a spread one.

---

## 3. How your rate is set

Two things determine what you earn. Both are public formulas — you can calculate your own rate
before you commit anything.

### The patience bonus — up to 3×

Your rate starts at the base level and climbs steadily the longer your deposit stays in place,
reaching a maximum of three times the base rate after roughly three weeks. Leave the deposit
alone and it reaches the top. Withdraw, and it resets to the beginning.

This is the same logic as a loyalty rate or a stepped-rate GIC: the institution pays more for
money it can count on.

### The contribution bonus — up to 10×

This one has no equivalent in traditional banking, and it is the mechanism most worth
understanding.

You can voluntarily destroy some of the tokens you have earned. Doing so permanently increases
the rate at which your deposit generates new ones. You are trading a quantity of asset today
for a higher rate of production going forward — indefinitely.

The closest traditional analogy is **paying points on a mortgage**: an upfront cost, in
exchange for a permanently better rate over the life of the position. The difference is that
here you are paying with the asset itself, and the improved rate has no expiry date.

Two things to be clear about:

- **It is competitive, not absolute.** Your bonus is calculated by comparing how much you have
  destroyed against the network average. If everyone burns more, the same contribution buys a
  smaller bonus. Your rate can fall because of what other people do, without you doing anything.
- **It is irreversible.** Destroyed tokens are gone. If the asset later appreciates, you do not
  get them back.

### Putting it together

```
  what you earn  =  size of deposit
                    × time elapsed
                    × patience bonus   (1× to 3×)
                    × contribution bonus (up to 10×)
```

A depositor who has done neither earns the base rate. A depositor who has waited and
contributed can earn up to thirty times that. The gap between those two is the entire incentive
design.

---

## 4. Where LOCK is different — and why it exists

At the first three levels, destroying tokens does exactly what it sounds like: they cease to
exist, and the total quantity in circulation falls.

**LOCK does not work this way.** When you destroy LOCK, the tokens are not eliminated. They are
routed to a vault, which:

1. Sells half of them for ETH (the main currency of the network);
2. Pairs both halves and deposits them into the public trading pool;
3. Receives a claim ticket on that deposit — and sends it to an address with no withdrawal
   function.

The result is that the money becomes **permanent trading liquidity**. It sits in the market
where anyone can buy or sell against it, and it can never be removed — not by a founder, not by
a large holder, not by anyone. There is no code path to take it out.

### Why this matters more than it sounds

Liquidity is the boring, unglamorous thing that determines whether you can actually sell. An
asset with no liquidity has a quoted price and no exit — the equivalent of a stock nobody will
make a market in. Most small crypto projects fail here: liquidity is supplied by people who
withdraw it the moment conditions turn, and the exit disappears exactly when it is needed.

The LOCK design attacks this directly. Every person who takes the rate bonus is, as a side
effect, permanently deepening the market for everyone else. It converts an individual selfish
act into a structural public good.

> **The honest framing.** This does not make LOCK safe, and it does not put a floor under the
> price. The pool holds ETH, so the value of that liquidity rises and falls with ETH. What it
> does guarantee is that the *depth* is permanent — the ability to transact does not evaporate.

---

## 5. Where the yield comes from — read this section

Any yield product deserves one question above all others: **who is paying?**

For a savings account, the answer is a borrower paying a higher rate. For a corporate bond, it
is the company's operating profit. For a rental property, it is a tenant.

**Here, the yield is newly created supply.** The tokens paid to depositors did not exist before
and are not transferred from anybody. They are created.

This has a direct and unavoidable consequence: **if you hold the asset and do not participate,
your share of the total shrinks over time.** This is dilution. It is the same mechanism as
monetary inflation, and it works in exactly the same way — the printing benefits those
receiving the new supply at the expense of those merely holding it.

The system's answer to this is threefold, and you should weigh each on its merits:

1. **The rate of new supply falls over time.** New issuance is proportional to what is
   deposited, while the total in circulation keeps growing — so the percentage added each year
   declines structurally. Early years dilute heavily; later years much less. This is arithmetic,
   not a policy promise.

2. **Destruction runs against issuance.** Every rate bonus taken is supply removed (or, for
   LOCK, permanently immobilised in the pool). At the first three levels this genuinely reduces
   the total.

3. **You can be on the receiving side.** Participation is open to anyone, with no minimum, no
   approval and no gatekeeper. Nobody is excluded from the issuance.

**What is not claimed:** that this makes dilution disappear. It does not. If you buy and sit
still, you are on the losing side of the arrangement by design. The system rewards activity, and
it is explicit about that.

---

## 6. What guarantees exist — and what does not

### Genuinely guaranteed

These are properties of the software, verifiable by anyone who wants to check:

- **Your deposit is returnable in full, on demand.** No notice period, no approval, no
  discretion. The withdrawal function cannot be disabled.
- **Nobody can seize, freeze or dilute your holdings by decision.** There is no administrator
  with special powers, because no such role was ever written.
- **The rules cannot change.** No board, no vote, no upgrade. The formulas that were correct in
  2020 are the formulas today and will be the formulas in 2040.
- **Nothing is hidden.** Every deposit, withdrawal, creation and destruction is publicly
  recorded and permanently inspectable.

### Explicitly not guaranteed

- **Price.** There is no peg, no reserve backing and no buyer of last resort. The assets are
  worth what someone will pay.
- **A specific rate of return.** The formula is fixed; your actual outcome depends on your own
  choices and on what everyone else does.
- **Protection of any kind.** There is no deposit insurance, no CDIC or FDIC equivalent, no
  regulator supervising solvency, and no complaints process. If you make a mistake, no one can
  reverse it.
- **That the software is flawless.** It has run without incident since 2020 and has been
  independently audited, but no audit proves the absence of bugs.

### The two-sided nature of permanence

The same immutability that makes the system trustworthy makes it unfixable. A specific,
documented example: the timing constants were written when the underlying network produced a
block every 15 seconds. It now produces one every 12. Every schedule therefore runs about 25%
faster than originally intended — the three-week ramp is closer to 22 days, and the initial
waiting period is closer to 19 hours than 24.

This affects every participant identically and confers no advantage on anyone. But it also
cannot be corrected, ever. **That is the honest cost of "no one can change the rules": it
includes the rules you would want changed.**

---

## 7. Who this suits, and who it does not

**It may suit you if:** you want a yield mechanism whose rules you can read in full and verify
yourself; you are comfortable being an active participant rather than a passive holder; you
value the absence of a counterparty more than the presence of a guarantee; and you can lose the
capital without it mattering to your life.

**It will not suit you if:** you want capital preservation, a predictable return, insured
deposits, or somebody to call. Nothing in this system is designed to protect the value of what
you put in. It is designed to distribute new supply to the people who participate, and to build
market depth that cannot be withdrawn.

If you are weighing this against a savings account, they are not comparable products. A savings
account is a claim on an institution. This is a position in a self-executing programme. The
first can fail because an institution fails; the second can fail because the market decides the
asset is worth less.

---

## 8. Glossary

| Term used here | What it means | Nearest familiar idea |
|---|---|---|
| **Token** | A unit of a digital asset, held in your own wallet | A share or a unit of currency |
| **Wallet** | Software holding your assets and authorising actions | An account you alone control, with no branch |
| **Lock / deposit** | Committing an asset so it generates yield | Opening a term deposit |
| **Mint / claim** | Collecting the yield you have accrued | Drawing accrued interest |
| **Burn** | Permanently destroying tokens to raise your rate | Paying points to lower a mortgage rate |
| **Validator** | Anyone with an active deposit | An account holder |
| **Liquidity pool** | Shared reserve enabling buying and selling | A market maker's inventory |
| **Multiplier** | The factor applied to your base rate | A bonus or promotional rate |
| **Gas fee** | Network charge for each transaction | A wire transfer fee |
| **L1 / L2** | Main network / cheaper connected network | Wire transfer vs. e-transfer — same money, different cost |
| **Immutable** | Cannot be altered by anyone, ever | A contract with no amendment clause |
| **On-chain** | Publicly recorded and permanently verifiable | A public register, but for every transaction |

---

## Where to look next

- **The live dashboard** — every figure quoted anywhere is readable there in real time.
- **The technical whitepaper** — the full mechanism, line by line.
- **The security audits** — independent reviews of the contract code.
- **The block explorer** — the raw record. Nothing here requires you to take anyone's word.

The last point deserves emphasis, because it is the genuine difference. A bank statement is a
claim about what a bank says it holds. Every number in this system is a fact you can verify
yourself, from a source nobody controls. That does not make the assets safe. It does mean that
if you choose to take the risk, you can do it with your eyes open.
