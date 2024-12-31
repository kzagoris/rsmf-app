import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import {
    Firestore,
    Timestamp,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore"
import { FirebaseStorage, getDownloadURL, ref, uploadString } from "firebase/storage"
import { useCollectionData, useCollectionDataOnce, useDocumentData } from "react-firebase-hooks/firestore"
import { useAuth } from "~/lib/firebase"
import { courseParticipantConverter } from "~/models/CourseParticipant"
import { DescriptorInfoType, ImageIdType, User, UserRoleType, userConverter } from "~/models/User"

export const useUserId = (firestore: Firestore, email: string | null) => {
    const usersRef = collection(firestore, "users").withConverter(userConverter)
    const queryRef = email ? query(usersRef, where("email", "==", email)) : null
    return useCollectionDataOnce<User>(queryRef)
}

export const useUserInfo = (firestore: Firestore, id: string | null) => {
    const userRef = id ? doc(collection(firestore, "users"), id).withConverter(userConverter) : null
    return useDocumentData<User>(userRef)
}

export const useUserManagement = (firestore: Firestore) => {
    const addUser = async (email: string, role: UserRoleType) => {
        const userRef = doc(collection(firestore, "users")).withConverter(userConverter)
        if (await isEmailRegistered(email)) {
            throw new Error("Email already added")
        }
        await setDoc(userRef, {
            email,
            role,
            status: "unregister",
            firstName: null,
            lastName: null,
            filters: [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            descriptorInfo: null,
            idImage: null,
            courses: [],
        })
    }

    const deleteUser = async (user: User) => {
        if (!user.id) return
        const userRef = doc(collection(firestore, "users"), user.id).withConverter(userConverter)
        const batch = writeBatch(firestore)
        for (const course of user.courses) {
            if (!course.id) continue
            const courseParticipantRef =
                user.role === "student"
                    ? doc(collection(firestore, `courses/${course.id}/students`), user.id).withConverter(
                          courseParticipantConverter,
                      )
                    : doc(collection(firestore, `courses/${course.id}/proctors`), user.id).withConverter(
                          courseParticipantConverter,
                      )
            batch.delete(courseParticipantRef)
        }
        batch.delete(userRef)
        await batch.commit()
    }

    const signUpUser = async (email: string, password: string, firstName: string, lastName: string) => {
        const { user } = await createUserWithEmailAndPassword(useAuth(), email, password)
        await updateProfile(user, { displayName: `${firstName} ${lastName}` })
        return user
    }

    const updateName = async (userId: string, firstName: string, lastName: string) => {
        const userRef = doc(collection(firestore, "users"), userId).withConverter(userConverter)
        const user = (await getDoc(userRef)).data()
        if (!user) throw new Error("User does not exist")
        const batch = writeBatch(firestore)
        batch.update(userRef, { firstName, lastName })
        if (user.courses) {
            user.courses.forEach((course) => {
                if (!course.id) return
                const courseParticipantRef =
                    user.role === "student"
                        ? doc(collection(firestore, `courses/${course.id}/students`), user.id).withConverter(
                              courseParticipantConverter,
                          )
                        : doc(collection(firestore, `courses/${course.id}/proctors`), user.id).withConverter(
                              courseParticipantConverter,
                          )
                batch.update(courseParticipantRef, { firstName, lastName })
            })
        }
        await batch.commit()
    }

    const isEmailRegistered = async (email: string) => {
        const usersRef = collection(firestore, "users").withConverter(userConverter)
        const queryRef = query(usersRef, where("email", "==", email))
        const querySnapshot = await getDocs(queryRef)
        return !querySnapshot.empty
    }

    const updateIdImage = async (storage: FirebaseStorage, userId: string, idImage: string, extension: string) => {
        // upload to storage and the store it in the user document
        const userRef = doc(collection(firestore, "users"), userId).withConverter(userConverter)
        const idImageRef = ref(storage, `idImages/${userId}/id-card.${extension}`)
        await uploadString(idImageRef, idImage, "data_url")
        const uploadedImageUrl = await getDownloadURL(idImageRef)
        const uploadedIdImage: ImageIdType = {
            extension,
            fullPath: uploadedImageUrl,
        }
        await updateDoc(userRef, { idImage: uploadedIdImage })
    }

    const updateFaceDescriptor = async (userId: string, descriptor: DescriptorInfoType) => {
        const userRef = doc(collection(firestore, "users"), userId).withConverter(userConverter)
        const addedDescriptor = {
            descriptor: Array.from(descriptor.descriptor),
            image: descriptor.image,
        }
        await updateDoc(userRef, {
            descriptorInfo: addedDescriptor,
        })
    }

    const updateUser = async (user: User) => {
        const userRef = doc(collection(firestore, "users"), user.id).withConverter(userConverter)
        await updateDoc(userRef, user)
    }

    const useUsers = () => {
        const usersRef = collection(firestore, "users").withConverter(userConverter)
        return useCollectionData<User>(usersRef)
    }

    return {
        signUpUser,
        addUser,
        deleteUser,
        useUsers,
        updateUser,
        updateName,
        updateFaceDescriptor,
        updateIdImage,
        isEmailRegistered,
    }
}
