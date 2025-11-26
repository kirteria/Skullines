'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { sdk } from '@farcaster/miniapp-sdk'

const FarcasterToastManager = dynamic(() => import('./FarcasterToastManager'), { ssr: false, loading: () => null })
const FarcasterManifestSigner = dynamic(() => import('./FarcasterManifestSigner'), { ssr: false, loading: () => null })

interface FarcasterWrapperProps {
  children: React.ReactNode
}

export default function FarcasterWrapper({ children }: FarcasterWrapperProps): JSX.Element {
  const [sdkReady, setSdkReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const detectMiniApp = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp()
        if (inMiniApp && window.location.pathname !== '/mint') {
          router.replace('/mint')
        } else {
          setSdkReady(true)
        }
      } catch {
        setSdkReady(true)
      }
    }

    timeout = setTimeout(() => setSdkReady(true), 3000)

    detectMiniApp()

    return () => clearTimeout(timeout)
  }, [router])

  if (!sdkReady) {
    return <div className="min-h-screen" />
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
