# Cowswap Swap Protocol API

## Class: CowswapProtocolEvm

Main class for Cowswap token swaps on EVM.

### Constructor

```javascript
new CowswapProtocolEvm(account, config?)
```

Parameters:

* `account`: `WalletAccountEvm | WalletAccountReadOnlyEvm | WalletAccountEvmErc4337 | WalletAccountReadOnlyEvmErc4337`
* `config` (optional):
  * `swapMaxFee` (`number | bigint`): maximum total gas fee allowed (wei). Note: Cowswap trades are gasless, but this option is kept for interface compatibility.

Example:

```javascript
const swap = new CowswapProtocolEvm(account)
```

### Methods

| Method                        | Description                   | Returns                                                                                                                                  |
| ----------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `swap(options, config?)`      | Perform a token swap          | `Promise<{hash: string, fee: bigint, tokenInAmount: bigint, tokenOutAmount: bigint}>` |
| `quoteSwap(options, config?)` | Get estimated fee and amounts | `Promise<{fee: bigint, tokenInAmount: bigint, tokenOutAmount: bigint}>`                                                                  |
| `createLimitOrder(options)`   | Create a limit order          | `Promise<{hash: string, fee: bigint, tokenInAmount: bigint, tokenOutAmount: bigint}>` |

***

### `swap(options, config?)`

Execute a swap via Cowswap.

Options:

* `tokenIn` (`string`): Address of the ERC-20 token to sell
* `tokenOut` (`string`): Address of the ERC-20 token to buy
* `tokenInAmount` (`number | bigint`, optional): Exact input amount (base units)
* `tokenOutAmount` (`number | bigint`, optional): Exact output amount (base units)
* `to` (`string`, optional): Recipient address (defaults to account address)
* `validTo` (`number`, optional): Expiration timestamp
* `hooks` (`object`, optional): Pre and post hooks
  * `pre` (`array`): `{ target, callData }`
  * `post` (`array`): `{ target, callData }`

Config (ERC-4337 only):

* `paymasterToken` (`string`, optional): Token symbol/address for fee sponsorship

Returns:

* `{ hash, fee, tokenInAmount, tokenOutAmount }`
* `hash` is the Cowswap order UID.
* `fee` is the Cowswap protocol fee in `tokenIn` units.

Notes:

* Users must first approve the Cowswap Vault Relayer (`0xC92E8bdf79f0507f65a392b0ab4667716BFE0110`) to spend the `tokenIn`.
* Requires a provider; requires a non read-only account to sign orders.

Example:

```javascript
const tx = await swap.swap({
  tokenIn: '0xdAC17F...ec7',      // USDT
  tokenOut: '0xC02a...6Cc2',      // WETH
  tokenInAmount: 1000000n
})
```

***

### `quoteSwap(options, config?)`

Get estimated fee and token in/out amounts.

Options are the same as `swap`.

Returns: `{ fee, tokenInAmount, tokenOutAmount }`

Works with read-only accounts.

Example:

```javascript
const quote = await swap.quoteSwap({
  tokenIn: '0xdAC17F...ec7',      // USDT
  tokenOut: '0xC02a...6Cc2',      // WETH
  tokenOutAmount: 500000000000000000n // 0.5 WETH
})
```

***

### `createLimitOrder(options)`

Create a limit order with fixed sell and buy amounts.

Options:

* `tokenIn` (`string`): Address of the ERC-20 token to sell
* `tokenOut` (`string`): Address of the ERC-20 token to buy
* `sellAmount` (`number | bigint`): Exact amount to sell
* `buyAmount` (`number | bigint`): Minimum amount to buy
* `to` (`string`, optional): Recipient address
* `validTo` (`number`, optional): Expiration timestamp
* `hooks` (`object`, optional): Pre and post hooks

Returns: `{ hash, fee, tokenInAmount, tokenOutAmount }`

Example:

```javascript
const order = await swap.createLimitOrder({
  tokenIn: '0xdAC17F...ec7',
  tokenOut: '0xC02a...6Cc2',
  sellAmount: 1000000n,
  buyAmount: 500000000000000000n
})
```