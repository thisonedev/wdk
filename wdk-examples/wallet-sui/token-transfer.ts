/**
 * Sui Example: Token Transfer
 *
 * Demonstrates: Transferring specific Sui coin objects and estimating fees.
 *
 * Run: npx tsx wallet-sui/token-transfer.ts
 */

import WalletManagerSui from '@tetherto/wdk-wallet-sui'
import { loadSuiConfig, optionalEnv } from '../shared/config.js'
import { logSection, logResult, formatMist } from '../shared/helpers.js'

async function main() {
  const config = loadSuiConfig()
  const actuallySend = optionalEnv('ACTUALLY_SEND') === 'true'

  logSection('Sui Token Transfer')

  const wallet = new WalletManagerSui(config.seedPhrase, {
    rpcUrl: config.rpcUrl
  })

  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  logResult('Sender', { address })

  const token = config.coinType
  const amount = 4000n
  let tokenName = 'Unknown Token'
  let displayAmount = `${amount} base units`
  try {
    const metadata = await account.getTokenMetadata(token)
    if (metadata) {
      tokenName = `${metadata.name} (${metadata.symbol})`
      displayAmount = `${Number(amount) / 10 ** metadata.decimals} ${metadata.symbol}`
    }
  } catch (err) {
    // metadata optional
  }
  logResult('Token', { name: tokenName, address: token, amount: displayAmount })

  const transferParams = {
    token,
    recipient: config.recipientAddress,
    amount
  }

  // 1. Quote the transfer fee
  const quote = await account.quoteTransfer(transferParams)
  logResult('Transfer Fee Estimate', { fee: formatMist(quote.fee) })

  if (actuallySend) {
    console.log('\nExecuting real token transfer...')
    // 2. Execute transfer
    const result = await account.transfer(transferParams)
    logResult('Transfer Executed', {
      hash: result.hash,
      fee: formatMist(result.fee)
    })
  } else {
    console.log('\nSkipping actual transfer (set ACTUALLY_SEND=true to send)')
  }

  wallet.dispose()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
