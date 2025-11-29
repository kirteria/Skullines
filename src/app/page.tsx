'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Minus, Plus } from 'lucide-react'
import { useContractData } from '@/hooks/useContractData'
import { useMint } from '@/hooks/useMint'
import { NFTPreview } from '@/components/NFTPreview'
import { sdk } from '@farcaster/miniapp-sdk'
import { Blocked } from '@/components/Blocked'

export default function HomePage() {
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState < "idle" | "processing" | "verifying" | "pending" | "success" | "failed" >("idle");
  const [isInFarcaster, setIsInFarcaster] = useState<boolean | null>(null)

  const { address, isConnected } = useAccount()
  const { totalSupply, maxSupply, userBalance, maxMintPerAddress, mintingEnabled, loading, mintPrice, refetch } = useContractData(address)
  const { mintNFT, isPending, isConfirming, isSuccess, error, mintedIds } = useMint()

  const remainingMints = Math.max((maxMintPerAddress || 0) - (userBalance || 0), 0)
  const maxQuantity = remainingMints
  const isSoldOut = totalSupply >= maxSupply
  const progressPercentage = (totalSupply / maxSupply) * 100

  const formatEth = (v: number) => parseFloat(v.toFixed(7)).toString()

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        await sdk.actions.ready()
        const inApp = await sdk.isInMiniApp()
        setIsInFarcaster(inApp)
      } catch {
        setIsInFarcaster(false)
      }
    }
    initFarcaster()
  }, [])

  if (isInFarcaster === null) return null
  if (isInFarcaster === false) return <Blocked />

  useEffect(() => {
    if (isPending && status === 'idle') setStatus('pending')
  }, [isPending])

  useEffect(() => {
    if (status === 'pending' && isConfirming) setStatus('confirming')
  }, [isConfirming])

  useEffect(() => {
    if (status === 'confirming' && isSuccess) setStatus('success')
  }, [isSuccess])

  useEffect(() => {
    if (error?.message === 'USER_CANCELLED') {
      setStatus('cancelled')
      setTimeout(() => setStatus('idle'), 1000)
    }
    if (error && error.message !== 'USER_CANCELLED') {
      setStatus('failed')
      setTimeout(() => setStatus('idle'), 1000)
    }
  }, [error])

  const handleMint = async () => {
    if (!isConnected || !mintPrice || status !== 'idle') return

    try {
      const ids = await mintNFT(quantity, mintPrice)
      if (!ids || ids.length === 0) return

      await refetch()

      const lastTokenId = ids[ids.length - 1]
      const appUrl = process.env.NEXT_PUBLIC_APP_URL!
      const collectionName = process.env.NEXT_PUBLIC_NFT_NAME!
      const nftImageUrl = `${appUrl}/api/nft/${lastTokenId}`

      if (status === 'success') {
        await sdk.actions.composeCast({
          text: `Just minted my ${collectionName} 💜\n\u200B\nGet yours now 💀🔥`,
          embeds: [nftImageUrl, appUrl],
        })
        setTimeout(() => setStatus('idle'), 0)
      }
    } catch {}
  }

  const getButtonText = () => {
    if (status === 'pending') return 'Processing'
    if (status === 'confirming') return 'Verifying'
    if (status === 'success') return 'Mint Successfully'
    if (status === 'failed') return 'Mint Failed'
    if (status === 'cancelled') return 'Mint Canceled'
    if (loading) return 'Loading'
    if (isSoldOut) return 'Minted Out'
    if (!mintingEnabled) return 'Mint Paused'
    if (remainingMints <= 0) return 'Max Mint Reached'
    return 'Mint'
  }

  const disabled = status !== 'idle' || !isConnected || loading || isSoldOut || !mintingEnabled || remainingMints <= 0

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 px-4" style={{ backgroundColor: '#101010' }}>
      <div className="relative w-full max-w-md mx-auto mb-4 mt-16">
        <NFTPreview className="w-full aspect-square rounded-2xl" />
        {!loading && mintPrice && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 px-3 py-1 rounded-full text-white text-sm font-bold">
            {formatEth(Number(mintPrice))} ETH
          </div>
        )}
      </div>

      <div className="w-full max-w-md mx-auto mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-bold text-white">Minted</span>
          <span className="font-semibold text-white">{loading ? '...' : `${totalSupply}/${maxSupply}`}</span>
        </div>
        <Progress value={progressPercentage} className="h-2 rounded-full" />
      </div>

      <div className="flex items-center justify-center gap-3 mb-4">
        <Button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={status !== 'idle' || quantity <= 1} className="text-white w-10 h-10 rounded-full">
          <Minus className="w-4 h-4" />
        </Button>
        <div className="w-16 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{quantity}</span>
        </div>
        <Button onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))} disabled={status !== 'idle' || quantity >= maxQuantity} className="text-white w-10 h-10 rounded-full">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Button onClick={handleMint} disabled={disabled} className="w-full max-w-md text-white h-15 text-xl font-semibold rounded-full disabled:opacity-50">
        {getButtonText()}
      </Button>
    </div>
  )
}
