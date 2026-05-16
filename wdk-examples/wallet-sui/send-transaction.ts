/**
 * Sui Example: Send Transaction
 *
 * Demonstrates: Estimating fees and sending a native SUI transfer.
 *
 * Run: npx tsx wallet-sui/send-transaction.ts
 */

import WalletManagerSui from '@tetherto/wdk-wallet-sui'
import { loadSuiConfig, optionalEnv } from '../shared/config.js'
import { logSection, logResult, formatMist } from '../shared/helpers.js'

async function main() {
  const config = loadSuiConfig()
  const actuallySend = optionalEnv('ACTUALLY_SEND') === 'true'

  logSection('Send SUI Transaction')

  const wallet = new WalletManagerSui(config.seedPhrase, {
    rpcUrl: config.rpcUrl
  })

  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  logResult('Sender', { address })

  const txParams = {
    to: config.recipientAddress,
    value: 1_000_000n // 0.001 SUI in MIST
  }

  // 1. Estimate fee (quote)
  const quote = await account.quoteSendTransaction(txParams)
  logResult('Fee Estimate', { fee: formatMist(quote.fee) })

  if (actuallySend) {
    console.log('\nSending real transaction...')
    // 2. Execute transaction
    const result = await account.sendTransaction(txParams)
    logResult('Transaction Sent', {
      hash: result.hash,
      fee: formatMist(result.fee)
    })
  } else {
    console.log('\nSkipping actual send (set ACTUALLY_SEND=true to send)')
  }

  wallet.dispose()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
