'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface NFTImageSliderProps {
  className?: string
}

export function NFTImageSlider({ className = '' }: NFTImageSliderProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [realImages, setRealImages] = useState<string[]>([])
  const [showDefault, setShowDefault] = useState(true)

  useEffect(() => {
    const detectImages = async () => {
      const detected: string[] = []

      for (let i = 1; i <= 100; i++) {
        const imgPath = `/image/nft/${i}.png`
        try {
          const res = await fetch(imgPath, { method: 'HEAD' })
          if (!res.ok) break
          detected.push(imgPath)
        } catch {
          break
        }
      }

      setRealImages(detected)
    }

    detectImages()
  }, [])

  // hide default after 2 sec if real images exist
  useEffect(() => {
    if (realImages.length === 0) return
    const timer = setTimeout(() => setShowDefault(false), 2000)
    return () => clearTimeout(timer)
  }, [realImages])

  // real image slider
  useEffect(() => {
    if (showDefault || realImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % realImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [showDefault, realImages])

  return (
    <div
      className={`aspect-square bg-[#101010] rounded-2xl overflow-hidden shadow-lg relative ${className}`}
    >
      {showDefault && (
        <Image
          src="/default.gif"
          alt="default"
          fill
          className="object-cover absolute inset-0"
          sizes="280px"
        />
      )}

      {realImages.map((img, index) => (
        <Image
          key={img}
          src={img}
          alt="nft"
          fill
          sizes="280px"
          className={`object-cover absolute inset-0 transition-opacity duration-500 ${
            !showDefault && index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  )
}
