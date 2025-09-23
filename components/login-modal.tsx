"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoginForm } from "@/components/login-form"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <div className="h-4 w-4 rounded-sm bg-background"></div>
            </div>
            <span className="text-xl font-semibold text-foreground">Enterprise</span>
          </div>
          <DialogTitle className="text-2xl">Welcome back</DialogTitle>
          <DialogDescription>Sign in to access your enterprise dashboard</DialogDescription>
        </DialogHeader>
        <LoginForm />
      </DialogContent>
    </Dialog>
  )
}
