# Manage Accounts

Work with multiple Sui accounts and custom derivation paths.

This guide explains how to retrieve multiple accounts from your Sui wallet and use custom derivation paths.

## Retrieve Accounts by Index

Use `getAccount()` with a zero-based index to access accounts derived from the default BIP-44 Sui path (`m/44'/784'/{index}'/0'/0'`).

```javascript
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Account 0 address:', address)

const account1 = await wallet.getAccount(1)
const address1 = await account1.getAddress()
console.log('Account 1 address:', address1)
```

## Retrieve Account by Custom Derivation Path

Use `getAccountByPath()` when you need a specific hierarchy beyond the default sequential index. The path is relative to the Sui prefix `m/44'/784'`.

```javascript
const customAccount = await wallet.getAccountByPath("0'/0'/1'")
const customAddress = await customAccount.getAddress()
console.log('Custom account address:', customAddress)
```

## Iterate Over Multiple Accounts

You can loop through accounts to inspect addresses and balances in bulk.

```javascript
async function listAccounts(wallet) {
  const accounts = []

  for (let i = 0; i < 5; i++) {
    const account = await wallet.getAccount(i)
    const address = await account.getAddress()
    const balance = await account.getBalance()

    accounts.push({
      index: i,
      path: `m/44'/784'/${i}'/0'/0'`,
      address,
      balance
    })

    console.log(`Account ${i}:`, { address, balance: balance.toString() })
  }

  return accounts
}
```