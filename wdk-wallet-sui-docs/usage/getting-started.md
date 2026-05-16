# Getting Started

Install and create your first Sui wallet.

This guide explains how to install the [`@tetherto/wdk-wallet-sui`](https://www.npmjs.com/package/@tetherto/wdk-wallet-sui) package and create a new wallet instance.

## 1. Installation

### Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/): version 18 or higher.
* [npm](https://www.npmjs.com/): usually comes with Node.js.

### Install Package

```bash
npm install @tetherto/wdk-wallet-sui
```

## 2. Create a Wallet

Import the module and create a `WalletManagerSui` instance with a BIP-39 seed phrase and an RPC provider.

```javascript
import WalletManagerSui from '@tetherto/wdk-wallet-sui'

const seedPhrase = 'your twelve word seed phrase here'

const wallet = new WalletManagerSui(seedPhrase, {
  rpcUrl: 'https://fullnode.mainnet.sui.io:443',
  transferMaxFee: 50000000n // Optional: maximum fee in MIST (0.05 SUI)
})
```

{% hint style="danger" %}
**Secure the Seed Phrase:** Securely store this seed phrase to avoid a permanent loss of access to your funds.
{% endhint %}

Alternatively, pass an array of RPC URLs for automatic failover:

```javascript
const wallet = new WalletManagerSui(seedPhrase, {
  rpcUrl: [
    'https://fullnode.mainnet.sui.io:443',
    'https://sui-mainnet-endpoint-2.com'
  ]
})
```

## 3. Get Your First Account

Retrieve an account from the wallet and inspect its address.

```javascript
// Get the default account (index 0)
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Wallet address:', address)

// Create a read-only version of the account
const readOnlyAccount = await account.toReadOnlyAccount()
```

{% hint style="info" %}
**RPC Providers:** The examples use standard Sui fullnode URLs. For production environments, it's recommended to use reliable, paid RPC providers or your own nodes to ensure stability and rate-limit compliance.
{% endhint %}
