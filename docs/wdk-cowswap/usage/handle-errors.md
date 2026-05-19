# Handle Errors

This guide covers [swap errors](#swap-errors), [quote errors](#quote-errors), and [best practices](#best-practices).

## Swap errors

You can detect failed swaps by wrapping [`swap()`](/sdk/swap-modules/swap-cowswap-evm/api-reference.md#swap-options-config) in `try/catch` and inspecting `error.message`:

{% code title="Handle swap failures" lineNumbers="true" %}

```javascript
try {
  const result = await swapProtocol.swap({
    tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenInAmount: 1000000n
  })
  console.log('Order submitted successfully:', result.hash)
} catch (error) {
  console.error('Swap failed:', error.message)

  if (error.message.includes('liquidity')) {
    console.log('No route or insufficient liquidity for this pair')
  }
  if (error.message.includes('read-only')) {
    console.log('Read-only account cannot sign orders')
  }
}
```

{% endcode %}

## Quote errors

You can handle failures from [`quoteSwap()`](/sdk/swap-modules/swap-cowswap-evm/api-reference.md#quoteswap-options-config) the same way:

{% code title="Handle quote failures" lineNumbers="true" %}

```javascript
try {
  const quote = await swapProtocol.quoteSwap({
    tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenInAmount: 1000000n
  })
  console.log('Quoted fee:', quote.fee)
} catch (error) {
  console.error('Quote failed:', error.message)
}
```

{% endcode %}

## Best Practices

* **Allowance**: Always ensure you have approved the Cowswap Vault Relayer contract before attempting a swap.
* **Network**: Verify that your wallet account is connected to a network supported by Cowswap.
* **Order Status**: Cowswap orders are off-chain. After submission, you can monitor the status of the order UID using Cowswap's API or Explorer.
