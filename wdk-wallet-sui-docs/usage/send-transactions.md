# Send Transactions

Send native SUI and estimate transaction fees on SUI blockchain.

{% hint style="warning" %}
**BigInt Usage:** Always use `BigInt` (the `n` suffix) for monetary values (MIST) to avoid precision loss with large numbers.
{% endhint %}

## Send SUI

Use `account.sendTransaction()` to send a simple SUI transfer. WDK handles the transaction construction, gas estimation, and broadcasting.

```javascript
const result = await account.sendTransaction({
  to: '0x30f50d81e31f3b36ea3d449bd689552d1e2fe11b7919dfba780fb5a63c7f19d8',
  value: 1000000000n // 1 SUI in MIST
})
console.log('Transaction digest:', result.hash)
console.log('Transaction fee:', result.fee, 'MIST')
```

## Sign Without Broadcasting

Use `account.signTransaction()` when you need a signed raw transaction but want to submit it through a separate relay, service, or review flow.

```javascript
const signedTransaction = await account.signTransaction({
  to: '0x30f50d81e31f3b36ea3d449bd689552d1e2fe11b7919dfba780fb5a63c7f19d8',
  value: 1000000000n
})

console.log('Signed transaction signature:', signedTransaction)
```

{% hint style="info" %}
`signTransaction()` returns a serialized signature for the transaction block and does not broadcast it. Use `sendTransaction()` when WDK should sign, broadcast, and return the transaction digest.
{% endhint %}

## Estimate Transaction Fees

Use `account.quoteSendTransaction()` to get a fee estimate before sending.

```javascript
const quote = await account.quoteSendTransaction({
  to: '0x30f50d81e31f3b36ea3d449bd689552d1e2fe11b7919dfba780fb5a63c7f19d8',
  value: 1000000000n
})
console.log('Estimated fee:', quote.fee, 'MIST')
```

## Use Dynamic Fee Rates

Retrieve current reference gas price using `wallet.getFeeRates()` to understand the network's current congestion level.

```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate (Reference Price):', feeRates.normal, 'MIST')
console.log('Fast fee rate (Reference Price + 20%):', feeRates.fast, 'MIST')
```
