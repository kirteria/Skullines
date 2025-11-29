'use client'

import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACT_CONFIG } from '@/config/contract'
import { readContract } from '@wagmi/core'
import { wagmiConfig } from '@/config/wagmi'

type MintCallbacks = {
  onPending?: () => void
  onConfirming?: () => void
  onSuccess?: () => void
  onFailed?: () => void
  onCancelled?: () => void
}

export function useMint() {
  const { address } = useAccount()
  const [transactionHash, setTransactionHash] = useState<string>()
  const [error, setError] = useState<Error | null>(null)
  const [mintedIds, setMintedIds] = useState<number[]>([])
  const { writeContractAsync, isPending } = useWriteContract()

  const mintNFT = async (quantity: number, mintPrice: string, callbacks?: MintCallbacks) => {
    if (!address) return undefined

    try {
      setError(null)
      callbacks?.onPending?.()

      const before = Number(
        await readContract(wagmiConfig, {
          address: CONTRACT_CONFIG.address,
          abi: CONTRACT_CONFIG.abi,
          functionName: 'totalSupply',
        })
      )

      const totalValue = parseEther((Number(mintPrice) * quantity).toString())
      let txHash: string

      try {
        txHash = await writeContractAsync({
          address: CONTRACT_CONFIG.address,
          abi: CONTRACT_CONFIG.abi,
          functionName: 'mint',
          args: [BigInt(quantity)],
          value: totalValue,
        })
      } catch (err: any) {
        const msg = err?.message?.toLowerCase() || ''
        if (err?.code === 4001 || msg.includes('user rejected') || msg.includes('cancel')) {
          const e = new Error('USER_CANCELLED') as any
          e.code = 4001
          setError(e)
          callbacks?.onCancelled?.()
          return undefined
        }
        throw err
      }

      setTransactionHash(txHash)
      callbacks?.onConfirming?.()

      const receiptTotalSupply = await new Promise<number>((resolve) => {
        const interval = setInterval(async () => {
          const now = Number(
            await readContract(wagmiConfig, {
              address: CONTRACT_CONFIG.address,
              abi: CONTRACT_CONFIG.abi,
              functionName: 'totalSupply',
            })
          )
          if (now >= before + quantity) {
            clearInterval(interval)
            resolve(now)
          }
        }, 1000)
      })

      const ids: number[] = []
      for (let id = before + 1; id <= receiptTotalSupply; id++) ids.push(id)
      setMintedIds(ids)

      callbacks?.onSuccess?.()
      return ids
    } catch (err: any) {
      setError(err)
      callbacks?.onFailed?.()
      return undefined
    }
  }

  return {
    mintNFT,
    isPending,
    error,
    transactionHash,
    mintedIds,
  }
}
