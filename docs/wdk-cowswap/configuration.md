# Swap Service Configuration

The `CowswapProtocolEvm` accepts a configuration object that defines behavior:

```javascript
import CowswapProtocolEvm from '@tetherto/wdk-protocol-swap-cowswap-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

// Create wallet account first
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

// Create swap service
const swapProtocol = new CowswapProtocolEvm(account)
```

## Account Configuration

The swap service uses the wallet account configuration for network access and signing:

```javascript
import { WalletAccountEvm, WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'

// Full access account
const account = new WalletAccountEvm(
  seedPhrase,
  "0'/0/0",
  {
    provider: 'https://ethereum-rpc.publicnode.com'
  }
)

// Read-only account (quotes only)
const readOnly = new WalletAccountReadOnlyEvm(
  '0xYourAddress',
  {
    provider: 'https://ethereum-rpc.publicnode.com'
  }
)

// Create swap service
const swapProtocol = new CowswapProtocolEvm(account)
```

## ERC-4337 (Account Abstraction) Configuration

When using ERC-4337 smart accounts (`@tetherto/wdk-wallet-evm-erc-4337`), Cowswap uses EIP-1271 for order signing.

```javascript
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

const aa = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
  chainId: 1,
  provider: 'https://mainnet.infura.io/v3/YOUR_ID',
  bundlerUrl: 'YOUR_BUNDLER_URL',
  paymasterUrl: 'YOUR_PAYMASTER_URL'
})

const swapAA = new CowswapProtocolEvm(aa)

const result = await swapAA.swap({
  tokenIn: '0xTokenIn',
  tokenOut: '0xTokenOut',
  tokenInAmount: 1000000n
})
```

## Network Support

Cowswap supports multiple EVM networks. Ensure your account is configured with a valid provider for the target network.

* Ethereum Mainnet (Chain ID 1)
* Gnosis Chain (Chain ID 100)
* Arbitrum One (Chain ID 42161)
* Base (Chain ID 8453)
