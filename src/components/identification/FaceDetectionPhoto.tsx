import { Button, Container, Stack } from "@mui/material"
import { createRef, FunctionComponent, useEffect, useState } from "react"
import {
    detectBestFace,
    disposeFaceDetection,
    drawFaces,
    FaceDetectionInfo,
    setupFaceDetection,
} from "~/lib/face-detection"
import { useTranslation } from "react-i18next"

type Props = {
    imgData: string | null
    feedback: (faceInfo: FaceDetectionInfo | undefined | null) => void
}

const FaceDetectionPhoto: FunctionComponent<Props> = ({ imgData, feedback }) => {
    if (!imgData) feedback(null)
    const faceImageRef = createRef<HTMLImageElement>()
    const faceCanvasRef = createRef<HTMLCanvasElement>()
    const [faceDetect, setFaceDetect] = useState<FaceDetectionInfo | null>(null)
    const [loading, setLoading] = useState(false)
    const { t } = useTranslation()

    useEffect(() => {
        const faceImage = faceImageRef.current
        if (faceDetect) return
        if (!faceImage) return
        setLoading(true)
        setupFaceDetection()
            .then((faceDetection) => detectBestFace(faceImage))
            .then((face) => {
                if (!faceCanvasRef.current || !face) return

                drawFaces(faceCanvasRef.current, faceImage, [face.detection])
                setFaceDetect(face)
                setLoading(false)
            })
        return () => {
            disposeFaceDetection()
        }
    }, [faceImageRef])

    return imgData ? (
        <Container maxWidth="sm">
            <Stack spacing={1}>
                <img
                    style={{ display: faceDetect ? "none" : "block" }}
                    ref={faceImageRef}
                    src={imgData}
                    alt="Face Image"
                />
                <canvas style={{ display: faceDetect ? "block" : "none" }} ref={faceCanvasRef} />
                {!loading && (
                    <Stack direction="row" spacing={2} justifyContent="space-between">
                        <Button
                            sx={{ minWidth: "250px" }}
                            variant="contained"
                            color="warning"
                            onClick={() => feedback(null)}
                        >
                            {t("Try Again")}
                        </Button>
                        <Button
                            sx={{ minWidth: "250px" }}
                            variant="contained"
                            color="secondary"
                            onClick={() => feedback(faceDetect)}
                        >
                            {t("Confirm")}
                        </Button>
                    </Stack>
                )}
            </Stack>
        </Container>
    ) : (
        <div>{t("no image")}</div>
    )
}
export { FaceDetectionPhoto }
