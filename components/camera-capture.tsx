"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RotateCcw, Check } from "lucide-react"

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose?: () => void
  title?: string
  aspectRatio?: number
}

export function CameraCapture({ onCapture, onClose, title = "Take a photo", aspectRatio = 4 / 3 }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          aspectRatio: aspectRatio
        }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  const switchCamera = () => {
    stopCamera()
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        
        <div className="relative bg-black rounded-lg overflow-hidden">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-auto" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-2 justify-center">
          {capturedImage ? (
            <>
              <Button onClick={retakePhoto} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button onClick={confirmPhoto}>
                <Check className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            </>
          ) : (
            <>
              <Button onClick={switchCamera} variant="outline" size="sm">
                Switch Camera
              </Button>
              <Button onClick={capturePhoto}>
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            </>
          )}
        </div>

        {onClose && (
          <Button onClick={onClose} variant="ghost" className="w-full">
            Close
          </Button>
        )}
      </div>
    </div>
  )
}





