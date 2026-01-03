import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/toaster"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Intern Attendance System - Langkawi Port",
  description: "Intern attendance and volume log management system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          {children}
          <Toaster />
        </Suspense>
      </body>
    </html>
  )
}
