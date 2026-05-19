# Configuration

## Wallet Configuration

The `WalletManagerSui` accepts an optional configuration object that defines how the wallet interacts with the Sui blockchain:

```javascript
import WalletManagerSui from '@tetherto/wdk-wallet-sui'

const config = {
  provider: 'https://fullnode.mainnet.sui.io:443', // Recommended: Sui RPC endpoint
  transferMaxFee: 10000000 // Optional: Maximum fee in MIST
}

const wallet = new WalletManagerSui(seedPhrase, config)
```

## Account Configuration

Accounts are obtained through the `WalletManagerSui` instance using `getAccount()` or `getAccountByPath()`:

```javascript
import WalletManagerSui from '@tetherto/wdk-wallet-sui'

const accountConfig = {
  provider: 'https://fullnode.mainnet.sui.io:443',
  transferMaxFee: 10000000 // Optional: Maximum fee in MIST
}

const wallet = new WalletManagerSui(seedPhrase, accountConfig)

// Get account by index
const account = await wallet.getAccount(0)

// Or get account by custom derivation path
const customAccount = await wallet.getAccountByPath("m/44'/784'/0'/0'/0'")
```

## Configuration Options

### provider

The `provider` option specifies one Sui RPC endpoint or an ordered list of endpoints for blockchain interactions.

**Type:** `string | string[]` (optional)

**Default:** If not provided, wallet functionality that requires RPC will throw an error

**Examples:**

```javascript
// Single endpoint
const config = {
  provider: 'https://fullnode.mainnet.sui.io:443'
}

// Testnet
const config = {
  provider: 'https://fullnode.testnet.sui.io:443'
}

// Failover across multiple endpoints
const config = {
  provider: [
    'https://fullnode.mainnet.sui.io:443',
    'https://sui-mainnet.blockvision.org:443'
  ]
}
```

### retries

The `retries` option controls additional retry attempts after the initial failover request fails.

**Type:** `number` (optional)

**Default:** `3`

### transferMaxFee

The `transferMaxFee` option sets the maximum allowed fee (in MIST) for transfer operations.

**Type:** `number` (optional)

**Unit:** MIST (1 SUI = 1,000,000,000 MIST)

## Network Endpoints

### Mainnet

* RPC: `https://fullnode.mainnet.sui.io:443`

### Testnet

* RPC: `https://fullnode.testnet.sui.io:443`

### Devnet

* RPC: `https://fullnode.devnet.sui.io:443`

## Derivation Paths

Sui wallets typically follow the BIP-44 path structure:

* Default path: `m/44'/784'/{index}'/0'/0'`

## Security Considerations

* Always use HTTPS URLs for RPC endpoints
* Set appropriate `transferMaxFee` limits for your use case
* Use environment variables for sensitive data like seed phrases
