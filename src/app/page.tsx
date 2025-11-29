"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { sdk } from "@farcaster/miniapp-sdk"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const redirect = async () => {
      try {
        if (document.readyState !== "complete") {
          await new Promise<void>((resolve) => {
            window.addEventListener("load", () => resolve(), { once: true })
          })
        }
        await sdk.actions.ready()
        router.replace("/mint")
      } catch (err) {
        console.error("Redirect failed", err)
        router.replace("/mint")
      }
    }

    redirect()
  }, [router])

  return null
}
