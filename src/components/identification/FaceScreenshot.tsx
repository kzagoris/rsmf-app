import { FunctionComponent, useCallback, useRef } from "react"
import { Button, Container, Stack } from "@mui/material"
import Webcam from "react-webcam"
import { useTranslation } from "react-i18next"

type Props = { getScreenshot: (getScreenshot: string) => void }

const FaceScreenshot: FunctionComponent<Props> = ({ getScreenshot }) => {
    const { t } = useTranslation()
    const webcamRef = useRef<Webcam>(null)
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (!imageSrc) {
            console.error("cannot take an image from camera")
            return
        }
        getScreenshot(imageSrc)
    }, [webcamRef])

    return (
        <Container maxWidth="sm">
            <Stack>
                <Webcam ref={webcamRef} screenshotFormat="image/png" videoConstraints={{ facingMode: "user" }} />
                <Button variant="contained" onClick={capture}>
                    {t("capture_photo")}
                </Button>
            </Stack>
        </Container>
    )
}

export { FaceScreenshot }
