# @tetherto/wdk-protocol-swap-cowswap-evm

[![npm version](https://img.shields.io/npm/v/%40tetherto%2Fwdk-protocol-swap-cowswap-evm?style=flat-square)](https://www.npmjs.com/package/@tetherto/wdk-protocol-swap-cowswap-evm)
[![npm downloads](https://img.shields.io/npm/dw/%40tetherto%2Fwdk-protocol-swap-cowswap-evm?style=flat-square)](https://www.npmjs.com/package/@tetherto/wdk-protocol-swap-cowswap-evm)
[![license](https://img.shields.io/npm/l/%40tetherto%2Fwdk-protocol-swap-cowswap-evm?style=flat-square)](https://github.com/tetherto/wdk-protocol-swap-cowswap-evm/blob/main/LICENSE)
[![docs](https://img.shields.io/badge/docs-docs.wdk.tether.io-0A66C2?style=flat-square)](https://docs.wdk.tether.io/sdk/protocol-modules/cowswap-evm)

**Note**: This package is currently in beta. Please test thoroughly in development environments before using in production.

A lightweight package that lets EVM wallet accounts swap tokens using the Cowswap protocol. It provides a clean SDK for token swaps on EVM chains and works with both standard wallets and ERC-4337 smart accounts.

## About WDK

This module is part of the [**WDK (Wallet Development Kit)**](https://docs.wdk.tether.io/) project, which empowers developers to build secure, non-custodial wallets with unified blockchain access, stateless architecture, and complete user control.

For detailed documentation about the complete WDK ecosystem, visit [docs.wdk.tether.io](https://docs.wdk.tether.io).

## Installation

```bash
npm install @tetherto/wdk-protocol-swap-cowswap-evm
```

## Quick Start

```javascript
import CowswapProtocolEvm from '@tetherto/wdk-protocol-swap-cowswap-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-sepolia-rpc.publicnode.com'
})

const swapProtocol = new CowswapProtocolEvm(account)

const result = await swapProtocol.swap({
  tokenIn: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH (Sepolia)
  tokenOut: '0x58Eb19eF91e8A6327FEd391b51aE1887b833cc91', // USDT (Sepolia)
  tokenInAmount: 750000000000000n // 0.00075 WETH
})

console.log('Order UID:', result.hash)
```

## Key Capabilities

* **Token Swapping**: Execute token swaps through Cowswap on supported EVM networks
* **Account Abstraction**: Compatible with standard EVM accounts and ERC-4337 smart accounts
* **Gasless Trades**: Users pay settlement fees in their sell token; no gas fees for failed or cancelled orders
* **MEV Protection**: Comprehensive MEV protection for every order
* **TypeScript Support**: Full TypeScript definitions included

## Documentation

| Topic | Description | Link |
|-------|-------------|------|
| Overview | Module overview and feature summary | [Cowswap Overview](https://docs.wdk.tether.io/sdk/protocol-modules/cowswap-evm) |
| Usage | End-to-end integration walkthrough | [Cowswap Usage](https://docs.wdk.tether.io/sdk/protocol-modules/cowswap-evm/usage) |
| Configuration | Provider, fees, and network configuration | [Cowswap Configuration](https://docs.wdk.tether.io/sdk/protocol-modules/cowswap-evm/configuration) |
| API Reference | Complete class and type reference | [Cowswap API Reference](https://docs.wdk.tether.io/sdk/protocol-modules/cowswap-evm/api-reference) |

## Testing

To run the test suites for this module, use the following commands:

- Run all unit tests (Jest):
```bash
npm run test:unit
```
- Run integration tests (Brittle):
```bash
npm run test:integration
```
- Run test coverage:
```bash
npm run test:coverage
```

## Community

Join the [WDK Discord](https://discord.gg/arYXDhHB2w) to connect with other developers.

## Support

For support, please [open an issue](https://github.com/tetherto/wdk-protocol-swap-cowswap-evm/issues) on GitHub or reach out via [email](mailto:wallet-info@tether.io).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
