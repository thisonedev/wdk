# Transfer Tokens

Transfer Sui coin objects and estimate transfer fees on the Sui blockchain.

This guide explains how to transfer Sui tokens, estimate fees, and validate inputs before executing.

## Transfer Coins

Use `account.transfer()` to send any Sui coin object (tokens) to a recipient address. WDK automatically handles the coin selection, merging, and splitting required by Sui's object model.

```javascript
const transferResult = await account.transfer({
  token: '0xc060006111016b8a020ad5b31f5ad8f153034c8a91ca4977f6b96b263ee32c31::usdt::USDT',
  recipient: '0x30f50d81e31f3b36ea3d449bd689552d1e2fe11b7919dfba780fb5a63c7f19d8',
  amount: 1000000n // 1 USDT (assuming 6 decimals)
})
console.log('Transfer digest:', transferResult.hash)
console.log('Transfer fee:', transferResult.fee, 'MIST')
```

## Estimate Transfer Fees

Use `account.quoteTransfer()` to get a fee estimate before executing the transfer.

```javascript
const transferQuote = await account.quoteTransfer({
  token: '0xc06...::usdt::USDT',
  recipient: '0x30f5...d8',
  amount: 1000000n
})
console.log('Transfer fee estimate:', transferQuote.fee, 'MIST')
```

## Transfer with Validation

Validate addresses and check balances before transferring to catch errors early.

### 1. Validate Addresses

```javascript
if (!recipient.startsWith('0x') || recipient.length !== 66) {
  throw new Error('Invalid Sui recipient address')
}
```

### 2. Check Balances

Use `account.getTokenBalance()` and `account.getBalance()` to verify the account has sufficient funds for the transfer and the gas fees.

```javascript
const balance = await account.getTokenBalance(tokenType)
if (balance < amount) {
  throw new Error('Insufficient token balance')
}

const nativeBalance = await account.getBalance()
if (nativeBalance < 10000000n) { // Example threshold for gas
  throw new Error('Need more SUI for gas fees')
}
```

### 3. Quote and Execute Transfer

Use `account.quoteTransfer()` to estimate fees, then `account.transfer()` to execute:

```javascript
const quote = await account.quoteTransfer({
  token: tokenType,
  recipient,
  amount
})
console.log('Estimated gas cost:', quote.fee)

const result = await account.transfer({
  token: tokenType,
  recipient,
  amount
})
console.log('Transfer successful:', result.hash)
```

## Advanced: Move Calls & Publishing

Sui allows for more complex token actions like minting or burning via Move function calls.

### Execute a Move Call

Use `account.moveCall()` to interact with Move functions on-chain.

```javascript
// Example: Minting a token
const result = await account.moveCall({
  target: '0xmy_package::my_token::mint',
  arguments: [TREASURY_CAP_OBJECT_ID, 1000n, recipientAddress],
})
console.log('Mint transaction digest:', result.hash)
```

### Publish a Move Package

Use `account.publish()` to deploy new Move code (packages) to the blockchain.

```javascript
const result = await account.publish({
  modules: [compiledModuleBase64],
  dependencies: ['0x1', '0x2'],
})
console.log('Package published:', result.hash)
```
