# Check Balances

Query native SUI and coin balances on the Sui blockchain.

This guide explains how to check native SUI and other coin balances for both owned and read-only accounts.

## Owned Account Balances

Use an account retrieved from `WalletManagerSui` to query balances.

### Native SUI Balance

Use `account.getBalance()` to retrieve the native SUI balance from an `Account` object. The balance is returned in MIST (1 SUI = 1,000,000,000 MIST).

```javascript
const balance = await account.getBalance()
console.log('Native SUI balance:', balance, 'MIST')
```

### Single Coin Balance

Use `account.getTokenBalance(coinType)` to retrieve the balance for a specific coin type.

```javascript
const usdtType = '0xc060006111016b8a020ad5b31f5ad8f153034c8a91ca4977f6b96b263ee32c31::usdt::USDT'
const tokenBalance = await account.getTokenBalance(usdtType)
console.log('USD₮ balance:', tokenBalance)
```

### Multiple Coin Balances

Use `account.getTokenBalances(coinTypes)` to retrieve multiple coin balances, where `coinTypes` is an array of Sui coin type strings.

```javascript
const tokenBalances = await account.getTokenBalances([
  '0x2::sui::SUI',
  '0xc060006111016b8a020ad5b31f5ad8f153034c8a91ca4977f6b96b263ee32c31::usdt::USDT'
])
console.log('Multi-token balances:', tokenBalances)
```

## Read-Only Account Balances

Use `WalletAccountReadOnlySui` to check balances for any public Sui address without requiring a seed phrase.

### Native SUI Balance

```javascript
import { WalletAccountReadOnlySui } from '@tetherto/wdk-wallet-sui'

const readOnlyAccount = new WalletAccountReadOnlySui('0x85eef430fea1c8c53b333bc5e9dffc6f86b565a61b0b9c6d0dd5ec43e725ff30', {
   rpcUrl: 'https://fullnode.mainnet.sui.io:443'
})

const balance = await readOnlyAccount.getBalance()
console.log('Native SUI balance:', balance, 'MIST')
```

### Single Coin Balance

```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('0xc06...::usdt::USDT')
console.log('Token balance:', tokenBalance)
```

{% hint style="info" %}
You can also create a read-only account from an existing owned account using `await account.toReadOnlyAccount()`.
{% endhint %}
