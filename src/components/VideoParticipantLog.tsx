import { Box, Button, Grid, Paper, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { FunctionComponent, useEffect, useRef } from "react"
import { useFirestore } from "~/lib/firebase"
import { useMessageSystem } from "~/lib/useMessageSystem"
import { useUserInfo } from "~/lib/useUserManagement"
import { IdCardView } from "./shared/IdCardView"
import LoadingView from "./shared/LoadingView"
import { LoggingCourse } from "~/models/LoggingCourse"
import LogListView from "~/components/LogListView"
import { useTranslation } from "react-i18next"

type Props = {
    stream?: MediaStream | null
    studentId?: string | null
    logEvents: LoggingCourse[]
    onReturn: () => void
    isIdentified: boolean
    onIdentified: (identified: boolean) => Promise<void>
}

export const VideoParticipantLog: FunctionComponent<Props> = ({
    stream,
    isIdentified,
    studentId,
    logEvents,
    onReturn,
    onIdentified,
}) => {
    const firestore = useFirestore()
    const { t } = useTranslation()
    const [userData, userDataLoading, userDataError] = useUserInfo(firestore, studentId ?? null)
    const [, , { setError }] = useMessageSystem()
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        setTimeout(() => {
            if (videoRef.current && stream) {
                videoRef.current.srcObject = stream
            }
        }, 1000)
    }, [stream, videoRef])

    if (userDataError) setError(userDataError.message)
    if (userDataLoading) return <LoadingView />

    const studentName = `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`

    return (
        <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={6}>
                <Typography variant="h4" align="center" sx={{ mt: 3 }}>
                    {studentName}
                </Typography>
            </Grid>
            <Grid
                item
                xs={6}
                container
                alignContent="center"
                justifyContent="center"
                justifyItems="center"
                alignItems="center"
            >
                <Button variant="contained" onClick={onReturn}>
                    {t("Return")}
                </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Paper sx={{ position: "relative" }}>
                    <video
                        autoPlay
                        muted
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                        playsInline
                        ref={videoRef}
                    />
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
                    <IdCardView displayOnly imageIdCard={userData?.idImage?.fullPath} />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <ToggleButtonGroup
                        value={isIdentified}
                        sx={{ width: "100%" }}
                        exclusive
                        onChange={async (e, newValue) => {
                            await onIdentified(newValue)
                            onReturn()
                        }}
                    >
                        <ToggleButton color="success" sx={{ flexGrow: 1 }} value>
                            {t("Identified")}
                        </ToggleButton>
                        <ToggleButton color="error" sx={{ flexGrow: 1 }} value={false}>
                            {t("Not Identified")}
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Box
                    sx={{
                        overflowY: "auto",

                        padding: "1rem",
                    }}
                >
                    <Typography variant="h5" align="center" sx={{ my: 3 }}>
                        {t("Current Course Actions")}
                    </Typography>
                    <LogListView LogList={logEvents} />
                </Box>
            </Grid>
            <Grid item xs={12} sm={6} />
        </Grid>
    )
}
