# Get Started

This guide covers [installation](#installation), [create the swap protocol](#create-the-swap-protocol), and [supported networks](#supported-networks). You need [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) to follow along.

## Installation

Run the following to install [@tetherto/wdk-protocol-swap-cowswap-evm](https://www.npmjs.com/package/@tetherto/wdk-protocol-swap-cowswap-evm):

{% code title="Install with npm" lineNumbers="true" %}

```bash
npm install @tetherto/wdk-protocol-swap-cowswap-evm
```

{% endcode %}

{% hint style="info" %}
You also need an EVM wallet account from [`@tetherto/wdk-wallet-evm`](https://www.npmjs.com/package/@tetherto/wdk-wallet-evm) (or an ERC-4337 account from [`@tetherto/wdk-wallet-evm-erc-4337`](https://www.npmjs.com/package/@tetherto/wdk-wallet-evm-erc-4337)).
{% endhint %}

## Create the swap protocol

You can construct a swap client with [`new CowswapProtocolEvm(account)`](/sdk/swap-modules/swap-cowswap-evm/api-reference.md#constructor) on top of [`CowswapProtocolEvm`](/sdk/swap-modules/swap-cowswap-evm/api-reference.md#class-cowswapprotocolevm):

{% code title="Create CowswapProtocolEvm" lineNumbers="true" %}

```javascript
import CowswapProtocolEvm from '@tetherto/wdk-protocol-swap-cowswap-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

const swapProtocol = new CowswapProtocolEvm(account)
```

{% endcode %}

## Supported networks

Cowswap routing works on supported EVM networks:
* **Ethereum Mainnet**
* **Gnosis Chain**
* **Arbitrum One**
* **Base**

Ensure your [`WalletAccountEvm`](/sdk/wallet-modules/wallet-evm/api-reference.md#walletaccountevm) is configured for the correct network.
