import { Box, Button, Stack, Step, StepLabel, Stepper, Typography } from "@mui/material"
import { FunctionComponent, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useUserContext } from "~/components/contexts/UserContext"
import { FaceDetectionPhoto } from "~/components/identification/FaceDetectionPhoto"
import { FaceScreenshot } from "~/components/identification/FaceScreenshot"
import { PersonalInfo } from "~/components/identification/PersonalInfo"
import { UploadIDCard } from "~/components/identification/UploadIDCard"
import ErrorView from "~/components/shared/ErrorView"
import LoadingView from "~/components/shared/LoadingView"
import { FaceDetectionInfo } from "~/lib/face-detection"
import { useFirestore, useStorage } from "~/lib/firebase"
import { useMessageSystem } from "~/lib/useMessageSystem"
import { useUserInfo, useUserManagement } from "~/lib/useUserManagement"
import { DescriptorInfoType, ImageIdType, User } from "~/models/User"

type Props = {}

const studentSteps = ["Personal Information", "Face Data", "Identification Data"]
const proctorSteps = ["Personal Information"]

type FaceStepStatus = "ACQUIRE" | "DETECT" | "COMPLETED"

const IdentificationSteps: FunctionComponent<Props> = ({}) => {
    const [activeStep, setActiveStep] = useState(0)
    const [faceStepStatus, setFaceStepStatus] = useState<FaceStepStatus>("ACQUIRE")
    const [faceImage, setFaceImage] = useState<string | null>(null)
    const [, , { setError, setSuccess, setInfo }] = useMessageSystem()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const firestore = useFirestore()
    const storage = useStorage()

    const { state } = useUserContext()
    const userId = state?.currentUser?.uid ?? null
    const [userData, loadingUserData, userDataError] = useUserInfo(firestore, state?.currentUser?.uid ?? null)
    const { updateName, updateFaceDescriptor, updateIdImage } = useUserManagement(firestore)
    const steps = userData && userData.role === "student" ? studentSteps : proctorSteps

    const getScreenshot = (imageSrc: string) => {
        setFaceImage(imageSrc)
        setFaceStepStatus("DETECT")
    }

    const getIdCard = async (imageId: ImageIdType) => {
        if (!userId) {
            setError(t("User ID is undefined"))
            return
        }
        try {
            if (!imageId.fullPath.startsWith("data:image/")) {
                setInfo(t("Keeping previous ID card image"))
                return navigate("/profile")
            }
            await updateIdImage(storage, userId, imageId.fullPath, imageId.extension)
            setSuccess(t("ID card image updated"))
            navigate("/profile")
        } catch (error) {
            setError((error as Error).message)
        }
    }
    const detectionFeedback = async (face: FaceDetectionInfo | null | undefined) => {
        if (!userId) {
            setError(t("User ID is undefined"))
            return
        }
        if (face) {
            try {
                await updateFaceDescriptor(userId, {
                    descriptor: face.descriptor,
                    image: {
                        width: face.detection.imageWidth,
                        height: face.detection.imageHeight,
                    },
                } satisfies DescriptorInfoType)
                setFaceStepStatus("COMPLETED")
                setSuccess(t("Face data updated"))
                setActiveStep(activeStep + 1)
            } catch (error) {
                setError((error as Error).message)
            }
            return
        }

        setFaceStepStatus("ACQUIRE")
    }

    const handlePersonInfoSubmit = async (user: User): Promise<void> => {
        if (user.id === undefined) {
            setError(t("User ID is undefined"))
            return
        }

        if (!user.firstName || !user.lastName || user.firstName === "" || user.lastName === "") {
            setError(t("First name and last name are required"))
            return
        }

        try {
            await updateName(user.id, user.firstName, user.lastName)
            if (userData?.role !== "student") {
                navigate("/profile")
            }
            setSuccess(t("Personal information updated"))
            setActiveStep(activeStep + 1)
        } catch (error) {
            setError((error as Error).message)
        }
    }

    if (state.state !== "SIGNED_IN") return <ErrorView message={t("You must be signed in to access this page")} />
    if (userDataError) return <ErrorView message={userDataError.message} />
    if (loadingUserData) return <LoadingView />

    return (
        <Stack marginTop="2em" width="100%" spacing={2}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{t(label)}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Typography variant="h4" component="h1" align="center">
                {t(steps[activeStep])}
            </Typography>
            <Typography variant="h6" component="h2" align="center">
                {activeStep === 0 && t("Please enter your personal information")}
                {activeStep === 1 && t("Please look to the camera and press the 'CAPTURE PHOTO' button")}
                {activeStep === 2 && t("Please upload a photo of your ID card")}
            </Typography>
            <Box sx={{ minHeight: "60vh" }}>
                {activeStep === 0 && <PersonalInfo user={userData ?? null} onSubmit={handlePersonInfoSubmit} />}
                {activeStep === 1 &&
                    ((faceStepStatus === "ACQUIRE" && <FaceScreenshot getScreenshot={getScreenshot} />) ||
                        (faceStepStatus === "DETECT" && (
                            <FaceDetectionPhoto imgData={faceImage} feedback={detectionFeedback} />
                        )))}
                {activeStep === 2 && <UploadIDCard currentIdImage={userData?.idImage ?? null} getIdImage={getIdCard} />}
            </Box>
            <Box sx={{ display: "flex", marginTop: "2em" }}>
                <Button
                    sx={{ px: "4em", mx: "4em" }}
                    variant="contained"
                    onClick={() => setActiveStep(activeStep - 1)}
                    disabled={activeStep === 0}
                >
                    {t("Back")}
                </Button>
                <Box sx={{ flexGrow: 1 }} />
            </Box>
        </Stack>
    )
}

export { IdentificationSteps as default }
