import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'
import CowswapProtocolEvm from '@tetherto/wdk-protocol-swap-cowswap-evm'
import { loadEvmConfig } from '../shared/config.js'
import { ethers } from 'ethers'
import { logSection } from '../shared/helpers.js'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Example: Swap tokens on Sepolia using Cowswap.
 * Selling small amount of WETH for USDT.
 */
async function main() {
  logSection('Initializing Swap Operation')
  await sleep(1000)
  const config = loadEvmConfig()

  // Sepolia Testnet Addresses
  const NATIVE_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  const WETH_SEPOLIA = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
  const USDT_SEPOLIA = '0x58Eb19eF91e8A6327FEd391b51aE1887b833cc91'

  const account = new WalletAccountEvm(config.seedPhrase, "0'/0/0", {
    provider: config.rpcUrl
  })

  const cowswap = new CowswapProtocolEvm(account)
  const address = await account.getAddress()

  console.log(`Using account: ${address}`)

  const swapOptions = {
    tokenIn: WETH_SEPOLIA,
    tokenOut: USDT_SEPOLIA,
    tokenInAmount: 750000000000000n // 0.00075 ETH
  }

  const formatEth = (val: bigint) => Number(ethers.formatEther(val)).toFixed(6)
  const formatUsdt = (val: bigint) => Number(ethers.formatUnits(val, 6)).toFixed(2)

  console.log(`Action: Swapping ${formatEth(swapOptions.tokenInAmount)} ETH -> USDT`)

  try {
    // 1. Check WETH balance and wrap if necessary
    const wethContract = new ethers.Contract(WETH_SEPOLIA, [
      'function balanceOf(address) view returns (uint256)',
      'function deposit() payable'
    ], account._provider)

    const wethBalance = await wethContract.balanceOf(address)

    if (wethBalance < swapOptions.tokenInAmount) {
      logSection('Wrapping ETH to WETH')
      await sleep(1000)
      const wallet = ethers.Wallet.fromPhrase(config.seedPhrase, account._provider)
      const wethWithSigner = wethContract.connect(wallet) as any
      const wrapTx = await wethWithSigner.deposit({ value: swapOptions.tokenInAmount })
      await wrapTx.wait()
      console.log('ETH wrapped successfully!')
    }

    // 2. Approve Vault Relayer if needed
    const VAULT_RELAYER = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110'
    const tokenContract = new ethers.Contract(WETH_SEPOLIA, [
      'function allowance(address,address) view returns (uint256)',
      'function approve(address,uint256) returns (bool)'
    ], account._provider)

    const allowance = await tokenContract.allowance(address, VAULT_RELAYER)
    if (allowance < swapOptions.tokenInAmount) {
      console.log('Approving Vault Relayer...')
      const wallet = ethers.Wallet.fromPhrase(config.seedPhrase, account._provider)
      const tokenWithSigner = tokenContract.connect(wallet) as any
      const approveTx = await tokenWithSigner.approve(VAULT_RELAYER, ethers.MaxUint256)
      await approveTx.wait()
      console.log('Vault Relayer approved!')
    }
    console.log('Fetching quote...')
    const quote = await cowswap.quoteSwap(swapOptions)
    console.log('Quote received:')
    console.log(`- Fee: ${formatEth(quote.fee)} WETH`)
    console.log(`- Expected Out: ${formatUsdt(quote.tokenOutAmount)} USDT`)

    console.log('Executing swap on Cowswap...')
    const result = await cowswap.swap(swapOptions)
    console.log('Swap fulfilled! Order UID:', result.hash)
  } catch (error: any) {    if (error.message.includes('No route')) {
      console.error('Error: No liquidity route found for this pair on Sepolia.')
    } else if (error.message.includes('allowance')) {
      console.error('Error: Insufficient allowance. Please approve the Vault Relayer first.')
    } else {
      console.error('Swap failed:', error.message)
    }
  }
}

main().catch(console.error)

