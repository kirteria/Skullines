'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function NFTImageSlider({ className = '' }) {
  const [realImages, setRealImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedFirst, setLoadedFirst] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('/default.gif')

  // Detect images
  useEffect(() => {
    const detectImages = async () => {
      const images: string[] = []
      for (let i = 1; i <= 100; i++) {
        const path = `/image/nft/${i}.png`
        try {
          const res = await fetch(path, { method: 'HEAD' })
          if (!res.ok) break
          images.push(path)
        } catch {
          break
        }
      }
      setRealImages(images)
    }

    detectImages()
  }, [])

  // Switch default -> real when FIRST real loads
  const handleFirstLoad = () => {
    if (!loadedFirst) setLoadedFirst(true)
  }

  // Rotate real images (NO animation)
  useEffect(() => {
    if (realImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(i => {
        const next = (i + 1) % realImages.length
        setCurrentSrc(realImages[next])
        return next
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [realImages])

  return (
    <div
      className={`aspect-square bg-[#101010] rounded-2xl overflow-hidden relative ${className}`}
    >
      {/* Default Image: fades OUT */}
      <Image
        src="/default.gif"
        alt="default"
        fill
        sizes="280px"
        className={`absolute inset-0 object-cover transition-opacity duration-800 ${
          loadedFirst ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* First real load triggers fade */}
      <Image
        src={currentSrc}
        alt="nft"
        onLoadingComplete={handleFirstLoad}
        fill
        sizes="280px"
        className={`absolute inset-0 object-cover transition-opacity duration-800 ${
          loadedFirst ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
