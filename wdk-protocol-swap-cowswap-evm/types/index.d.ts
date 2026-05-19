import { SwapProtocol, SwapProtocolConfig, SwapOptions, SwapResult } from '@tetherto/wdk-wallet/protocols'
import { WalletAccountEvm, WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'
import { WalletAccountEvmErc4337, WalletAccountReadOnlyEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

export { QuoteAmountsAndCosts, Costs, Amounts, EnrichedOrder } from '@cowprotocol/cow-sdk'

export default class CowswapProtocolEvm extends SwapProtocol {
  constructor(
    account: WalletAccountEvm | WalletAccountReadOnlyEvm | WalletAccountEvmErc4337 | WalletAccountReadOnlyEvmErc4337,
    config?: SwapProtocolConfig
  )

  swap(
    options: SwapOptions,
    config?: { paymasterToken?: string; swapMaxFee?: number | bigint }
  ): Promise<SwapResult>

  quoteSwap(
    options: SwapOptions,
    config?: { paymasterToken?: string }
  ): Promise<Omit<SwapResult, 'hash'>>
}
