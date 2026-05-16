/**
 * Sui Example: Check Balances
 *
 * Demonstrates: Querying native SUI balance and other coin balances.
 *
 * Run: npx tsx wallet-sui/check-balances.ts
 */

import WalletManagerSui from '@tetherto/wdk-wallet-sui'
import { loadSuiConfig } from '../shared/config.js'
import { logSection, logResult, formatMist } from '../shared/helpers.js'

async function main() {
  const config = loadSuiConfig()

  logSection('Check Balances (Sui)')

  const wallet = new WalletManagerSui(config.seedPhrase, {
    rpcUrl: config.rpcUrl
  })

  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  logResult('Account', { address })

  // Check native SUI balance
  const balance = await account.getBalance()
  logResult('Native SUI Balance', { balance: formatMist(balance) })

  // Check specific coin balance (e.g., USDT on Sui)
  const coinType = config.coinType
  const coinBalance = await account.getTokenBalance(coinType)
  logResult('Coin Balance', {
    type: coinType,
    balance: `${coinBalance} (base units)`
  })

  // Get coin metadata to format it better
  try {
    const metadata = await account.getTokenMetadata(coinType)
    if (metadata) {
      const formatted = Number(coinBalance) / 10 ** metadata.decimals
      logResult('Formatted Coin Balance', {
        balance: `${formatted} ${metadata.symbol}`
      })
    }
  } catch (err) {
    console.log('\n(Metadata not available for this coin type)')
  }

  wallet.dispose()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
