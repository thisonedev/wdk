/**
 * Sui Example: Read-Only Account
 *
 * Demonstrates: Querying balances and verifying signatures using
 * a read-only account that doesn't have a private key.
 *
 * Run: npx tsx wallet-sui/read-only-account.ts
 */

import { WalletAccountReadOnlySui } from '@tetherto/wdk-wallet-sui'
import { loadSuiConfig } from '../shared/config.js'
import { logSection, logResult, formatMist } from '../shared/helpers.js'

async function main() {
  const config = loadSuiConfig()

  // Use a known public address (or the one from your config)
  const publicAddress = config.recipientAddress

  logSection('Read-Only Account (Sui)')
  console.log(`Working with address: ${publicAddress}`)

  const roAccount = new WalletAccountReadOnlySui(publicAddress, {
    rpcUrl: config.rpcUrl
  })

  // 1. Check balances
  const balance = await roAccount.getBalance()
  logResult('Native SUI Balance', { balance: formatMist(balance) })

  // 2. Quote a transaction fee
  const quote = await roAccount.quoteSendTransaction({
    to: config.recipientAddress,
    value: 100000000n
  })
  logResult('Transaction Fee Quote', { fee: formatMist(quote.fee) })

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
