# swap-cowswap-evm

A lightweight package that lets EVM wallet accounts swap tokens using the Cowswap protocol. It provides a clean SDK for token swaps on EVM chains and works with both standard wallets and ERC-4337 smart accounts.

## Features

* **Token Swapping**: Execute token swaps through Cowswap on supported EVM networks
* **Account Abstraction**: Compatible with standard EVM accounts and ERC-4337 smart accounts
* **Gasless Trades**: Users pay settlement fees in their sell token; no gas fees for failed or cancelled orders
* **MEV Protection**: Comprehensive MEV protection for every order
* **TypeScript Support**: Full TypeScript definitions included

## Supported Networks

Works with EVM networks supported by Cowswap:
* Ethereum Mainnet
* Gnosis Chain
* Arbitrum One
* Base

## Wallet Compatibility

The swap service supports multiple EVM wallet types:

* **Standard EVM Wallets**: `@tetherto/wdk-wallet-evm` accounts
* **ERC-4337 Smart Accounts**: `@tetherto/wdk-wallet-evm-erc-4337` accounts
* **Read-Only Accounts**: For quoting swaps without signing orders

## Key Components

* **Cowswap Integration**: Uses Cowswap Order Book API for routing and quotes
* **Intent-based Trading**: Orders are submitted as signed messages (intents)
* **Quote System**: Pre-transaction fee and amount estimation via `quoteSwap`

## Installation

```bash
npm install @tetherto/wdk-protocol-swap-cowswap-evm
```

## Testing

You can run the unit tests and check coverage with the following commands:

```bash
# Run all unit tests
npm run test:unit

# Run tests with coverage report
npm run test:coverage

# Run integration tests (requires internet access)
npm run test:integration
```

## Quick Start

```javascript
import CowswapProtocolEvm from '@tetherto/wdk-protocol-swap-cowswap-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

const swapProtocol = new CowswapProtocolEvm(account)

const result = await swapProtocol.swap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  tokenInAmount: 1000000n // 1 USDT
})

console.log('Order UID:', result.hash)
```

## License

Apache-2.0