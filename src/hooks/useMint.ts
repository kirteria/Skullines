'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACT_CONFIG } from '@/config/contract'
import { readContract } from '@wagmi/core'
import { wagmiConfig } from '@/config/wagmi'

export function useMint() {
  const { address } = useAccount()
  const [transactionHash, setTransactionHash] = useState<string>()
  const [error, setError] = useState<Error | null>(null)
  const [mintedIds, setMintedIds] = useState<number[]>([])

  const { writeContractAsync, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}` | undefined,
  })

  const mintNFT = async (quantity: number, mintPrice: string) => {
    if (!address) return undefined

    try {
      setError(null)

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
        const msg = err?.message?.toLowerCase() || ""

        if (
          err?.code === 4001 ||
          msg.includes("user rejected") ||
          msg.includes("cancel")
        ) {
          const e = new Error("USER_CANCELLED") as any
          e.code = 4001
          setError(e)
          return undefined
        }

        throw err
      }

      setTransactionHash(txHash)

      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (!isConfirming) {
            clearInterval(check)
            resolve()
          }
        }, 300)
      })

      if (!isSuccess) return undefined

      const after = Number(
        await readContract(wagmiConfig, {
          address: CONTRACT_CONFIG.address,
          abi: CONTRACT_CONFIG.abi,
          functionName: 'totalSupply',
        })
      )

      const ids: number[] = []
      for (let id = before + 1; id <= after; id++) ids.push(id)

      setMintedIds(ids)
      return ids

    } catch (err: any) {
      setError(err)
      return undefined
    }
  }

  return {
    mintNFT,
    isPending,
    isConfirming,
    isSuccess,
    error,
    transactionHash,
    mintedIds,
  }
}
