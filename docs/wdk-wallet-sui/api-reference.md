# API Reference

**Complete API documentation for `@tetherto/wdk-wallet-sui`**

## Table of Contents

| Class | Description | Methods |
| :--- | :--- | :--- |
| [WalletManagerSui](#walletmanagersui) | Main class for managing Sui wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`. | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountSui](#walletaccountsui) | Individual Sui wallet account implementation. Extends `WalletAccountReadOnlySui`. | [Constructor](#constructor-1), [Methods](#methods-1), [Properties](#properties) |
| [WalletAccountReadOnlySui](#walletaccountreadonlysui) | Read-only Sui wallet account for balance queries and verification. Extends `WalletAccountReadOnly`. | [Constructor](#constructor-2), [Methods](#methods-2) |

---

## WalletManagerSui

The main class for managing Sui wallets. It handles account derivation from seed phrases and orchestrates RPC connections with built-in failover support.

### Constructor
```javascript
new WalletManagerSui(seed, config?)
```
**Parameters:**
* `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or raw seed bytes.
* `config` (SuiWalletConfig, optional): Configuration settings for the wallet manager.

### Methods

| Method | Description | Returns | Throws |
| :--- | :--- | :--- | :--- |
| [`getAccount(index?)`](#getaccountindex) | Returns a wallet account at the specified index. | `Promise<WalletAccountSui>` | - |
| [`getAccountByPath(path)`](#getaccountbypathpath) | Returns a wallet account at the specified derivation path. | `Promise<WalletAccountSui>` | - |
| [`requestFaucet(index?, network?)`](#requestfaucetindex-network) | Requests SUI from the faucet for an account. | `Promise<void>` | If on mainnet. |
| [`getFeeRates()`](#getfeerates) | Returns the current reference gas price. | `Promise<FeeRates>` | If no provider is set. |
| [`dispose()`](#dispose) | Securely clears all private keys from memory. | `void` | - |

#### `getAccount(index)`

Returns a wallet account at the specified index using the default Sui derivation path prefix (`m/44'/784'`).

**Parameters:**
* `index` (number, optional): The zero-based account index. Default: `0`.

**Returns:**
* `Promise<WalletAccountSui>`: The derived account instance.

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

#### `getAccountByPath(path)`

Returns a wallet account at a specific SLIP-0010 derivation path relative to the Sui prefix.

**Parameters:**
* `path` (string): The derivation path (e.g., `"0'/0'/0'"`).

**Returns:**
* `Promise<WalletAccountSui>`: The derived account instance.

**Example:**
```javascript
const account = await wallet.getAccountByPath("1'/0'/0'")
```

#### `requestFaucet(index, network)`

Requests SUI from the faucet for the specified account index. This is only available on `testnet` and `devnet`.

**Parameters:**
* `index` (number, optional): The account index to fund. Default: `0`.
* `network` (string, optional): The network faucet to use (`'testnet'` or `'devnet'`). Default: `'testnet'`.

**Returns:**
* `Promise<void>`

**Example:**
```javascript
await wallet.requestFaucet(0, 'testnet')
```

#### `getFeeRates()`

Queries the network for the current reference gas price and returns estimated fee rates.

**Returns:**
* `Promise<FeeRates>`: An object containing `normal` and `fast` fee rates in MIST.

**Example:**
```javascript
const rates = await wallet.getFeeRates()
console.log('Current gas price:', rates.normal)
```

#### `dispose()`
Clears all sensitive private key data from memory for every account managed by this instance.

**Example:**
```javascript
wallet.dispose()
```

---

## WalletAccountSui

Represents an individual Sui wallet account with full signing capabilities.

### Constructor

```javascript
new WalletAccountSui(seed, path, config?)
```
**Parameters:**
* `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes.
* `path` (string): Full derivation path for the account.
* `config` (SuiWalletConfig, optional): Configuration settings.

### Methods

| Method | Description | Returns | Throws |
| :--- | :--- | :--- | :--- |
| [`getAddress()`](#getaddress) | Returns the account's Sui address. | `Promise<string>` | - |
| [`getBalance()`](#getbalance) | Returns the native SUI balance. | `Promise<bigint>` | If no provider. |
| [`transfer(options)`](#transferoptions) | Transfers Sui coins to another address. | `Promise<TransactionResult>` | If coins not found. |
| [`sign(message)`](#signmessage) | Signs a personal message using Ed25519. | `Promise<string>` | If disposed. |
| [`sendTransaction(tx)`](#sendtransactiontx) | Signs and executes a transaction block. | `Promise<TransactionResult>` | If simulation fails. |
| [`signTransaction(tx)`](#signtransactiontx) | Signs a transaction without broadcasting it. | `Promise<string>` | If disposed. |
| [`publish(options)`](#publishoptions) | Publishes a Move package. | `Promise<TransactionResult>` | If publish fails. |
| [`moveCall(options)`](#movecalloptions) | Executes a Move function call. | `Promise<TransactionResult>` | If execution fails. |
| [`toReadOnlyAccount()`](#toreadonlyaccount) | Returns a read-only copy of the account. | `Promise<WalletAccountReadOnlySui>` | - |
| [`dispose()`](#dispose-1) | Erases the account's private key from memory. | `void` | - |

#### `getAddress()`

Returns the public Sui address associated with this account.

**Returns:**
* `Promise<string>`: The Sui address (e.g., `"0x30f5..."`).

**Example:**
```javascript
const address = await account.getAddress()
```

#### `getBalance()`

Retrieves the current balance of native SUI for this account.

**Returns:**
* `Promise<bigint>`: The balance in MIST.

**Example:**
```javascript
const balance = await account.getBalance()
```

#### `transfer(options)`

Transfers a specific coin type to a recipient. WDK handles coin object management automatically.

**Parameters:**
* `options` (TransferOptions): The transfer parameters.

**Returns:**
* `Promise<TransactionResult>`: The result containing the digest and fee.

**Example:**
```javascript
const result = await account.transfer({
  token: '0x2::sui::SUI',
  recipient: '0x...',
  amount: 500n
})
```

#### `sign(message)`

Signs a UTF-8 string message using Sui's personal message signing format.

**Parameters:**
* `message` (string): The message to sign.

**Returns:**
* `Promise<string>`: The serialized Ed25519 signature.

**Example:**
```javascript
const signature = await account.sign('Hello WDK')
```

#### `sendTransaction(tx)`

Signs and broadcasts a transaction block to the network.

**Parameters:**
* `tx` (SuiTransaction): A simple transaction object or a Sui SDK `Transaction` instance.

**Returns:**
* `Promise<TransactionResult>`: The execution result.

**Example:**
```javascript
const result = await account.sendTransaction({ to: '0x...', value: 1000n })
```

#### `signTransaction(tx)`

Signs a transaction block and returns the signature without broadcasting it.

**Parameters:**
* `tx` (SuiTransaction): The transaction to sign.

**Returns:**
* `Promise<string>`: The serialized signature.

**Example:**
```javascript
const signed = await account.signTransaction(tx)
```

#### `publish(options)`

Publishes a new Move package to the blockchain.

**Parameters:**
* `options` (object):
    * `modules` (string[]): Compiled module bytes as base64 strings.
    * `dependencies` (string[]): Addresses of dependent packages.

**Returns:**
* `Promise<TransactionResult>`: The result of the publish transaction.

**Example:**
```javascript
const result = await account.publish({ modules, dependencies: ['0x1', '0x2'] })
```

#### `moveCall(options)`

Executes a generic Move function call.

**Parameters:**
* `options` (object):
    * `target` (string): Function target (e.g., `"package::module::function"`).
    * `arguments` (any[], optional): Arguments for the call.
    * `typeArguments` (string[], optional): Type arguments for generic functions.

**Returns:**
* `Promise<TransactionResult>`: The call result.

**Example:**
```javascript
const result = await account.moveCall({ target: '0x...::token::mint', arguments: [cap, 100n] })
```

#### `toReadOnlyAccount()`

Returns a read-only instance of this account. The read-only instance cannot sign transactions but can query balances and verify signatures.

**Returns:**
* `Promise<WalletAccountReadOnlySui>`: The read-only account instance.

**Example:**
```javascript
const readOnly = await account.toReadOnlyAccount()
```

#### `dispose()`

Securely erases the account's private key from memory.

**Example:**
```javascript
account.dispose()
```

### Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `index` | `number` | The account index in the derivation path. |
| `path` | `string` | The full derivation path (e.g., `m/44'/784'/0'/0'/0'`). |
| `keyPair` | `KeyPair` | The raw Ed25519 key pair (⚠️ Contains sensitive data). |

---

## WalletAccountReadOnlySui

A read-only implementation for querying state and verifying signatures without access to private keys.

### Constructor

```javascript
new WalletAccountReadOnlySui(address, config?)
```
**Parameters:**
* `address` (string): The public Sui address.
* `config` (SuiWalletConfig, optional): Configuration settings.

### Methods

| Method | Description | Returns | Throws |
| :--- | :--- | :--- | :--- |
| [`getBalance()`](#getbalance-1) | Returns the native SUI balance. | `Promise<bigint>` | If no provider. |
| [`getTokenBalance(coinType)`](#gettokenbalancecointype) | Returns balance for a specific coin. | `Promise<bigint>` | If no provider. |
| [`getTokenBalances(coinTypes)`](#gettokenbalancescointypes) | Returns balances for multiple coins. | `Promise<Record<string, bigint>>` | If no provider. |
| [`getTokenMetadata(coinType)`](#gettokenmetadatacointype) | Returns metadata for a coin type. | `Promise<CoinMetadata \| null>` | If no provider. |
| [`quoteSendTransaction(tx)`](#quotesendtransactiontx) | Quotes the costs of a send transaction operation. | `Promise<Omit<TransactionResult, 'hash'>>` | If no provider. |
| [`quoteTransfer(options)`](#quotetransferoptions) | Quotes the costs of a transfer operation. | `Promise<Omit<TransactionResult, 'hash'>>` | If no provider. |
| [`getTransactionReceipt(hash)`](#gettransactionreceipthash) | Fetches a transaction's receipt (block response). | `Promise<SuiTransactionReceipt \| null>` | If no provider. |
| [`verify(message, signature)`](#verifymessage-signature) | Verifies a message signature. | `Promise<boolean>` | - |

#### `getBalance()`

Retrieves the current balance of native SUI for this account.

**Returns:**
* `Promise<bigint>`: The balance in MIST.

**Example:**
```javascript
const balance = await readOnlyAccount.getBalance()
```

#### `getTokenBalance(coinType)`

Retrieves the balance for a specific coin type.

**Parameters:**
* `coinType` (string): The full Sui coin type string.

**Returns:**
* `Promise<bigint>`: The balance in the coin's base units.

**Example:**
```javascript
const balance = await readOnlyAccount.getTokenBalance('0x...::usdt::USDT')
```

#### `getTokenBalances(coinTypes)`
Retrieves the balances for multiple coin types efficiently.

**Parameters:**
* `coinTypes` (string[]): An array of full Sui coin type strings.

**Returns:**
* `Promise<Record<string, bigint>>`: A mapping of coin types to their balances.

**Example:**
```javascript
const balances = await readOnlyAccount.getTokenBalances(['0x...::usdc::USDC', '0x...::usdt::USDT'])
```

#### `getTokenMetadata(coinType)`

Fetches the metadata (symbol, name, decimals, etc.) for a specific coin type.

**Parameters:**
* `coinType` (string): The full Sui coin type string.

**Returns:**
* `Promise<CoinMetadata | null>`: The metadata object or null if not found.

**Example:**
```javascript
const metadata = await readOnlyAccount.getTokenMetadata('0x...::usdt::USDT')
```

#### `quoteSendTransaction(tx)`

Calculates the estimated fee for a transaction before execution.

**Parameters:**
* `tx` (SuiTransaction): The transaction to quote.

**Returns:**
* `Promise<Omit<TransactionResult, 'hash'>>`: The estimated fee.

**Example:**
```javascript
const { fee } = await readOnlyAccount.quoteSendTransaction({ to: '0x...', value: 1000n })
```

#### `quoteTransfer(options)`

Calculates the estimated fee for a transfer operation before execution.

**Parameters:**
* `options` (TransferOptions): The transfer options.

**Returns:**
* `Promise<Omit<TransactionResult, 'hash'>>`: The estimated fee.

**Example:**
```javascript
const { fee } = await readOnlyAccount.quoteTransfer({
  token: '0x2::sui::SUI',
  recipient: '0x...',
  amount: 500n
})
```

#### `getTransactionReceipt(hash)`

Retrieves the full transaction details (receipt) for a given digest.

**Parameters:**
* `hash` (string): The transaction digest.

**Returns:**
* `Promise<SuiTransactionReceipt | null>`: The transaction response or null if not found/error.

**Example:**
```javascript
const receipt = await readOnlyAccount.getTransactionReceipt('0x...')
```

#### `verify(message, signature)`

Verifies that a personal message signature was produced by this account's address.

**Parameters:**
* `message` (string): The original UTF-8 message.
* `signature` (string): The serialized signature to verify.

**Returns:**
* `Promise<boolean>`: True if the signature is valid for this account.

**Example:**
```javascript
const isValid = await readOnlyAccount.verify('Hello WDK', signature)
```

---

## Types

### SuiWalletConfig

Configuration options for Sui wallet instances.
```typescript
interface SuiWalletConfig {
  /** The Sui RPC endpoint(s). Can be a single URL or an array for automatic failover. */
  rpcUrl?: string | string[];
  
  /** A pre-configured Sui client instance for making RPC requests. */
  provider?: any;
  
  /** Number of retry attempts for RPC calls during failover. Defaults to 3. */
  retries?: number;
  
  /** Maximum fee (in MIST) allowed for transfer operations. Transactions exceeding this will throw an error. */
  transferMaxFee?: number | bigint;
}
```

### SuiTransaction

A union type representing either a simplified transfer or a complex Sui transaction object.
```typescript
type SuiTransaction = SimpleSuiTransaction | any;

interface SimpleSuiTransaction {
  /** The public Sui address of the recipient. */
  to: string;
  
  /** The amount of native SUI to send, denominated in MIST. */
  value: number | bigint;
}
```

### TransferOptions

Options for token/coin transfer operations.
```typescript
interface TransferOptions {
  /** The full Sui coin type string (e.g., '0x2::sui::SUI'). */
  token: string;
  
  /** The public Sui address of the recipient. */
  recipient: string;
  
  /** The amount to transfer in the token's base units (e.g., MIST for SUI). */
  amount: number | bigint;
}
```

### TransactionResult

The result returned after executing a transaction on the Sui network.
```typescript
interface TransactionResult {
  /** The unique transaction digest (hash) of the executed transaction. */
  hash: string;
  
  /** The actual total gas fee paid for the transaction in MIST. */
  fee: bigint;
}
```

### FeeRates

Represents current suggested gas price information.
```typescript
interface FeeRates {
  /** The standard reference gas price from the network. Suitable for normal priority. */
  normal: bigint;
  
  /** A suggested fast gas price (Reference Price + 20% buffer) to ensure faster inclusion. */
  fast: bigint;
}
```

### KeyPair

Raw cryptographic key data for a Sui account.
```typescript
interface KeyPair {
  /** The raw Ed25519 private key bytes (32 bytes). Becomes null after the account is disposed. */
  privateKey: Uint8Array | null;
  
  /** The raw Ed25519 public key bytes (32 bytes). */
  publicKey: Uint8Array;
}
```
