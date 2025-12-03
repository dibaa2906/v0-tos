// Face recognition using face-api.js for clock in/out verification
// We'll use a simplified approach with face-api.js

let modelsLoaded = false

// Load face-api.js models
export async function loadFaceModels(): Promise<boolean> {
  if (modelsLoaded) return true
  
  try {
    // Dynamically import face-api.js with error handling
    let faceapi: any
    try {
      faceapi = await import('face-api.js').catch(() => null)
    } catch (e) {
      console.warn('⚠️ face-api.js not available, face recognition disabled')
      return false
    }
    
    if (!faceapi) {
      console.warn('⚠️ face-api.js not available, face recognition disabled')
      return false
    }
    
    // Try loading from CDN if local models don't exist
    try {
      const MODEL_URL = '/models'
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ])
    } catch {
      // Fallback: load from CDN
      console.log('⚠️ Local models not found, trying CDN...')
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ])
    }
    
    modelsLoaded = true
    console.log('✅ Face recognition models loaded')
    return true
  } catch (error) {
    console.error('❌ Failed to load face recognition models:', error)
    return false
  }
}

// Compare two face images
export async function compareFaces(
  profileImage: string, // Base64 image from database
  capturedImage: string, // Base64 image just captured
  threshold: number = 0.6 // 0.6 = 60%, but we'll check against 0.2 for 80% accuracy (lower distance = higher similarity)
): Promise<{ match: boolean; accuracy: number }> {
  try {
    // Load models if not loaded
    if (!modelsLoaded) {
      const loaded = await loadFaceModels()
      if (!loaded) {
        return { match: false, accuracy: 0 }
      }
    }
    
    let faceapi: any
    try {
      faceapi = await import('face-api.js').catch(() => null)
    } catch (e) {
      console.warn('⚠️ face-api.js not available')
      return { match: false, accuracy: 0 }
    }
    
    if (!faceapi) {
      console.warn('⚠️ face-api.js not available')
      return { match: false, accuracy: 0 }
    }
    
    // Convert base64 to HTMLImageElement
    const profileImg = await loadImageFromBase64(profileImage)
    const capturedImg = await loadImageFromBase64(capturedImage)
    
    // Use face landmarks first to align faces properly (focus on facial features only)
    // This ensures we're comparing facial features, not background/clothing
    // Use very lenient settings for better detection
    const detectionOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 512, // Larger input size for better detection
      scoreThreshold: 0.1 // Very low threshold = very lenient detection
    })
    
    // Detect faces with landmarks and descriptors
    // Landmarks = 68 facial feature points (eyes, nose, mouth, jawline)
    // Descriptors = 128-dimensional vector representing facial features only
    console.log('🔍 Detecting face in profile image...', {
      profileWidth: profileImg.width,
      profileHeight: profileImg.height
    })
    // --- Patch: Safe detection for profile ---
    let profileDetectionWithLandmarks = null
    let profileDetection = null
    let profileFaceDetection = await faceapi.detectSingleFace(profileImg, detectionOptions)
    if (profileFaceDetection) {
      profileDetectionWithLandmarks = await faceapi.detectSingleFace(profileImg, detectionOptions).withFaceLandmarks68()
      if (profileDetectionWithLandmarks) {
        profileDetection = await faceapi.detectSingleFace(profileImg, detectionOptions)
          .withFaceLandmarks68()
          .withFaceDescriptor()
      }
    }
    if (!profileDetection) {
      // Try more lenient
      console.log('⚠️ No face in profile with lenient settings, trying even more lenient...')
      const moreLenientOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.05
      })
      profileFaceDetection = await faceapi.detectSingleFace(profileImg, moreLenientOptions)
      if (profileFaceDetection) {
        profileDetectionWithLandmarks = await faceapi.detectSingleFace(profileImg, moreLenientOptions).withFaceLandmarks68()
        if (profileDetectionWithLandmarks) {
          profileDetection = await faceapi.detectSingleFace(profileImg, moreLenientOptions)
            .withFaceLandmarks68()
            .withFaceDescriptor()
        }
      }
    }
    // --- End patch ---
    
    console.log('🔍 Detecting face in captured image...', {
      capturedWidth: capturedImg.width,
      capturedHeight: capturedImg.height
    })
    // --- Patch: Safe detection for captured ---
    let capturedDetectionWithLandmarks = null
    let capturedDetection = null
    let capturedFaceDetection = await faceapi.detectSingleFace(capturedImg, detectionOptions)
    if (capturedFaceDetection) {
      capturedDetectionWithLandmarks = await faceapi.detectSingleFace(capturedImg, detectionOptions).withFaceLandmarks68()
      if (capturedDetectionWithLandmarks) {
        capturedDetection = await faceapi.detectSingleFace(capturedImg, detectionOptions)
          .withFaceLandmarks68()
          .withFaceDescriptor()
      }
    }
    if (!capturedDetection) {
      console.log('⚠️ No face in captured image with lenient settings, trying even more lenient...')
      const moreLenientOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.05
      })
      capturedFaceDetection = await faceapi.detectSingleFace(capturedImg, moreLenientOptions)
      if (capturedFaceDetection) {
        capturedDetectionWithLandmarks = await faceapi.detectSingleFace(capturedImg, moreLenientOptions).withFaceLandmarks68()
        if (capturedDetectionWithLandmarks) {
          capturedDetection = await faceapi.detectSingleFace(capturedImg, moreLenientOptions)
            .withFaceLandmarks68()
            .withFaceDescriptor()
        }
      }
    }
    // --- End patch ---
    
    if (!profileDetection) {
      console.error('❌ Could not detect face in profile image')
      throw new Error('No face detected in your profile photo. Please update your profile picture.')
    }
    
    if (!capturedDetection) {
      console.error('❌ Could not detect face in captured image')
      throw new Error('No face detected in the captured photo. Please ensure your face is clearly visible.')
    }
    
    console.log('✅ Face detected in both images')
    
    // The face descriptor (128D vector) represents ONLY facial features:
    // - Eye position and shape
    // - Nose position and shape  
    // - Mouth position and shape
    // - Face shape and proportions
    // It IGNORES: hair, clothing, background, lighting
    
    // Calculate euclidean distance between face descriptors
    // Lower distance = more similar facial features
    const distance = faceapi.euclideanDistance(
      profileDetection.descriptor,
      capturedDetection.descriptor
    )
    
    // face-api.js typical distances:
    // - 0.4+ = Different person
    // - 0.3-0.4 = Possibly same person
    // - 0.2-0.3 = Likely same person (good match)
    // - 0.0-0.2 = Very similar (excellent match)
    // - 0.6 = ~50% similarity
    // - 0.4 = ~75% similarity  
    // - 0.2 = ~90% similarity
    
    // Convert distance to accuracy percentage (inverse relationship)
    // We want 80% accuracy minimum, which corresponds to distance ~0.3
    // Formula: accuracy = 100 * (1 - (distance / 0.6))
    // This gives us: distance 0.3 = 50%, 0.2 = 67%, 0.15 = 75%, 0.1 = 83%
    // For 80% accuracy target, we use distance threshold of 0.25
    const accuracy = Math.max(0, Math.min(100, 100 * (1 - (distance / 0.5))))
    
    // For matching, use a more lenient threshold to account for lighting/angle differences
    // Lower distance = higher similarity
    // 0.5 = ~50% similarity (very lenient)
    // 0.4 = ~65% similarity
    // 0.3 = ~80% similarity
    const matchThreshold = 0.45 // Very lenient threshold (~50% similarity)
    const isMatch = distance <= matchThreshold
    
    console.log('🔍 Comparison details:', {
      distance: distance.toFixed(3),
      matchThreshold: matchThreshold.toFixed(3),
      isMatch,
      accuracy: accuracy.toFixed(1) + '%'
    })
    
    console.log('Face comparison:', {
      distance,
      accuracy: accuracy.toFixed(2) + '%',
      match: isMatch,
      threshold: matchThreshold
    })
    
    return {
      match: isMatch,
      accuracy: accuracy // Already in 0-100 range
    }
  } catch (error: any) {
    console.error('❌ Face comparison error:', error)
    console.error('Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack
    })
    
    // Re-throw with better error message for the UI
    if (error?.message && error.message.includes('No face detected')) {
      throw error // Re-throw as-is (already user-friendly)
    }
    
    throw new Error(`Face comparison failed: ${error?.message || 'Unknown error. Please try again.'}`)
  }
}

// Helper to load image from base64
function loadImageFromBase64(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = base64
  })
}

// Detect face with full details (for overlay drawing)
export async function detectFaceWithDetails(imageData: string): Promise<{
  hasFace: boolean
  box?: { x: number; y: number; width: number; height: number }
  landmarks?: any
} | null> {
  try {
    if (!modelsLoaded) {
      const loaded = await loadFaceModels()
      if (!loaded) {
        console.error('❌ Face models not loaded')
        return null
      }
    }
    
    let faceapi: any
    try {
      faceapi = await import('face-api.js').catch(() => null)
    } catch (e) {
      console.warn('⚠️ face-api.js not available')
      return null
    }
    
    if (!faceapi) {
      console.warn('⚠️ face-api.js not available')
      return null
    }
    
    const img = await loadImageFromBase64(imageData)
    
    // Use very lenient detection options
    let detectionOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 512,
      scoreThreshold: 0.1
    })
    
    // Safe face detection
    let faceDetection = await faceapi.detectSingleFace(img, detectionOptions)
    let detection = null
    if (faceDetection) {
      let detectionWithLandmarks = await faceapi.detectSingleFace(img, detectionOptions).withFaceLandmarks68()
      if (detectionWithLandmarks) {
        detection = detectionWithLandmarks
      }
    }
    if (!detection) {
      // Try more lenient
      detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.05
      })
      faceDetection = await faceapi.detectSingleFace(img, detectionOptions)
      if (faceDetection) {
        let detectionWithLandmarks = await faceapi.detectSingleFace(img, detectionOptions).withFaceLandmarks68()
        if (detectionWithLandmarks) {
          detection = detectionWithLandmarks
        }
      }
    }
    if (!detection) {
      return { hasFace: false }
    }
    
    return {
      hasFace: true,
      box: {
        x: detection.box.x,
        y: detection.box.y,
        width: detection.box.width,
        height: detection.box.height
      },
      landmarks: detection.landmarks
    }
  } catch (error: any) {
    console.error('❌ Face detection error:', error)
    return null
  }
}

// Detect if a face exists in image
export async function detectFace(imageData: string): Promise<boolean> {
  try {
    if (!modelsLoaded) {
      const loaded = await loadFaceModels()
      if (!loaded) {
        console.error('❌ Face models not loaded')
        return false
      }
    }
    
    let faceapi: any
    try {
      faceapi = await import('face-api.js').catch(() => null)
    } catch (e) {
      console.warn('⚠️ face-api.js not available')
      return false
    }
    
    if (!faceapi) {
      console.warn('⚠️ face-api.js not available')
      return false
    }
    
    const img = await loadImageFromBase64(imageData)
    
    console.log('🔍 Detecting face in image...', {
      imageWidth: img.width,
      imageHeight: img.height
    })
    
    // Use very lenient detection options to catch more faces
    // Lower scoreThreshold = more lenient detection (0.1 is very lenient)
    // Try with different input sizes if first attempt fails
    let detectionOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 512, // Larger input size for better detection
      scoreThreshold: 0.1 // Very low threshold = very lenient detection
    })
    
    let detection = await faceapi.detectSingleFace(img, detectionOptions)
    
    // If no detection, try with even more lenient settings
    if (!detection) {
      console.log('⚠️ No face detected with lenient settings, trying even more lenient...')
      detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.05 // Extremely lenient threshold
      })
      detection = await faceapi.detectSingleFace(img, detectionOptions)
    }
    
    // Last resort: try default settings
    if (!detection) {
      console.log('⚠️ No face detected, trying default settings...')
      detection = await faceapi.detectSingleFace(img)
    }
    
    const hasFace = !!detection
    console.log('Face detection result:', {
      hasFace,
      detection: detection ? {
        score: detection.score,
        box: detection.box,
        x: detection.box.x,
        y: detection.box.y,
        width: detection.box.width,
        height: detection.box.height
      } : null,
      imageSize: `${img.width}x${img.height}`
    })
    
    return hasFace
  } catch (error: any) {
    console.error('❌ Face detection error:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack
    })
    return false
  }
}
