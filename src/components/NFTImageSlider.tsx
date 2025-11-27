'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function NFTImageSlider({ className = '' }) {
  const [realImages, setRealImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentSrc, setCurrentSrc] = useState('/default.gif')
  const [isFirstLoad, setIsFirstLoad] = useState(true) // fade only once

  // Detect NFT images
  useEffect(() => {
    const detect = async () => {
      const arr: string[] = []
      for (let i = 1; i <= 100; i++) {
        const path = `/image/nft/${i}.png`
        try {
          const res = await fetch(path, { method: 'HEAD' })
          if (!res.ok) break
          arr.push(path)
        } catch {
          break
        }
      }
      setRealImages(arr)
    }
    detect()
  }, [])

  // First transition: default → first real (with fade)
  useEffect(() => {
    if (realImages.length === 0) return

    const timer = setTimeout(() => {
      setCurrentSrc(realImages[0])
      setIsFirstLoad(false) // disable fade after first load
    }, 1000)

    return () => clearTimeout(timer)
  }, [realImages])

  // Real → real (no animation)
  useEffect(() => {
    if (realImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(i => {
        const next = (i + 1) % realImages.length
        setCurrentSrc(realImages[next]) // instant change
        return next
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [realImages])

  return (
    <div
      className={`aspect-square bg-[#101010] rounded-2xl overflow-hidden relative ${className}`}
    >
      <Image
        src={currentSrc}
        alt="nft"
        fill
        sizes="280px"
        className={`object-cover absolute inset-0 transition-opacity duration-700
          ${isFirstLoad ? 'opacity-100' : 'opacity-100'}
          ${isFirstLoad && currentSrc !== '/default.gif' ? 'opacity-0' : ''}
        `}
      />
    </div>
  )
}
