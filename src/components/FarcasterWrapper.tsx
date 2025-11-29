"use client"

import type React from "react"

import { useEffect, useState } from "react"
import FarcasterToastManager from "./FarcasterToastManager"
import FarcasterManifestSigner from "./FarcasterManifestSigner"

interface FarcasterWrapperProps {
  children: React.ReactNode
}

export default function FarcasterWrapper({ children }: FarcasterWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <FarcasterToastManager>
      {({ onManifestSuccess, onManifestError }) => (
        <>
          <FarcasterManifestSigner onSuccess={onManifestSuccess} onError={onManifestError} />
          {children}
        </>
      )}
    </FarcasterToastManager>
  )
}
