# Get Swap Quotes

This guide shows how to [quote before swapping](#quote-before-swapping) and use quotes for [fee estimation](#fee-estimation). Quotes use [`quoteSwap()`](/sdk/swap-modules/swap-cowswap-evm/api-reference.md#quoteswap-options-config).

## Quote before swapping

You can preview fee and token amounts for the same parameters you would pass to [`swap()`](/sdk/swap-modules/swap-cowswap-evm/api-reference.md#swap-options-config) using [`quoteSwap()`](/sdk/swap-modules/swap-cowswap-evm/api-reference.md#quoteswap-options-config):

{% code title="Quote exact input swap" lineNumbers="true" %}

```javascript
const quote = await swapProtocol.quoteSwap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenInAmount: 1000000n
})

console.log('Estimated protocol fee (sell token units):', quote.fee)
console.log('Tokens in (base units):', quote.tokenInAmount)
console.log('Tokens out (base units):', quote.tokenOutAmount)
```

{% endcode %}

You can quote an exact-output style trade the same way by passing `tokenOutAmount` instead of `tokenInAmount` to [`quoteSwap()`](/sdk/swap-modules/swap-cowswap-evm/api-reference.md#quoteswap-options-config):

{% code title="Quote exact output swap" lineNumbers="true" %}

```javascript
const quote = await swapProtocol.quoteSwap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenOutAmount: 500000000000000000n
})

console.log('Estimated protocol fee (sell token units):', quote.fee)
console.log('Required token in (base units):', quote.tokenInAmount)
```

{% endcode %}

## Fee estimation

Cowswap fees are denominated in the sell token. `quote.fee` represents the estimated network cost that will be deducted from your sell amount (for sell orders) or added to it (for buy orders).

{% hint style="info" %}
On-chain conditions and solver competition can change between quote and execution. The executed order may still differ slightly from the quote.
{% endhint %}
