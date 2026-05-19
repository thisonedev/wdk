# wallet-sui

**Overview of the `@tetherto/wdk-wallet-sui` module.**

The `@tetherto/wdk-wallet-sui` module provides a comprehensive set of tools for managing Sui accounts, querying balances, and executing transactions on the Sui blockchain. It is built to be fully compatible with the Tether WDK ecosystem and supports both Node.js and Bare runtimes.

### Features

*   **Account Management**: Derive multiple Sui accounts from a single BIP-39 seed phrase using the standard BIP-44 derivation path (`m/44'/784'`).
*   **Balance Queries**: Retrieve real-time balances for native SUI (in MIST) and any other Sui-based coin objects.
*   **Transaction Support**: Send native SUI transfers and transfer any Sui coin object with automatic fee estimation and gas budget management.
*   **Advanced Move Actions**: Support for publishing Move packages and executing generic Move function calls (Move calls).
*   **Signature Verification**: Robust support for signing and verifying personal messages and transactions using Sui's Ed25519 signing scheme.
*   **Memory Safety**: Securely erases sensitive private key data from memory using `sodium_memzero` when accounts are disposed of.
*   **RPC Failover**: Built-in support for multiple RPC endpoints with automatic failover to ensure high availability.
