"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Minus, Plus } from "lucide-react"
import { useContractData } from "@/hooks/useContractData"
import { useMint } from "@/hooks/useMint"
import { NFTImageSlider } from "@/components/NFTImageSlider"
import { sdk } from "@farcaster/miniapp-sdk"

export default function Page() {
  const [isInFarcaster, setIsInFarcaster] = useState<boolean | null>(null)

  useEffect(() => {
    const checkTimeout = setTimeout(() => {
      if (isInFarcaster === null) {
        setIsInFarcaster(false)
      }
    }, 3000)

    sdk
      .isInMiniApp()
      .then((inApp) => {
        clearTimeout(checkTimeout)
        setIsInFarcaster(inApp)
      })
      .catch(() => {
        clearTimeout(checkTimeout)
        setIsInFarcaster(false)
      })

    return () => clearTimeout(checkTimeout)
  }, [])

  if (isInFarcaster === null) return null

  if (isInFarcaster) {
    return <MintPageContent />
  }

  return <HomePageContent />
}

function MintPageContent() {
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState<"idle" | "pending" | "confirming" | "success" | "failed" | "cancelled">("idle")

  const { address, isConnected } = useAccount()

  const { totalSupply, maxSupply, userBalance, maxMintPerAddress, mintingEnabled, loading, mintPrice, refetch } =
    useContractData(address)

  const { mintNFT } = useMint()

  const remainingMints = Math.max((maxMintPerAddress || 0) - (userBalance || 0), 0)
  const maxQuantity = remainingMints
  const isSoldOut = totalSupply >= maxSupply
  const progressPercentage = (totalSupply / maxSupply) * 100
  const formatEth = (v: number) => Number.parseFloat(v.toFixed(7)).toString()
  const reset = () => setTimeout(() => setStatus("idle"), 1000)

  const handleMint = async () => {
    if (!isConnected || !mintPrice) return

    try {
      setStatus("pending")

      const mintedIds = await mintNFT(quantity, mintPrice)

      if (!mintedIds || mintedIds.length === 0) {
        setStatus("failed")
        reset()
        return
      }

      setStatus("confirming")

      const lastTokenId = mintedIds[mintedIds.length - 1]
      const appUrl = process.env.NEXT_PUBLIC_APP_URL!
      const collectionName = process.env.NEXT_PUBLIC_NFT_NAME!
      const nftImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/nft/${lastTokenId}`

      await sdk.actions.composeCast({
        text: `Just minted my ${collectionName} 💜\n\u200B\nGet yours now 💀🔥`,
        embeds: [nftImageUrl, appUrl],
      })

      setStatus("success")
      await refetch()
      reset()
    } catch (err: any) {
      console.error(err)
      if (err?.code === 4001) {
        setStatus("cancelled")
      } else {
        setStatus("failed")
      }
      reset()
    }
  }

  const getButtonText = () => {
    if (status === "pending") return "Processing"
    if (status === "confirming") return "Verifying"
    if (status === "success") return "Mint Successfully"
    if (status === "failed") return "Mint Failed"
    if (status === "cancelled") return "Mint Cancelled"
    if (loading) return "Loading"
    if (isSoldOut) return "Minted Out"
    if (!mintingEnabled) return "Mint Paused"
    if (remainingMints <= 0) return "Max Mint Reached"
    return "Mint"
  }

  const disabled =
    !isConnected ||
    loading ||
    isSoldOut ||
    !mintingEnabled ||
    status === "pending" ||
    status === "confirming" ||
    remainingMints <= 0

  const xUrl = process.env.NEXT_PUBLIC_X_URL
  const farcasterUrl = process.env.NEXT_PUBLIC_FARCASTER_URL
  const openseaUrl = process.env.NEXT_PUBLIC_OPENSEA_URL

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 px-4" style={{ backgroundColor: "#101010" }}>
      <div className="fixed top-6 right-4 flex gap-3 z-50">
        {xUrl && (
          <a href={xUrl} target="_blank" rel="noreferrer">
            <img src="/x.png" className="w-7 h-7 object-contain" />
          </a>
        )}
        {farcasterUrl && (
          <a href={farcasterUrl} target="_blank" rel="noreferrer">
            <img src="/farcaster.png" className="w-7 h-7 object-contain" />
          </a>
        )}
        {openseaUrl && (
          <a href={openseaUrl} target="_blank" rel="noreferrer">
            <img src="/opensea.png" className="w-7 h-7 object-contain" />
          </a>
        )}
      </div>

      <div className="relative w-full max-w-md mx-auto mb-4 mt-16">
        <NFTImageSlider className="w-full aspect-square rounded-2xl" />
        {!loading && mintPrice && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 px-3 py-1 rounded-full text-white text-sm font-bold shadow-lg">
            {formatEth(Number(mintPrice))} ETH
          </div>
        )}
      </div>

      <div className="w-full max-w-md mx-auto mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-bold text-white">Minted</span>
          <span className="font-semibold text-white">{loading ? "..." : `${totalSupply}/${maxSupply}`}</span>
        </div>
        <Progress value={progressPercentage} className="h-2 rounded-full" />
      </div>

      <div className="flex items-center justify-center gap-3 mb-4">
        <Button
          onClick={() => quantity > 1 && setQuantity(quantity - 1)}
          disabled={quantity <= 1}
          className="text-white w-10 h-10 rounded-full shadow-lg disabled:opacity-50"
          style={{
            backgroundColor: "#6A3CFF",
            border: "1px solid #5631CF",
          }}
        >
          <Minus className="w-4 h-4" />
        </Button>

        <div className="w-16 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white">{quantity}</span>
        </div>

        <Button
          onClick={() => quantity < maxQuantity && setQuantity(quantity + 1)}
          disabled={quantity >= maxQuantity}
          className="text-white w-10 h-10 rounded-full shadow-lg disabled:opacity-50"
          style={{
            backgroundColor: "#6A3CFF",
            border: "1px solid #5631CF",
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Button
        onClick={handleMint}
        disabled={disabled}
        className="w-full max-w-md text-white h-15 text-xl font-semibold rounded-full shadow-xl disabled:opacity-50"
        style={{
          backgroundColor: "#6A3CFF",
          border: "1px solid #5631CF",
        }}
      >
        {getButtonText()}
      </Button>
    </div>
  )
}

function HomePageContent() {
  const nftName = process.env.NEXT_PUBLIC_NFT_NAME

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        if (document.readyState !== "complete") {
          await new Promise<void>((resolve) => {
            window.addEventListener("load", () => resolve(), { once: true })
          })
        }
        await sdk.actions.ready()
        console.log("Farcaster SDK initialized")
      } catch (err) {
        console.error("Farcaster SDK init failed", err)
      }
    }

    initFarcaster()
  }, [])

  const handleOpenApp = () => {
    window.location.href = process.env.NEXT_PUBLIC_FARCASTER_APP_URL!
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#101010" }}>
      <div className="max-w-sm w-full flex flex-col items-center text-center space-y-4">
        <div className="w-[250px] h-[250px] rounded-2xl overflow-hidden shadow-lg">
          <img src="/skull.png" alt="Logo" className="w-full h-full object-cover" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{nftName}</h1>
          <p className="text-sm sm:text-base text-white">Born on Base - forever on the Blockhain</p>
        </div>

        <Button
          onClick={handleOpenApp}
          className="px-6 py-5 text-base sm:text-lg rounded-full shadow-lg w-full"
          style={{
            backgroundColor: "#6A3CFF",
            border: "1px solid #5631CF",
            color: "#FFFFFF",
          }}
        >
          Visit Farcaster
        </Button>

        <p className="text-xs sm:text-sm text-white">You need farcaster client to access this mini app</p>
      </div>
    </div>
  )
}
