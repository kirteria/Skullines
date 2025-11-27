'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface NFTImageSliderProps {
  className?: string
}

export function NFTImageSlider({ className = '' }: NFTImageSliderProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [realImages, setRealImages] = useState<string[]>([])
  const [currentSrc, setCurrentSrc] = useState('/default.gif')

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

  useEffect(() => {
    if (realImages.length === 0) return
    const timer = setTimeout(() => {
      setCurrentSrc(realImages[0])
    }, 1000)
    return () => clearTimeout(timer)
  }, [realImages])

  useEffect(() => {
    if (realImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((i) => {
        const next = (i + 1) % realImages.length
        setCurrentSrc(realImages[next])
        return next
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [realImages])

  return (
    <div
      className={`aspect-square bg-[#101010] rounded-2xl overflow-hidden shadow-lg relative ${className}`}
    >
      <Image
        src={currentSrc}
        alt="nft"
        fill
        sizes="280px"
        className="object-cover absolute inset-0"
      />
    </div>
  )
}
