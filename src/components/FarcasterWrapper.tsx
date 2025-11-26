'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { sdk } from '@farcaster/miniapp-sdk'

const FarcasterToastManager = dynamic(() => import('./FarcasterToastManager'), {
  ssr: false,
  loading: () => null
})

const FarcasterManifestSigner = dynamic(() => import('./FarcasterManifestSigner'), {
  ssr: false,
  loading: () => null
})

interface FarcasterWrapperProps {
  children: React.ReactNode
}

export default function FarcasterWrapper({ children }: FarcasterWrapperProps) {
  const [sdkChecked, setSdkChecked] = useState(false)
  const [inMiniApp, setInMiniApp] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMiniApp = async () => {
      try {
        const detected = await sdk.isInMiniApp()
        setInMiniApp(detected)
      } catch {
        setInMiniApp(false)
      } finally {
        setSdkChecked(true)
      }
    }

    checkMiniApp()
  }, [])

  useEffect(() => {
    if (sdkChecked && inMiniApp && window.location.pathname !== '/mint') {
      router.replace('/mint')
    }
  }, [sdkChecked, inMiniApp, router])

  if (!sdkChecked) {
    return <div className="min-h-screen" style={{ backgroundColor: '#AA8AFB' }} />
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
