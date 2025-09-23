"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { CorporateHero } from "@/components/corporate-hero"
import { CorporateHeader } from "@/components/corporate-header"
import { CorporateFeatures } from "@/components/corporate-features"
import { CorporateStats } from "@/components/corporate-stats"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <CorporateHeader />
      <main>
        <CorporateHero />
        <CorporateStats />
        <CorporateFeatures />
      </main>
    </div>
  )
}
