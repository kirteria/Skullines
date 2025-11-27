'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function NFTImageSlider({ className = '' }) {
  const [realImages, setRealImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showReal, setShowReal] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('/default.gif')

  // Detect images
  useEffect(() => {
    const detect = async () => {
      const imgs: string[] = []
      for (let i = 1; i <= 100; i++) {
        const path = `/image/nft/${i}.png`
        try {
          const res = await fetch(path, { method: 'HEAD' })
          if (!res.ok) break
          imgs.push(path)
        } catch {
          break
        }
      }
      setRealImages(imgs)
    }
    detect()
  }, [])

  // Fade default -> first real
  useEffect(() => {
    if (realImages.length === 0) return

    const timer = setTimeout(() => {
      setCurrentSrc(realImages[0])
      setShowReal(true) // triggers fade in
    }, 1000)

    return () => clearTimeout(timer)
  }, [realImages])

  // Real -> real (no animation)
  useEffect(() => {
    if (realImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(i => {
        const next = (i + 1) % realImages.length
        setCurrentSrc(realImages[next]) // instant swap
        return next
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [realImages])

  return (
    <div
      className={`aspect-square bg-[#101010] rounded-2xl overflow-hidden relative ${className}`}
    >

      {/* Default Image Layer (fades out) */}
      <Image
        src="/default.gif"
        alt=""
        fill
        sizes="280px"
        className={`absolute inset-0 object-cover transition-opacity duration-700 ${
          showReal ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Real Image Layer (fades in ONCE) */}
      <Image
        src={currentSrc}
        alt=""
        fill
        sizes="280px"
        className={`absolute inset-0 object-cover transition-opacity duration-700 ${
          showReal ? 'opacity-100' : 'opacity-0'
        }`}
      />

    </div>
  )
}
