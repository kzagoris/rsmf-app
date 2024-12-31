import { Box, Divider, Drawer, Grid, Paper, Stack, Typography } from "@mui/material"
import { MediaConnection } from "peerjs"
import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react"
// eslint-disable-next-line camelcase
import { unstable_usePrompt, useParams } from "react-router-dom"
import Webcam from "react-webcam"
import { VideoParticipantLog } from "~/components/VideoParticipantLog"
import { useUserContext } from "~/components/contexts/UserContext"
import ErrorView from "~/components/shared/ErrorView"
import LoadingView from "~/components/shared/LoadingView"
import { MicCameraToggleComponent } from "~/components/shared/MicCameraToggleComponent"
import { useFirestore, useStorage } from "~/lib/firebase"
import { useCourseManagement } from "~/lib/useCourseManagement"
import { useExamLogging } from "~/lib/useExamLogging"
import { useUserInfo } from "~/lib/useUserManagement"
import { useVideoCall } from "~/lib/useVideoCall"
import { useVideoDetection } from "~/lib/useVideoDetection"
import { UserRoleType } from "~/models/User"
import { useTranslation } from "react-i18next"
import { useVideoRecordingManagement } from "~/lib/useVideoRecordingManagement"
import { DrawerHeader } from "~/components/shared/Drawer"
import LogListView from "~/components/LogListView"

type Props = {}

export type RemoteStreamType = {
    id: string
    stream: MediaStream
    role: UserRoleType
    mediaConnection?: MediaConnection | null
}

const VideoExamView: FunctionComponent<Props> = ({}) => {
    const firestore = useFirestore()
    const storage = useStorage()
    const { state } = useUserContext()
    const { t } = useTranslation()
    const { courseId } = useParams()
    const userId = state?.currentUser?.uid ?? null
    const { getCourseProctors, getCourseStudents } = useCourseManagement(firestore)
    const [userData, loadingUserData, userDataError] = useUserInfo(firestore, userId)
    const {
        setCameraStatus,
        setMicStatus,
        setHighlighted,
        setIdentified,
        useLoggingStatus,
        useLoggingStatusParticipants,
        addExamLoggingVideoEvent,
        addExamLoggingEvent,
        useExamLoggingPerCourse,
    } = useExamLogging(firestore, storage)

    const [proctors, loadingProctors, errorProctors] = getCourseProctors(courseId)
    const [students, loadingStudents, errorStudents] = getCourseStudents(courseId)
    const [videoError, setVideoError] = useState<string | null>(null)
    const [userStream, setUserStream] = useState<MediaStream | null>(null)
    const [enterExam, setEnterExam] = useState(false)
    const [exitExam, setExitExam] = useState(false)
    const [openLogDrawer, setOpenLogDrawer] = useState(true)
    const [participantLog, setParticipantLog] = useState<{
        stream: MediaStream
        studentId: string
        isIdentified: boolean
    } | null>(null)
    unstable_usePrompt({ when: true, message: "Are you sure you want to leave the exam? You will terminate the exam!" })
    const [loggingStatusData, loadingCameraMicStatus, cameraMicStatusError] = useLoggingStatus(courseId, userId)
    const [loggingStatusParticipantsData, loadingCameraMicStatusParticipants, cameraMicStatusParticipantsError] =
        useLoggingStatusParticipants(courseId)
    const { videoRef, isDetecting } = useVideoDetection(userStream, userData?.descriptorInfo?.descriptor, {
        matchThreshold: 0.6,
        onMatchFound: async (matchedFace) => {
            // console.log("Match found:", matchedFace)
            if (!userId || !courseId) return
            if (!loggingStatusData?.isHighlighted) return
            await setHighlighted(userId, courseId, false)
            stopRecording()
        },
        onMatchNotFound: async () => {
            if (!userId || !courseId) return
            if (loggingStatusData?.isHighlighted) return
            await setHighlighted(userId, courseId, true)
            startRecording()
        },
    })

    const [logEvents] = useExamLoggingPerCourse(courseId)
    const { startRecording, stopRecording, isRecording } = useVideoRecordingManagement(
        userStream,
        async (video, filename, contentType) => {
            if (!userId || !courseId || !userData) return
            return addExamLoggingVideoEvent(
                courseId,
                userId,
                `${userData.firstName} ${userData.lastName}`,
                userData.email,
                video,
                filename,
                contentType,
            )
        },
    )

    const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
    const reloadVideoStreams = () => {
        remoteStreams.forEach((remoteStream) => {
            const videoElement = remoteVideoRefs.current.get(remoteStream.id)

            if (!videoElement) return

            videoElement.srcObject = remoteStream.stream

            return () => {
                remoteVideoRefs.current.forEach((videoElement) => {
                    videoElement.srcObject = null
                })
            }
        })
    }
    const logDrawerWidth = 400

    const remoteStreams: Map<string, RemoteStreamType> = useMemo(() => {
        const streams = new Map<string, RemoteStreamType>()
        if (!students || !proctors || !userData) return streams
        userData.role !== "student" &&
            students.forEach((student) => {
                if (!student.id || student.id === userId) return
                streams.set(student.id, {
                    id: student.id,
                    stream: new MediaStream(),
                    role: "student",
                })
            })
        proctors.forEach((proctor) => {
            if (!proctor.id || proctor.id === userId) return
            streams.set(proctor.id, {
                id: proctor.id,
                stream: new MediaStream(),
                role: "proctor",
            })
        })
        return streams
    }, [students, proctors, userId])

    useEffect(() => {
        reloadVideoStreams()
    }, [remoteStreams, remoteVideoRefs])

    const { error } = useVideoCall(
        userStream,
        courseId,
        userId,
        remoteStreams,
        userData?.role ?? null,
        loggingStatusData ?? null,
        reloadVideoStreams,
        {
            enterEvent: async () => {
                setEnterExam(true)
            },
            exitEvent: async () => {
                setExitExam(true)
            },
        },
    )

    const handleUserMedia = (mediaStream: MediaStream) => {
        setUserStream(mediaStream)
    }

    useEffect(() => {
        if (!userId || !courseId || !userData) return
        if (userData.role === "student") {
            addExamLoggingEvent(
                courseId,
                userId,
                `${userData.firstName} ${userData.lastName}`,
                userData.email,
                "ENTERED_EXAM",
                "",
            ).then(() => {
                console.info("Entered exam")
            })
        }
    }, [enterExam, userData])

    useEffect(() => {
        if (!userId || !courseId || !userData) return
        addExamLoggingEvent(
            courseId,
            userId,
            `${userData.firstName} ${userData.lastName}`,
            userData.email,
            "LEFT_EXAM",
            "",
        ).then(() => {
            console.info("Exit exam")
        })
    }, [exitExam, userData])

    const getName = (id: string) => {
        let firstName = ""
        let lastName = ""
        let email = ""
        if (userData?.role === "student") {
            const proctor = proctors?.find((proctor) => proctor.id === id)
            firstName = proctor?.firstName ?? ""
            lastName = proctor?.lastName ?? ""
            email = proctor?.email ?? ""
        } else {
            const student = students?.find((student) => student.id === id)
            firstName = student?.firstName ?? ""
            lastName = student?.lastName ?? ""
            email = student?.email ?? ""
        }
        if (firstName.length > 0 && lastName.length > 0) return `${firstName} ${lastName}`
        return `${email} (UNREGISTERED)`
    }
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        const message = t("Are you sure you want to leave the exam? You will terminate the exam!")
        e.preventDefault()
        e.returnValue = message // Custom message for some browsers
    }
    const handleLogDrawerClose = () => {
        setOpenLogDrawer(false)
    }

    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload)

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [])

    if (
        loadingUserData ||
        loadingStudents ||
        loadingProctors ||
        loadingCameraMicStatus ||
        loadingCameraMicStatusParticipants
    )
        return <LoadingView />

    if (userDataError) return <ErrorView message={userDataError.message} />
    if (errorStudents) return <ErrorView message={errorStudents.message} />
    if (errorProctors) return <ErrorView message={errorProctors.message} />
    if (error) return <ErrorView message={error} />
    if (videoError) return <ErrorView message={videoError} />

    if (!courseId) return <ErrorView message={t("Invalid course id")} />

    const toggleAudioMuted = (participantId: string, status: boolean) => {
        return setMicStatus(participantId, courseId, status)
    }

    const toggleVideoMuted = (participantId: string, status: boolean) => {
        return setCameraStatus(participantId, courseId, status)
    }

    const getLoggingParticipant = (loggingParticipantId: string) =>
        loggingStatusParticipantsData?.find((participant) => participant.id === loggingParticipantId)

    if (
        (userData?.role !== "admin" && !userData?.courses) ||
        userData?.courses?.findIndex((course) => course.id === courseId) === -1
    )
        return <ErrorView message={t("You are not enrolled in this course")} />
    return (
        <Stack spacing={3} sx={{ mt: 3 }}>
            <Box sx={{ display: participantLog ? "inherit" : "none" }}>
                <VideoParticipantLog
                    stream={participantLog?.stream}
                    studentId={participantLog?.studentId}
                    logEvents={logEvents?.filter((l) => l.userId === participantLog?.studentId) ?? []}
                    onReturn={() => setParticipantLog(null)}
                    isIdentified={participantLog?.isIdentified ?? false}
                    onIdentified={async (identified) => {
                        if (!participantLog?.studentId) return
                        await setIdentified(participantLog?.studentId, courseId, identified)
                    }}
                />
            </Box>
            <Stack
                sx={[participantLog ? { display: "none" } : {}]}
                direction="column"
                justifyContent="space-between"
                alignItems="center"
            >
                <Paper
                    sx={[
                        {
                            maxWidth: "350px",
                            position: "relative",
                        },
                        userData?.role === "student" && loggingStatusData?.isHighlighted
                            ? { boxShadow: "0 0 10px 5px #ff0000;" }
                            : userData?.role === "student" && !loggingStatusData?.isIdentified
                              ? { boxShadow: "0 0 10px 5px #ffff00;" }
                              : {},
                    ]}
                >
                    <Webcam
                        audio
                        muted={!(loggingStatusData?.micStatus ?? false)}
                        mirrored
                        videoConstraints={{ facingMode: "user" }}
                        audioConstraints={{ noiseSuppression: true, echoCancellation: true }}
                        onUserMedia={handleUserMedia}
                        onUserMediaError={(error) => {
                            setVideoError(t("Cannot get the video stream. Please check your camera and try again."))
                            console.error(error)
                        }}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            paddingBottom: 0,
                            marginBottom: -6,
                        }}
                    />
                    <MicCameraToggleComponent
                        type="mic"
                        status={loggingStatusData?.micStatus ?? false}
                        toggleMuted={() => {
                            if (!userId) return
                            return toggleAudioMuted(userId, !(loggingStatusData?.micStatus ?? false))
                        }}
                        top="20px"
                        left="20px"
                    />
                    <MicCameraToggleComponent
                        type="camera"
                        status={loggingStatusData?.cameraStatus ?? true}
                        toggleMuted={() => {
                            if (!userId) return
                            return toggleVideoMuted(userId, !(loggingStatusData?.cameraStatus ?? false))
                        }}
                        top="20px"
                        left="60px"
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            padding: "4px",
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="subtitle1">{`${userData?.firstName} ${userData?.lastName}`}</Typography>
                    </Box>
                </Paper>
            </Stack>
            <Typography sx={[{ textAlign: "center" }, participantLog ? { display: "none" } : {}]} variant="h4">
                {userData?.role === "student" ? t("Proctors") : t("Students")}
            </Typography>
            <Grid sx={[participantLog ? { display: "none" } : {}]} container justifyContent="space-between">
                {Array.from(remoteStreams.values(), (remoteStream) => {
                    const loggingStatusParticipant = getLoggingParticipant(remoteStream.id)
                    return (
                        <Grid item xs="auto" key={remoteStream.id}>
                            <Paper
                                sx={[
                                    {
                                        maxWidth: "350px",
                                        margin: 3,
                                        position: "relative",
                                        cursor: userData?.role !== "student" ? "pointer" : "default",
                                    },
                                    loggingStatusParticipant?.isHighlighted
                                        ? { boxShadow: "0 0 10px 5px #ff0000;" }
                                        : !loggingStatusData?.isIdentified
                                          ? { boxShadow: "0 0 10px 5px #ffff00;" }
                                          : {},
                                ]}
                            >
                                <video
                                    muted={!(loggingStatusParticipant?.micStatus ?? false)}
                                    onClick={() => {
                                        if (userData.role === "student" || remoteStream.role !== "student") return
                                        setParticipantLog({
                                            stream: remoteStream.stream,
                                            studentId: remoteStream.id,
                                            isIdentified: loggingStatusParticipant?.isIdentified ?? false,
                                        })
                                    }}
                                    autoPlay
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                    playsInline
                                    ref={(ref) => {
                                        if (ref) {
                                            remoteVideoRefs.current.set(remoteStream.id, ref)
                                        } else {
                                            remoteVideoRefs.current.delete(remoteStream.id)
                                        }
                                    }}
                                />
                                <MicCameraToggleComponent
                                    type="mic"
                                    status={loggingStatusParticipant?.micStatus ?? false}
                                    toggleMuted={() =>
                                        toggleAudioMuted(
                                            remoteStream.id,
                                            !(loggingStatusParticipant?.micStatus ?? false),
                                        )
                                    }
                                    top="20px"
                                    left="20px"
                                    disabled={userData?.role === "student"}
                                />
                                <MicCameraToggleComponent
                                    type="camera"
                                    status={loggingStatusParticipant?.cameraStatus ?? true}
                                    toggleMuted={() =>
                                        toggleVideoMuted(
                                            remoteStream.id,
                                            !(loggingStatusParticipant?.cameraStatus ?? true),
                                        )
                                    }
                                    top="20px"
                                    left="60px"
                                    disabled={userData?.role === "student"}
                                />
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: "rgba(0, 0, 0, 0.5)",
                                        color: "white",
                                        padding: "4px",
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography variant="subtitle1">{getName(remoteStream.id)}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    )
                })}
            </Grid>
            {(userData?.role === "admin" || userData?.role === "proctor") && (
                <Drawer
                    sx={{
                        width: logDrawerWidth,
                        display: participantLog ? "none" : "inherit",
                        flexShrink: 0,
                        "& .MuiDrawer-paper": {
                            width: logDrawerWidth,
                        },
                    }}
                    variant="persistent"
                    anchor="right"
                    open={openLogDrawer}
                >
                    <DrawerHeader sx={{ marginTop: "64px" }}>
                        <Typography sx={{ marginRight: "40px" }} variant="h6" noWrap component="div">
                            {t("Current Course Actions")}
                        </Typography>
                        {/* <IconButton onClick={handleLogDrawerClose}> */}
                        {/*     {theme.direction === "rtl" ? <ChevronLeftIcon /> : <ChevronRightIcon />} */}
                        {/* </IconButton> */}
                    </DrawerHeader>
                    <Divider />
                    <LogListView LogList={logEvents ?? []} />
                </Drawer>
            )}
        </Stack>
    )
}

export { VideoExamView as default }
