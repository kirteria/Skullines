"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/mint")   // ← this ALWAYS works in Farcaster
  }, [])

  return null
}
