import { DocumentData, FirestoreDataConverter, Timestamp } from "firebase/firestore"
import { PartialBy } from "~/lib/helperFunctions"

export type LoggingCourseReasonType = "VIDEO" | "LEFT_EXAM" | "ENTERED_EXAM" | "OTHER"

export class LoggingCourse {
    id?: string | null
    date: Timestamp
    userId: string
    userName: string
    userEmail: string
    reason: LoggingCourseReasonType
    videoId?: string | null
    message?: string | null

    constructor({ id, date, userId, userName, userEmail, reason, videoId, message }: PartialBy<LoggingCourse, "date">) {
        this.id = id
        this.date = date ?? Timestamp.now()
        this.userId = userId
        this.userName = userName
        this.userEmail = userEmail
        this.reason = reason ?? "other"
        this.videoId = videoId
        this.message = message
    }
}

export const loggingLogConverter: FirestoreDataConverter<LoggingCourse> = {
    fromFirestore(snapshot, options): LoggingCourse {
        const data = snapshot.data(options) as LoggingCourse
        return new LoggingCourse({
            id: snapshot.id,
            date: data.date,
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
            reason: data.reason,
            videoId: data.videoId,
            message: data.message,
        })
    },
    toFirestore(modelObject): DocumentData {
        return {
            date: modelObject.date,
            userId: modelObject.userId,
            userName: modelObject.userName,
            userEmail: modelObject.userEmail,
            reason: modelObject.reason,
            videoId: modelObject.videoId ?? null,
            message: modelObject.message ?? null,
        }
    },
}
