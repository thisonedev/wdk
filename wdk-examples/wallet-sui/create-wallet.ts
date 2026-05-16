/**
 * Sui Example: Create Wallet
 *
 * Demonstrates: Initializing a WalletManagerSui, deriving an account,
 * and converting it to a read-only account.
 *
 * Run: npx tsx wallet-sui/create-wallet.ts
 */

import WalletManagerSui from '@tetherto/wdk-wallet-sui'
import { loadSuiConfig } from '../shared/config.js'
import { logSection, logResult } from '../shared/helpers.js'

async function main() {
  const config = loadSuiConfig()

  logSection('Create Sui Wallet')

  const wallet = new WalletManagerSui(config.seedPhrase, {
    rpcUrl: config.rpcUrl
  })

  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  logResult('Account 0', { address })

  const readOnlyAccount = await account.toReadOnlyAccount()
  const roAddress = await readOnlyAccount.getAddress()
  logResult('Read-Only Account', { address: roAddress })

  wallet.dispose()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
