import {
    DocumentData,
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SetOptions,
    SnapshotOptions,
    Timestamp,
    WithFieldValue,
} from "firebase/firestore"

export class Course {
    id?: string = ""
    code: string = ""
    name: string = ""
    description?: string
    startDate: Timestamp = Timestamp.now()
    duration: number = 0
}

export const courseConverter: FirestoreDataConverter<Course> = {
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Course {
        const data = snapshot.data(options)
        return {
            id: snapshot.id,
            code: data.code,
            name: data.name,
            description: data.description,
            startDate: data.startDate,
            duration: data.duration,
        }
    },
    toFirestore(modelObject: WithFieldValue<Course>, options?: SetOptions): DocumentData {
        return {
            code: modelObject.code,
            name: modelObject.name,
            description: modelObject.description,
            startDate: modelObject.startDate,
            duration: modelObject.duration,
        }
    },
}
