import { DocumentData, FirestoreDataConverter } from "firebase/firestore"

export class LoggingParticipant {
    id?: string
    micStatus?: boolean | null | undefined = null
    cameraStatus?: boolean | null | undefined = null
    isHighlighted?: boolean | null | undefined = null
    isIdentified?: boolean | null | undefined = null
}

export const loggingParticipantConverter: FirestoreDataConverter<LoggingParticipant> = {
    fromFirestore(snapshot, options): LoggingParticipant {
        const data = snapshot.data(options) as LoggingParticipant
        return {
            id: snapshot.id,
            micStatus: data.micStatus ?? false,
            cameraStatus: data.cameraStatus ?? true,
            isHighlighted: data.isHighlighted ?? false,
            isIdentified: data.isIdentified ?? false,
        }
    },
    toFirestore(modelObject): DocumentData {
        return {
            micStatus: modelObject.micStatus ?? false,
            cameraStatus: modelObject.cameraStatus ?? true,
            isHighlighted: modelObject.isHighlighted ?? false,
            isIdentified: modelObject.isIdentified ?? false,
        }
    },
}
