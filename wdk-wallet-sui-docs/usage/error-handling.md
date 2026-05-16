# Error Handling

This guide covers best practices for handling transaction errors, managing fee limits, and cleaning up sensitive data from memory.

## Handle Transaction Errors

Wrap transactions in `try/catch` blocks to handle common failure scenarios such as insufficient balance, invalid addresses, or exceeded fee limits.

{% code title="Transaction Error Handling" lineNumbers="true" %}

```javascript
try {
  const result = await account.transfer({
    token: '0x123...', // Token contract address
    recipient: '0xabc...',
    amount: 1000000n
  })
  console.log('Transfer submitted:', result.hash)
} catch (error) {
  console.error('Transfer failed:', error.message)
  if (error.message.toLowerCase().includes('insufficient')) {
    console.log('Please add more tokens to your wallet')
  } else if (error.message.toLowerCase().includes('fee')) {
    console.log('The transfer fee exceeds your configured maximum')
  }
}
```

{% endcode %}

## Handle Token Transfer Errors

Sui token transfers can fail for reasons including insufficient balance or invalid recipient addresses.

{% code title="Token Transfer Error Handling" lineNumbers="true" %}

```javascript
async function safeTransfer(account, wallet) {
  try {
    const balance = await account.getBalance('0x123...') // Token type
    const transferAmount = 1000000000n // 1 SUI

    if (balance < transferAmount) {
      throw new Error('Insufficient balance')
    }

    const result = await account.transfer({
      recipient: '0xabc...',
      amount: transferAmount
    })
    console.log('Transaction successful:', result.hash)

    return result
  } catch (error) {
    if (error.message.includes('Insufficient')) {
      console.error('Please add more SUI to your wallet')
    } else if (error.message.includes('invalid address')) {
      console.error('The recipient address is invalid')
    } else if (error.message.includes('max fee')) {
      console.error('The transfer fee exceeds your configured maximum')
    } else {
      console.error('Transaction failed:', error.message)
    }
    throw error
  } finally {
    account.dispose()
    wallet.dispose()
  }
}
```

{% endcode %}

## Manage Fee Limits

Set `transferMaxFee` when creating the wallet to prevent transactions from exceeding a maximum cost.

{% code title="Fee Management" lineNumbers="true" %}

```javascript
const config = {
  transferMaxFee: 10000000 // MIST
}
```

{% endcode %}

## Dispose of Sensitive Data

Call `dispose()` on accounts and wallet managers to clear private keys and sensitive data from memory when they are no longer needed.

{% code title="Memory Cleanup" lineNumbers="true" %}

```javascript
account.dispose()
wallet.dispose()
```

{% endcode %}

{% hint style="warning" %}
Always call `dispose()` in a `finally` block or cleanup handler to ensure sensitive data is cleared even if an error occurs.
{% endhint %}
