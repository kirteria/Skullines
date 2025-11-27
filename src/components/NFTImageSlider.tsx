'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface NFTImageSliderProps {
  className?: string
}

export function NFTImageSlider({ className = '' }: NFTImageSliderProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    const detectImages = async () => {
      const detected: string[] = []

      for (let i = 1; i <= 100; i++) {
        const imgPath = `/image/nft/${i}.png`

        try {
          const response = await fetch(imgPath, { method: 'HEAD' })
          if (response.ok) detected.push(imgPath)
          else break
        } catch {
          break
        }
      }

      if (detected.length > 0) {
        setImages(['/default.png', ...detected])
      } else {
        setImages(['/default.png'])
      }
    }

    detectImages()
  }, [])

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div
      className={`aspect-square bg-[#101010] rounded-2xl overflow-hidden shadow-lg relative ${className}`}
    >
      {images.map((img, index) => (
        <div
          key={img + index}
          className={`absolute inset-0 transition-transform duration-500 ${
            index === currentIndex ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <Image
            src={img}
            alt=""
            fill
            className="object-cover"
            sizes="280px"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  )
}
