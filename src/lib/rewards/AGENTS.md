# Rewards

A shopper's standing in the loyalty program: what they earned and can spend,
their offers, and their referral link. Client-safe: `ledger.ts`, `offers.ts`,
and `referral.ts`.

- **The policy is not here.** `commerce/programs/rewards.ts` owns the rates, what
  a point is worth, and what a review pays, because the cart and the order
  confirmation quote them too. Never restate a rate here.
- **Not on the commerce adapter**, but the reads take a `demo`, because the
  orders a balance comes from are a storefront's.
- **Everything an order can answer is derived from orders**, through
  `listAccountOrders`, and review points come from `lib/reviews`, so each figure
  is counted once. Referrals and birthdays come from `demo-ledger.ts`.
- **Points from an order activate on delivery**, since an order still in a van
  can come back. That is why `RewardsBalance` reports `pending` apart from
  `available`, and only `available` reaches the cart.
- **An offer's status is derived** by `offerStatus`, from its `usedAt` and
  `expiresAt`. Only `offers.ts` knows what `?offers=` means.
- **An offer's code has to exist in the cart.** The live codes in
  `demo-offers.ts` are also in `DISCOUNT_CODES` in
  `commerce/adapters/demo/cart.ts`, and both files say so.
- **Each storefront draws rewards its own way, over shared behavior.**
  `balanceFacts` in `ledger.ts` words a balance, and `usePointsRedemption`,
  `RewardsPitch`, and `useOfferCode` in `components/rewards/` do the rest.
- **Points are spent at the checkout**, through a switch on the cart summary. The
  stake goes through `updateCartAction`, and `lib/cart` clamps it against
  `getRewardsBalance` before the adapter sees it. The adapter caps it at what the
  order can absorb, goods but not carriage, and `lib/cart` puts the balance back
  as `Cart.rewardsBalance`.
- **Staking points does not spend them.** The ledger moves when an order is
  placed, through `Order.rewards`. A backend that reserves points against a live
  cart returns a balance net of the stake, and `withRewardsBalance` has to add
  them back.
- **The referral code is derived** by `referralCode`, the 1 function a real
  backend replaces with a code it can revoke.

Demo stand-ins: `demo-ledger.ts` and `demo-offers.ts`.
