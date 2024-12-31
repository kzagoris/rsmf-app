import { DocumentData, FirestoreDataConverter } from "firebase/firestore"
import { UserRoleType } from "~/models/User"

export class CourseParticipant {
    id?: string
    firstName: string | null = null
    lastName: string | null = null
    email: string = ""
    role: UserRoleType = "student"
}

export const courseParticipantConverter: FirestoreDataConverter<CourseParticipant> = {
    fromFirestore(snapshot, options): CourseParticipant {
        const data = snapshot.data(options) as CourseParticipant
        return {
            id: snapshot.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
        }
    },
    toFirestore(modelObject): DocumentData {
        return {
            firstName: modelObject.firstName,
            lastName: modelObject.lastName,
            email: modelObject.email,
            role: modelObject.role,
        }
    },
}
