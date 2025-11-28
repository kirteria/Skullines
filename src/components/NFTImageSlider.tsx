'use client'

import Image from 'next/image'

interface NFTImageSliderProps {
  className?: string
  mintPrice?: string
}

export function NFTImageSlider({ className = '', mintPrice }: NFTImageSliderProps) {
  return (
    <div className={`aspect-square bg-[#101010] rounded-2xl overflow-hidden relative ${className}`}>
      <Image
        src="/preview.gif"
        alt="nft"
        fill
        sizes="280px"
        className="object-cover absolute inset-0"
      />
      {mintPrice && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-60 px-3 py-1 rounded-full text-white text-sm font-bold shadow-md backdrop-blur-sm">
          {mintPrice}
        </div>
      )}
    </div>
  )
}
