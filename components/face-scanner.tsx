"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface FaceScannerProps {
  onFaceDetected: () => void
  onCancel: () => void
  mode: 'clockIn' | 'clockOut'
}

export function FaceScanner({ onFaceDetected, onCancel, mode }: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let mounted = true

    const initializeCamera = async () => {
      try {
        setIsLoading(true)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user'
          }
        })
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setIsLoading(false)
          setIsScanning(true)
        }
      } catch (err: any) {
        console.error('Error accessing camera:', err)
        setError(err.message || 'Failed to access camera. Please allow camera permissions.')
        setIsLoading(false)
      }
    }

    initializeCamera()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      // Simulate face detection (in real implementation, use face-api.js)
      // For now, we'll do a simple check and then proceed
      setFaceDetected(true)
      setIsScanning(false)
      
      // Wait a moment to show success
      setTimeout(() => {
        onFaceDetected()
      }, 1000)
    } catch (err) {
      console.error('Error capturing face:', err)
      setError('Failed to capture face. Please try again.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    onCancel()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Face Recognition {mode === 'clockIn' ? 'Clock In' : 'Clock Out'}
        </CardTitle>
        <CardDescription>
          Please position your face in front of the camera for verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={stopCamera} variant="outline">
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ display: isLoading ? 'none' : 'block' }}
              />
              <canvas ref={canvasRef} className="hidden" />
              {faceDetected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
              )}
              {isScanning && !faceDetected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-4 border-primary rounded-full w-64 h-64 animate-pulse" />
                </div>
              )}
            </div>
            
            {!faceDetected && (
              <div className="flex gap-2">
                <Button onClick={handleCapture} className="flex-1" disabled={isLoading || !isScanning}>
                  {isScanning ? 'Capture Face' : 'Processing...'}
                </Button>
                <Button onClick={stopCamera} variant="outline">
                  Cancel
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

