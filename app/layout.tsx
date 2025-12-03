import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "sonner"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Langkawi Port Sdn Bhd - Intern Portal",
  description: "Intern attendance and management system for Langkawi Port Sdn Bhd",
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
          <Toaster 
            toastOptions={{
              classNames: {
                error: 'error-toast',
              },
            }}
          />
        </Suspense>
      </body>
    </html>
  )
}
