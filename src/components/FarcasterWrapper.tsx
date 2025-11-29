'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
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

export default function FarcasterWrapper({ children }: FarcasterWrapperProps): JSX.Element {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const checkMiniApp = async () => {  
      try {  
        const inMiniApp = await sdk.isInMiniApp()  
        console.log('Farcaster Mini App?', inMiniApp)
      } catch (err) {  
        console.error('Error detecting Farcaster Mini App:', err)  
      }  
    }  

    checkMiniApp()
  }, [])

  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <FarcasterToastManager>
      {({ onManifestSuccess, onManifestError }) => (
        <>
          <FarcasterManifestSigner  
            onSuccess={onManifestSuccess}  
            onError={onManifestError}  
          />
          {children}
        </>
      )}
    </FarcasterToastManager>
  )
}
