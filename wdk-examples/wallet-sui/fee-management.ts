/**
 * Sui Example: Fee Management
 *
 * Demonstrates: Retrieving reference gas price and estimating
 * transaction fees.
 *
 * Run: npx tsx wallet-sui/fee-management.ts
 */

import WalletManagerSui from '@tetherto/wdk-wallet-sui'
import { loadSuiConfig } from '../shared/config.js'
import { logSection, logResult, formatMist } from '../shared/helpers.js'

async function main() {
  const config = loadSuiConfig()

  logSection('Sui Fee Management')

  const wallet = new WalletManagerSui(config.seedPhrase, {
    rpcUrl: config.rpcUrl
  })

  // 1. Get network fee rates (Reference Gas Price)
  const rates = await wallet.getFeeRates()
  logResult('Network Fee Rates', {
    normal: `${rates.normal} MIST`,
    fast: `${rates.fast} MIST`
  })

  // 2. Quote specific transaction fee
  const account = await wallet.getAccount(0)
  const quote = await account.quoteSendTransaction({
    to: config.recipientAddress,
    value: 100000000n
  })
  
  logResult('Transaction Fee Quote', {
    fee: formatMist(quote.fee)
  })

  wallet.dispose()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
