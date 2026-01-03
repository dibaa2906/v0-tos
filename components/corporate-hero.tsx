"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Shield } from "lucide-react"
import { useState } from "react"
import { LoginModal } from "@/components/login-modal"

export function CorporateHero() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <>
      <section className="relative overflow-hidden bg-background py-24 sm:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                <Shield className="h-4 w-4" />
                Langkawi Port Sdn Bhd - Intern Portal
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
              Intern Attendance Management System
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty">
              Track your attendance, manage leave applications, and maintain daily work logs all in one place. Streamline your internship experience at Langkawi Port with our comprehensive management platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => setIsLoginOpen(true)} className="h-12 px-8">
                Get Started Free →
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => setIsLoginOpen(true)} className="h-12 px-8">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  )
}
