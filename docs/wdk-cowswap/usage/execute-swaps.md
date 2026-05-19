# Execute Swaps

This guide explains how to run a [basic exact-input swap](#basic-exact-input-swap), an [exact-output swap](#exact-output-swap), and a [swap from an ERC-4337 smart account](#swap-with-erc-4337). You should already have a [`CowswapProtocolEvm`](/sdk/swap-modules/swap-cowswap-evm/api-reference.md#class-cowswapprotocolevm) instance.

{% hint style="warning" %}
Swaps involve signing intents that authorize movement of tokens. Ensure you have approved the Cowswap Vault Relayer first.
{% endhint %}

## Basic exact-input swap

You can sell an exact amount of the input token using [`swap()`](/sdk/swap-modules/swap-cowswap-evm/api-reference.md#swap-options-config):

{% code title="Exact input: USDT to WETH" lineNumbers="true" %}

```javascript
const result = await swapProtocol.swap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenInAmount: 1000000n
})

console.log('Order UID:', result.hash)
console.log('Protocol fee (sell token units):', result.fee)
console.log('Tokens sold (base units):', result.tokenInAmount)
console.log('Tokens bought (base units):', result.tokenOutAmount)
```

{% endcode %}

## Exact output swap

You can receive an exact amount of the output token by passing `tokenOutAmount` to [`swap()`](/sdk/swap-modules/swap-cowswap-evm/api-reference.md#swap-options-config):

{% code title="Exact output amount" lineNumbers="true" %}

```javascript
const result = await swapProtocol.swap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenOutAmount: 500000000000000000n
})

console.log('Order UID:', result.hash)
console.log('Tokens sold (base units):', result.tokenInAmount)
console.log('Tokens bought (base units):', result.tokenOutAmount)
```

{% endcode %}

## Swap with ERC-4337

Cowswap supports ERC-4337 smart accounts using EIP-1271 signatures.

{% code title="Swap with smart account" lineNumbers="true" %}

```javascript
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'
import CowswapProtocolEvm from '@tetherto/wdk-protocol-swap-cowswap-evm'

const aa = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
  chainId: 1,
  provider: 'https://mainnet.infura.io/v3/YOUR_ID',
  bundlerUrl: process.env.BUNDLER_URL,
  paymasterUrl: process.env.PAYMASTER_URL
})

const swapAA = new CowswapProtocolEvm(aa)

const result = await swapAA.swap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenInAmount: 1000000n
})

console.log('Order UID:', result.hash)
```

{% endcode %}
