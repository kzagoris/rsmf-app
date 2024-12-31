import { useEffect, useRef, useState } from "react"
import {
    FaceDetectionInfo,
    detectBestFace,
    detectFaces,
    disposeFaceDetection,
    setupFaceDetection,
} from "./face-detection"

export const useVideoDetection = (
    stream: MediaStream | null,
    faceDescription: Float32Array | undefined | null,
    options?: {
        matchThreshold?: number
        onMatchFound?: (matchedFace: FaceDetectionInfo) => void
        onMatchNotFound?: () => void
    },
) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [isDetecting, setIsDetecting] = useState(false)
    const [isSetup, setIsSetup] = useState(false)

    const matchThreshold = options?.matchThreshold || 0.6
    const onMatchFound = options?.onMatchFound || (() => {})
    const onMatchNotFound = options?.onMatchNotFound || (() => {})

    useEffect(() => {
        if (!stream) return

        const videoElement = document.createElement("video")
        videoElement.srcObject = stream
        videoElement.play()
        videoRef.current = videoElement
        setIsDetecting(true)

        return () => {
            videoElement.pause()
            videoElement.srcObject = null
            videoRef.current = null
        }
    }, [stream])

    useEffect(() => {
        setupFaceDetection().then(() => {
            console.log("Face detection setup")
            setIsSetup(true)
        })
        return () => {
            disposeFaceDetection()
            setIsSetup(false)
        }
    }, [])

    useEffect(() => {
        if (!videoRef.current || !faceDescription || !isSetup) return
        let timeoutId: NodeJS.Timeout
        const detectFace = async () => {
            if (!isDetecting || !videoRef.current) return
            const detectedFaces = await detectFaces(videoRef.current)
            // console.log("detectedFaces", detectedFaces)
            const detection = await detectBestFace(videoRef.current)
            // console.log("detection", detection)

            if (detection) {
                const distance = detection.descriptor.map((value, i) => Math.abs(value - (faceDescription[i] || 0)))

                const avgDistance = distance.reduce((a, b) => a + b, 0) / distance.length
                // console.log("avgDistance", avgDistance, matchThreshold)

                if (avgDistance <= matchThreshold) {
                    onMatchFound(detection)
                } else {
                    onMatchNotFound()
                }
            } else {
                onMatchNotFound()
            }

            // animationFrameId = requestAnimationFrame(detectFace)
            timeoutId = setTimeout(detectFace, 1000)
        }

        setIsDetecting(true)
        // animationFrameId = requestAnimationFrame(detectFace)
        timeoutId = setTimeout(detectFace, 1000)

        return () => {
            setIsDetecting(false)
            // cancelAnimationFrame(animationFrameId)
            clearTimeout(timeoutId)
        }
    }, [faceDescription, isDetecting, matchThreshold, onMatchFound, onMatchNotFound, isSetup])

    return { videoRef, isDetecting }
}
