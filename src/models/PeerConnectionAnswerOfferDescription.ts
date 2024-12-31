import { DocumentData, FirestoreDataConverter } from "firebase/firestore"

export class PeerConnectionAnswerOfferDescription {
    id?: string = ""
    createdId: string = ""
    receiverId: string = ""
    rtcDescription: {
        sdp: string | null
        type: string
    } = { sdp: null, type: "" }
}

export const peerConnectionAnswerOfferDescriptionConverter: FirestoreDataConverter<PeerConnectionAnswerOfferDescription> =
    {
        fromFirestore(snapshot, options): PeerConnectionAnswerOfferDescription {
            const data = snapshot.data(options) as PeerConnectionAnswerOfferDescription
            return {
                id: snapshot.id,
                createdId: data.createdId,
                receiverId: data.receiverId,
                rtcDescription: data.rtcDescription,
            }
        },
        toFirestore(modelObject): DocumentData {
            return {
                callerId: modelObject.createdId,
                receiverId: modelObject.receiverId,
                createdId: modelObject.createdId,
                rtcDescription: modelObject.rtcDescription,
            }
        },
    }
