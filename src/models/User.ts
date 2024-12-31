import { DocumentData, FirestoreDataConverter, Timestamp, WithFieldValue } from "firebase/firestore"
import { Course } from "./Course"

export type UserRoleType = "student" | "proctor" | "admin"
export type DescriptorInfoType = {
    descriptor: Float32Array
    image: {
        width: number
        height: number
    }
}
export type ImageIdType = {
    extension: string
    fullPath: string
}

export class User {
    id?: string
    firstName: string | null = null
    lastName: string | null = null
    email: string = ""
    role: UserRoleType = "student"
    status: "register" | "unregister" | "notBiometrics" = "unregister"
    filters: string[] = []
    createdAt: Timestamp = Timestamp.now()
    updatedAt: Timestamp = Timestamp.now()
    descriptorInfo: DescriptorInfoType | null = null
    idImage: ImageIdType | null = null
    courses: Course[] = []
}

export const userConverter: FirestoreDataConverter<User> = {
    fromFirestore(snapshot, options): User {
        const data = snapshot.data(options) as User
        return {
            id: snapshot.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
            status: data.status,
            filters: data.filters,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            descriptorInfo: data.descriptorInfo
                ? {
                      descriptor: new Float32Array(data.descriptorInfo.descriptor),
                      image: data.descriptorInfo.image,
                  }
                : null,
            idImage: data.idImage,
            courses: data.courses,
        }
    },
    toFirestore(modelObject: WithFieldValue<User>): DocumentData {
        const descriptorInfo = modelObject.descriptorInfo as DescriptorInfoType
        return {
            firstName: modelObject.firstName,
            lastName: modelObject.lastName,
            email: modelObject.email,
            role: modelObject.role,
            status: modelObject.status,
            filters: modelObject.filters,
            createdAt: modelObject.createdAt,
            updatedAt: modelObject.updatedAt,
            descriptorInfo: modelObject.descriptorInfo
                ? {
                      descriptor: Array.from(descriptorInfo.descriptor),
                      image: descriptorInfo.image,
                  }
                : null,
            idImage: modelObject.idImage,
            courses: modelObject.courses,
        }
    },
}
