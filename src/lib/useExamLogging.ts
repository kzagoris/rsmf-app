import { QueryConstraint } from "@firebase/firestore"
import { addDoc, collection, doc, Firestore, orderBy, query, updateDoc, where } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes, type FirebaseStorage } from "firebase/storage"
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore"
import { LoggingCourse, LoggingCourseReasonType, loggingLogConverter } from "~/models/LoggingCourse"
import { LoggingParticipant, loggingParticipantConverter } from "~/models/LoggingParticipant"

export const useExamLogging = (firestore: Firestore, storage: FirebaseStorage) => {
    const setMicStatus = async (userId: string, courseId: string, status: boolean) => {
        const participantRef = doc(firestore, `logging/${courseId}/participants`, userId).withConverter(
            loggingParticipantConverter,
        )
        await updateDoc(participantRef, { micStatus: status })
    }

    const setCameraStatus = async (userId: string, courseId: string, status: boolean) => {
        const participantRef = doc(firestore, `logging/${courseId}/participants`, userId).withConverter(
            loggingParticipantConverter,
        )
        await updateDoc(participantRef, { cameraStatus: status })
    }

    const setHighlighted = async (userId: string, courseId: string, status: boolean) => {
        const participantRef = doc(firestore, `logging/${courseId}/participants`, userId).withConverter(
            loggingParticipantConverter,
        )
        await updateDoc(participantRef, { isHighlighted: status })
    }

    const setIdentified = async (userId: string, courseId: string, status: boolean) => {
        const participantRef = doc(firestore, `logging/${courseId}/participants`, userId).withConverter(
            loggingParticipantConverter,
        )
        console.log("setIdentified", userId, courseId, status)
        await updateDoc(participantRef, { isIdentified: status })
    }

    const useLoggingStatus = (courseId?: string | null, participantId?: string | null) => {
        return useDocumentData<LoggingParticipant>(
            participantId && courseId
                ? doc(firestore, `logging/${courseId}/participants`, participantId).withConverter(
                      loggingParticipantConverter,
                  )
                : null,
        )
    }

    const useLoggingStatusParticipants = (courseId?: string | null) => {
        return useCollectionData<LoggingParticipant>(
            courseId
                ? collection(firestore, `logging/${courseId}/participants`).withConverter(loggingParticipantConverter)
                : null,
        )
    }

    const useExamLoggingPerCourse = (courseId?: string | null) => {
        return useCollectionData<LoggingCourse>(
            courseId
                ? query(
                      collection(firestore, `logging/${courseId}/log`).withConverter(loggingLogConverter),
                      orderBy("date", "desc"),
                  )
                : null,
        )
    }

    const useFilteringExamLogging = (
        courseId: string,
        {
            userId,
            reason,
        }: {
            userId?: string
            reason?: LoggingCourseReasonType
        },
    ) => {
        return useCollectionData<LoggingCourse>(
            query(
                collection(firestore, `logging/${courseId}/log`).withConverter(loggingLogConverter),
                ...getFilteringWhere(userId, reason),
            ),
        )
    }

    const getFilteringWhere = (userId?: string, reason?: LoggingCourseReasonType): QueryConstraint[] => {
        const whereList: QueryConstraint[] = []
        if (userId) {
            whereList.push(where("userId", "==", userId))
        }
        if (reason) {
            whereList.push(where("reason", "==", reason))
        }
        return whereList
    }

    const addExamLogging = async (courseId: string, logEvent: LoggingCourse) => {
        const logRef = collection(firestore, `logging/${courseId}/log`).withConverter(loggingLogConverter)
        await addDoc(logRef, logEvent)
    }

    const addExamLoggingEvent = async (
        courseId: string,
        userId: string,
        userName: string,
        userEmail: string,
        reason: LoggingCourseReasonType,
        message: string,
    ) => {
        const logEvent = new LoggingCourse({
            userId,
            userName,
            userEmail,
            reason,
            message,
        })
        await addExamLogging(courseId, logEvent)
    }

    const addExamLoggingVideoEvent = async (
        courseId: string,
        userId: string,
        userName: string,
        userEmail: string,
        video: Blob,
        filename: string,
        contentType: string,
    ) => {
        // upload to storage and get the video url
        const videoRef = ref(storage, `logging/${courseId}/video/${userId}/${filename}`)
        const videoSnapshot = await uploadBytes(videoRef, video, { contentType })
        const videoUrl = await getDownloadURL(videoSnapshot.ref)
        const logEvent = new LoggingCourse({
            userId,
            userName,
            userEmail,
            reason: "VIDEO",
            videoId: videoUrl,
        })
        await addExamLogging(courseId, logEvent)
    }

    return {
        setMicStatus,
        setCameraStatus,
        setHighlighted,
        setIdentified,
        useLoggingStatus,
        useLoggingStatusParticipants,
        addExamLoggingVideoEvent,
        addExamLoggingEvent,
        useFilteringExamLogging,
        useExamLoggingPerCourse,
    }
}
