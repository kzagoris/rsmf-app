import {
    detectAllFaces,
    detectSingleFace,
    draw,
    FaceLandmarks68,
    matchDimensions,
    nets,
    resizeResults,
    SsdMobilenetv1Options,
    TinyFaceDetectorOptions,
    WithFaceDescriptor,
    WithFaceLandmarks,
} from "face-api.js"
import { FaceDetection } from "face-api.js/build/commonjs/classes/FaceDetection"

export type FaceDetectionInfo = WithFaceDescriptor<WithFaceLandmarks<{ detection: FaceDetection }, FaceLandmarks68>>

const FACE_DETECTOR_OPTIONS: "SSD_MOBILE_NET_V1" | "TINY_FACE_DETECTOR" = "TINY_FACE_DETECTOR"
export const setupFaceDetection = async () => {
    FACE_DETECTOR_OPTIONS === "TINY_FACE_DETECTOR"
        ? await nets.tinyFaceDetector.loadFromUri("/models")
        : await nets.ssdMobilenetv1.loadFromUri("/models")
    await nets.faceLandmark68TinyNet.loadFromUri("/models")
    await nets.faceRecognitionNet.loadFromUri("/models")
}

export const disposeFaceDetection = () => {
    try {
        nets.tinyFaceDetector.dispose()
        nets.ssdMobilenetv1.dispose()
    } catch (e) {
        console.error("Face detection already disposed")
    }
}

export const detectBestFace = async (
    image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
): Promise<FaceDetectionInfo | undefined> => {
    const options =
        FACE_DETECTOR_OPTIONS === "TINY_FACE_DETECTOR"
            ? new TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 })
            : new SsdMobilenetv1Options({ minConfidence: 0.5 })
    return detectSingleFace(image, options).withFaceLandmarks(true).withFaceDescriptor()
}

// detect of the faces in the image
export const detectFaces = async (image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) => {
    const options =
        FACE_DETECTOR_OPTIONS === "TINY_FACE_DETECTOR"
            ? new TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.1 })
            : new SsdMobilenetv1Options({ minConfidence: 0.1 })
    return detectAllFaces(image, options)
}

export const drawFaces = (canvas: HTMLCanvasElement, img: HTMLImageElement, faces: FaceDetection[]) => {
    matchDimensions(canvas, img)
    const context = canvas.getContext("2d")
    if (!context) return
    context.drawImage(img, 0, 0, img.width, img.height)
    draw.drawDetections(canvas, resizeResults(faces, img))
}
