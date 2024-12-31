import { useEffect, useMemo, useRef, useState } from "react"

const MAX_RECORDING_TIME = 1000 * 60 * 10 // 10 minute
const MIN_RECORDING_TIME = 1000 * 5 // 5 seconds
export const useVideoRecordingManagement = (
    stream: MediaStream | null,
    storageFunction: (video: Blob, filename: string, contentType: string) => Promise<void>,
) => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const recordedBlobsRef = useRef<Blob[]>([])
    const recordingStartTimeRef = useRef<number | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isRecording) return
            const recordingDuration = Date.now() - (recordingStartTimeRef.current ?? Date.now())
            if (recordingDuration > MAX_RECORDING_TIME) {
                stopRecording()
            }
        })
        return () => clearInterval(interval)
    }, [])

    const mimeType = useMemo(() => {
        const possibleTypes = [
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=h264,opus",
            "video/mp4;codecs=h264,aac",
            "video/webm;codecs=vp8,opus",
        ]
        const supported = possibleTypes.filter((mimeType) => {
            return MediaRecorder.isTypeSupported(mimeType)
        })
        return (supported[0] ?? null)?.split(";", 1)[0] ?? null
    }, [MediaRecorder])

    const handleDataAvailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
            recordedBlobsRef.current.push(event.data)
        }
    }

    const startRecording = () => {
        if (!mimeType) {
            setErrorMsg("No supported mimeType found")
            return
        }

        if (!stream) {
            setErrorMsg("No stream found")
            return
        }
        if (isRecording) {
            console.info("Already recording")
            return
        }

        const options = { mimeType, videoBitsPerSecond: 500_000 }

        try {
            const recorder = new MediaRecorder(stream, options)
            setIsRecording(true)

            recorder.onstop = (event) => {
                mediaRecorderRef.current = null
                const recordingDuration = Date.now() - (recordingStartTimeRef.current ?? Date.now())
                console.info("recording duration", recordingDuration)
                if (recordingDuration < MIN_RECORDING_TIME) {
                    console.info("Recording too short", recordingDuration)
                    setIsRecording(false)
                    recordedBlobsRef.current = []
                    return
                }

                storageFunction(getRecord(), `rec_${Date.now()}.webm`, mimeType).then(() => {
                    setIsRecording(false)
                    recordedBlobsRef.current = []
                })
            }
            recorder.ondataavailable = handleDataAvailable
            recorder.start()
            mediaRecorderRef.current = recorder
            recordingStartTimeRef.current = Date.now()
        } catch (e) {
            console.error("Exception while creating MediaRecorder:", e)
            setErrorMsg(`Exception while creating MediaRecorder: ${JSON.stringify(e)}`)
            setIsRecording(false)
        }
    }

    const stopRecording = () => {
        if (!mediaRecorderRef.current) return
        mediaRecorderRef.current.stop()
    }

    const getRecord = () => new Blob(recordedBlobsRef.current, { type: mimeType })

    const downloadRecord = () => {
        const url = window.URL.createObjectURL(getRecord())
        const downloadLink = document.createElement("a")
        downloadLink.href = url
        downloadLink.download = "recording.webm"
        downloadLink.click()
        window.URL.revokeObjectURL(url)
    }

    return {
        startRecording,
        stopRecording,
        isRecording,
        errorMsg,
    }
}
