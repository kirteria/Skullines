'use client'

import Image from 'next/image'

interface NFTPreviewProps {
  className?: string
}

export function NFTPreview({ className = '' }: NFTPreviewProps) {
  return (
    <div
      className={`aspect-square bg-[#101010] rounded-2xl overflow-hidden relative ${className}`}
    >
      <Image
        src="/skull.png"
        alt="nft"
        fill
        sizes="280px"
        className="object-cover absolute inset-0"
      />
    </div>
  )
}
