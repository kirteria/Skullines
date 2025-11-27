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
          const head = await fetch(imgPath, { method: 'HEAD' })
          if (head.ok) detected.push(imgPath)
          else break
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
    const timer = setTimeout(() => setShowDefault(false), 3000)
    return () => clearTimeout(timer)
  }, [realImages])

  useEffect(() => {
    if (showDefault || realImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % realImages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [showDefault, realImages])

  return (
    <div
      className={`aspect-square bg-[#101010] rounded-2xl overflow-hidden shadow-lg relative ${className}`}
    >
      {showDefault && (
        <div className="absolute inset-0 animate-glitch">
          <Image
            src="/default.gif"
            alt=""
            fill
            className="object-cover"
            sizes="280px"
          />
        </div>
      )}

      {realImages.map((img, index) => (
        <div
          key={img}
          className={`absolute inset-0 transition-opacity duration-500 ${
            !showDefault && index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={img}
            alt=""
            fill
            className="object-cover"
            sizes="280px"
          />
        </div>
      ))}
    </div>
  )
}
