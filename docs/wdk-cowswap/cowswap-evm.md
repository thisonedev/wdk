# swap-cowswap-evm

A lightweight package that lets EVM wallet accounts swap tokens using the Cowswap protocol. It provides a clean SDK for token swaps on EVM chains and works with both standard wallets and ERC-4337 smart accounts.

## Features

* **Token Swapping**: Execute token swaps through Cowswap on supported EVM networks
* **Account Abstraction**: Compatible with standard EVM accounts and ERC-4337 smart accounts
* **Gasless Trades**: Users pay settlement fees in their sell token; no gas fees for failed or cancelled orders
* **MEV Protection**: Comprehensive MEV protection for every order
* **Provider Flexibility**: Works with JSON-RPC URLs and EIP-1193 providers
* **TypeScript Support**: Full TypeScript definitions included

## Supported Networks

Works with EVM networks supported by Cowswap (Ethereum, Gnosis, Arbitrum, Base). A working RPC provider is required.

## Wallet Compatibility

The swap service supports multiple EVM wallet types:

* **Standard EVM Wallets**: `@tetherto/wdk-wallet-evm` accounts
* **ERC-4337 Smart Accounts**: `@tetherto/wdk-wallet-evm-erc-4337` accounts
* **Read-Only Accounts**: For quoting swaps without signing orders

## Key Components

* **Cowswap Integration**: Uses Cowswap intent-based trading model
* **Quote System**: Pre-transaction fee and amount estimation via `quoteSwap`
* **AA Integration**: Support for smart accounts via EIP-1271 signatures
