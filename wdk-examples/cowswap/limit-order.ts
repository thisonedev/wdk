import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'
import CowswapProtocolEvm from '@tetherto/wdk-protocol-swap-cowswap-evm'
import { loadEvmConfig } from '../shared/config.js'
import { ethers } from 'ethers'
import { logSection } from '../shared/helpers.js'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Example: Create a limit order on Sepolia using Cowswap.
 */
async function main() {
  logSection('Initializing Limit Order Operation')
  await sleep(1000)
  const config = loadEvmConfig()

  // Sepolia Testnet Addresses
  const WETH_SEPOLIA = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
  const USDT_SEPOLIA = '0x58Eb19eF91e8A6327FEd391b51aE1887b833cc91'

  const account = new WalletAccountEvm(config.seedPhrase, "0'/0/0", {
    provider: config.rpcUrl
  })

  const cowswap = new CowswapProtocolEvm(account)

  console.log(`Using account: ${await account.getAddress()}`)

  // Fetch USDT balance to sell all
  const usdtBalance = await account.getTokenBalance(USDT_SEPOLIA)
  console.log(`Current USDT balance: ${usdtBalance}`)

  const formatEth = (val: bigint) => Number(ethers.formatEther(val)).toFixed(6)
  const formatUsdt = (val: bigint) => Number(ethers.formatUnits(val, 6)).toFixed(2)

  // Create a limit order: Sell all USDT for at least 0.0001 WETH
  const limitOrderOptions = {
    tokenIn: USDT_SEPOLIA,
    tokenOut: WETH_SEPOLIA,
    sellAmount: usdtBalance,
    buyAmount: 10000000000000000n, // 0.01 WETH (adjusted for potential balance size)
    validTo: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
  }

  console.log(`Action: Creating limit order to sell ${formatUsdt(limitOrderOptions.sellAmount)} USDT for at least ${formatEth(limitOrderOptions.buyAmount)} WETH`)

  logSection('Creating limit order')
  await sleep(1000)
  try {
    const result = await cowswap.createLimitOrder(limitOrderOptions)
    console.log('Limit order placed successfully!')
    console.log('Order UID:', result.hash)
  } catch (error: any) {
    console.error('Failed to create limit order:', error.message)
  }
}

main().catch(console.error)
