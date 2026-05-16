/**
 * Sui Example: Sign and Verify Message
 *
 * Demonstrates: Signing a personal message and verifying it
 * with both owned and read-only accounts.
 *
 * Run: npx tsx wallet-sui/sign-verify-message.ts
 */

import WalletManagerSui from '@tetherto/wdk-wallet-sui'
import { loadSuiConfig } from '../shared/config.js'
import { logSection, logResult } from '../shared/helpers.js'

async function main() {
  const config = loadSuiConfig()

  logSection('Sign & Verify Message (Sui)')

  const wallet = new WalletManagerSui(config.seedPhrase, {
    rpcUrl: config.rpcUrl
  })

  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  logResult('Account', { address })

  const message = 'Hello, Sui world!'
  console.log(`\nMessage: "${message}"`)

  // 1. Sign message
  const signature = await account.sign(message)
  logResult('Signature', signature)

  // 2. Verify with owned account
  const isValidOwned = await account.verify(message, signature)
  logResult('Verification (Owned Account)', { isValid: isValidOwned })

  // 3. Verify with read-only account (demonstrating address-only verification)
  const readOnlyAccount = await account.toReadOnlyAccount()
  const isValidRO = await readOnlyAccount.verify(message, signature)
  logResult('Verification (Read-Only Account)', { isValid: isValidRO })

  wallet.dispose()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
