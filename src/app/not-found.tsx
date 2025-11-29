'use client'

import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#101010' }}
    >
      <div className="max-w-sm w-full flex flex-col items-center text-center space-y-4">
        <div className="w-[250px] h-[250px] rounded-2xl overflow-hidden shadow-lg">
          <img src="/skull.png" alt="Logo" className="w-full h-full object-cover" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {process.env.NEXT_PUBLIC_NFT_NAME}
          </h1>
          <p className="text-sm sm:text-base text-white">
            Born on Base - forever on the Blockchain
          </p>
        </div>

        <Button
          onClick={() => window.location.href = process.env.NEXT_PUBLIC_FARCASTER_APP_URL!}
          className="px-6 py-5 text-base sm:text-lg rounded-full shadow-lg w-full"
          style={{
            backgroundColor: '#6A3CFF',
            border: '1px solid #5631CF',
            color: '#FFFFFF'
          }}
        >
          Visit Farcaster
        </Button>

        <p className="text-xs sm:text-sm text-white">
          You need Farcaster client to access this mini app
        </p>
      </div>
    </div>
  )
}
