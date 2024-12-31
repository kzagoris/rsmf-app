import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore"

export class RTCCandidate {
    id?: string = ""
    type: "offer" | "answer" = "answer"
    createdId: string = ""
    candidate!: {
        candidate: string | null
        sdpMLineIndex: number | null
        sdpMid: string | null
        usernameFragment: string | null
    }
}

export const RTCCandidateConverter: FirestoreDataConverter<RTCCandidate> = {
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): RTCCandidate {
        const data = snapshot.data(options) as RTCCandidate
        return {
            id: snapshot.id,
            createdId: data.createdId,
            candidate: data.candidate,
            type: data.type,
        }
    },
    toFirestore(modelObject: RTCCandidate): DocumentData {
        return {
            createdId: modelObject.createdId,
            candidate: modelObject.candidate,
            type: modelObject.type,
        }
    },
}
